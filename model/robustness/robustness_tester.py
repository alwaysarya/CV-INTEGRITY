"""
Robustness Tester
Tests model performance under various transformations
"""

import os
import sys
import json
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
from tqdm import tqdm

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from model.robustness.transformations import ImageTransformations
from configs.paths import MODEL_SAVED_PATH, OUTPUT_REPORTS_PATH
from utils.logger import get_logger

logger = get_logger(__name__)

class RobustnessTester:
    """Test model robustness under transformations"""
    
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        self.transformations = ImageTransformations()
    
    def test_single_image(self, image_path):
        """Test a single image with all transformations"""
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        
        results = {}
        
        # Original prediction
        orig_result = self.model(img)
        results['original'] = self._extract_predictions(orig_result)
        
        # Apply transformations
        transforms = self.transformations.apply_all_transformations(img)
        
        for name, transformed_img in transforms.items():
            if name == 'original':
                continue
            pred = self.model(transformed_img)
            results[name] = self._extract_predictions(pred)
        
        return results
    
    def _extract_predictions(self, result):
        """Extract predictions from YOLO result"""
        if len(result) == 0:
            return {'classes': [], 'confidences': [], 'count': 0, 'avg_confidence': 0}
        
        boxes = result[0].boxes
        if boxes is None or len(boxes) == 0:
            return {'classes': [], 'confidences': [], 'count': 0, 'avg_confidence': 0}
        
        classes = boxes.cls.cpu().numpy().tolist()
        confidences = boxes.conf.cpu().numpy().tolist()
        
        return {
            'classes': classes,
            'confidences': confidences,
            'count': len(classes),
            'avg_confidence': np.mean(confidences) if confidences else 0
        }
    
    def calculate_robustness_score(self, results):
        """Calculate robustness score based on prediction stability"""
        if not results or 'original' not in results:
            return 0
        
        original = results['original']
        if original['count'] == 0:
            return 0
        
        original_classes = set(original['classes'])
        scores = []
        
        for transform, pred in results.items():
            if transform == 'original':
                continue
            
            pred_classes = set(pred['classes'])
            
            # Class stability (same classes detected?)
            class_overlap = len(original_classes.intersection(pred_classes))
            class_stability = class_overlap / max(len(original_classes), 1)
            
            # Confidence stability
            conf_stability = 1 - abs(original.get('avg_confidence', 0) - pred.get('avg_confidence', 0)) / 100
            
            # Count stability
            count_stability = 1 - abs(original['count'] - pred['count']) / max(original['count'], 1)
            
            # Combined score
            score = (class_stability * 0.5 + conf_stability * 0.3 + count_stability * 0.2) * 100
            scores.append(score)
        
        return np.mean(scores) if scores else 0
    
    def test_dataset(self, dataset_path, num_samples=10):
        """Test robustness on a dataset"""
        image_path = Path(dataset_path) / "images"
        image_files = list(image_path.glob("*.jpg")) + list(image_path.glob("*.png"))
        
        if not image_files:
            logger.error(f"No images found in {image_path}")
            return None
        
        # Sample images
        sampled = np.random.choice(image_files, min(num_samples, len(image_files)), replace=False)
        
        all_results = {}
        robustness_scores = []
        
        for img_path in tqdm(sampled, desc="Testing robustness"):
            result = self.test_single_image(img_path)
            if result:
                score = self.calculate_robustness_score(result)
                robustness_scores.append(score)
                all_results[img_path.name] = {
                    'robustness_score': score,
                    'predictions': result
                }
        
        return {
            'average_robustness': np.mean(robustness_scores) if robustness_scores else 0,
            'min_robustness': np.min(robustness_scores) if robustness_scores else 0,
            'max_robustness': np.max(robustness_scores) if robustness_scores else 0,
            'samples_tested': len(sampled),
            'details': all_results
        }

def test_all_models():
    """Test robustness on all trained models"""
    # Convert string paths to Path objects
    saved_models_path = Path(MODEL_SAVED_PATH)
    
    models = {
        'good': saved_models_path / 'good' / 'train' / 'weights' / 'best.pt',
        'bad': saved_models_path / 'bad' / 'train' / 'weights' / 'best.pt',
        'worst': saved_models_path / 'worst' / 'train' / 'weights' / 'best.pt'
    }
    
    dataset = Path('datasets/processed/good')
    results = {}
    
    for name, model_path in models.items():
        if model_path.exists():
            logger.info(f"Testing {name} model...")
            tester = RobustnessTester(str(model_path))
            result = tester.test_dataset(dataset, num_samples=10)
            if result:
                results[name] = result
                logger.info(f"  {name}: Robustness = {result['average_robustness']:.2f}%")
        else:
            logger.warning(f"Model not found: {model_path}")
    
    # Save results
    output_dir = Path(OUTPUT_REPORTS_PATH)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / 'robustness_results.json'
    
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    return results

if __name__ == "__main__":
    results = test_all_models()
    print("\n" + "="*50)
    print("📊 ROBUSTNESS TEST RESULTS")
    print("="*50)
    if results:
        for model, data in results.items():
            print(f"\n🟢 {model.upper()}:")
            print(f"   Average Robustness: {data['average_robustness']:.2f}%")
            print(f"   Min: {data['min_robustness']:.2f}%")
            print(f"   Max: {data['max_robustness']:.2f}%")
    else:
        print("❌ No results generated. Check if models exist.")
