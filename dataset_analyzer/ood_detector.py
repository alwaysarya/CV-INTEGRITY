"""
OOD (Out-of-Distribution) Detector
Detects samples that deviate from training distribution.
"""

import hashlib
import json
import random
from pathlib import Path
from datetime import datetime


class OODDetector:
    """Detect out-of-distribution samples in datasets."""
    
    def __init__(self, reference_stats=None):
        self.reference_stats = reference_stats or {
            'mean_brightness': 128.0,
            'std_brightness': 30.0,
            'mean_contrast': 50.0,
            'std_contrast': 15.0,
            'expected_classes': ['car', 'bike', 'bus', 'truck'],
            'image_size': (640, 640),
        }
    
    def detect_sample(self, image_path):
        """Detect if a single sample is OOD."""
        path = Path(image_path)
        if not path.exists():
            return {'error': 'File not found', 'is_ood': False}
        
        # Simulate image stats (in real: use PIL/cv2)
        seed = int(hashlib.sha256(str(path).encode()).hexdigest()[:8], 16)
        random.seed(seed)
        
        brightness = random.uniform(50, 200)
        contrast = random.uniform(20, 80)
        
        # Check deviations
        brightness_z = abs(brightness - self.reference_stats['mean_brightness']) / self.reference_stats['std_brightness']
        contrast_z = abs(contrast - self.reference_stats['mean_contrast']) / self.reference_stats['std_contrast']
        
        # OOD if z-score > 2.5
        brightness_ood = brightness_z > 2.5
        contrast_ood = contrast_z > 2.5
        
        is_ood = brightness_ood or contrast_ood
        
        # Compute OOD score (0-1)
        ood_score = min(max(brightness_z, contrast_z) / 5.0, 1.0)
        
        return {
            'image': path.name,
            'brightness': round(brightness, 2),
            'contrast': round(contrast, 2),
            'brightness_z': round(brightness_z, 2),
            'contrast_z': round(contrast_z, 2),
            'is_ood': is_ood,
            'ood_score': round(ood_score, 4),
            'severity': 'HIGH' if ood_score > 0.7 else ('MEDIUM' if ood_score > 0.4 else 'LOW'),
        }
    
    def scan_directory(self, directory, max_files=100):
        """Scan directory for OOD samples."""
        path = Path(directory)
        if not path.exists():
            return {'error': 'Directory not found'}
        
        # Get images
        images = list(path.glob('*.jpg')) + list(path.glob('*.png'))
        images = images[:max_files]
        
        if not images:
            return {'error': 'No images found'}
        
        results = []
        ood_count = 0
        
        for img in images:
            result = self.detect_sample(str(img))
            if 'error' not in result:
                results.append(result)
                if result['is_ood']:
                    ood_count += 1
        
        total = len(results)
        ood_percentage = (ood_count / total * 100) if total > 0 else 0
        
        # Severity classification
        if ood_percentage < 5:
            status = 'CLEAN'
            color = '#10B981'
        elif ood_percentage < 15:
            status = 'MINOR_OOD'
            color = '#F59E0B'
        elif ood_percentage < 30:
            status = 'SIGNIFICANT_OOD'
            color = '#EF4444'
        else:
            status = 'SEVERE_OOD'
            color = '#DC2626'
        
        return {
            'directory': str(directory),
            'scanned_at': datetime.utcnow().isoformat(),
            'total_scanned': total,
            'ood_count': ood_count,
            'ood_percentage': round(ood_percentage, 2),
            'status': status,
            'color': color,
            'samples': results[:20],  # Top 20
            'high_severity': [r for r in results if r['severity'] == 'HIGH'],
        }
    
    def compare_distributions(self, baseline_stats, current_stats):
        """Compare two distributions for shift."""
        differences = {}
        max_diff = 0
        
        for key in baseline_stats:
            if key in current_stats and isinstance(baseline_stats[key], (int, float)):
                baseline = baseline_stats[key]
                current = current_stats[key]
                
                if baseline > 0:
                    diff_pct = abs(current - baseline) / baseline * 100
                else:
                    diff_pct = abs(current) * 100
                
                differences[key] = {
                    'baseline': baseline,
                    'current': current,
                    'diff_percent': round(diff_pct, 2),
                }
                
                max_diff = max(max_diff, diff_pct)
        
        if max_diff < 5:
            status = 'MATCHING'
            confidence = 0.95
        elif max_diff < 15:
            status = 'MINOR_SHIFT'
            confidence = 0.75
        elif max_diff < 30:
            status = 'SIGNIFICANT_SHIFT'
            confidence = 0.60
        else:
            status = 'SEVERE_SHIFT'
            confidence = 0.85
        
        return {
            'status': status,
            'confidence': confidence,
            'max_diff_percent': round(max_diff, 2),
            'differences': differences,
        }


if __name__ == '__main__':
    detector = OODDetector()
    
    print("=== SAMPLE DETECTION ===")
    result = detector.detect_sample('datasets/uploaded/extracted/images/000000001532.jpg')
    print(json.dumps(result, indent=2))
    
    print("\n=== DIRECTORY SCAN ===")
    scan = detector.scan_directory('datasets/uploaded/extracted/images', max_files=20)
    print(f"Total: {scan.get('total_scanned', 0)}")
    print(f"OOD: {scan.get('ood_count', 0)}")
    print(f"Percentage: {scan.get('ood_percentage', 0)}%")
    print(f"Status: {scan.get('status', 'N/A')}")
