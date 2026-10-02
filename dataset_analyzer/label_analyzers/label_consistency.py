"""Label consistency checker"""
from typing import List, Dict, Tuple


class LabelConsistencyChecker:
    @staticmethod
    def analyze(labels: List[int], predictions: List[int] = None) -> Dict:
        if not labels:
            return {"status": "empty", "consistent": False}
        if predictions is None:
            return {"status": "no_predictions", "consistent": True}
        if len(labels) != len(predictions):
            return {"status": "length_mismatch", "consistent": False}
        matches = sum(1 for l, p in zip(labels, predictions) if l == p)
        accuracy = matches / len(labels)
        return {
            "status": "analyzed",
            "total": len(labels),
            "matches": matches,
            "accuracy": round(accuracy, 4),
            "consistent": accuracy > 0.85,
        }


def analyze_consistency(labels, predictions=None):
    return LabelConsistencyChecker.analyze(labels, predictions)
