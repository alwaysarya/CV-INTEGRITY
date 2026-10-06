#!/usr/bin/env python3
"""Resume training — completed models skip kare"""
import sys, os, json, time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pathlib import Path
import torch

SAVE = Path("model/saved_models/yolo_10")
PRETRAINED = Path("model/pretrained")
DATA = "model/configs/coco20.yaml"
DEVICE = 'mps' if torch.backends.mps.is_available() else 'cpu'

MODELS = [
    "yolo11n", "yolo11s", "yolo11m", "yolo11l",
    "yolov10n", "yolov10m", "yolov10x",
    "yolov9c", "yolov9e",
    "yolov8x",
]

def is_trained(name):
    """Check karo model train ho chuka hai"""
    summary_file = SAVE / name / "train" / "results.csv"
    weights_file = SAVE / name / "train" / "weights" / "best.pt"
    return summary_file.exists() and weights_file.exists()

def train(name, epochs):
    print(f"\n{'='*70}\n🚀 {name} | epochs={epochs}\n{'='*70}")
    from ultralytics import YOLO
    weights = PRETRAINED / f"{name}.pt"
    if not weights.exists():
        return {"model": name, "error": "weights missing"}
    try:
        model = YOLO(str(weights))
        model.train(
            data=DATA, epochs=epochs, batch=8, imgsz=640,
            device=DEVICE, workers=0, patience=20,
            save=True, project=str(SAVE / name),
            name="train", exist_ok=True, plots=True, verbose=False,
        )
        m = model.val()
        return {
            "model": name,
            "mAP50": float(m.box.map50),
            "mAP50-95": float(m.box.map),
        }
    except Exception as e:
        return {"model": name, "error": str(e)}

def main():
    epochs = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    results = []
    start = time.time()
    
    for i, name in enumerate(MODELS, 1):
        if is_trained(name):
            print(f"\n[{i}/10] ✅ {name} — ALREADY TRAINED, skipping")
            continue
        print(f"\n[{i}/10] 🚀 {name}")
        results.append(train(name, epochs))
    
    print(f"\n{'='*70}\n✅ DONE | {(time.time()-start)/60:.1f} min\n{'='*70}")

if __name__ == "__main__":
    main()
