"""Rotation Attack - Rotates images."""
import cv2
import numpy as np


def apply_rotation(image_path, output_path, angle=15):
    """Rotate image by angle."""
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h))
    cv2.imwrite(str(output_path), rotated)
    return str(output_path)


def apply(image_path, output_path):
    return apply_rotation(image_path, output_path)
