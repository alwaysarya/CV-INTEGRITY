"""Duplicate Attack - Creates near-duplicate images."""
import shutil
from pathlib import Path


def apply_duplicate(image_path, output_path, count=3):
    """Create duplicate copies of image."""
    paths = []
    for i in range(count):
        out = Path(output_path).with_name(f"{Path(output_path).stem}_dup{i}{Path(output_path).suffix}")
        shutil.copy(image_path, out)
        paths.append(str(out))
    return paths


def apply(image_path, output_path, count=3):
    """Default apply function with optional count."""
    return apply_duplicate(image_path, output_path, count=count)
