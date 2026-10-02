"""Label quality scorer"""
from typing import List, Dict
from collections import Counter


class LabelQualityScorer:
    @staticmethod
    def score(labels: List[int]) -> Dict:
        if not labels:
            return {"status": "empty", "score": 0}
        counts = Counter(labels)
        total = len(labels)
        # Balanced = higher score
        imbalance = max(counts.values()) / min(counts.values()) if min(counts.values()) > 0 else float('inf')
        score = max(0, 100 - (imbalance - 1) * 10)
        return {
            "status": "success",
            "total": total,
            "num_classes": len(counts),
            "imbalance_ratio": round(imbalance, 2),
            "score": round(score, 2),
            "grade": "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D",
        }


def score_labels(labels):
    return LabelQualityScorer.score(labels)
