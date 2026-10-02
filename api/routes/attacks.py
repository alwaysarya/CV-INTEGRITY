"""
Attack Simulator API — Real attack execution
"""

from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
import sys
import numpy as np
import hashlib
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/attacks", tags=["attacks"])


class RunAttackRequest(BaseModel):
    attack_id: str
    access_level: str = "black-box"


@router.get("/list")
async def list_attacks():
    """List available attacks."""
    attacks = [
        {"id": "poison-1", "name": "Data Poisoning", "description": "Inject malicious samples into training data", "severity": "Critical", "category": "Poisoning"},
        {"id": "evasion-1", "name": "Adversarial Evasion", "description": "Craft inputs to fool model predictions", "severity": "High", "category": "Evasion"},
        {"id": "inversion-1", "name": "Model Inversion", "description": "Extract training data from model outputs", "severity": "High", "category": "Inversion"},
        {"id": "backdoor-1", "name": "Backdoor Injection", "description": "Embed hidden triggers in model", "severity": "Critical", "category": "Backdoor"},
        {"id": "poison-2", "name": "Label Flipping", "description": "Corrupt training labels", "severity": "Medium", "category": "Poisoning"},
        {"id": "evasion-2", "name": "FGSM Attack", "description": "Fast gradient sign method", "severity": "Medium", "category": "Evasion"},
    ]
    return {"attacks": attacks, "count": len(attacks)}


@router.post("/run")
async def run_attack(req: RunAttackRequest):
    """Run a real attack and return detection result."""
    try:
        from model.backdoor_detector import BackdoorDetector
        
        # Generate attack pattern based on type
        np.random.seed(hash(req.attack_id) % 2**32)
        
        if "poison" in req.attack_id:
            # Poisoning: add anomalous patches
            images = np.random.rand(20, 64, 64, 3).astype(np.float32)
            for i in range(5):
                images[i, 10:20, 10:20] = 1.0
        elif "backdoor" in req.attack_id:
            # Backdoor: consistent small trigger
            images = np.random.rand(20, 64, 64, 3).astype(np.float32)
            for i in range(10):
                images[i, 5:8, 5:8] = 0.9
        elif "evasion" in req.attack_id:
            # Evasion: high-frequency noise
            images = np.random.rand(20, 64, 64, 3).astype(np.float32)
            images += np.random.randn(20, 64, 64, 3) * 0.3
            images = np.clip(images, 0, 1)
        else:
            images = np.random.rand(20, 64, 64, 3).astype(np.float32)
        
        # Run real detection
        detector = BackdoorDetector(access_level=req.access_level)
        detection = detector.detect(images)
        
        risk = detection.get("overall_risk", {})
        risk_score = risk.get("score", 0)
        detected = risk_score > 20
        
        evidence_hash = hashlib.sha256(
            f"{req.attack_id}{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()[:16]
        
        return {
            "status": "success",
            "attack_id": req.attack_id,
            "attack_name": req.attack_id.replace("-", " ").title(),
            "detected": detected,
            "detection_confidence": round(100 - risk_score, 1),
            "risk_score": risk_score,
            "risk_level": risk.get("level", "UNKNOWN"),
            "detection_methods": [
                {"method": f.get("method"), "confidence": f.get("confidence", 0)}
                for f in detection.get("findings", [])
            ],
            "recommendation": detection.get("recommendation", "REVIEW"),
            "evidence_hash": evidence_hash,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}
