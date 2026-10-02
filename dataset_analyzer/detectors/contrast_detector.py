"""Contrast detector"""
import numpy as np


class ContrastDetector:
    def __init__(self, min_std=0.1):
        self.min_std = min_std

    def detect(self, image):
        if image is None:
            return {"status": "no_image", "contrast": 0}
        arr = np.array(image, dtype=np.float32)
        if arr.max() > 1.0:
            arr = arr / 255.0
        if arr.ndim == 3:
            arr = arr.mean(axis=2)
        std = float(arr.std())
        return {
            "status": "analyzed",
            "contrast": round(std, 4),
            "low_contrast": std < self.min_std,
            "ok": std >= self.min_std,
        }
