"""
Dataset Loaders for CV-INTEGRITY
Supports COCO and YOLO formats for SIH compliance.

COCO format: annotations.json with images, annotations, categories
YOLO format: images/ + labels/ folders with .txt files
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import hashlib


# ============================================================
# COCO DATASET LOADER
# ============================================================
class COCOLoader:
    """Load COCO-format datasets."""
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.annotations_file = None
        self.images = []
        self.annotations = []
        self.categories = []
    
    def load(self) -> Dict[str, Any]:
        """Load COCO dataset."""
        result = {
            "format": "coco",
            "dataset_path": str(self.dataset_path),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if not self.dataset_path.exists():
            result["status"] = "failed"
            result["error"] = f"Path not found: {self.dataset_path}"
            return result
        
        # Find annotation file
        possible_files = [
            self.dataset_path / "annotations.json",
            self.dataset_path / "instances.json",
            self.dataset_path / "_annotations.coco.json",
        ]
        
        for f in possible_files:
            if f.exists():
                self.annotations_file = f
                break
        
        if self.annotations_file is None:
            # Search for any .json file
            json_files = list(self.dataset_path.glob("*.json"))
            if json_files:
                self.annotations_file = json_files[0]
        
        if self.annotations_file is None:
            result["status"] = "failed"
            result["error"] = "No annotations file found"
            return result
        
        try:
            with open(self.annotations_file, 'r') as f:
                data = json.load(f)
            
            self.images = data.get("images", [])
            self.annotations = data.get("annotations", [])
            self.categories = data.get("categories", [])
            
            result["status"] = "success"
            result["num_images"] = len(self.images)
            result["num_annotations"] = len(self.annotations)
            result["num_categories"] = len(self.categories)
            result["categories"] = [c.get("name", "unknown") for c in self.categories[:20]]
            result["annotations_file"] = str(self.annotations_file)
            result["dataset_hash"] = self._compute_hash()
            
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def get_image_annotations(self, image_id: int) -> List[Dict]:
        """Get all annotations for an image."""
        return [a for a in self.annotations if a.get("image_id") == image_id]
    
    def get_category_counts(self) -> Dict[str, int]:
        """Get count of annotations per category."""
        counts = {}
        cat_map = {c["id"]: c.get("name", "unknown") for c in self.categories}
        
        for ann in self.annotations:
            cat_id = ann.get("category_id")
            cat_name = cat_map.get(cat_id, "unknown")
            counts[cat_name] = counts.get(cat_name, 0) + 1
        
        return counts
    
    def get_bbox_stats(self) -> Dict[str, Any]:
        """Get bounding box statistics."""
        if not self.annotations:
            return {}
        
        areas = [a.get("area", 0) for a in self.annotations if "area" in a]
        
        if not areas:
            # Compute from bbox
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
        """Compute dataset hash."""
        if self.annotations_file:
            return hashlib.sha256(self.annotations_file.read_bytes()).hexdigest()[:16]
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
        """Load YOLO dataset."""
        result = {
            "format": "yolo",
            "dataset_path": str(self.dataset_path),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if not self.dataset_path.exists():
            result["status"] = "failed"
            result["error"] = f"Path not found: {self.dataset_path}"
            return result
        
        # Find images and labels directories
        for img_dir_name in ["images", "train/images", "valid/images", "images/train"]:
            possible = self.dataset_path / img_dir_name
            if possible.exists() and possible.is_dir():
                self.images_dir = possible
                break
        
        for lbl_dir_name in ["labels", "train/labels", "valid/labels", "labels/train"]:
            possible = self.dataset_path / lbl_dir_name
            if possible.exists() and possible.is_dir():
                self.labels_dir = possible
                break
        
        if self.images_dir is None:
            result["status"] = "failed"
            result["error"] = "No images directory found"
            return result
        
        # Find image files
        image_extensions = ["*.jpg", "*.jpeg", "*.png", "*.bmp"]
        for ext in image_extensions:
            self.image_files.extend(list(self.images_dir.glob(ext)))
        
        # Find label files
        if self.labels_dir:
            self.label_files = list(self.labels_dir.glob("*.txt"))
        
        # Load class names if available
        classes_file = self.dataset_path / "classes.txt"
        if not classes_file.exists():
            classes_file = self.dataset_path / "data.yaml"
        
        if classes_file.exists() and classes_file.suffix == ".txt":
            with open(classes_file, 'r') as f:
                self.class_names = [line.strip() for line in f if line.strip()]
        
        result["status"] = "success"
        result["num_images"] = len(self.image_files)
        result["num_labels"] = len(self.label_files)
        result["num_classes"] = len(self.class_names) if self.class_names else "unknown"
        result["class_names"] = self.class_names[:20]
        result["images_dir"] = str(self.images_dir)
        result["labels_dir"] = str(self.labels_dir) if self.labels_dir else None
        result["dataset_hash"] = self._compute_hash()
        
        return result
    
    def get_label_stats(self) -> Dict[str, Any]:
        """Get statistics from YOLO labels."""
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
        """Compute dataset hash from file list."""
        hasher = hashlib.sha256()
        for f in sorted(self.image_files)[:100]:  # First 100 files
            hasher.update(str(f.name).encode())
            hasher.update(str(f.stat().st_size).encode())
        return hasher.hexdigest()[:16]


# ============================================================
# AUTO-DETECT FORMAT
# ============================================================
def detect_format(dataset_path: str) -> str:
    """Auto-detect dataset format."""
    path = Path(dataset_path)
    
    if not path.exists():
        return "unknown"
    
    # Check for COCO
    coco_files = ["annotations.json", "instances.json", "_annotations.coco.json"]
    for f in coco_files:
        if (path / f).exists():
            return "coco"
    
    # Check for YOLO
    yolo_dirs = ["images", "labels", "train", "valid"]
    for d in yolo_dirs:
        if (path / d).exists():
            return "yolo"
    
    # Check for any JSON (likely COCO)
    if list(path.glob("*.json")):
        return "coco"
    
    # Check for images + labels
    if list(path.glob("*.jpg")) or list(path.glob("*.png")):
        if list(path.glob("*.txt")):
            return "yolo"
    
    return "unknown"


def load_dataset(dataset_path: str) -> Dict[str, Any]:
    """Load dataset with auto-detection."""
    fmt = detect_format(dataset_path)
    
    if fmt == "coco":
        loader = COCOLoader(dataset_path)
        return loader.load()
    elif fmt == "yolo":
        loader = YOLOLoader(dataset_path)
        return loader.load()
    else:
        return {
            "status": "failed",
            "error": f"Unknown format at {dataset_path}",
            "detected_format": fmt,
        }


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = load_dataset(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python dataset_loaders.py <dataset_path>")
