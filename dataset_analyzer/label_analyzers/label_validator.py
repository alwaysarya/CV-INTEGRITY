"""Label validator"""
from typing import List, Dict


class LabelValidator:
    @staticmethod
    def validate(labels: List[int], num_classes: int = None) -> Dict:
        if not labels:
            return {"status": "empty", "valid": False}
        errors = []
        if num_classes is not None:
            invalid = [l for l in labels if l < 0 or l >= num_classes]
            if invalid:
                errors.append(f"{len(invalid)} labels out of range [0, {num_classes})")
        if any(not isinstance(l, int) for l in labels):
            errors.append("Non-integer labels found")
        return {
            "status": "analyzed",
            "total": len(labels),
            "valid": len(errors) == 0,
            "errors": errors,
        }


def validate_labels(labels, num_classes=None):
    return LabelValidator.validate(labels, num_classes)
