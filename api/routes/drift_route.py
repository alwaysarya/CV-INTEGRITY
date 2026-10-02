"""
Drift Detection API Routes
Exposes ModelDriftDetector + RiskCalibrator via REST
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/drift", tags=["drift"])


class SnapshotRequest(BaseModel):
    model_name: str
    metrics: Dict[str, float]


class DriftCheckRequest(BaseModel):
    model_name: str
    current_metrics: Dict[str, float]


@router.get("/status")
async def drift_status():
    """Overall drift status for all models"""
    try:
        from model_drift.drift_detector import ModelDriftDetector
        detector = ModelDriftDetector()
        reports = detector.get_all_drift_reports()
        return {
            "status": "success",
            "total_models": len(reports),
            "reports": reports,
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.get("/model/{model_name}")
async def model_drift(model_name: str):
    """Drift status for one model"""
    try:
        from model_drift.drift_detector import ModelDriftDetector
        detector = ModelDriftDetector()
        status = detector.get_model_status(model_name)
        baseline = detector.get_baseline(model_name)
        history = detector.get_history(model_name, limit=10)
        return {
            "status": "success",
            "model_name": model_name,
            "current_status": status,
            "baseline": baseline,
            "history": history,
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.post("/snapshot")
async def save_snapshot(req: SnapshotRequest):
    """Save a metrics snapshot for a model"""
    try:
        from model_drift.drift_detector import ModelDriftDetector
        detector = ModelDriftDetector()
        path = detector.save_snapshot(req.model_name, req.metrics)
        return {"status": "success", "saved_to": path}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.post("/detect")
async def detect_drift(req: DriftCheckRequest):
    """Detect drift for a model given current metrics"""
    try:
        from model_drift.drift_detector import ModelDriftDetector
        from model_drift.risk_calibrator import RiskCalibrator
        detector = ModelDriftDetector()
        report = detector.detect_drift(req.model_name, req.current_metrics)
        calibration = RiskCalibrator.calibrate_from_report(report)
        return {
            "status": "success",
            "drift_report": report,
            "risk_calibration": calibration,
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.get("/calibration-table")
async def calibration_table():
    """Get risk calibration reference table"""
    try:
        from model_drift.risk_calibrator import RiskCalibrator
        return {"status": "success", "table": RiskCalibrator.get_calibration_table()}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


# ============================================================
# RISK LEVELS — Real threshold definitions
# ============================================================
@router.get("/risk-levels")
async def get_risk_levels():
    """Return risk level definitions used by drift detector"""
    return {
        "status": "success",
        "risk_levels": [
            {"level": "STABLE",   "color": "#5EEAD4", "psi": "< 0.10",      "ks": "< 0.15",      "mapDrop": "< 3%",     "policy": "AUTO-APPROVE: No drift detected."},
            {"level": "MINOR",    "color": "#38BDF8", "psi": "0.10 - 0.20", "ks": "0.15 - 0.30", "mapDrop": "3% - 8%",  "policy": "MONITOR: Subtle feature variance detected."},
            {"level": "MODERATE", "color": "#FBBF24", "psi": "0.20 - 0.35", "ks": "0.30 - 0.45", "mapDrop": "8% - 15%", "policy": "REVIEW: Model performance decaying."},
            {"level": "SEVERE",   "color": "#FB923C", "psi": "0.35 - 0.50", "ks": "0.45 - 0.60", "mapDrop": "15% - 25%","policy": "WARN_QUARANTINE: Substantial data shift."},
            {"level": "CRITICAL", "color": "#F87171", "psi": ">= 0.50",     "ks": ">= 0.60",     "mapDrop": "> 25%",    "policy": "HARD_QUARANTINE: Immediate lockdown."},
        ]
    }
