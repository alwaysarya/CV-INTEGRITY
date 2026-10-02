"""
Model Analysis API — Real weight-level integrity analysis.
Detects anomalies, substituted models, and backdoor-like patterns.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import sys

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/model", tags=["model-analysis"])


class ModelAnalysisRequest(BaseModel):
    model_name: str  # "good", "bad", "worst", or full path
    baseline: Optional[str] = None  # Optional baseline for comparison


# Model name → file path mapping
MODEL_PATHS = {
    "good": PROJECT_ROOT / "model" / "saved_models" / "good" / "train" / "weights" / "best.pt",
    "bad": PROJECT_ROOT / "model" / "saved_models" / "bad" / "train" / "weights" / "best.pt",
    "worst": PROJECT_ROOT / "model" / "saved_models" / "worst" / "train" / "weights" / "best.pt",
    "base": PROJECT_ROOT / "yolov8n.pt",
}


@router.post("/analyze")
async def analyze_model(req: ModelAnalysisRequest):
    """Run real weight-level integrity analysis on a model."""
    try:
        from model.onnx_loader import PyTorchModelLoader

        # Resolve model path
        model_path = MODEL_PATHS.get(req.model_name.lower())
        if not model_path:
            # Try direct path
            direct = Path(req.model_name)
            if direct.exists():
                model_path = direct
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Model not found: {req.model_name}. Available: {list(MODEL_PATHS.keys())}"
                )

        if not model_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Model file missing: {model_path}"
            )

        # Resolve baseline
        baseline_path = None
        if req.baseline:
            baseline_path = MODEL_PATHS.get(req.baseline.lower())
            if not baseline_path:
                baseline_path = Path(req.baseline)

        # Run analysis
        loader = PyTorchModelLoader(str(model_path))
        result = loader.analyze_weights(str(baseline_path) if baseline_path else None)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze/all")
async def analyze_all_models():
    """Analyze all models and return comparison."""
    try:
        from model.onnx_loader import PyTorchModelLoader

        baseline_path = MODEL_PATHS["base"]
        results = {}

        for name in ["good", "bad", "worst"]:
            path = MODEL_PATHS[name]
            if not path.exists():
                results[name] = {"status": "failed", "error": "Model file missing"}
                continue

            loader = PyTorchModelLoader(str(path))
            results[name] = loader.analyze_weights(str(baseline_path))

        return {
            "status": "success",
            "baseline_used": "yolov8n.pt",
            "models": results,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_models():
    """List available models with file info."""
    models = []
    for name, path in MODEL_PATHS.items():
        models.append({
            "name": name,
            "path": str(path),
            "exists": path.exists(),
            "size_bytes": path.stat().st_size if path.exists() else 0,
        })
    return {"models": models}
