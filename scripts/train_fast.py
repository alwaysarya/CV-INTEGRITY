#!/usr/bin/env python3
"""
FAST TRAINING - Sirf 20 epochs (5-7 minutes)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from model.trainer import YOLOTrainer

def main():
    print("\n" + "="*60)
    print("🚀 FAST TRAINING (20 Epochs Only)")
    print("="*60 + "\n")
    
    trainer = YOLOTrainer()
    results = trainer.train_all_datasets(epochs=20)
    
    print("\n" + "="*60)
    print("📊 Training Complete!")
    print("="*60)
    for dataset, result in results.items():
        if 'metrics' in result:
            m = result['metrics']
            print(f"   {dataset.upper()}: mAP50 = {m.get('mAP50', 0)*100:.1f}%")
        else:
            print(f"   {dataset.upper()}: {result.get('error', 'Error')}")

if __name__ == "__main__":
    main()
