"""Contrast Attack - Modifies image contrast."""
import cv2
import numpy as np


def apply_contrast(image_path, output_path, alpha=1.5, beta=0):
    """Adjust contrast (alpha) and brightness (beta)."""
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    adjusted = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    cv2.imwrite(str(output_path), adjusted)
    return str(output_path)


def apply(image_path, output_path):
    return apply_contrast(image_path, output_path)
