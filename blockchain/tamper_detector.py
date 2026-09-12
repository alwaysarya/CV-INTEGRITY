"""
Tamper Detection System
Detect any modification to datasets, models, or outputs
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from pathlib import Path
from datetime import datetime
from file_hasher import FileHasher


class TamperDetector:
    def __init__(self, hashes_file='outputs/reports/file_hashes.json'):
        self.hashes_file = hashes_file
        self.hasher = FileHasher()
        self.known_hashes = self._load_known_hashes()
    
    def _load_known_hashes(self):
        if Path(self.hashes_file).exists():
            try:
                with open(self.hashes_file, 'r') as f:
                    data = json.load(f)
                if 'datasets' not in data:
                    data['datasets'] = {}
                if 'models' not in data:
                    data['models'] = {}
                return data
            except:
                pass
        return {'datasets': {}, 'models': {}}
    
    def register_dataset(self, dataset_name, dataset_path):
        hash_data = self.hasher.hash_dataset(dataset_path)
        if hash_data:
            self.known_hashes['datasets'][dataset_name] = {
                'path': str(dataset_path),
                'hash': hash_data['combined_hash'],
                'registered_at': datetime.now().isoformat()
            }
            self._save_hashes()
        return hash_data
    
    def register_model(self, model_name, model_path):
        hash_data = self.hasher.hash_model(model_path)
        if hash_data:
            self.known_hashes['models'][model_name] = {
                'path': str(model_path),
                'hash': hash_data['model_hash'],
                'registered_at': datetime.now().isoformat()
            }
            self._save_hashes()
        return hash_data
    
    def verify_dataset(self, dataset_name):
        if dataset_name not in self.known_hashes['datasets']:
            return {'status': 'UNKNOWN', 'is_tampered': None}
        
        registered = self.known_hashes['datasets'][dataset_name]
        
        # Handle both formats
        if 'path' in registered:
            path = registered['path']
            expected_hash = registered['hash']
        elif 'dataset_path' in registered:
            path = registered['dataset_path']
            expected_hash = registered.get('combined_hash') or registered.get('hash')
        else:
            return {'status': 'ERROR', 'is_tampered': None}
        
        if not path or not expected_hash:
            return {'status': 'ERROR', 'is_tampered': None}
        
        current_hash = self.hasher.hash_dataset(path)
        if not current_hash:
            return {'status': 'MISSING', 'is_tampered': True}
        
        is_tampered = current_hash['combined_hash'] != expected_hash
        return {
            'status': 'TAMPERED' if is_tampered else 'CLEAN',
            'is_tampered': is_tampered,
            'message': '⚠️ TAMPERING DETECTED!' if is_tampered else '✅ Dataset is intact'
        }
    
    def verify_model(self, model_name):
        if model_name not in self.known_hashes['models']:
            return {'status': 'UNKNOWN', 'is_tampered': None}
        
        registered = self.known_hashes['models'][model_name]
        
        # Handle both formats
        if 'path' in registered:
            path = registered['path']
            expected_hash = registered['hash']
        elif 'model_path' in registered:
            path = registered['model_path']
            expected_hash = registered.get('model_hash') or registered.get('hash')
        else:
            return {'status': 'ERROR', 'is_tampered': None}
        
        if not path or not expected_hash:
            return {'status': 'ERROR', 'is_tampered': None}
        
        current_hash = self.hasher.hash_model(path)
        if not current_hash:
            return {'status': 'MISSING', 'is_tampered': True}
        
        is_tampered = current_hash['model_hash'] != expected_hash
        return {
            'status': 'TAMPERED' if is_tampered else 'CLEAN',
            'is_tampered': is_tampered,
            'message': '⚠️ TAMPERING DETECTED!' if is_tampered else '✅ Model is intact'
        }
    
    def verify_all(self):
        results = {
            'verified_at': datetime.now().isoformat(),
            'datasets': {},
            'models': {},
            'total_tampered': 0,
            'total_clean': 0
        }
        
        for ds_name in list(self.known_hashes['datasets'].keys()):
            result = self.verify_dataset(ds_name)
            results['datasets'][ds_name] = result
            if result['is_tampered'] is True:
                results['total_tampered'] += 1
            elif result['is_tampered'] is False:
                results['total_clean'] += 1
        
        for model_name in list(self.known_hashes['models'].keys()):
            result = self.verify_model(model_name)
            results['models'][model_name] = result
            if result['is_tampered'] is True:
                results['total_tampered'] += 1
            elif result['is_tampered'] is False:
                results['total_clean'] += 1
        
        return results
    
    def _save_hashes(self):
        Path(self.hashes_file).parent.mkdir(parents=True, exist_ok=True)
        with open(self.hashes_file, 'w') as f:
            json.dump(self.known_hashes, f, indent=2)


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔍 TAMPER DETECTION DEMO")
    print("="*60 + "\n")
    detector = TamperDetector()
    
    print("📝 Registering datasets...")
    for ds in ['good', 'bad', 'worst']:
        detector.register_dataset(ds, f"datasets/processed/{ds}")
        print(f"   ✅ {ds.upper()} registered")
    
    print("\n📝 Registering models...")
    models = [
        ('yolov8_good', 'model/saved_models/good/train/weights/best.pt'),
        ('yolov8_bad', 'model/saved_models/bad/train/weights/best.pt'),
        ('yolov8_worst', 'model/saved_models/worst/train/weights/best.pt')
    ]
    for name, path in models:
        detector.register_model(name, path)
        print(f"   ✅ {name} registered")
    
    print("\n🔍 Verifying all...")
    results = detector.verify_all()
    print(f"   ✅ Total Clean: {results['total_clean']}")
    print(f"   ⚠️  Total Tampered: {results['total_tampered']}")
    
    print("\n" + "="*60)
    print("✅ Tamper Detection ready!")
    print("="*60)