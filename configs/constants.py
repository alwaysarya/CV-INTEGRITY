"""
Constants for CV-INTEGRITY
"""

# Dataset constants
CLASS_NAMES = ['car', 'bicycle', 'bus', 'truck']
NUM_CLASSES = len(CLASS_NAMES)

# Image constants
IMAGE_SIZE = 640
BATCH_SIZE = 16
EPOCHS = 50  # Default epochs for training

# Quality thresholds
BLUR_THRESHOLD = 100  # Laplacian variance
DUPLICATE_THRESHOLD = 10  # Perceptual hash difference

# Trust score thresholds
TRUST_ACCEPT = 80
TRUST_REVIEW = 50
TRUST_QUARANTINE = 0

# Weight for trust score components
TRUST_WEIGHTS = {
    'dataset_quality': 0.30,
    'model_performance': 0.30,
    'robustness': 0.25,
    'stability': 0.15
}

# Attack types
ATTACK_TYPES = ['blur', 'noise', 'duplicate', 'label_poison', 'brightness', 'contrast']

# Logging
LOG_FORMAT = "{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
LOG_ROTATION = "10 MB"
LOG_RETENTION = "10 days"

# Model versions
YOLO_VERSIONS = ['yolov8n', 'yolov8s', 'yolov8m', 'yolov8l']
DEFAULT_MODEL = 'yolov8n'

# Random seeds
RANDOM_SEED = 42
