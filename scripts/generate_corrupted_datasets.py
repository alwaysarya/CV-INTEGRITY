#!/usr/bin/env python3
"""
Generate REAL corrupted datasets
GOOD = clean
BAD = 30% corrupted
WORST = 70% corrupted
"""

import os
import cv2
import numpy as np
import random
import shutil
from pathlib import Path
from tqdm import tqdm

random.seed(42)
np.random.seed(42)

RAW = Path("datasets/raw/images/val2017")
GOOD = Path("datasets/processed/good")
BAD = Path("datasets/processed/bad")
WORST = Path("datasets/processed/worst")

print("📊 Generating REAL corrupted datasets...")
print("="*60)

# Get images
all_images = list(RAW.glob("*.jpg"))
print(f"📸 Total available: {len(all_images)} images")

# Shuffle for randomization
random.shuffle(all_images)

# Split: 300 each
good_imgs = all_images[:300]
bad_imgs = all_images[300:600]
worst_imgs = all_images[600:900]

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def add_blur(img, intensity=15):
    """Add Gaussian blur"""
    if intensity % 2 == 0:
        intensity += 1
    return cv2.GaussianBlur(img, (intensity, intensity), 0)

def add_noise(img, intensity=30):
    """Add Gaussian noise"""
    noise = np.random.normal(0, intensity, img.shape).astype(np.uint8)
    return cv2.add(img, noise)

def adjust_brightness(img, factor=0.5):
    """Adjust brightness"""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hsv[:, :, 2] = cv2.multiply(hsv[:, :, 2], factor)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

def add_wrong_label(img_path, label_path):
    """Add wrong labels"""
    # Create wrong label
    wrong_classes = [0, 1, 2, 3]
    with open(label_path, 'w') as f:
        # Write wrong class (random)
        wrong_class = random.choice(wrong_classes)
        # Random bbox
        x = random.uniform(0.2, 0.8)
        y = random.uniform(0.2, 0.8)
        w = random.uniform(0.1, 0.3)
        h = random.uniform(0.1, 0.3)
        f.write(f"{wrong_class} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")

# ============================================================
# GOOD DATASET (Clean - no corruption)
# ============================================================
print("\n🟢 Creating GOOD dataset (clean)...")
for img in tqdm(good_imgs[:300], desc="GOOD"):
    shutil.copy2(img, GOOD / "images" / img.name)
    
    # Create label (correct YOLO format)
    label_path = GOOD / "labels" / (img.stem + ".txt")
    with open(label_path, 'w') as f:
        # Car class = 0, with proper bbox
        f.write(f"0 0.500000 0.500000 0.300000 0.300000\n")

# ============================================================
# BAD DATASET (30% corruption)
# ============================================================
print("\n🟡 Creating BAD dataset (30% corrupted)...")
for i, img in enumerate(tqdm(bad_imgs[:300], desc="BAD")):
    img_data = cv2.imread(str(img))
    if img_data is None:
        continue
    
    # 30% chance of corruption
    if i % 10 < 3:  # 30%
        corruption_type = random.choice(['blur', 'noise', 'brightness'])
        if corruption_type == 'blur':
            img_data = add_blur(img_data, 15)
        elif corruption_type == 'noise':
            img_data = add_noise(img_data, 25)
        else:
            img_data = adjust_brightness(img_data, 0.6)
    
    new_path = BAD / "images" / img.name
    cv2.imwrite(str(new_path), img_data)
    
    # 30% wrong labels
    label_path = BAD / "labels" / (img.stem + ".txt")
    if i % 10 < 3:
        add_wrong_label(img, label_path)
    else:
        with open(label_path, 'w') as f:
            f.write(f"0 0.500000 0.500000 0.300000 0.300000\n")

# ============================================================
# WORST DATASET (70% corruption)
# ============================================================
print("\n🔴 Creating WORST dataset (70% corrupted)...")
for i, img in enumerate(tqdm(worst_imgs[:300], desc="WORST")):
    img_data = cv2.imread(str(img))
    if img_data is None:
        continue
    
    # 70% chance of heavy corruption
    if i % 10 < 7:  # 70%
        # Apply multiple corruptions
        img_data = add_blur(img_data, 25)
        if random.random() < 0.5:
            img_data = add_noise(img_data, 40)
        if random.random() < 0.5:
            img_data = adjust_brightness(img_data, 0.3)
    
    new_path = WORST / "images" / img.name
    cv2.imwrite(str(new_path), img_data)
    
    # 70% wrong labels
    label_path = WORST / "labels" / (img.stem + ".txt")
    if i % 10 < 7:
        add_wrong_label(img, label_path)
    else:
        with open(label_path, 'w') as f:
            f.write(f"0 0.500000 0.500000 0.300000 0.300000\n")

# ============================================================
# DUPLICATE ATTACK (add duplicates to BAD and WORST)
# ============================================================
print("\n📋 Adding duplicates...")
# BAD: 10% duplicates
bad_images = list((BAD / "images").glob("*.jpg"))
for img in random.sample(bad_images, len(bad_images) // 10):
    new_name = f"dup_{img.name}"
    shutil.copy2(img, BAD / "images" / new_name)
    # Copy label too
    lbl = BAD / "labels" / (img.stem + ".txt")
    if lbl.exists():
        shutil.copy2(lbl, BAD / "labels" / f"dup_{img.stem}.txt")

# WORST: 30% duplicates
worst_images = list((WORST / "images").glob("*.jpg"))
for img in random.sample(worst_images, len(worst_images) * 3 // 10):
    new_name = f"dup_{img.name}"
    shutil.copy2(img, WORST / "images" / new_name)
    lbl = WORST / "labels" / (img.stem + ".txt")
    if lbl.exists():
        shutil.copy2(lbl, WORST / "labels" / f"dup_{img.stem}.txt")

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "="*60)
print("✅ REAL CORRUPTED DATASETS CREATED!")
print("="*60)
print(f"🟢 GOOD:  {len(list((GOOD/'images').glob('*')))} images (clean)")
print(f"🟡 BAD:   {len(list((BAD/'images').glob('*')))} images (30% corrupted)")
print(f"🔴 WORST: {len(list((WORST/'images').glob('*')))} images (70% corrupted)")
print("="*60)
