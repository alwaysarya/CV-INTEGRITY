"""Dataset quality scorer — main entry"""
from pathlib import Path
from typing import Dict, List
import sys

# Try imports from detectors
try:
    from dataset_analyzer.detectors.blur_detector import BlurDetector
    from dataset_analyzer.detectors.duplicate_detector import DuplicateDetector
    from dataset_analyzer.detectors.noise_detector import NoiseDetector
    from dataset_analyzer.detectors.brightness_detector import BrightnessDetector
    from dataset_analyzer.detectors.contrast_detector import ContrastDetector
    from dataset_analyzer.detectors.resolution_detector import ResolutionDetector
    DETECTORS_AVAILABLE = True
except Exception as e:
    DETECTORS_AVAILABLE = False
    print(f"⚠️ Detector imports failed: {e}")


class DatasetScorer:
    """Score a dataset on quality metrics"""

    def __init__(self):
        self.detectors = []
        if DETECTORS_AVAILABLE:
            try:
                self.detectors = [
                    ("blur", BlurDetector()),
                    ("duplicate", DuplicateDetector()),
                    ("noise", NoiseDetector()),
                    ("brightness", BrightnessDetector()),
                    ("contrast", ContrastDetector()),
                    ("resolution", ResolutionDetector()),
                ]
            except Exception:
                pass

    def score_images(self, image_paths: List[str]) -> Dict:
        if not image_paths:
            return {"status": "empty", "score": 0}

        try:
            import cv2
        except ImportError:
            return {"status": "cv2_missing", "score": 0}

        issues = {name: 0 for name, _ in self.detectors}
        total_processed = 0

        for path in image_paths[:200]:
            img = cv2.imread(str(path))
            if img is None:
                continue
            total_processed += 1
            for name, det in self.detectors:
                try:
                    if hasattr(det, 'detect'):
                        r = det.detect(img)
                        if r.get('issue') or r.get('low_contrast') or r.get('low_resolution'):
                            issues[name] += 1
                except Exception:
                    pass

        if total_processed == 0:
            return {"status": "no_images_loaded", "score": 0}

        total_issues = sum(issues.values())
        issue_rate = total_issues / (total_processed * max(len(self.detectors), 1))
        score = max(0, 100 - issue_rate * 100)

        return {
            "status": "success",
            "total_images": total_processed,
            "issues_per_detector": issues,
            "total_issues": total_issues,
            "score": round(score, 2),
            "grade": self._grade(score),
        }

    @staticmethod
    def _grade(score):
        if score >= 90: return "A"
        if score >= 80: return "B"
        if score >= 70: return "C"
        if score >= 60: return "D"
        return "F"


def score_dataset(image_paths):
    return DatasetScorer().score_images(image_paths)


if __name__ == "__main__":
    import sys
    paths = sys.argv[1:] if len(sys.argv) > 1 else []
    print(score_dataset(paths))
