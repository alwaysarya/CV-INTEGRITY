"""Class balance analyzer"""
from typing import Dict, List
from collections import Counter


class ClassBalanceAnalyzer:
    @staticmethod
    def analyze(labels: List[int]) -> Dict:
        if not labels:
            return {"status": "empty", "balanced": False}
        counts = Counter(labels)
        total = len(labels)
        distribution = {k: v / total for k, v in counts.items()}
        max_ratio = max(distribution.values())
        min_ratio = min(distribution.values())
        imbalance = max_ratio / min_ratio if min_ratio > 0 else float('inf')
        return {
            "status": "analyzed",
            "total_samples": total,
            "num_classes": len(counts),
            "distribution": dict(counts),
            "imbalance_ratio": round(imbalance, 2),
            "balanced": imbalance < 3.0,
        }


def analyze_class_balance(labels):
    return ClassBalanceAnalyzer.analyze(labels)
