"""Blur Attack - Adds Gaussian blur to images."""
import cv2
import numpy as np
from pathlib import Path


def apply_blur(image_path, output_path, kernel_size=15):
    """Apply Gaussian blur to image."""
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    blurred = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)
    cv2.imwrite(str(output_path), blurred)
    return str(output_path)


def apply(image_path, output_path):
    """Default apply function."""
    return apply_blur(image_path, output_path)
