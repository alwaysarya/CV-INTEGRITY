"""
Path configurations for CV-INTEGRITY
"""

import os
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parent.parent.absolute()

# Dataset paths
DATASET_RAW_PATH = os.path.join(PROJECT_ROOT, 'datasets', 'raw')
DATASET_PROCESSED_PATH = os.path.join(PROJECT_ROOT, 'datasets', 'processed')
DATASET_METADATA_PATH = os.path.join(PROJECT_ROOT, 'datasets', 'metadata')

# Dataset type paths
DATASET_GOOD_PATH = os.path.join(DATASET_PROCESSED_PATH, 'good')
DATASET_BAD_PATH = os.path.join(DATASET_PROCESSED_PATH, 'bad')
DATASET_WORST_PATH = os.path.join(DATASET_PROCESSED_PATH, 'worst')

# Model paths
MODEL_SAVED_PATH = os.path.join(PROJECT_ROOT, 'model', 'saved_models')
MODEL_CONFIGS_PATH = os.path.join(PROJECT_ROOT, 'model', 'configs')

# Output paths
OUTPUT_REPORTS_PATH = os.path.join(PROJECT_ROOT, 'outputs', 'reports')
OUTPUT_PLOTS_PATH = os.path.join(PROJECT_ROOT, 'outputs', 'plots')
OUTPUT_EXPORTS_PATH = os.path.join(PROJECT_ROOT, 'outputs', 'exports')

# Logs path
LOGS_PATH = os.path.join(PROJECT_ROOT, 'logs')

# Create directories if not exist
def create_dirs():
    """Create all required directories"""
    dirs = [
        DATASET_RAW_PATH,
        DATASET_PROCESSED_PATH,
        DATASET_METADATA_PATH,
        DATASET_GOOD_PATH,
        DATASET_BAD_PATH,
        DATASET_WORST_PATH,
        MODEL_SAVED_PATH,
        MODEL_CONFIGS_PATH,
        OUTPUT_REPORTS_PATH,
        OUTPUT_PLOTS_PATH,
        OUTPUT_EXPORTS_PATH,
        LOGS_PATH
    ]
    
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        os.makedirs(os.path.join(d, 'images'), exist_ok=True)
        os.makedirs(os.path.join(d, 'labels'), exist_ok=True)

if __name__ == "__main__":
    create_dirs()
    print("✅ All directories created!")
