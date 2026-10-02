"""Brightness detector"""
import numpy as np


class BrightnessDetector:
    def __init__(self, low_threshold=0.2, high_threshold=0.8):
        self.low = low_threshold
        self.high = high_threshold

    def detect(self, image):
        if image is None:
            return {"status": "no_image", "brightness": 0}
        arr = np.array(image, dtype=np.float32)
        if arr.max() > 1.0:
            arr = arr / 255.0
        mean_brightness = float(arr.mean())
        issue = None
        if mean_brightness < self.low:
            issue = "too_dark"
        elif mean_brightness > self.high:
            issue = "too_bright"
        return {
            "status": "analyzed",
            "brightness": round(mean_brightness, 4),
            "issue": issue,
            "ok": issue is None,
        }
