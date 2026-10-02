"""
Audit Trail Module
Track every action in the CV pipeline
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from pathlib import Path
from datetime import datetime
from blockchain import Blockchain
from file_hasher import FileHasher


class AuditTrail:
    def __init__(self, blockchain_path='outputs/reports/blockchain.json'):
        self.blockchain_path = blockchain_path
        self.hasher = FileHasher()
        self.blockchain = Blockchain(difficulty=2)
        self.current_user = "system"
    
    def set_user(self, username):
        self.current_user = username
    
    def log_dataset_upload(self, dataset_path, dataset_name):
        hash_data = self.hasher.hash_dataset(dataset_path)
        record = {
            'action': 'DATASET_UPLOAD',
            'user': self.current_user,
            'dataset_name': dataset_name,
            'dataset_hash': hash_data['combined_hash'] if hash_data else None,
            'num_images': hash_data['total_images'] if hash_data else 0,
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_block(record)
        self.blockchain.save_to_file(self.blockchain_path)
        return record
    
    def log_model_training(self, model_name, model_path, dataset_hash, metrics):
        model_hash = self.hasher.hash_model(model_path)
        record = {
            'action': 'MODEL_TRAINING',
            'user': self.current_user,
            'model_name': model_name,
            'model_hash': model_hash['model_hash'] if model_hash else None,
            'dataset_hash': dataset_hash,
            'metrics': metrics,
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_block(record)
        self.blockchain.save_to_file(self.blockchain_path)
        return record
    
    def log_inference(self, model_hash, input_data, output_data, decision):
        record = {
            'action': 'INFERENCE',
            'user': self.current_user,
            'model_hash': model_hash,
            'input_hash': self.hasher.hash_string(str(input_data)),
            'output_hash': self.hasher.hash_string(str(output_data)),
            'trust_decision': decision,
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_block(record)
        self.blockchain.save_to_file(self.blockchain_path)
        return record
    
    def log_tamper_attempt(self, filepath, expected_hash, actual_hash):
        record = {
            'action': 'TAMPER_DETECTED',
            'user': self.current_user,
            'file': str(filepath),
            'expected_hash': expected_hash,
            'actual_hash': actual_hash,
            'severity': 'HIGH',
            'timestamp': datetime.now().isoformat()
        }
        self.blockchain.add_block(record)
        self.blockchain.save_to_file(self.blockchain_path)
        return record
    
    def verify_integrity(self):
        return self.blockchain.is_chain_valid()
    
    def get_audit_history(self):
        return self.blockchain.get_chain_data()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("📋 AUDIT TRAIL DEMO")
    print("="*60 + "\n")
    audit = AuditTrail()
    audit.set_user("Arya Ranjan")
    audit.log_dataset_upload("datasets/processed/good", "good_dataset")
    print("✅ Dataset logged")
    audit.log_model_training(
        model_name="yolov8_good",
        model_path="model/saved_models/good/train/weights/best.pt",
        dataset_hash="abc123",
        metrics={'mAP50': 0.1928}
    )
    print("✅ Model logged")
    is_valid, message = audit.verify_integrity()
    print(f"✅ {message}")