"""
Dataset Loaders — Real Implementation
Supports COCO, YOLO formats for SIH compliance.
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import hashlib


# ============================================================
# COCO DATASET LOADER
# ============================================================
class COCOLoader:
    """Load COCO-format datasets with recursive JSON search."""
    
    def __init__(self, dataset_path: str, annotation_name: str = "instances_val2017.json"):
        self.dataset_path = Path(dataset_path)
        self.annotation_name = annotation_name
        self.annotations_file = None
        self.images = []
        self.annotations = []
        self.categories = []
    
    def load(self) -> Dict[str, Any]:
        result = {
            "format": "coco",
            "dataset_path": str(self.dataset_path),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if not self.dataset_path.exists():
            result["status"] = "failed"
            result["error"] = f"Path not found: {self.dataset_path}"
            return result
        
        # Search for JSON files recursively
        json_files = list(self.dataset_path.rglob("*.json"))
        
        # Prefer specific annotation file
        preferred = None
        for f in json_files:
            if f.name == self.annotation_name:
                preferred = f
                break
        
        # Fallback to instances_* or first JSON
        if preferred is None:
            for f in json_files:
                if 'instances' in f.name.lower():
                    preferred = f
                    break
        
        if preferred is None and json_files:
            preferred = json_files[0]
        
        if preferred is None:
            result["status"] = "failed"
            result["error"] = "No JSON annotations found"
            return result
        
        self.annotations_file = preferred
        result["annotations_file"] = str(preferred)
        result["file_size_bytes"] = preferred.stat().st_size
        
        try:
            with open(preferred, 'r') as f:
                data = json.load(f)
            
            self.images = data.get("images", [])
            self.annotations = data.get("annotations", [])
            self.categories = data.get("categories", [])
            
            result["status"] = "success"
            result["num_images"] = len(self.images)
            result["num_annotations"] = len(self.annotations)
            result["num_categories"] = len(self.categories)
            result["categories"] = [c.get("name", "unknown") for c in self.categories[:30]]
            result["dataset_hash"] = self._compute_hash()
            result["sample_images"] = [img.get("file_name") for img in self.images[:5]]
            
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def get_image_annotations(self, image_id: int) -> List[Dict]:
        return [a for a in self.annotations if a.get("image_id") == image_id]
    
    def get_category_counts(self) -> Dict[str, int]:
        counts = {}
        cat_map = {c["id"]: c.get("name", "unknown") for c in self.categories}
        for ann in self.annotations:
            cat_id = ann.get("category_id")
            cat_name = cat_map.get(cat_id, "unknown")
            counts[cat_name] = counts.get(cat_name, 0) + 1
        return dict(sorted(counts.items(), key=lambda x: -x[1]))
    
    def get_bbox_stats(self) -> Dict[str, Any]:
        if not self.annotations:
            return {}
        areas = [a.get("area", 0) for a in self.annotations if "area" in a]
        if not areas:
            for a in self.annotations:
                bbox = a.get("bbox", [0, 0, 0, 0])
                areas.append(bbox[2] * bbox[3])
        return {
            "min_area": float(np.min(areas)),
            "max_area": float(np.max(areas)),
            "mean_area": float(np.mean(areas)),
            "median_area": float(np.median(areas)),
            "num_boxes": len(areas),
        }
    
    def _compute_hash(self) -> str:
        if self.annotations_file:
            sha = hashlib.sha256()
            with open(self.annotations_file, 'rb') as f:
                for chunk in iter(lambda: f.read(8192), b''):
                    sha.update(chunk)
            return sha.hexdigest()[:16]
        return ""


# ============================================================
# YOLO DATASET LOADER
# ============================================================
class YOLOLoader:
    """Load YOLO-format datasets."""
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.images_dir = None
        self.labels_dir = None
        self.class_names = []
        self.image_files = []
        self.label_files = []
    
    def load(self) -> Dict[str, Any]:
        result = {
            "format": "yolo",
            "dataset_path": str(self.dataset_path),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if not self.dataset_path.exists():
            result["status"] = "failed"
            result["error"] = f"Path not found: {self.dataset_path}"
            return result
        
        # Find images dir
        for name in ["images", "train/images", "valid/images", "images/train", "images/val"]:
            candidate = self.dataset_path / name
            if candidate.exists() and candidate.is_dir():
                self.images_dir = candidate
                break
        
        # Find labels dir
        for name in ["labels", "train/labels", "valid/labels", "labels/train", "labels/val"]:
            candidate = self.dataset_path / name
            if candidate.exists() and candidate.is_dir():
                self.labels_dir = candidate
                break
        
        if self.images_dir is None:
            result["status"] = "failed"
            result["error"] = "No images directory found"
            return result
        
        # Find image files
        for ext in ["*.jpg", "*.jpeg", "*.png", "*.bmp"]:
            self.image_files.extend(list(self.images_dir.glob(ext)))
        
        # Find label files
        if self.labels_dir:
            self.label_files = list(self.labels_dir.glob("*.txt"))
        
        # Class names
        for name in ["classes.txt", "data.yaml", "obj.names"]:
            cf = self.dataset_path / name
            if cf.exists() and cf.suffix == ".txt":
                with open(cf, 'r') as f:
                    self.class_names = [line.strip() for line in f if line.strip()]
                break
        
        result["status"] = "success"
        result["num_images"] = len(self.image_files)
        result["num_labels"] = len(self.label_files)
        result["num_classes"] = len(self.class_names) if self.class_names else "unknown"
        result["class_names"] = self.class_names[:30]
        result["images_dir"] = str(self.images_dir)
        result["labels_dir"] = str(self.labels_dir) if self.labels_dir else None
        result["dataset_hash"] = self._compute_hash()
        
        return result
    
    def get_label_stats(self) -> Dict[str, Any]:
        stats = {
            "total_boxes": 0,
            "class_counts": {},
            "avg_boxes_per_image": 0,
        }
        for label_file in self.label_files:
            try:
                with open(label_file, 'r') as f:
                    lines = f.readlines()
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        class_id = int(parts[0])
                        stats["total_boxes"] += 1
                        stats["class_counts"][class_id] = stats["class_counts"].get(class_id, 0) + 1
            except Exception:
                continue
        if self.label_files:
            stats["avg_boxes_per_image"] = stats["total_boxes"] / len(self.label_files)
        return stats
    
    def _compute_hash(self) -> str:
        hasher = hashlib.sha256()
        for f in sorted(self.image_files)[:100]:
            hasher.update(str(f.name).encode())
            hasher.update(str(f.stat().st_size).encode())
        return hasher.hexdigest()[:16]


# ============================================================
# AUTO-DETECT
# ============================================================
def detect_format(dataset_path: str) -> str:
    path = Path(dataset_path)
    if not path.exists():
        return "unknown"
    
    # COCO
    for f in ["annotations.json", "instances.json", "_annotations.coco.json"]:
        if (path / f).exists():
            return "coco"
    
    # COCO in subdirs
    if list(path.rglob("instances_*.json")):
        return "coco"
    
    # YOLO
    for d in ["images", "labels", "train", "valid"]:
        if (path / d).exists():
            return "yolo"
    
    if list(path.rglob("*.jpg")) and list(path.rglob("*.txt")):
        return "yolo"
    
    return "unknown"


def load_dataset(dataset_path: str) -> Dict[str, Any]:
    fmt = detect_format(dataset_path)
    if fmt == "coco":
        return COCOLoader(dataset_path).load()
    elif fmt == "yolo":
        return YOLOLoader(dataset_path).load()
    else:
        return {"status": "failed", "error": f"Unknown format", "detected_format": fmt}


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = load_dataset(sys.argv[1])
        print(json.dumps(result, indent=2, default=str))
    else:
        print("Usage: python dataset_loaders.py <path>")
