"""Label Attack - Simulates label flipping."""
import json
import random
from pathlib import Path


def apply_label_flip(labels_path, output_path, flip_ratio=0.2):
    """Flip labels for a random subset."""
    # For YOLO format: read txt file, flip class IDs
    labels = Path(labels_path)
    if labels.exists() and labels.suffix == '.txt':
        with open(labels) as f:
            lines = f.readlines()
        
        flipped = []
        for line in lines:
            parts = line.strip().split()
            if parts:
                # Randomly flip class ID
                if random.random() < flip_ratio:
                    parts[0] = str(1 - int(parts[0])) if parts[0] in ['0', '1'] else parts[0]
                flipped.append(' '.join(parts) + '\n')
        
        with open(output_path, 'w') as f:
            f.writelines(flipped)
        return str(output_path)
    return None


def apply(image_path, output_path):
    return apply_label_flip(image_path, output_path)
