#!/usr/bin/env python3
"""
Dataset Download Script for CV-INTEGRITY
Downloads COCO 2017 validation dataset (small version for testing)
"""

import os
import zipfile
import requests
from pathlib import Path
from tqdm import tqdm
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from configs.paths import DATASET_RAW_PATH

def download_file(url, filename, desc):
    """Download file with progress bar"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filename, 'wb') as f:
        with tqdm(total=total_size, unit='B', unit_scale=True, desc=desc) as pbar:
            for data in response.iter_content(chunk_size=1024):
                f.write(data)
                pbar.update(len(data))

def extract_zip(zip_path, extract_path):
    """Extract zip file"""
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)

def main():
    """Main download function"""
    print("\n" + "="*50)
    print("🚀 CV-INTEGRITY AI - Dataset Download")
    print("="*50 + "\n")
    
    # Create directories
    os.makedirs(DATASET_RAW_PATH, exist_ok=True)
    os.makedirs(os.path.join(DATASET_RAW_PATH, 'images'), exist_ok=True)
    os.makedirs(os.path.join(DATASET_RAW_PATH, 'labels'), exist_ok=True)
    
    # URLs
    urls = {
        'images': {
            'url': 'http://images.cocodataset.org/zips/val2017.zip',
            'desc': 'Downloading images (1GB)'
        },
        'annotations': {
            'url': 'http://images.cocodataset.org/annotations/annotations_trainval2017.zip',
            'desc': 'Downloading annotations (240MB)'
        }
    }
    
    # Download images
    print("📸 Downloading COCO images...")
    img_zip = os.path.join(DATASET_RAW_PATH, 'val2017.zip')
    download_file(urls['images']['url'], img_zip, urls['images']['desc'])
    
    print("\n📦 Extracting images...")
    extract_zip(img_zip, os.path.join(DATASET_RAW_PATH, 'images'))
    os.remove(img_zip)
    
    # Download annotations
    print("\n🏷️ Downloading annotations...")
    ann_zip = os.path.join(DATASET_RAW_PATH, 'annotations.zip')
    download_file(urls['annotations']['url'], ann_zip, urls['annotations']['desc'])
    
    print("\n📦 Extracting annotations...")
    extract_zip(ann_zip, os.path.join(DATASET_RAW_PATH, 'labels'))
    os.remove(ann_zip)
    
    print("\n" + "="*50)
    print("✅ DATASET DOWNLOAD COMPLETE!")
    print(f"📁 Location: {DATASET_RAW_PATH}")
    print("="*50 + "\n")
    
    # Show stats
    img_dir = os.path.join(DATASET_RAW_PATH, 'images', 'val2017')
    if os.path.exists(img_dir):
        num_images = len([f for f in os.listdir(img_dir) if f.endswith(('.jpg', '.png'))])
        print(f"📊 Total images: {num_images}")
    
    print("\n💡 Next step: Run generate_datasets.py to create GOOD/BAD/WORST datasets")

if __name__ == "__main__":
    main()
