"""
File Hashing Module
Generate cryptographic hashes for datasets, models, and outputs
"""

import hashlib
import json
from pathlib import Path
from datetime import datetime


class FileHasher:
    """Generate SHA-256 hashes for any file or directory"""
    
    @staticmethod
    def hash_file(filepath):
        """Generate SHA-256 hash of a single file"""
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    @staticmethod
    def hash_string(text):
        """Generate SHA-256 hash of string"""
        return hashlib.sha256(text.encode()).hexdigest()
    
    @staticmethod
    def hash_directory(directory_path):
        """
        Generate a single hash for entire directory
        Combines all file hashes in sorted order
        """
        directory = Path(directory_path)
        if not directory.exists():
            return None
        
        all_hashes = []
        files = sorted(directory.rglob('*'))
        
        for file in files:
            if file.is_file():
                file_hash = FileHasher.hash_file(file)
                all_hashes.append(f"{file.name}:{file_hash}")
        
        # Combine all hashes
        combined = "|".join(all_hashes)
        return FileHasher.hash_string(combined)
    
    @staticmethod
    def hash_dataset(dataset_path):
        """
        Hash entire dataset (images + labels)
        Returns individual hashes and combined hash
        """
        dataset = Path(dataset_path)
        if not dataset.exists():
            return None
        
        images_path = dataset / "images"
        labels_path = dataset / "labels"
        
        result = {
            'dataset_path': str(dataset),
            'timestamp': datetime.now().isoformat(),
            'images_hash': None,
            'labels_hash': None,
            'combined_hash': None,
            'total_images': 0,
            'total_labels': 0
        }
        
        if images_path.exists():
            result['images_hash'] = FileHasher.hash_directory(images_path)
            result['total_images'] = len(list(images_path.glob('*')))
        
        if labels_path.exists():
            result['labels_hash'] = FileHasher.hash_directory(labels_path)
            result['total_labels'] = len(list(labels_path.glob('*')))
        
        # Combined hash
        if result['images_hash'] and result['labels_hash']:
            combined_str = f"{result['images_hash']}|{result['labels_hash']}"
            result['combined_hash'] = FileHasher.hash_string(combined_str)
        
        return result
    
    @staticmethod
    def hash_model(model_path):
        """Hash a trained model file"""
        model_file = Path(model_path)
        if not model_file.exists():
            return None
        
        return {
            'model_path': str(model_file),
            'model_name': model_file.name,
            'model_hash': FileHasher.hash_file(model_file),
            'file_size': model_file.stat().st_size,
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def verify_file(filepath, expected_hash):
        """Verify if file matches expected hash"""
        actual_hash = FileHasher.hash_file(filepath)
        return {
            'file': str(filepath),
            'expected': expected_hash,
            'actual': actual_hash,
            'is_valid': actual_hash == expected_hash
        }


# ============================================================
# DEMO / TESTING
# ============================================================
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔐 FILE HASHER DEMO")
    print("="*60 + "\n")
    
    hasher = FileHasher()
    
    # Test 1: Hash a string
    print("📝 Test 1: Hash a string")
    text = "CV-INTEGRITY AI"
    hash_val = hasher.hash_string(text)
    print(f"   Text: {text}")
    print(f"   Hash: {hash_val[:40]}...")
    
    # Test 2: Hash a dataset
    print("\n📊 Test 2: Hash dataset")
    for ds in ['good', 'bad', 'worst']:
        ds_path = f"datasets/processed/{ds}"
        result = hasher.hash_dataset(ds_path)
        if result:
            print(f"\n   {ds.upper()}:")
            print(f"   Images: {result['total_images']}")
            print(f"   Combined Hash: {result['combined_hash'][:40]}...")
    
    # Test 3: Hash a model
    print("\n🤖 Test 3: Hash model")
    models = [
        "model/saved_models/good/train/weights/best.pt",
        "model/saved_models/bad/train/weights/best.pt",
        "model/saved_models/worst/train/weights/best.pt"
    ]
    for model_path in models:
        result = hasher.hash_model(model_path)
        if result:
            print(f"\n   {result['model_name']}:")
            print(f"   Size: {result['file_size']/1024:.1f} KB")
            print(f"   Hash: {result['model_hash'][:40]}...")
    
    # Save all hashes
    print("\n💾 Saving all hashes...")
    all_hashes = {
        'timestamp': datetime.now().isoformat(),
        'datasets': {},
        'models': {}
    }
    
    for ds in ['good', 'bad', 'worst']:
        result = hasher.hash_dataset(f"datasets/processed/{ds}")
        if result:
            all_hashes['datasets'][ds] = result
    
    for model_path in models:
        result = hasher.hash_model(model_path)
        if result:
            all_hashes['models'][result['model_name']] = result
    
    output_path = Path('outputs/reports/file_hashes.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(all_hashes, f, indent=2)
    
    print(f"   Saved: {output_path}")
    print("\n" + "="*60)
    print("✅ File Hasher ready!")
    print("="*60)
