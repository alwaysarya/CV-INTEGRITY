"""Evaluate all trained YOLO models against their datasets"""
from ultralytics import YOLO
from pathlib import Path
import json
import sys

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def evaluate_all():
    models = [
        ("good",  "model/saved_models/good/train/weights/best.pt",  "model/configs/good_dataset.yaml"),
        ("bad",   "model/saved_models/bad/train/weights/best.pt",   "model/configs/bad_dataset.yaml"),
        ("worst", "model/saved_models/worst/train/weights/best.pt", "model/configs/worst_dataset.yaml"),
    ]

    results = {}

    for name, model_path, config_path in models:
        print(f"\n📊 Evaluating: {name}")
        print(f"   Model: {model_path}")
        print(f"   Config: {config_path}")

        if not Path(model_path).exists():
            print(f"   ❌ Model not found")
            continue
        if not Path(config_path).exists():
            print(f"   ❌ Config not found")
            continue

        try:
            model = YOLO(model_path)
            metrics = model.val(
                data=config_path,
                verbose=False,
                plots=False,
                save_json=False,
            )

            results[name] = {
                "precision": round(float(metrics.box.mp), 4),
                "recall": round(float(metrics.box.mr), 4),
                "mAP50": round(float(metrics.box.map50), 4),
                "mAP50_95": round(float(metrics.box.map), 4),
                "fitness": round(float(metrics.fitness), 4),
            }

            print(f"   ✅ Precision: {results[name]['precision']}")
            print(f"   ✅ Recall:    {results[name]['recall']}")
            print(f"   ✅ mAP50:     {results[name]['mAP50']}")
            print(f"   ✅ mAP50-95:  {results[name]['mAP50_95']}")

        except Exception as e:
            print(f"   ❌ Error: {e}")
            results[name] = {
                "precision": 0.0, "recall": 0.0,
                "mAP50": 0.0, "mAP50_95": 0.0, "fitness": 0.0,
            }

    # Save results
    output_file = PROJECT_ROOT / "model" / "saved_models" / "evaluation_results.json"
    output_file.write_text(json.dumps(results, indent=2))
    print(f"\n✅ Results saved to: {output_file}")

    # Also save comparison CSV
    csv_file = PROJECT_ROOT / "model" / "saved_models" / "model_comparison.csv"
    with open(csv_file, 'w') as f:
        f.write("model,precision,recall,mAP50,mAP50_95,fitness\n")
        for name, r in results.items():
            f.write(f"{name},{r['precision']},{r['recall']},{r['mAP50']},{r['mAP50_95']},{r['fitness']}\n")
    print(f"✅ CSV saved to: {csv_file}")

    return results


if __name__ == "__main__":
    print("=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)
    results = evaluate_all()
    print()
    print("=" * 60)
    print(json.dumps(results, indent=2))
    print("=" * 60)
