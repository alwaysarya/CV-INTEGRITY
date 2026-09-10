"""
Dataset Scorer Module
Combines all quality metrics into final dataset score
"""

import json
import sys
import os
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from dataset_analyzer.detectors.blur_detector import BlurDetector
from dataset_analyzer.detectors.duplicate_detector import DuplicateDetector
from dataset_analyzer.detectors.noise_detector import NoiseDetector
from utils.logger import get_logger

logger = get_logger(__name__)

class DatasetScorer:
    """Calculate overall dataset quality score"""
    
    def __init__(self):
        self.blur_detector = BlurDetector()
        self.duplicate_detector = DuplicateDetector()
        self.noise_detector = NoiseDetector()
    
    def calculate_score(self, dataset_path):
        """
        Calculate overall dataset quality score
        
        Args:
            dataset_path: Path to dataset folder
            
        Returns:
            dict: Complete quality report with scores
        """
        logger.info(f"Analyzing dataset: {dataset_path}")
        
        # Run all detectors
        blur_results = self.blur_detector.analyze_dataset(dataset_path)
        duplicate_results = self.duplicate_detector.detect_duplicates(dataset_path)
        noise_results = self.noise_detector.analyze_dataset(dataset_path)
        
        # Calculate individual scores (0-100)
        # Higher = better quality
        
        # Blur score: 100 - blurry_percentage
        blur_score = 100 - blur_results.get('blurry_percentage', 0)
        
        # Duplicate score: 100 - duplicate_percentage
        duplicate_score = 100 - duplicate_results.get('duplicate_percentage', 0)
        
        # Noise score: 100 - noisy_percentage
        noise_score = 100 - noise_results.get('noisy_percentage', 0)
        
        # Overall dataset score (weighted average)
        weights = {
            'blur': 0.4,
            'duplicate': 0.3,
            'noise': 0.3
        }
        
        overall_score = (
            blur_score * weights['blur'] +
            duplicate_score * weights['duplicate'] +
            noise_score * weights['noise']
        )
        
        # Determine quality category
        if overall_score >= 80:
            quality_category = "GOOD 🟢"
            status = "ACCEPT"
        elif overall_score >= 50:
            quality_category = "MODERATE 🟡"
            status = "REVIEW"
        else:
            quality_category = "POOR 🔴"
            status = "QUARANTINE"
        
        return {
            'dataset_name': Path(dataset_path).name,
            'total_images': blur_results.get('total_images', 0),
            'scores': {
                'blur_score': round(blur_score, 2),
                'duplicate_score': round(duplicate_score, 2),
                'noise_score': round(noise_score, 2),
                'overall_score': round(overall_score, 2)
            },
            'details': {
                'blur': blur_results,
                'duplicate': duplicate_results,
                'noise': noise_results
            },
            'quality_category': quality_category,
            'recommendation': status
        }

if __name__ == "__main__":
    # Test all datasets
    scorer = DatasetScorer()
    
    datasets = [
        ("datasets/processed/good", "GOOD Dataset"),
        ("datasets/processed/bad", "BAD Dataset"),
        ("datasets/processed/worst", "WORST Dataset")
    ]
    
    print("\n" + "="*60)
    print("📊 DATASET QUALITY ANALYSIS REPORT")
    print("="*60)
    
    for path, name in datasets:
        print(f"\n🟢 {name}")
        print("-"*40)
        result = scorer.calculate_score(path)
        print(f"   Overall Score: {result['scores']['overall_score']}/100")
        print(f"   Category: {result['quality_category']}")
        print(f"   Recommendation: {result['recommendation']}")
        print(f"   Total Images: {result['total_images']}")
        
        # Save report
        report_path = Path("outputs/reports") / f"{Path(path).name}_quality_report.json"
        os.makedirs(report_path.parent, exist_ok=True)
        with open(report_path, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"   Report saved: {report_path}")
    
    print("\n" + "="*60)
    print("✅ Analysis Complete!")
    print("="*60)
