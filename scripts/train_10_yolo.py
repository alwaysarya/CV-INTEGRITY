#!/usr/bin/env python3
"""Train 10 latest YOLO models on COCO 20-class (local weights)"""
import sys, os, json, time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pathlib import Path
import torch

SAVE = Path("model/saved_models/yolo_10")
SAVE.mkdir(parents=True, exist_ok=True)
PRETRAINED = Path("model/pretrained")
DATA = "model/configs/coco20.yaml"
DEVICE = 'mps' if torch.backends.mps.is_available() else 'cpu'

MODELS = [
    "yolo11n", "yolo11s", "yolo11m", "yolo11l",
    "yolov10n", "yolov10m", "yolov10x",
    "yolov9c", "yolov9e",
    "yolov8x",
]

def train(name, epochs):
    print(f"\n{'='*70}\n🚀 {name} | epochs={epochs} | device={DEVICE}\n{'='*70}")
    from ultralytics import YOLO
    
    weights = PRETRAINED / f"{name}.pt"
    if not weights.exists():
        print(f"❌ {weights} not found")
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
        r = {
            "model": name,
            "mAP50": float(m.box.map50),
            "mAP50-95": float(m.box.map),
            "precision": float(m.box.mp),
            "recall": float(m.box.mr),
        }
        print(f"✅ {name}: mAP50={r['mAP50']*100:.2f}%")
        return r
    except Exception as e:
        print(f"❌ {name}: {e}")
        return {"model": name, "error": str(e)}

def main():
    epochs = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    results = []
    start = time.time()
    
    for i, name in enumerate(MODELS, 1):
        print(f"\n[{i}/{len(MODELS)}]")
        results.append(train(name, epochs))
    
    summary = {
        "device": DEVICE, "epochs": epochs,
        "total_time_min": round((time.time()-start)/60, 1),
        "results": results,
    }
    (SAVE / "summary.json").write_text(json.dumps(summary, indent=2))
    
    print(f"\n{'='*70}\n✅ DONE | {summary['total_time_min']} min\n{'='*70}")
    for r in results:
        val = r.get('mAP50', r.get('error', 'N/A'))
        print(f"  {r['model']}: {val}")

if __name__ == "__main__":
    main()
