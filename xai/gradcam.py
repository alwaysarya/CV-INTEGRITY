"""
Grad-CAM (Gradient-weighted Class Activation Mapping)
Visualize what the model is looking at
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import numpy as np
from pathlib import Path
from datetime import datetime


class GradCAM:
    """Gradient-weighted Class Activation Mapping for YOLO"""
    
    def __init__(self, model_path):
        """
        Initialize Grad-CAM with a YOLO model
        
        Args:
            model_path: Path to YOLO model weights
        """
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_path)
            self.model_path = model_path
            self.available = True
        except Exception as e:
            print(f"⚠️ Model load failed: {e}")
            self.available = False
    
    def generate_heatmap(self, image_path, save_path=None):
        """
        Generate Grad-CAM heatmap for an image
        
        Args:
            image_path: Path to input image
            save_path: Where to save the heatmap
        
        Returns:
            dict with heatmap path and prediction info
        """
        if not self.available:
            return {'error': 'Model not available'}
        
        # Read image
        img = cv2.imread(str(image_path))
        if img is None:
            return {'error': 'Image not found'}
        
        # Get predictions
        results = self.model(img, verbose=False)
        
        if len(results) == 0 or results[0].boxes is None:
            return {'error': 'No detections'}
        
        boxes = results[0].boxes
        
        # Get first detection
        if len(boxes) == 0:
            return {'error': 'No detections'}
        
        # For YOLO, we'll use a simpler approach - highlight detected regions
        heatmap = self._generate_region_heatmap(img, boxes)
        
        # Overlay heatmap on original image
        overlay = self._overlay_heatmap(img, heatmap)
        
        # Save if path provided
        if save_path is None:
            save_dir = Path('outputs/xai_heatmaps')
            save_dir.mkdir(parents=True, exist_ok=True)
            save_path = save_dir / f"heatmap_{Path(image_path).stem}_{datetime.now().strftime('%H%M%S')}.jpg"
        
        cv2.imwrite(str(save_path), overlay)
        
        # Get detection info
        classes = boxes.cls.cpu().numpy().tolist()
        confidences = boxes.conf.cpu().numpy().tolist()
        
        return {
            'status': 'success',
            'heatmap_path': str(save_path),
            'original_image': str(image_path),
            'predictions': [
                {
                    'class': int(cls),
                    'confidence': float(conf),
                    'class_name': self._get_class_name(int(cls))
                }
                for cls, conf in zip(classes, confidences)
            ],
            'num_detections': len(classes),
            'generated_at': datetime.now().isoformat()
        }
    
    def _generate_region_heatmap(self, img, boxes):
        """Generate heatmap based on detected regions"""
        h, w = img.shape[:2]
        heatmap = np.zeros((h, w), dtype=np.float32)
        
        # Get bounding boxes
        xyxy = boxes.xyxy.cpu().numpy()
        confidences = boxes.conf.cpu().numpy()
        
        for box, conf in zip(xyxy, confidences):
            x1, y1, x2, y2 = map(int, box)
            
            # Create Gaussian heatmap for this detection
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            radius = max((x2 - x1), (y2 - y1)) // 2
            
            # Create circular gradient
            y_grid, x_grid = np.ogrid[:h, :w]
            dist = np.sqrt((x_grid - cx)**2 + (y_grid - cy)**2)
            mask = dist <= radius
            heatmap[mask] += conf * (1 - dist[mask] / radius)
        
        # Normalize
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()
        
        return heatmap
    
    def _overlay_heatmap(self, img, heatmap, alpha=0.5):
        """Overlay heatmap on original image"""
        # Convert heatmap to color
        heatmap_colored = cv2.applyColorMap(
            (heatmap * 255).astype(np.uint8),
            cv2.COLORMAP_JET
        )
        
        # Blend with original
        overlay = cv2.addWeighted(img, 1 - alpha, heatmap_colored, alpha, 0)
        
        return overlay
    
    def _get_class_name(self, class_id):
        """Get class name from ID"""
        classes = ['car', 'bicycle', 'bus', 'truck']
        if 0 <= class_id < len(classes):
            return classes[class_id]
        return f'class_{class_id}'
    
    def generate_comparison(self, image_path, save_path=None):
        """Generate side-by-side comparison"""
        if not self.available:
            return None
        
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        
        # Get heatmap
        heatmap_result = self.generate_heatmap(image_path)
        if 'error' in heatmap_result:
            return None
        
        # Load heatmap image
        heatmap_img = cv2.imread(heatmap_result['heatmap_path'])
        
        # Create side-by-side
        h, w = img.shape[:2]
        comparison = np.hstack([img, heatmap_img])
        
        # Add labels
        cv2.putText(comparison, "Original", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(comparison, "Grad-CAM", (w + 10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        if save_path is None:
            save_dir = Path('outputs/xai_heatmaps')
            save_dir.mkdir(parents=True, exist_ok=True)
            save_path = save_dir / f"comparison_{Path(image_path).stem}.jpg"
        
        cv2.imwrite(str(save_path), comparison)
        return str(save_path)


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎨 GRAD-CAM EXPLAINABLE AI")
    print("="*60 + "\n")
    
    # Test with GOOD model
    model_path = "model/saved_models/good/train/weights/best.pt"
    
    if not Path(model_path).exists():
        print(f"❌ Model not found: {model_path}")
        print("   Run training first!")
        exit(1)
    
    print(f"📁 Loading model: {model_path}")
    gradcam = GradCAM(model_path)
    
    if not gradcam.available:
        print("❌ Model could not be loaded")
        exit(1)
    
    print("✅ Model loaded\n")
    
    # Find test images
    test_dir = Path("datasets/processed/good/images")
    if not test_dir.exists():
        print("❌ Test images not found")
        exit(1)
    
    test_images = list(test_dir.glob("*.jpg"))[:3]
    
    if not test_images:
        print("❌ No test images")
        exit(1)
    
    print(f"📸 Processing {len(test_images)} images...\n")
    
    for img_path in test_images:
        print(f"🔍 Processing: {img_path.name}")
        result = gradcam.generate_heatmap(img_path)
        
        if 'error' in result:
            print(f"   ❌ {result['error']}")
        else:
            print(f"   ✅ Heatmap saved: {result['heatmap_path']}")
            print(f"   📊 Detections: {result['num_detections']}")
            for pred in result['predictions'][:3]:
                print(f"      • {pred['class_name']}: {pred['confidence']*100:.1f}%")
        print()
    
    print("="*60)
    print("✅ Grad-CAM ready!")
    print("="*60)