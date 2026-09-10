"""
Model Evaluator
Evaluates trained YOLO models on test data
"""

import os
import sys
import json
import torch
from pathlib import Path
from ultralytics import YOLO
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from configs.paths import MODEL_SAVED_PATH
from utils.logger import get_logger

logger = get_logger(__name__)

class ModelEvaluator:
    """Evaluate trained YOLO models"""
    
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
    def evaluate_model(self, model_path, test_data_path):
        """
        Evaluate a single model
        
        Args:
            model_path: Path to model weights
            test_data_path: Path to test data
            
        Returns:
            dict: Evaluation metrics
        """
        logger.info(f"Evaluating model: {model_path}")
        
        # Load model
        model = YOLO(model_path)
        
        # Run evaluation
        results = model.val(
            data=test_data_path,
            device=self.device,
            batch=8,
            imgsz=640,
            plots=True
        )
        
        # Extract metrics
        metrics = {
            'precision': float(results.results_dict.get('metrics/precision', 0)),
            'recall': float(results.results_dict.get('metrics/recall', 0)),
            'mAP50': float(results.results_dict.get('metrics/mAP50', 0)),
            'mAP50_95': float(results.results_dict.get('metrics/mAP50-95', 0)),
            'fitness': float(results.results_dict.get('metrics/fitness', 0))
        }
        
        return metrics
    
    def evaluate_all_models(self):
        """Evaluate all trained models"""
        models = {
            'good': Path(MODEL_SAVED_PATH) / 'good' / 'train' / 'weights' / 'best.pt',
            'bad': Path(MODEL_SAVED_PATH) / 'bad' / 'train' / 'weights' / 'best.pt',
            'worst': Path(MODEL_SAVED_PATH) / 'worst' / 'train' / 'weights' / 'best.pt'
        }
        
        # Use GOOD dataset YAML for testing
        test_data = Path('model/configs/good_dataset.yaml')
        
        results = {}
        for name, path in models.items():
            if path.exists():
                metrics = self.evaluate_model(str(path), str(test_data))
                results[name] = metrics
            else:
                results[name] = {'error': f'Model not found: {path}'}
                logger.warning(f"Model not found: {path}")
        
        # Save results
        results_path = Path(MODEL_SAVED_PATH) / "evaluation_results.json"
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Create comparison DataFrame
        df = pd.DataFrame(results).T
        df.to_csv(Path(MODEL_SAVED_PATH) / "model_comparison.csv")
        
        return results

if __name__ == "__main__":
    evaluator = ModelEvaluator()
    results = evaluator.evaluate_all_models()
    
    print("\n" + "="*60)
    print("📊 Model Evaluation Results")
    print("="*60)
    
    for model, metrics in results.items():
        print(f"\n🟢 {model.upper()} Model:")
        print(f"   Precision: {metrics.get('precision', 0)*100:.2f}%")
        print(f"   Recall: {metrics.get('recall', 0)*100:.2f}%")
        print(f"   mAP50: {metrics.get('mAP50', 0)*100:.2f}%")
        print(f"   mAP50-95: {metrics.get('mAP50_95', 0)*100:.2f}%")
