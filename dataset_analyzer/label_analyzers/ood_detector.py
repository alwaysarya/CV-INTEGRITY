"""Out-of-distribution detector"""
import numpy as np
from typing import List, Dict


class OODDetector:
    @staticmethod
    def detect(features: List[List[float]], threshold: float = 3.0) -> Dict:
        if not features:
            return {"status": "empty", "ood_detected": False}
        arr = np.array(features, dtype=np.float32)
        mean = arr.mean(axis=0)
        std = arr.std(axis=0) + 1e-8
        z_scores = np.abs((arr - mean) / std)
        max_z = z_scores.max(axis=1)
        ood_indices = np.where(max_z > threshold)[0].tolist()
        return {
            "status": "analyzed",
            "total": len(features),
            "ood_count": len(ood_indices),
            "ood_indices": ood_indices[:20],
            "ood_detected": len(ood_indices) > 0,
        }


def detect_ood(features, threshold=3.0):
    return OODDetector.detect(features, threshold)
