import json
import sys
import os
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from dataset_analyzer.detectors.blur_detector import BlurDetector
from dataset_analyzer.detectors.duplicate_detector import DuplicateDetector
from dataset_analyzer.detectors.noise_detector import NoiseDetector


def convert_to_serializable(obj):
    import numpy as np
    if isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(v) for v in obj]
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj


class DatasetScorer:
    def __init__(self):
        self.blur_detector = BlurDetector()
        self.duplicate_detector = DuplicateDetector()
        self.noise_detector = NoiseDetector()

    def calculate_score(self, dataset_path):
        blur_results = self.blur_detector.analyze_dataset(dataset_path)
        duplicate_results = self.duplicate_detector.detect_duplicates(dataset_path)
        noise_results = self.noise_detector.analyze_dataset(dataset_path)

        blur_score = float(100 - blur_results.get('blurry_percentage', 0))
        duplicate_score = float(100 - duplicate_results.get('duplicate_percentage', 0))
        noise_score = float(100 - noise_results.get('noisy_percentage', 0))

        weights = {'blur': 0.4, 'duplicate': 0.3, 'noise': 0.3}
        overall_score = float(
            blur_score * weights['blur'] +
            duplicate_score * weights['duplicate'] +
            noise_score * weights['noise']
        )

        if overall_score >= 80:
            quality_category = "GOOD"
            status = "ACCEPT"
        elif overall_score >= 50:
            quality_category = "MODERATE"
            status = "REVIEW"
        else:
            quality_category = "POOR"
            status = "QUARANTINE"

        result = {
            'dataset_name': str(Path(dataset_path).name),
            'total_images': int(blur_results.get('total_images', 0)),
            'scores': {
                'blur_score': float(round(blur_score, 2)),
                'duplicate_score': float(round(duplicate_score, 2)),
                'noise_score': float(round(noise_score, 2)),
                'overall_score': float(round(overall_score, 2))
            },
            'details': {
                'blur': blur_results,
                'duplicate': duplicate_results,
                'noise': noise_results
            },
            'quality_category': quality_category,
            'recommendation': status
        }

        return convert_to_serializable(result)


if __name__ == "__main__":
    scorer = DatasetScorer()
    datasets = [
        ("datasets/processed/good", "GOOD Dataset"),
        ("datasets/processed/bad", "BAD Dataset"),
        ("datasets/processed/worst", "WORST Dataset")
    ]

    print("\n" + "="*60)
    print("DATASET QUALITY ANALYSIS REPORT")
    print("="*60)

    for path, name in datasets:
        print(f"\n{name}")
        print("-"*40)
        result = scorer.calculate_score(path)
        print(f"   Overall Score: {result['scores']['overall_score']}/100")
        print(f"   Category: {result['quality_category']}")
        print(f"   Recommendation: {result['recommendation']}")
        print(f"   Total Images: {result['total_images']}")

        report_path = Path("outputs/reports") / f"{Path(path).name}_quality_report.json"
        os.makedirs(report_path.parent, exist_ok=True)
        with open(report_path, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"   Report saved: {report_path}")

    print("\n" + "="*60)
    print("Analysis Complete!")
    print("="*60)
