"""
YOLO Model Trainer for CV-INTEGRITY
Trains YOLOv8 on GOOD, BAD, and WORST datasets
"""

import os
import sys
import json
import yaml
from pathlib import Path
from ultralytics import YOLO
import torch

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from configs.paths import (
    DATASET_GOOD_PATH, DATASET_BAD_PATH, DATASET_WORST_PATH,
    MODEL_SAVED_PATH, MODEL_CONFIGS_PATH
)
from configs.constants import DEFAULT_MODEL, EPOCHS, BATCH_SIZE, IMAGE_SIZE
from utils.logger import get_logger

logger = get_logger(__name__)

class YOLOTrainer:
    """YOLO model trainer with dataset quality tracking"""
    
    def __init__(self, model_name=DEFAULT_MODEL):
        self.model_name = model_name
        self.model = None
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        logger.info(f"Using device: {self.device}")
        
    def create_dataset_yaml(self, dataset_path, dataset_name):
        """Create YOLO dataset YAML file"""
        dataset_path = Path(dataset_path)
        
        yaml_content = {
            'path': str(dataset_path.absolute()),
            'train': 'images',
            'val': 'images',
            'nc': 4,
            'names': ['car', 'bicycle', 'bus', 'truck']
        }
        
        yaml_path = Path(MODEL_CONFIGS_PATH) / f"{dataset_name}_dataset.yaml"
        os.makedirs(yaml_path.parent, exist_ok=True)
        
        with open(yaml_path, 'w') as f:
            yaml.dump(yaml_content, f, default_flow_style=False)
        
        return str(yaml_path)
    
    def train(self, dataset_path, dataset_name, epochs=EPOCHS):
        """Train YOLO model on given dataset"""
        logger.info(f"🚀 Training YOLO on {dataset_name.upper()} dataset...")
        
        # Create dataset YAML
        yaml_path = self.create_dataset_yaml(dataset_path, dataset_name)
        
        # Initialize YOLO model
        self.model = YOLO(f"{self.model_name}.pt")
        
        # Training
        results = self.model.train(
            data=yaml_path,
            epochs=epochs,
            batch=BATCH_SIZE,
            imgsz=IMAGE_SIZE,
            device=self.device,
            workers=0,
            patience=10,
            save=True,
            project=str(Path(MODEL_SAVED_PATH) / dataset_name),
            name="train",
            exist_ok=True,
            verbose=True,
            plots=True
        )
        
        # ============================================================
        # EXTRACT METRICS CORRECTLY
        # ============================================================
        # Validation metrics are in results.results_dict or results.metrics
        metrics = {
            'precision': 0.0,
            'recall': 0.0,
            'mAP50': 0.0,
            'mAP50_95': 0.0
        }
        
        try:
            # Try results_dict first
            if hasattr(results, 'results_dict') and results.results_dict:
                rd = results.results_dict
                metrics['precision'] = float(rd.get('metrics/precision(B)', rd.get('metrics/precision', 0)))
                metrics['recall'] = float(rd.get('metrics/recall(B)', rd.get('metrics/recall', 0)))
                metrics['mAP50'] = float(rd.get('metrics/mAP50(B)', rd.get('metrics/mAP50', 0)))
                metrics['mAP50_95'] = float(rd.get('metrics/mAP50-95(B)', rd.get('metrics/mAP50-95', 0)))
            
            # If still 0, try to load from results.csv
            if metrics['mAP50'] == 0.0:
                results_csv = Path(MODEL_SAVED_PATH) / dataset_name / "train" / "results.csv"
                if results_csv.exists():
                    import csv
                    with open(results_csv, 'r') as f:
                        reader = list(csv.DictReader(f))
                        if reader:
                            last_row = reader[-1]
                            # Find mAP columns
                            for key in last_row.keys():
                                key_clean = key.strip()
                                if 'mAP50(B)' in key_clean or 'mAP50' == key_clean:
                                    metrics['mAP50'] = float(last_row[key])
                                elif 'mAP50-95' in key_clean:
                                    metrics['mAP50_95'] = float(last_row[key])
                                elif 'precision' in key_clean.lower():
                                    metrics['precision'] = float(last_row[key])
                                elif 'recall' in key_clean.lower():
                                    metrics['recall'] = float(last_row[key])
        except Exception as e:
            logger.error(f"Error extracting metrics: {e}")
        
        # Save results
        result_path = Path(MODEL_SAVED_PATH) / dataset_name / "training_results.json"
        os.makedirs(result_path.parent, exist_ok=True)
        
        output = {
            'dataset': dataset_name,
            'epochs': epochs,
            'model': self.model_name,
            'device': self.device,
            'metrics': metrics
        }
        
        with open(result_path, 'w') as f:
            json.dump(output, f, indent=2)
        
        logger.info(f"✅ {dataset_name}: mAP50 = {metrics['mAP50']*100:.2f}%")
        
        return output
    
    def train_all_datasets(self, epochs=EPOCHS):
        """Train models on all three datasets"""
        datasets = [
            (DATASET_GOOD_PATH, 'good'),
            (DATASET_BAD_PATH, 'bad'),
            (DATASET_WORST_PATH, 'worst')
        ]
        
        results = {}
        
        for dataset_path, dataset_name in datasets:
            try:
                result = self.train(dataset_path, dataset_name, epochs)
                results[dataset_name] = result
            except Exception as e:
                logger.error(f"❌ Error training on {dataset_name}: {e}")
                results[dataset_name] = {'error': str(e)}
        
        # Save combined results
        combined_path = Path(MODEL_SAVED_PATH) / "all_training_results.json"
        with open(combined_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        return results

if __name__ == "__main__":
    trainer = YOLOTrainer()
    results = trainer.train_all_datasets(epochs=20)
    print(json.dumps(results, indent=2))
