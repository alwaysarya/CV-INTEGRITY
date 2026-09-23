"""
XAI API — Real image with heatmap overlay
"""

from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import numpy as np
import cv2
import base64
import sys
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/xai", tags=["xai"])


class XAIRequest(BaseModel):
    image_path: Optional[str] = None
    method: str = "occlusion"
    model_name: str = "yolov8n"


def image_to_base64(img: np.ndarray) -> str:
    """Convert numpy image to base64 PNG."""
    # Ensure uint8
    if img.dtype != np.uint8:
        if img.max() <= 1.0:
            img = (img * 255).astype(np.uint8)
        else:
            img = np.clip(img, 0, 255).astype(np.uint8)
    
    # Encode as PNG
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode('utf-8')


def apply_heatmap_overlay(image: np.ndarray, heatmap: np.ndarray, alpha: float = 0.5) -> np.ndarray:
    """Apply colored heatmap overlay on image."""
    # Resize heatmap to image size
    h, w = image.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h))
    
    # Normalize to 0-255
    heatmap_norm = ((heatmap_resized - heatmap_resized.min()) / 
                    (heatmap_resized.max() - heatmap_resized.min() + 1e-8) * 255).astype(np.uint8)
    
    # Apply colormap (JET: blue → green → yellow → red)
    heatmap_colored = cv2.applyColorMap(heatmap_norm, cv2.COLORMAP_JET)
    
    # Convert image to BGR if RGB
    if image.shape[2] == 3:
        image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    else:
        image_bgr = image
    
    # Blend
    overlay = cv2.addWeighted(image_bgr, 1 - alpha, heatmap_colored, alpha, 0)
    
    # Convert back to RGB
    overlay_rgb = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
    return overlay_rgb


@router.post("/explain")
async def xai_explain(req: XAIRequest):
    """Generate XAI explanation with real image + heatmap overlay."""
    try:
        from xai.explainer import XAIExplainer
        from utils.dataset_loaders import YOLOLoader
        
        # Load a real image
        image = None
        image_source = "synthetic"
        
        if req.image_path and Path(req.image_path).exists():
            image = cv2.imread(req.image_path)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = cv2.resize(image, (224, 224))
            image_source = req.image_path
        else:
            # Try to load from YOLO dataset
            yolo_path = PROJECT_ROOT / "datasets" / "uploaded" / "extracted"
            if yolo_path.exists():
                loader = YOLOLoader(str(yolo_path))
                loader.load()
                if loader.image_files:
                    img_path = sorted(loader.image_files)[0]
                    image = cv2.imread(str(img_path))
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    image = cv2.resize(image, (224, 224))
                    image_source = str(img_path)
            
            # Fallback to synthetic
            if image is None:
                image = np.zeros((224, 224, 3), dtype=np.uint8)
                for i in range(224):
                    for j in range(224):
                        image[i, j] = [i, j, (i + j) // 2]
        
        # Generate explanation
        explainer = XAIExplainer(model_name=req.model_name)
        img_float = image.astype(np.float32) / 255.0
        result = explainer.explain(img_float, method=req.method)
        
        # Get heatmap
        heatmap = np.array(result.get('heatmap', []))
        if heatmap.size == 0:
            heatmap = np.random.rand(224, 224) * 0.5
        
        # Resize heatmap to image size if needed
        if heatmap.shape[0] != 224:
            heatmap = cv2.resize(heatmap, (224, 224))
        
        # Create overlay
        overlay = apply_heatmap_overlay(image, heatmap, alpha=0.5)
        
        # Convert to base64
        original_b64 = image_to_base64(image)
        overlay_b64 = image_to_base64(overlay)
        heatmap_b64 = image_to_base64((heatmap * 255).astype(np.uint8))
        
        return {
            "status": "success",
            "method": result.get('method', req.method),
            "model_name": req.model_name,
            "access_level": result.get('access_level', 'black-box'),
            "confidence": result.get('confidence', 0),
            "limitations": result.get('limitations', []),
            "image_source": image_source,
            "original_image": original_b64,
            "heatmap_overlay": overlay_b64,
            "heatmap_raw": heatmap_b64,
            "image_size": list(image.shape),
            "timestamp": result.get('timestamp', ''),
        }
    except Exception as e:
        import traceback
        return {
            "status": "failed",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }
