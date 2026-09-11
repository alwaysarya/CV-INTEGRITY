"""
CV-INTEGRITY Blockchain Module
Simple blockchain for tracking data, models, and inference integrity
"""

import hashlib
import json
import time
from datetime import datetime
from pathlib import Path


class Block:
    """Single block in the blockchain"""
    
    def __init__(self, index, data, previous_hash, timestamp=None):
        self.index = index
        self.timestamp = timestamp or time.time()
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        """Calculate SHA-256 hash of block"""
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty=2):
        """Proof of Work mining"""
        target = '0' * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
        print(f"⛏️  Block {self.index} mined: {self.hash[:20]}...")
    
    def to_dict(self):
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'datetime': datetime.fromtimestamp(self.timestamp).isoformat(),
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'hash': self.hash
        }


class Blockchain:
    """Blockchain for CV model integrity tracking"""
    
    def __init__(self, difficulty=2):
        self.chain = []
        self.difficulty = difficulty
        self.pending_data = []
        # Create genesis block
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create the first block"""
        genesis = Block(0, {"message": "Genesis Block - CV-INTEGRITY AI"}, "0")
        genesis.mine_block(self.difficulty)
        self.chain.append(genesis)
    
    def get_latest_block(self):
        """Get the last block"""
        return self.chain[-1]
    
    def add_block(self, data):
        """Add a new block with data"""
        previous_block = self.get_latest_block()
        new_block = Block(
            index=len(self.chain),
            data=data,
            previous_hash=previous_block.hash
        )
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        return new_block
    
    def add_dataset_record(self, dataset_name, dataset_hash, contributor, num_images):
        """Add dataset to blockchain"""
        data = {
            'type': 'dataset',
            'dataset_name': dataset_name,
            'dataset_hash': dataset_hash,
            'contributor': contributor,
            'num_images': num_images,
            'action': 'dataset_uploaded'
        }
        return self.add_block(data)
    
    def add_model_record(self, model_name, model_hash, dataset_hash, metrics):
        """Add trained model to blockchain"""
        data = {
            'type': 'model',
            'model_name': model_name,
            'model_hash': model_hash,
            'dataset_hash': dataset_hash,
            'metrics': metrics,
            'action': 'model_trained'
        }
        return self.add_block(data)
    
    def add_inference_record(self, model_hash, input_hash, output_hash, decision):
        """Add inference output to blockchain"""
        data = {
            'type': 'inference',
            'model_hash': model_hash,
            'input_hash': input_hash,
            'output_hash': output_hash,
            'trust_decision': decision,
            'action': 'inference_validated'
        }
        return self.add_block(data)
    
    def is_chain_valid(self):
        """Verify entire blockchain integrity"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
            
            # Check current block hash
            if current_block.hash != current_block.calculate_hash():
                return False, f"Block {i} hash invalid"
            
            # Check chain link
            if current_block.previous_hash != previous_block.hash:
                return False, f"Block {i} chain broken"
        
        return True, "✅ Blockchain is valid"
    
    def get_chain_data(self):
        """Get entire blockchain as list of dicts"""
        return [block.to_dict() for block in self.chain]
    
    def save_to_file(self, filepath='outputs/reports/blockchain.json'):
        """Save blockchain to JSON file"""
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump({
                'chain': self.get_chain_data(),
                'length': len(self.chain),
                'difficulty': self.difficulty,
                'is_valid': self.is_chain_valid()[0]
            }, f, indent=2)
        print(f"💾 Blockchain saved: {filepath}")
    
    @staticmethod
    def hash_file(filepath):
        """Calculate SHA-256 hash of any file"""
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    @staticmethod
    def hash_string(text):
        """Calculate SHA-256 hash of string"""
        return hashlib.sha256(text.encode()).hexdigest()


# ============================================================
# DEMO / TESTING
# ============================================================
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔗 CV-INTEGRITY BLOCKCHAIN DEMO")
    print("="*60 + "\n")
    
    # Create blockchain
    cv_chain = Blockchain(difficulty=2)
    
    # Add dataset record
    print("\n📊 Adding dataset record...")
    cv_chain.add_dataset_record(
        dataset_name="good_dataset",
        dataset_hash="abc123def456...",
        contributor="Arya Ranjan",
        num_images=300
    )
    
    # Add model record
    print("\n🤖 Adding model record...")
    cv_chain.add_model_record(
        model_name="yolov8_good",
        model_hash="xyz789uvw012...",
        dataset_hash="abc123def456...",
        metrics={'mAP50': 0.1928, 'precision': 0.5282}
    )
    
    # Add inference record
    print("\n🧠 Adding inference record...")
    cv_chain.add_inference_record(
        model_hash="xyz789uvw012...",
        input_hash="inp111...",
        output_hash="out222...",
        decision="ACCEPT"
    )
    
    # Verify blockchain
    print("\n" + "="*60)
    is_valid, message = cv_chain.is_chain_valid()
    print(message)
    print("="*60)
    
    # Save to file
    cv_chain.save_to_file()
    
    print(f"\n📦 Total blocks: {len(cv_chain.chain)}")
    print(f"🔗 Chain length: {len(cv_chain.chain)}")
