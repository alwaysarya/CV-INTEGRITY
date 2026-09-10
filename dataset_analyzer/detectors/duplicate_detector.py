"""
Duplicate Detector Module
Detects duplicate images using perceptual hashing
"""

import imagehash
from PIL import Image
from pathlib import Path
from collections import defaultdict
import numpy as np
from tqdm import tqdm
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from configs.constants import DUPLICATE_THRESHOLD
from utils.logger import get_logger

logger = get_logger(__name__)

class DuplicateDetector:
    """Detect duplicate images using perceptual hashing"""
    
    def __init__(self, threshold=DUPLICATE_THRESHOLD):
        self.threshold = threshold
        
    def get_image_hash(self, image_path):
        """Generate perceptual hash of image"""
        try:
            img = Image.open(image_path)
            return imagehash.phash(img)
        except Exception as e:
            logger.error(f"Error processing {image_path}: {e}")
            return None
    
    def detect_duplicates(self, dataset_path):
        """
        Detect duplicate images in dataset
        
        Args:
            dataset_path: Path to dataset folder
            
        Returns:
            dict: Duplicate analysis results
        """
        image_path = Path(dataset_path) / "images"
        image_files = list(image_path.glob("*.jpg")) + list(image_path.glob("*.png"))
        
        if not image_files:
            return {"error": f"No images found in {image_path}"}
        
        hashes = {}
        duplicates = []
        unique_images = []
        
        for img_path in tqdm(image_files, desc="Detecting duplicates"):
            hash_val = self.get_image_hash(img_path)
            if hash_val is None:
                continue
                
            found_duplicate = False
            for existing_path, existing_hash in hashes.items():
                similarity = 100 - abs(hash_val - existing_hash)
                if similarity > (100 - self.threshold):
                    duplicates.append({
                        'original': existing_path.name,
                        'duplicate': img_path.name,
                        'similarity': round(similarity, 2)
                    })
                    found_duplicate = True
                    break
            
            if not found_duplicate:
                hashes[img_path] = hash_val
                unique_images.append(img_path.name)
        
        return {
            'total_images': len(image_files),
            'unique_images': len(unique_images),
            'duplicate_count': len(duplicates),
            'duplicate_percentage': round((len(duplicates) / len(image_files)) * 100, 2) if image_files else 0,
            'duplicates': duplicates
        }

if __name__ == "__main__":
    detector = DuplicateDetector()
    result = detector.detect_duplicates("datasets/processed/good")
    print(json.dumps(result, indent=2))
