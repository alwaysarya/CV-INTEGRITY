"""
COCO Dataset Loader
Supports COCO format for training-data integrity assessment.
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any, List


class COCOLoader:
    """Load and inspect COCO format datasets."""
    
    @staticmethod
    def is_coco(filepath: str) -> bool:
        """Check if file is COCO format (JSON with images/annotations)."""
        if not str(filepath).endswith('.json'):
            return False
        
        try:
            with open(filepath) as f:
                data = json.load(f)
            
            # COCO has 'images', 'annotations', 'categories' keys
            required_keys = {'images', 'annotations', 'categories'}
            return required_keys.issubset(data.keys())
        except:
            return False
    
    @staticmethod
    def load(filepath: str) -> Optional[Dict[str, Any]]:
        """Load COCO annotation file."""
        try:
            with open(filepath) as f:
                data = json.load(f)
            
            images = data.get('images', [])
            annotations = data.get('annotations', [])
            categories = data.get('categories', [])
            
            # Calculate stats
            class_counts = {}
            for ann in annotations:
                cat_id = ann.get('category_id')
                class_counts[cat_id] = class_counts.get(cat_id, 0) + 1
            
            # Map category IDs to names
            cat_map = {c['id']: c['name'] for c in categories}
            class_distribution = {
                cat_map.get(cid, f'class_{cid}'): count
                for cid, count in class_counts.items()
            }
            
            return {
                'format': 'COCO',
                'total_images': len(images),
                'total_annotations': len(annotations),
                'total_categories': len(categories),
                'categories': [c['name'] for c in categories],
                'class_distribution': class_distribution,
                'images_sample': [
                    {
                        'id': img.get('id'),
                        'file_name': img.get('file_name'),
                        'width': img.get('width'),
                        'height': img.get('height'),
                    }
                    for img in images[:5]
                ],
                'info': data.get('info', {}),
                'licenses': data.get('licenses', []),
            }
        except Exception as e:
            return {
                'format': 'COCO',
                'error': str(e),
            }
    
    @staticmethod
    def detect_format(dataset_dir: str) -> Dict[str, Any]:
        """Detect dataset format in directory."""
        path = Path(dataset_dir)
        
        if not path.exists():
            return {'format': 'UNKNOWN', 'error': 'Directory not found'}
        
        # Check for COCO (annotations.json or instances_*.json)
        coco_files = list(path.glob('*.json')) + list(path.glob('annotations/*.json'))
        for f in coco_files:
            if COCOLoader.is_coco(str(f)):
                return {
                    'format': 'COCO',
                    'annotation_file': str(f),
                    'confidence': 'HIGH',
                }
        
        # Check for YOLO (data.yaml + labels/*.txt)
        yaml_files = list(path.glob('*.yaml')) + list(path.glob('*.yml'))
        if yaml_files:
            return {
                'format': 'YOLO',
                'config_file': str(yaml_files[0]),
                'confidence': 'HIGH',
            }
        
        labels_dir = path / 'labels'
        if labels_dir.exists() and any(labels_dir.glob('*.txt')):
            return {
                'format': 'YOLO',
                'labels_dir': str(labels_dir),
                'confidence': 'MEDIUM',
            }
        
        return {'format': 'UNKNOWN', 'confidence': 'LOW'}


if __name__ == '__main__':
    print("COCO Loader ready")
