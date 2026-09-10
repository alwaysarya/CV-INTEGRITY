"""
Noise Detector Module
Detects noisy images using various metrics
"""

import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.logger import get_logger

logger = get_logger(__name__)

class NoiseDetector:
    """Detect noise in images"""
    
    def __init__(self, noise_threshold=30):
        self.noise_threshold = noise_threshold
        
    def estimate_noise(self, image):
        """Estimate noise level using standard deviation"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Calculate noise using local variance
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        noise = cv2.absdiff(gray, blur)
        noise_level = np.std(noise)
        
        return noise_level
    
    def detect_noise(self, image_path):
        """Detect noise in single image"""
        img = cv2.imread(str(image_path))
        if img is None:
            return 0, "ERROR"
        
        noise_level = self.estimate_noise(img)
        
        # Normalize to 0-100 (higher = more noisy)
        noise_score = min(100, (noise_level / 50) * 100)
        
        if noise_score < 20:
            status = "CLEAN ✅"
        elif noise_score < 50:
            status = "MODERATE ⚠️"
        else:
            status = "NOISY 🔴"
            
        return noise_score, status, noise_level
    
    def analyze_dataset(self, dataset_path):
        """Analyze all images in dataset"""
        image_path = Path(dataset_path) / "images"
        image_files = list(image_path.glob("*.jpg")) + list(image_path.glob("*.png"))
        
        if not image_files:
            return {"error": f"No images found in {image_path}"}
        
        results = []
        for img_path in tqdm(image_files, desc="Analyzing noise"):
            score, status, noise_level = self.detect_noise(img_path)
            results.append({
                'image': img_path.name,
                'noise_score': round(score, 2),
                'noise_level': round(noise_level, 2),
                'status': status
            })
        
        scores = [r['noise_score'] for r in results]
        avg_noise = np.mean(scores) if scores else 0
        noisy_count = len([r for r in results if r['status'] == 'NOISY 🔴'])
        
        return {
            'total_images': len(results),
            'average_noise_score': round(avg_noise, 2),
            'noisy_images': noisy_count,
            'noisy_percentage': round((noisy_count / len(results)) * 100, 2) if results else 0,
            'details': results
        }

if __name__ == "__main__":
    detector = NoiseDetector()
    result = detector.analyze_dataset("datasets/processed/good")
    print(json.dumps(result, indent=2))
