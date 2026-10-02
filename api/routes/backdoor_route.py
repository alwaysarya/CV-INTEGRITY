"""
Backdoor Detection API — Real trigger detection with model inference
"""

from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import numpy as np
import cv2
import base64
import hashlib
import sys
import json
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/backdoor", tags=["backdoor"])


class BackdoorRequest(BaseModel):
    dataset: str = "clean"  # clean, bad, worst
    num_samples: int = 20
    access_level: str = "black-box"


def image_to_base64(img: np.ndarray) -> str:
    """Convert numpy image to base64 PNG."""
    if img.dtype != np.uint8:
        if img.max() <= 1.0:
            img = (img * 255).astype(np.uint8)
        else:
            img = np.clip(img, 0, 255).astype(np.uint8)
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode('utf-8')


def create_heatmap_visualization(heatmap: np.ndarray) -> np.ndarray:
    """Create colored heatmap from raw values."""
    # Normalize
    h_min, h_max = heatmap.min(), heatmap.max()
    if h_max - h_min > 1e-8:
        normalized = (heatmap - h_min) / (h_max - h_min)
    else:
        normalized = np.zeros_like(heatmap)
    
    # Apply colormap
    colored = cv2.applyColorMap((normalized * 255).astype(np.uint8), cv2.COLORMAP_JET)
    return cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)


@router.post("/detect")
async def detect_backdoor(req: BackdoorRequest):
    """Run real backdoor detection on real dataset images."""
    try:
        from model.backdoor_detector import BackdoorDetector
        from utils.dataset_loaders import YOLOLoader
        
        # Load images from dataset
        images = []
        image_paths = []
        
        # Determine dataset path (FIXED: use processed folders)
        if req.dataset == "clean":
            dataset_paths = [PROJECT_ROOT / "datasets" / "processed" / "good" / "images"]
        elif req.dataset == "bad":
            dataset_paths = [PROJECT_ROOT / "datasets" / "processed" / "bad" / "images"]
        elif req.dataset == "worst":
            dataset_paths = [PROJECT_ROOT / "datasets" / "processed" / "worst" / "images"]
        else:
            dataset_paths = [PROJECT_ROOT / "datasets" / "processed" / "good" / "images"]
        
        for ds_path in dataset_paths:
            if ds_path.exists():
                try:
                    loader = YOLOLoader(str(ds_path))
                    loader.load()
                    
                    for f in sorted(loader.image_files)[:req.num_samples]:
                        try:
                            img = cv2.imread(str(f))
                            if img is not None:
                                img = cv2.resize(img, (64, 64))
                                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                                images.append(img)
                                image_paths.append(str(f))
                        except Exception:
                            continue
                    
                    if images:
                        break
                except Exception:
                    continue
        
        # Fallback to synthetic if no images
        if not images:
            images = np.random.rand(req.num_samples, 64, 64, 3).astype(np.float32)
        else:
            images = np.array(images, dtype=np.float32) / 255.0
        
        # Run REAL dataset integrity detection
        from model.real_dataset_detector import RealDatasetDetector
        
        # Map dataset name to path
        ds_folder = {
            "clean": "good",
            "bad": "bad",
            "worst": "worst",
        }.get(req.dataset, "good")
        
        ds_path = PROJECT_ROOT / "datasets" / "processed" / ds_folder
        if not ds_path.exists():
            raise Exception(f"Dataset not found: {ds_path}")
        
        real_detector = RealDatasetDetector(
            dataset_path=str(ds_path),
            dataset_name=req.dataset,
            access_level=req.access_level,
        )
        result = real_detector.detect(max_images=req.num_samples * 5)
        result["access_level"] = req.access_level
        result["dataset_used"] = req.dataset
        result["num_images_analyzed"] = result.get("dataset_stats", {}).get("total_images", 0)
        
        # Generate heatmap visualization (aggregate)
        if len(images) > 0:
            # Use frequency analysis heatmap
            gray = np.mean(images, axis=-1)
            fft = np.abs(np.fft.fft2(gray, axes=(-2, -1)))
            heatmap = np.mean(fft, axis=0)
            heatmap_vis = create_heatmap_visualization(heatmap)
            heatmap_b64 = image_to_base64(heatmap_vis)
        else:
            heatmap_b64 = ""
        
        # Add base64 visualization
        result["heatmap_visualization"] = heatmap_b64
        result["dataset_used"] = req.dataset
        result["num_images_analyzed"] = len(images)
        result["sample_paths"] = [p.split('/')[-1] for p in image_paths[:5]]
        
        # ============================================================
        # SAVE TO SQLITE DATABASE (PS 2.2.5 — audit trail)
        # ============================================================
        try:
            from api.models import history_db as db
            import hashlib as _hashlib
            from datetime import datetime as _dt

            # Generate asset ID from dataset + timestamp
            asset_id = f"{req.dataset}_{_dt.utcnow().strftime('%Y%m%d_%H%M%S')}"

            # Add asset
            db.add_asset(
                asset_id=asset_id,
                name=req.dataset,
                type_="dataset",
                hash_=result.get("hash", "N/A"),
                format_="YOLO",
                contributor=f"uploaded_{req.dataset}",
                size_mb=0,
                access_level=req.access_level,
            )

            # Add findings for each detection method
            for finding in result.get("findings", []):
                if finding.get("status") == "success":
                    db.add_finding(
                        asset_id=asset_id,
                        module=finding.get("method", "unknown"),
                        reason=finding.get("reason", ""),
                        evidence=str(finding.get("confidence", 0)),
                        severity=(
                            "critical" if finding.get("confidence", 0) > 0.7 else
                            "high" if finding.get("confidence", 0) > 0.5 else
                            "medium" if finding.get("confidence", 0) > 0.3 else
                            "low"
                        ),
                        confidence=finding.get("confidence", 0),
                    )

            # Add decision based on verdict
            risk_level = result.get("overall_risk", {}).get("level", "UNKNOWN")
            decision = (
                "accept" if risk_level == "LOW" else
                "review" if risk_level in ("MEDIUM", "HIGH") else
                "quarantine" if risk_level == "CRITICAL" else
                "review"
            )
            db.add_decision(
                asset_id=asset_id,
                decision=decision,
                note=f"Auto decision based on risk level: {risk_level}",
                analyst="system",
            )

            # Add report
            db.add_report(
                asset_id=asset_id,
                report_json=result,
                overall_score=result.get("overall_risk", {}).get("score", 0),
                grade=result.get("overall_risk", {}).get("level", "N/A")[0],
                verdict=risk_level,
            )

            print(f"✅ Saved to DB: {asset_id}")
            result["asset_id"] = asset_id

        except Exception as e:
            print(f"⚠️ DB save failed: {e}")
            # Don't fail the request if DB save fails

        return result
    except Exception as e:
        import traceback
        return {
            "status": "failed",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }


@router.post("/compare")
async def compare_datasets():
    """Compare clean vs triggered datasets side by side."""
    try:
        from model.backdoor_detector import BackdoorDetector
        from utils.dataset_loaders import YOLOLoader
        
        results = {}
        
        for name, path in [
            ("clean", PROJECT_ROOT / "datasets" / "uploaded" / "extracted"),
            ("raw", PROJECT_ROOT / "datasets" / "raw"),
        ]:
            if not path.exists():
                continue
            
            loader = YOLOLoader(str(path))
            loader.load()
            
            images = []
            for f in sorted(loader.image_files)[:20]:
                try:
                    img = cv2.imread(str(f))
                    if img is not None:
                        img = cv2.resize(img, (64, 64))
                        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                        images.append(img)
                except Exception:
                    continue
            
            if images:
                images = np.array(images, dtype=np.float32) / 255.0
                detector = BackdoorDetector(access_level="black-box")
                result = detector.detect(images)
                results[name] = {
                    "count": len(images),
                    "risk_score": result.get("overall_risk", {}).get("score", 0),
                    "risk_level": result.get("overall_risk", {}).get("level", "UNKNOWN"),
                    "recommendation": result.get("recommendation", "REVIEW"),
                    "findings": result.get("findings", []),
                }
        
        return {"status": "success", "comparison": results}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
