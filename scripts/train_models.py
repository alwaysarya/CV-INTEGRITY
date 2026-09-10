#!/usr/bin/env python3
"""
Training script for all YOLO models
Run this to train GOOD, BAD, and WORST models
"""

import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from model.trainer import YOLOTrainer
from model.evaluation.evaluator import ModelEvaluator

def main():
    """Main training function"""
    print("\n" + "="*70)
    print("🚀 CV-INTEGRITY AI - YOLO Training Pipeline")
    print("="*70 + "\n")
    
    # Step 1: Train models
    print("📚 PHASE 1: Training YOLO Models\n")
    trainer = YOLOTrainer()
    training_results = trainer.train_all_datasets(epochs=50)  # 50 epochs for good results
    
    # Print training results
    print("\n📊 Training Results:")
    for dataset, result in training_results.items():
        if 'metrics' in result:
            m = result['metrics']
            print(f"   🟢 {dataset.upper()}: mAP50 = {m.get('mAP50', 0)*100:.2f}%")
        else:
            print(f"   ❌ {dataset.upper()}: {result.get('error', 'Unknown error')}")
    
    # Step 2: Evaluate models
    print("\n📊 PHASE 2: Evaluating Models\n")
    evaluator = ModelEvaluator()
    evaluation_results = evaluator.evaluate_all_models()
    
    # Print evaluation results
    print("\n📊 Evaluation Results:")
    for model, metrics in evaluation_results.items():
        if 'error' not in metrics:
            print(f"   🟢 {model.upper()}: mAP50 = {metrics.get('mAP50', 0)*100:.2f}%")
        else:
            print(f"   ❌ {model.upper()}: {metrics.get('error')}")
    
    print("\n" + "="*70)
    print("✅ Training Pipeline Complete!")
    print("📁 Check model/saved_models/ for results")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
