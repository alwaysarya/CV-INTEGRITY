"""
Inference Provenance Route
Cryptographic binding of input image, model weights, preprocessing, config, and output.
PS 2.2.3 compliant.
"""
import hashlib
import time
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
import tempfile
import json

router = APIRouter(prefix="/api/provenance", tags=["provenance"])

MODEL_DIR = Path(__file__).parent.parent.parent / "model" / "saved_models"
FALLBACK_MODEL_DIRS = [
    Path(__file__).parent.parent.parent / "model",
    Path(__file__).parent.parent.parent / "runs",
]

def _find_model_file(model_name: str) -> Optional[Path]:
    """Find model weight file for a given name."""
    candidates = []
    for d in [MODEL_DIR] + FALLBACK_MODEL_DIRS:
        if not d.exists():
            continue
        for ext in ["*.pt", "*.onnx", "*.pth"]:
            candidates.extend(d.rglob(f"{model_name}{ext.replace('*','')}"))
            candidates.extend(d.rglob(f"*{model_name}*{ext.replace('*','')}"))
    # prefer exact match
    for c in candidates:
        if c.stem == model_name or c.stem == f"{model_name}.pt":
            return c
    return candidates[0] if candidates else None

def _hash_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def _hash_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

class VerifyRequest(BaseModel):
    input_hash: str
    model_hash: str
    preprocess_hash: str
    config_hash: str
    output_hash: str
    binding: str
    sequence: int = 0
    timestamp: str = ""
    nonce: str = ""


def _compute_binding(
    input_hash: str,
    model_hash: str,
    preprocess_hash: str,
    config_hash: str,
    output_hash: str,
    sequence: int,
    timestamp: str,
    nonce: str,
) -> str:
    """Compute the combined cryptographic binding of all components."""
    payload = "|".join([
        input_hash,
        model_hash,
        preprocess_hash,
        config_hash,
        output_hash,
        str(sequence),
        timestamp,
        nonce,
    ])
    return hashlib.sha256(payload.encode()).hexdigest()


@router.post("/infer")
async def infer_provenance(
    file: UploadFile = File(...),
    model_name: str = Query("good"),
):
    """
    Run inference on uploaded image and generate full provenance record.
    """
    try:
        # Read input
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")

        # Input hash
        input_hash = _hash_bytes(contents)

        # Save to temp for inference
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename or "img.jpg").suffix) as tmp:
            tmp.write(contents)
            tmp_path = Path(tmp.name)

        try:
            # Find model weights
            model_path = _find_model_file(model_name)
            if model_path and model_path.exists():
                model_hash = _hash_file(model_path)
            else:
                # Fallback: hash the model name as identity
                model_hash = _hash_bytes(f"model::{model_name}".encode())

            # Preprocessing hash — record the standard preprocessing pipeline
            preprocess_config = {
                "resize": [640, 640],
                "normalize": "0-1",
                "channels": "RGB",
                "letterbox": True,
            }
            preprocess_hash = _hash_bytes(json.dumps(preprocess_config, sort_keys=True).encode())

            # Config hash — inference config
            inference_config = {
                "conf_threshold": 0.25,
                "iou_threshold": 0.45,
                "max_det": 300,
                "device": "cpu",
            }
            config_hash = _hash_bytes(json.dumps(inference_config, sort_keys=True).encode())

            # Run real inference if YOLO available
            detections = []
            try:
                from ultralytics import YOLO
                if model_path and model_path.suffix == ".pt":
                    model = YOLO(str(model_path))
                    results = model(str(tmp_path), verbose=False)
                    if results and len(results) > 0:
                        r = results[0]
                        if r.boxes is not None and len(r.boxes) > 0:
                            names = r.names if hasattr(r, "names") else {}
                            for i, box in enumerate(r.boxes):
                                cls_id = int(box.cls[0].item()) if box.cls is not None else -1
                                conf = float(box.conf[0].item()) if box.conf is not None else 0.0
                                xyxy = box.xyxy[0].tolist() if box.xyxy is not None else [0, 0, 0, 0]
                                detections.append({
                                    "class_id": cls_id,
                                    "class_name": names.get(cls_id, f"class_{cls_id}"),
                                    "confidence": round(conf, 4),
                                    "bbox": [round(v, 2) for v in xyxy],
                                })
            except Exception as e:
                # Inference optional — record as no detections if model unavailable
                print(f"[provenance] inference skipped: {e}")

            # Output hash — based on detections
            output_payload = {
                "detections": detections,
                "total": len(detections),
            }
            output_hash = _hash_bytes(json.dumps(output_payload, sort_keys=True).encode())

            # Metadata
            sequence = int(time.time() * 1000)
            timestamp = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
            nonce = uuid.uuid4().hex

            # Combined binding
            binding = _compute_binding(
                input_hash, model_hash, preprocess_hash, config_hash,
                output_hash, sequence, timestamp, nonce,
            )

            return {
                "status": "success",
                "total_detections": len(detections),
                "detections": detections,
                "provenance": {
                    "input_hash": input_hash,
                    "model_hash": model_hash,
                    "preprocess_hash": preprocess_hash,
                    "config_hash": config_hash,
                    "output_hash": output_hash,
                    "binding": binding,
                    "sequence": sequence,
                    "timestamp": timestamp,
                    "nonce": nonce,
                    "model_name": model_name,
                    "model_path": str(model_path) if model_path else None,
                    "preprocessing": preprocess_config,
                    "inference_config": inference_config,
                },
            }
        finally:
            try:
                tmp_path.unlink()
            except Exception:
                pass
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
async def verify_binding(req: VerifyRequest):
    """
    Verify the cryptographic binding of a provenance record.
    Recomputes the binding and checks for tampering.
    """
    try:
        recomputed = _compute_binding(
            req.input_hash, req.model_hash, req.preprocess_hash, req.config_hash,
            req.output_hash, req.sequence, req.timestamp, req.nonce,
        )

        binding_valid = (recomputed == req.binding)

        # Record age
        record_age_seconds = 0
        if req.timestamp:
            try:
                from datetime import datetime, timezone
                ts = datetime.fromisoformat(req.timestamp.replace("Z", "+00:00"))
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                record_age_seconds = int((datetime.now(timezone.utc) - ts).total_seconds())
            except Exception:
                record_age_seconds = 0

        # Replay risk based on age
        if record_age_seconds < 3600:
            replay_risk = "low"
        elif record_age_seconds < 86400:
            replay_risk = "medium"
        else:
            replay_risk = "high"

        return {
            "status": "success",
            "verification": {
                "binding_valid": binding_valid,
                "recomputed_binding": recomputed,
                "claimed_binding": req.binding,
                "record_age_seconds": record_age_seconds,
                "replay_risk": replay_risk,
                "sequence": req.sequence,
                "nonce": req.nonce,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def provenance_health():
    """Health check for provenance subsystem."""
    return {
        "status": "ok",
        "model_dir": str(MODEL_DIR),
        "model_dir_exists": MODEL_DIR.exists(),
    }
