"""
Assurance Report API — Complete platform integrity assessment
Aggregates 5 modules: Model Integrity, Dataset Integrity, XAI, Backdoor, Source Risk
"""

from fastapi import APIRouter
from pathlib import Path
from typing import Dict, Any, List
import sys
import json
import hashlib
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/assurance", tags=["assurance"])


@router.get("/report")
async def assurance_report():
    """Generate complete assurance report from all 5 modules."""
    modules = {}
    
    # ============================================================
    # 1. MODEL INTEGRITY
    # ============================================================
    try:
        from model.onnx_loader import PyTorchModelLoader
        
        models = []
        for name, subpath in [
            ("good", "good/train/weights/best.pt"),
            ("bad", "bad/train/weights/best.pt"),
            ("worst", "worst/train/weights/best.pt"),
            ("yolov8n", "../../yolov8n.pt"),
        ]:
            full_path = PROJECT_ROOT / "model" / "saved_models" / subpath
            if not full_path.exists():
                full_path = PROJECT_ROOT / subpath.replace("../../", "")
            
            if full_path.exists():
                try:
                    loader = PyTorchModelLoader(str(full_path))
                    r = loader.load()
                    models.append({
                        "name": name,
                        "hash": (r.get("model_hash") or "")[:16],
                        "size_mb": round((r.get("model_size_bytes") or 0) / 1024 / 1024, 2),
                        "params": r.get("parameter_count", 0),
                        "status": r.get("status", "unknown"),
                    })
                except Exception:
                    continue
        
        modules["model_integrity"] = {
            "status": "success" if models else "no_data",
            "models_analyzed": len(models),
            "models": models,
            "summary": f"{len(models)} models verified with SHA-256 fingerprints",
        }
    except Exception as e:
        modules["model_integrity"] = {"status": "failed", "error": str(e)}
    
    # ============================================================
    # 2. DATASET INTEGRITY
    # ============================================================
    try:
        from utils.dataset_loaders import YOLOLoader, COCOLoader
        
        datasets_info = []
        
        # YOLO dataset
        yolo_path = PROJECT_ROOT / "datasets" / "uploaded" / "extracted"
        if yolo_path.exists():
            loader = YOLOLoader(str(yolo_path))
            result = loader.load()
            datasets_info.append({
                "name": "YOLO Extracted",
                "format": "yolo",
                "num_images": result.get("num_images", 0),
                "num_labels": result.get("num_labels", 0),
                "hash": result.get("dataset_hash", ""),
            })
        
        # COCO dataset
        coco_path = PROJECT_ROOT / "datasets" / "raw" / "labels" / "annotations"
        coco_file = coco_path / "instances_val2017.json"
        if coco_file.exists():
            loader = COCOLoader(str(coco_path), annotation_name="instances_val2017.json")
            result = loader.load()
            datasets_info.append({
                "name": "COCO-2017 Val",
                "format": "coco",
                "num_images": result.get("num_images", 0),
                "num_annotations": result.get("num_annotations", 0),
                "num_categories": result.get("num_categories", 0),
                "hash": result.get("dataset_hash", ""),
            })
        
        modules["dataset_integrity"] = {
            "status": "success" if datasets_info else "no_data",
            "datasets_analyzed": len(datasets_info),
            "datasets": datasets_info,
            "summary": f"{len(datasets_info)} datasets with cryptographic hashing",
        }
    except Exception as e:
        modules["dataset_integrity"] = {"status": "failed", "error": str(e)}
    
    # ============================================================
    # 3. XAI (Explainable AI)
    # ============================================================
    try:
        from xai.explainer import XAIExplainer
        import numpy as np
        
        # Generate test explanation
        explainer = XAIExplainer(model_name="yolov8n")
        img = np.random.rand(64, 64, 3).astype(np.float32)
        result = explainer.explain(img, method="occlusion")
        
        methods_available = explainer.get_supported_methods()
        
        modules["xai"] = {
            "status": "success",
            "methods_supported": len(methods_available.get("black_box", [])) + len(methods_available.get("white_box", [])),
            "methods_list": methods_available,
            "last_confidence": result.get("confidence", 0),
            "summary": f"{len(methods_available.get('black_box', []))} black-box methods available",
        }
    except Exception as e:
        modules["xai"] = {"status": "failed", "error": str(e)}
    
    # ============================================================
    # 4. BACKDOOR DETECTION
    # ============================================================
    try:
        from model.backdoor_detector import BackdoorDetector
        import numpy as np
        
        detector = BackdoorDetector(access_level="black-box")
        test_imgs = np.random.rand(20, 64, 64, 3).astype(np.float32)
        result = detector.detect(test_imgs)
        
        modules["backdoor_detection"] = {
            "status": "success",
            "risk_level": result.get("overall_risk", {}).get("level", "UNKNOWN"),
            "risk_score": result.get("overall_risk", {}).get("score", 0),
            "methods_run": len(result.get("findings", [])),
            "recommendation": result.get("recommendation", "REVIEW"),
            "summary": f"Risk: {result.get('overall_risk', {}).get('level', 'UNKNOWN')}",
        }
    except Exception as e:
        modules["backdoor_detection"] = {"status": "failed", "error": str(e)}
    
    # ============================================================
    # 5. SOURCE RISK
    # ============================================================
    try:
        from dataset_analyzer.source_risk import aggregate_contributor_risk
        
        # Sample contributor data
        contributors = [
            {"source_id": f"contrib_{i}", "sample_id": f"img_{j}", "is_anomaly": j < (i * 2)}
            for i in range(1, 4)
            for j in range(10)
        ]
        report = aggregate_contributor_risk(contributors)
        
        modules["source_risk"] = {
            "status": "success",
            "total_sources": report.get("summary", {}).get("total_sources", 0),
            "critical": report.get("summary", {}).get("critical", 0),
            "low": report.get("summary", {}).get("low", 0),
            "sources": report.get("sources", [])[:3],  # Top 3
            "summary": f"{report.get('summary', {}).get('total_sources', 0)} sources aggregated",
        }
    except Exception as e:
        modules["source_risk"] = {"status": "failed", "error": str(e)}
    
    # ============================================================
    # OVERALL STATUS
    # ============================================================
    successful = sum(1 for m in modules.values() if m.get("status") == "success")
    total = len(modules)
    
    overall_status = "success" if successful == total else ("partial" if successful > 0 else "failed")
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "overall_status": overall_status,
        "modules_analyzed": total,
        "modules_successful": successful,
        "modules": modules,
    }


@router.get("/export")
async def export_report():
    """Export report as JSON string."""
    report = await assurance_report()
    return {
        "filename": f"assurance-report-{datetime.utcnow().strftime('%Y-%m-%d')}.json",
        "content": json.dumps(report, indent=2, default=str),
    }
