"""Brightness Attack - Modifies image brightness."""
import cv2
import numpy as np


def apply_brightness(image_path, output_path, factor=1.5):
    """Adjust brightness."""
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * factor, 0, 255)
    bright = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    cv2.imwrite(str(output_path), bright)
    return str(output_path)


def apply(image_path, output_path):
    return apply_brightness(image_path, output_path)
