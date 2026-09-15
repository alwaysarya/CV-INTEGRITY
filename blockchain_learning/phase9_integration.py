"""
PHASE 9: CV-INTEGRITY Integration
Bringing all blockchain pieces together for the real project.
"""

import hashlib
import json
import time
import os
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime


# ============================================================
# REAL PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).parent.parent
BLOCKCHAIN_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'blockchain.json'
AUDIT_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'audit_trail.json'


# ============================================================
# BLOCK
# ============================================================

class Block:
    def __init__(self, index, data, previous_hash, timestamp=None):
        self.index = index
        self.timestamp = timestamp or time.time()
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True, default=str)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty=4):
        target = '0' * difficulty
        attempts = 0
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
            attempts += 1
        return attempts
    
    def to_dict(self):
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'datetime': datetime.fromtimestamp(self.timestamp).isoformat(),
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'hash': self.hash,
        }


# ============================================================
# CV-INTEGRITY BLOCKCHAIN
# ============================================================

class CVIntegrityBlockchain:
    """
    Production blockchain for CV-INTEGRITY.
    
    Features:
      - Dataset upload tracking
      - Model training records
      - Trust evaluations
      - Inference logs
      - Audit trail
    """
    
    def __init__(self, difficulty=4):
        self.difficulty = difficulty
        self.chain: List[Block] = []
        self.audit_log: List[Dict] = []
        self._load_or_create()
    
    def _load_or_create(self):
        """Load existing chain or create genesis."""
        if BLOCKCHAIN_FILE.exists():
            try:
                with open(BLOCKCHAIN_FILE, 'r') as f:
                    data = json.load(f)
                
                if isinstance(data, dict) and 'chain' in data:
                    for block_dict in data['chain']:
                        block = Block(
                            block_dict['index'],
                            block_dict['data'],
                            block_dict['previous_hash'],
                            block_dict['timestamp']
                        )
                        block.nonce = block_dict['nonce']
                        block.hash = block_dict['hash']
                        self.chain.append(block)
                    
                    print(f"✅ Loaded existing chain: {len(self.chain)} blocks")
                    return
            except Exception as e:
                print(f"⚠️  Could not load: {e}")
        
        # Create genesis
        print("📦 Creating new blockchain...")
        self._create_genesis()
    
    def _create_genesis(self):
        genesis = Block(
            index=0,
            data={
                'action': 'GENESIS',
                'message': 'CV-INTEGRITY Genesis Block',
                'version': '1.0.0',
                'created': datetime.utcnow().isoformat(),
            },
            previous_hash='0' * 64
        )
        genesis.mine_block(self.difficulty)
        self.chain.append(genesis)
        print(f"✅ Genesis created: {genesis.hash[:32]}...")
    
    def get_latest(self):
        return self.chain[-1]
    
    def add_block(self, data: Dict, mine=True) -> Block:
        """Add a new block to the chain."""
        prev = self.get_latest()
        block = Block(len(self.chain), data, prev.hash)
        
        if mine:
            attempts = block.mine_block(self.difficulty)
            data['_mining'] = {'attempts': attempts, 'nonce': block.nonce}
        
        self.chain.append(block)
        return block
    
    def is_valid(self) -> tuple:
        """Validate entire chain."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            prev = self.chain[i - 1]
            
            if current.hash != current.calculate_hash():
                return False, f"Block {i} hash tampered"
            if current.previous_hash != prev.hash:
                return False, f"Block {i} broken link"
        
        return True, "Chain valid"
    
    def save(self):
        """Save chain to JSON."""
        BLOCKCHAIN_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            'difficulty': self.difficulty,
            'length': len(self.chain),
            'updated_at': datetime.utcnow().isoformat(),
            'chain': [b.to_dict() for b in self.chain]
        }
        
        with open(BLOCKCHAIN_FILE, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        return BLOCKCHAIN_FILE
    
    def log_audit(self, event_type: str, data: Dict):
        """Add to audit log."""
        self.audit_log.append({
            'timestamp': datetime.utcnow().isoformat(),
            'event': event_type,
            'data': data
        })
    
    def save_audit(self):
        """Save audit log."""
        AUDIT_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(AUDIT_FILE, 'w') as f:
            json.dump(self.audit_log, f, indent=2, default=str)
        return AUDIT_FILE


# ============================================================
# HELPER: FILE HASHING
# ============================================================

def hash_file(filepath) -> str:
    """SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest()


def hash_directory(dirpath) -> str:
    """Hash all files in directory → combined hash."""
    dirpath = Path(dirpath)
    files = sorted([f for f in dirpath.rglob('*') if f.is_file()])
    
    combined = hashlib.sha256()
    for f in files:
        combined.update(f.name.encode())
        combined.update(hash_file(f).encode())
    
    return combined.hexdigest(), len(files)


def hash_string(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_dataset_upload():
    """Demo 1: Record a dataset upload on blockchain"""
    print("\n" + "=" * 70)
    print("DEMO 1: DATASET UPLOAD ON BLOCKCHAIN")
    print("=" * 70)
    
    bc = CVIntegrityBlockchain(difficulty=4)
    
    # Simulate dataset upload
    dataset_hash = hash_string("fake_dataset_content_" + str(time.time()))
    
    block_data = {
        'action': 'DATASET_UPLOAD',
        'user': 'aryan_0x1234',
        'dataset_name': 'good_dataset',
        'dataset_hash': dataset_hash,
        'num_images': 300,
        'classes': ['car', 'bike', 'bus', 'truck'],
        'timestamp': datetime.utcnow().isoformat(),
    }
    
    print(f"\nDataset: good_dataset")
    print(f"  Hash: {dataset_hash[:32]}...")
    print(f"  Images: 300")
    
    print(f"\nMining block...")
    start = time.time()
    block = bc.add_block(block_data)
    elapsed = time.time() - start
    
    print(f"✅ Block #{block.index} mined in {elapsed*1000:.0f}ms")
    print(f"  Hash: {block.hash}")
    print(f"  Nonce: {block.nonce}")
    print(f"  Previous: {block.previous_hash[:32]}...")
    
    # Save
    bc.save()
    bc.save_audit()
    print(f"\n💾 Saved to {BLOCKCHAIN_FILE}")


def demo_full_workflow():
    """Demo 2: Complete CV-INTEGRITY workflow"""
    print("\n" + "=" * 70)
    print("DEMO 2: COMPLETE WORKFLOW")
    print("=" * 70)
    
    bc = CVIntegrityBlockchain(difficulty=4)
    
    print(f"\nStarting with {len(bc.chain)} blocks")
    
    # Step 1: Upload dataset
    print(f"\n📤 Step 1: Upload dataset...")
    dataset_hash = hash_string("good_dataset_v1")
    bc.add_block({
        'action': 'DATASET_UPLOAD',
        'user': 'aryan',
        'dataset_name': 'good_dataset',
        'dataset_hash': dataset_hash,
        'num_images': 300,
    })
    bc.log_audit('DATASET_UPLOAD', {'dataset': 'good_dataset', 'hash': dataset_hash})
    print(f"  ✅ Recorded")
    
    # Step 2: Train model
    print(f"\n🤖 Step 2: Train model...")
    model_hash = hash_string("yolov8n_trained")
    bc.add_block({
        'action': 'MODEL_TRAINING',
        'user': 'aryan',
        'model': 'yolov8n',
        'model_hash': model_hash,
        'dataset_hash': dataset_hash,
        'epochs': 50,
        'accuracy': 0.87,
    })
    bc.log_audit('MODEL_TRAINING', {'model': 'yolov8n', 'accuracy': 0.87})
    print(f"  ✅ Recorded")
    
    # Step 3: Trust evaluation
    print(f"\n🧠 Step 3: Trust evaluation...")
    bc.add_block({
        'action': 'TRUST_EVALUATION',
        'user': 'aryan',
        'dataset_hash': dataset_hash,
        'model_hash': model_hash,
        'trust_score': 87,
        'decision': 'ACCEPTED',
        'thresholds': {'accept': 80, 'review': 50},
    })
    bc.log_audit('TRUST_EVALUATION', {'score': 87, 'decision': 'ACCEPTED'})
    print(f"  ✅ Recorded")
    
    # Step 4: Inference
    print(f"\n🎯 Step 4: Inference...")
    input_hash = hash_string("test_image_1")
    output_hash = hash_string("prediction_1")
    bc.add_block({
        'action': 'INFERENCE_RECORD',
        'model_hash': model_hash,
        'input_hash': input_hash,
        'output_hash': output_hash,
        'decision': 'APPROVED',
    })
    bc.log_audit('INFERENCE', {'input': input_hash, 'output': output_hash})
    print(f"  ✅ Recorded")
    
    # Validate
    print(f"\n🔍 Validating chain...")
    is_valid, msg = bc.is_valid()
    print(f"  {'✅' if is_valid else '❌'} {msg}")
    
    # Save
    bc.save()
    bc.save_audit()
    print(f"\n💾 Chain saved: {len(bc.chain)} blocks")


def demo_tamper_detection():
    """Demo 3: Detect tampering"""
    print("\n" + "=" * 70)
    print("DEMO 3: TAMPER DETECTION")
    print("=" * 70)
    
    bc = CVIntegrityBlockchain(difficulty=4)
    
    # Add some blocks
    for i in range(3):
        bc.add_block({
            'action': 'DATASET_UPLOAD',
            'dataset_name': f'dataset_{i}',
            'hash': hash_string(f'data_{i}'),
        })
    
    print(f"\n✅ Original chain: {len(bc.chain)} blocks")
    is_valid, msg = bc.is_valid()
    print(f"   Valid: {is_valid} — {msg}")
    
    # Tamper
    print(f"\n⚠️  Tampering with block 1 data...")
    bc.chain[1].data['dataset_name'] = 'HACKED_DATASET'
    
    # Validate
    is_valid, msg = bc.is_valid()
    print(f"   Valid: {is_valid} — {msg}")
    
    print(f"\n📌 Tamper detected automatically!")


def demo_chain_stats():
    """Demo 4: Chain statistics"""
    print("\n" + "=" * 70)
    print("DEMO 4: CHAIN STATISTICS")
    print("=" * 70)
    
    bc = CVIntegrityBlockchain(difficulty=3)
    
    # Add multiple blocks
    actions = ['DATASET_UPLOAD', 'MODEL_TRAINING', 'TRUST_EVALUATION', 'INFERENCE_RECORD', 'DATASET_VERIFIED']
    for action in actions:
        bc.add_block({'action': action, 'user': 'aryan'})
    
    # Stats
    print(f"\nChain length: {len(bc.chain)}")
    print(f"Difficulty: {bc.difficulty}")
    
    # Count by action
    action_counts = {}
    for block in bc.chain[1:]:  # Skip genesis
        action = block.data.get('action', 'UNKNOWN')
        action_counts[action] = action_counts.get(action, 0) + 1
    
    print(f"\nBlocks by action:")
    for action, count in action_counts.items():
        print(f"  {action}: {count}")
    
    # Nonce stats
    nonces = [b.nonce for b in bc.chain]
    print(f"\nNonce stats:")
    print(f"  Total: {sum(nonces):,}")
    print(f"  Avg per block: {sum(nonces)//len(nonces):,}")


def demo_blockchain_from_json():
    """Demo 5: Load chain from JSON"""
    print("\n" + "=" * 70)
    print("DEMO 5: LOAD CHAIN FROM JSON")
    print("=" * 70)
    
    if BLOCKCHAIN_FILE.exists():
        with open(BLOCKCHAIN_FILE) as f:
            data = json.load(f)
        
        print(f"\n📂 Loaded from: {BLOCKCHAIN_FILE}")
        print(f"   Difficulty: {data['difficulty']}")
        print(f"   Length: {data['length']}")
        print(f"   Updated: {data['updated_at']}")
        
        print(f"\nBlocks:")
        for block in data['chain'][:5]:
            print(f"  #{block['index']}: {block['data'].get('action', 'UNKNOWN')} — {block['hash'][:16]}...")
    else:
        print(f"\n⚠️  No blockchain file yet. Run Demo 1 first.")


def demo_merkle_integration():
    """Demo 6: Merkle tree + blockchain"""
    print("\n" + "=" * 70)
    print("DEMO 6: MERKLE TREE + BLOCKCHAIN")
    print("=" * 70)
    
    # Simulate 4 image hashes
    image_hashes = [hash_string(f'image_{i}') for i in range(4)]
    
    print(f"\n4 image hashes:")
    for h in image_hashes:
        print(f"  {h[:32]}...")
    
    # Build merkle tree
    level1 = [hash_string(image_hashes[i] + image_hashes[i+1]) for i in range(0, 4, 2)]
    root = hash_string(level1[0] + level1[1])
    
    print(f"\nMerkle root: {root}")
    
    # Store merkle root in blockchain
    bc = CVIntegrityBlockchain(difficulty=3)
    bc.add_block({
        'action': 'DATASET_MERKLE_ROOT',
        'dataset_name': 'image_folder',
        'merkle_root': root,
        'num_images': 4,
    })
    
    print(f"\n✅ Merkle root stored in block #{bc.chain[-1].index}")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 9: CV-INTEGRITY INTEGRATION")
    print("=" * 70)
    
    demo_dataset_upload()
    demo_full_workflow()
    demo_tamper_detection()
    demo_chain_stats()
    demo_blockchain_from_json()
    demo_merkle_integration()
    
    print("\n" + "=" * 70)
    print("PHASE 9 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. Real blockchain tracks: uploads, training, evaluations, inferences
  2. Each action = a block with proper data
  3. Mining difficulty = 4 (realistic for project)
  4. Save chain to outputs/reports/blockchain.json
  5. Audit log = separate file for events
  6. Tamper detection works automatically
  7. Load existing chain from JSON on startup
  8. Integrate Merkle tree for dataset hashing
""")
