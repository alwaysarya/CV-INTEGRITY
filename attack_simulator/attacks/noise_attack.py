"""Noise Attack - Adds random noise to images."""
import cv2
import numpy as np
from pathlib import Path


def apply_noise(image_path, output_path, noise_level=25):
    """Add Gaussian noise to image."""
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    noise = np.random.normal(0, noise_level, img.shape).astype(np.uint8)
    noisy = cv2.add(img, noise)
    cv2.imwrite(str(output_path), noisy)
    return str(output_path)


def apply(image_path, output_path):
    """Default apply function."""
    return apply_noise(image_path, output_path)
