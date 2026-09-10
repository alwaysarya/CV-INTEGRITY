import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from configs.constants import BLUR_THRESHOLD

class BlurDetector:
    def __init__(self, threshold=BLUR_THRESHOLD):
        self.threshold = threshold
    
    def detect_blur(self, image_path):
        img = cv2.imread(str(image_path))
        if img is None:
            return 0, "ERROR", 0
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        blur_score = min(100, (laplacian_var / 1000) * 100)
        
        if blur_score > 70:
            status = "SHARP ✅"
        elif blur_score > 40:
            status = "MODERATE ⚠️"
        else:
            status = "BLURRY 🔴"
        return float(blur_score), status, float(laplacian_var)
    
    def analyze_dataset(self, dataset_path):
        image_path = Path(dataset_path) / "images"
        image_files = list(image_path.glob("*.jpg")) + list(image_path.glob("*.png"))
        
        if not image_files:
            return {"error": f"No images found in {image_path}"}
        
        results = []
        for img_path in tqdm(image_files, desc="Analyzing blur"):
            score, status, variance = self.detect_blur(img_path)
            results.append({
                'image': img_path.name,
                'blur_score': float(round(score, 2)),
                'variance': float(round(variance, 2)),
                'status': status
            })
        
        scores = [r['blur_score'] for r in results]
        avg_blur = float(np.mean(scores)) if scores else 0.0
        blurry_count = int(len([r for r in results if r['status'] == 'BLURRY 🔴']))
        sharp_count = int(len([r for r in results if r['status'] == 'SHARP ✅']))
        
        return {
            'total_images': int(len(results)),
            'average_blur_score': float(round(avg_blur, 2)),
            'blurry_images': int(blurry_count),
            'sharp_images': int(sharp_count),
            'blurry_percentage': float(round((blurry_count / len(results)) * 100, 2)) if results else 0.0,
            'details': results
        }

if __name__ == "__main__":
    detector = BlurDetector()
    result = detector.analyze_dataset("datasets/processed/good")
    print(json.dumps(result, indent=2))
