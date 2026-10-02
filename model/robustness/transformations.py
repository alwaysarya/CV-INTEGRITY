"""
Image Transformations for Robustness Testing
"""

import cv2
import numpy as np
import random

class ImageTransformations:
    """Apply various transformations to test model robustness"""
    
    @staticmethod
    def adjust_brightness(image, factor=0.5):
        """Adjust brightness (0=dark, 1=normal, 2=bright)"""
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        hsv[:, :, 2] = cv2.multiply(hsv[:, :, 2], factor)
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    @staticmethod
    def add_blur(image, kernel_size=15):
        """Add Gaussian blur"""
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
    
    @staticmethod
    def add_noise(image, intensity=25):
        """Add Gaussian noise"""
        noise = np.random.normal(0, intensity, image.shape).astype(np.uint8)
        return cv2.add(image, noise)
    
    @staticmethod
    def rotate_image(image, angle=30):
        """Rotate image"""
        h, w = image.shape[:2]
        center = (w//2, h//2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        return cv2.warpAffine(image, matrix, (w, h))
    
    @staticmethod
    def crop_image(image, crop_factor=0.2):
        """Crop image (remove edges)"""
        h, w = image.shape[:2]
        crop_h = int(h * crop_factor)
        crop_w = int(w * crop_factor)
        return image[crop_h:h-crop_h, crop_w:w-crop_w]
    
    @staticmethod
    def resize_image(image, scale=0.5):
        """Resize image"""
        h, w = image.shape[:2]
        new_h = int(h * scale)
        new_w = int(w * scale)
        return cv2.resize(image, (new_w, new_h))
    
    @staticmethod
    def apply_all_transformations(image):
        """Apply all transformations and return results"""
        transformations = {
            'original': image.copy(),
            'brightness': ImageTransformations.adjust_brightness(image, 1.5),
            'darkness': ImageTransformations.adjust_brightness(image, 0.4),
            'blur': ImageTransformations.add_blur(image, 15),
            'noise': ImageTransformations.add_noise(image, 30),
            'rotation': ImageTransformations.rotate_image(image, 30),
        }
        return transformations
