#!/usr/bin/env python3
"""
Generate GOOD, BAD, and WORST datasets from raw COCO data
"""

import os
import json
import random
import shutil
import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from configs.paths import (
    DATASET_RAW_PATH, DATASET_GOOD_PATH, 
    DATASET_BAD_PATH, DATASET_WORST_PATH,
    DATASET_METADATA_PATH
)

def load_coco_annotations():
    """Load COCO annotations"""
    ann_file = os.path.join(DATASET_RAW_PATH, 'labels', 'annotations', 'instances_val2017.json')
    with open(ann_file, 'r') as f:
        return json.load(f)

def get_class_mapping():
    """Get class mapping for vehicles only"""
    # COCO class IDs for vehicles
    vehicle_classes = {
        1: 'person',  # We'll skip person
        2: 'bicycle',
        3: 'car',
        4: 'motorcycle',
        5: 'airplane',
        6: 'bus',
        7: 'train',
        8: 'truck'
    }
    return {k: v for k, v in vehicle_classes.items() if v in ['car', 'bicycle', 'bus', 'truck']}

def create_yolo_labels(annotation, class_mapping):
    """Convert COCO annotation to YOLO format"""
    # YOLO format: class_id x_center y_center width height (normalized)
    image_id = annotation['image_id']
    bbox = annotation['bbox']
    category_id = annotation['category_id']
    
    if category_id not in class_mapping:
        return None
    
    # Get image info
    # Note: Need image dimensions for normalization
    return {
        'image_id': image_id,
        'category_id': category_id,
        'class_name': class_mapping[category_id],
        'bbox': bbox,
        'normalized': True
    }

def process_dataset(annotations, class_mapping, output_path, corruption_level=0):
    """Process and create dataset with optional corruption"""
    # Create directories
    os.makedirs(os.path.join(output_path, 'images'), exist_ok=True)
    os.makedirs(os.path.join(output_path, 'labels'), exist_ok=True)
    
    # Filter vehicle annotations
    vehicle_anns = []
    for ann in annotations['annotations']:
        if ann['category_id'] in class_mapping:
            vehicle_anns.append(ann)
    
    print(f"Found {len(vehicle_anns)} vehicle annotations")
    
    # Process each annotation
    for ann in tqdm(vehicle_anns[:1000], desc="Processing"):
        image_id = ann['image_id']
        img_file = f"{str(image_id).zfill(12)}.jpg"
        img_path = os.path.join(DATASET_RAW_PATH, 'images', 'val2017', img_file)
        
        if not os.path.exists(img_path):
            continue
        
        # Copy image
        shutil.copy2(img_path, os.path.join(output_path, 'images', img_file))
        
        # Create label file
        label_file = os.path.join(output_path, 'labels', f"{str(image_id).zfill(12)}.txt")
        
        # Apply corruption if needed
        if corruption_level > 0:
            # Add some corruption to image
            img = cv2.imread(img_path)
            if random.random() < corruption_level / 100:
                # Add blur
                if random.random() < 0.5:
                    img = cv2.GaussianBlur(img, (15, 15), 0)
                # Add noise
                if random.random() < 0.5:
                    noise = np.random.normal(0, 25, img.shape).astype(np.uint8)
                    img = cv2.add(img, noise)
                cv2.imwrite(os.path.join(output_path, 'images', img_file), img)
        
        # Write label
        with open(label_file, 'w') as f:
            # YOLO format: class_id x_center y_center width height
            # For now, write placeholder
            class_id = list(class_mapping.keys()).index(ann['category_id'])
            # Simple bbox conversion (will be improved)
            x = ann['bbox'][0] + ann['bbox'][2]/2
            y = ann['bbox'][1] + ann['bbox'][3]/2
            w = ann['bbox'][2]
            h = ann['bbox'][3]
            # Normalize (assuming 640x640)
            x_norm = x / 640
            y_norm = y / 640
            w_norm = w / 640
            h_norm = h / 640
            f.write(f"{class_id} {x_norm:.6f} {y_norm:.6f} {w_norm:.6f} {h_norm:.6f}\n")
    
    # Save metadata
    metadata = {
        'total_images': len(os.listdir(os.path.join(output_path, 'images'))),
        'total_labels': len(os.listdir(os.path.join(output_path, 'labels'))),
        'classes': list(class_mapping.values()),
        'corruption_level': corruption_level
    }
    
    with open(os.path.join(output_path, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    return metadata

def main():
    """Main function"""
    print("\n" + "="*50)
    print("🚀 Generating GOOD/BAD/WORST Datasets")
    print("="*50 + "\n")
    
    # Load annotations
    print("📖 Loading COCO annotations...")
    annotations = load_coco_annotations()
    class_mapping = get_class_mapping()
    
    print(f"Classes: {list(class_mapping.values())}")
    
    # Create GOOD dataset (no corruption)
    print("\n🟢 Creating GOOD dataset...")
    good_meta = process_dataset(
        annotations, class_mapping, 
        DATASET_GOOD_PATH, 
        corruption_level=0
    )
    
    # Create BAD dataset (20% corruption)
    print("\n🟡 Creating BAD dataset...")
    bad_meta = process_dataset(
        annotations, class_mapping, 
        DATASET_BAD_PATH, 
        corruption_level=20
    )
    
    # Create WORST dataset (50% corruption)
    print("\n🔴 Creating WORST dataset...")
    worst_meta = process_dataset(
        annotations, class_mapping, 
        DATASET_WORST_PATH, 
        corruption_level=50
    )
    
    # Save combined metadata
    combined_meta = {
        'good': good_meta,
        'bad': bad_meta,
        'worst': worst_meta,
        'class_mapping': class_mapping
    }
    
    with open(os.path.join(DATASET_METADATA_PATH, 'dataset_info.json'), 'w') as f:
        json.dump(combined_meta, f, indent=2)
    
    print("\n" + "="*50)
    print("✅ ALL DATASETS CREATED SUCCESSFULLY!")
    print(f"🟢 GOOD: {good_meta['total_images']} images")
    print(f"🟡 BAD: {bad_meta['total_images']} images")
    print(f"🔴 WORST: {worst_meta['total_images']} images")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
