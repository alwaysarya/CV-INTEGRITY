"""
PHASE 2: Block Structure
Building the fundamental unit of a blockchain.
"""

import hashlib
import json
import time
from datetime import datetime


# ============================================================
# BLOCK CLASS
# ============================================================

class Block:
    """
    A single block in the blockchain.
    
    Attributes:
        index:         Position in the chain (0, 1, 2, ...)
        timestamp:     When the block was created
        data:          Any data to store (dict, string, etc.)
        previous_hash: Hash of the previous block
        nonce:         Number used for mining
        hash:          This block's hash
    """
    
    def __init__(self, index, data, previous_hash, timestamp=None):
        self.index = index
        self.timestamp = timestamp or time.time()
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        """Calculate SHA-256 hash of the block."""
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty=2):
        """
        Proof of Work mining.
        
        Find nonce such that hash starts with `difficulty` zeros.
        """
        target = '0' * difficulty
        attempts = 0
        
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
            attempts += 1
        
        return attempts
    
    def to_dict(self):
        """Convert block to dictionary for JSON storage."""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'hash': self.hash,
        }
    
    def __repr__(self):
        return f"Block(index={self.index}, nonce={self.nonce}, hash={self.hash[:16]}...)"


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_create_block():
    """Demo 1: Create a simple block"""
    print("\n" + "=" * 70)
    print("DEMO 1: CREATE A BLOCK")
    print("=" * 70)
    
    block = Block(
        index=0,
        data={"message": "Genesis Block"},
        previous_hash="0" * 64
    )
    
    print(f"Block created:")
    print(f"  Index:         {block.index}")
    print(f"  Timestamp:     {datetime.fromtimestamp(block.timestamp).isoformat()}")
    print(f"  Data:          {block.data}")
    print(f"  Previous Hash: {block.previous_hash[:32]}...")
    print(f"  Nonce:         {block.nonce}")
    print(f"  Hash:          {block.hash}")


def demo_mine_block():
    """Demo 2: Mine a block with difficulty 2"""
    print("\n" + "=" * 70)
    print("DEMO 2: MINE A BLOCK (DIFFICULTY 2)")
    print("=" * 70)
    
    block = Block(
        index=1,
        data={"action": "DATASET_UPLOAD", "dataset": "ImageNet-1K"},
        previous_hash="0" * 64
    )
    
    print(f"Before mining:")
    print(f"  Nonce: {block.nonce}")
    print(f"  Hash:  {block.hash}")
    
    print(f"\nMining with difficulty 2 (hash must start with '00')...")
    start = time.time()
    attempts = block.mine_block(difficulty=2)
    elapsed = time.time() - start
    
    print(f"\nMining complete:")
    print(f"  Nonce:    {block.nonce}")
    print(f"  Hash:     {block.hash}")
    print(f"  Attempts: {attempts}")
    print(f"  Time:     {elapsed*1000:.2f} ms")
    print(f"  Prefix:   {block.hash[:2]} ✓")


def demo_difficulty_comparison():
    """Demo 3: Compare mining times at different difficulties"""
    print("\n" + "=" * 70)
    print("DEMO 3: DIFFICULTY COMPARISON")
    print("=" * 70)
    
    results = []
    for difficulty in [1, 2, 3, 4]:
        block = Block(
            index=2,
            data={"test": f"difficulty_{difficulty}"},
            previous_hash="0" * 64
        )
        
        start = time.time()
        attempts = block.mine_block(difficulty=difficulty)
        elapsed = time.time() - start
        
        results.append((difficulty, attempts, elapsed * 1000))
        print(f"\nDifficulty {difficulty}:")
        print(f"  Hash:     {block.hash}")
        print(f"  Attempts: {attempts}")
        print(f"  Time:     {elapsed*1000:.2f} ms")
    
    print("\n" + "-" * 70)
    print("Observation: Higher difficulty = more attempts = more time")
    print("-" * 70)


def demo_tamper_detection():
    """Demo 4: Show how tampering breaks the block"""
    print("\n" + "=" * 70)
    print("DEMO 4: TAMPER DETECTION")
    print("=" * 70)
    
    block = Block(
        index=3,
        data={"action": "DATASET_UPLOAD", "dataset": "good_dataset"},
        previous_hash="0" * 64
    )
    block.mine_block(difficulty=2)
    
    original_hash = block.hash
    print(f"Original block:")
    print(f"  Data: {block.data}")
    print(f"  Hash: {original_hash}")
    
    # Tamper with data
    block.data = {"action": "DATASET_UPLOAD", "dataset": "TAMPERED_DATASET"}
    new_hash = block.calculate_hash()
    
    print(f"\nAfter tampering:")
    print(f"  Data: {block.data}")
    print(f"  New Hash: {new_hash}")
    
    print(f"\nHash match? {original_hash == new_hash}")
    print("Observation: Tampering changes the hash → detected!")


def demo_block_to_json():
    """Demo 5: Convert block to JSON for storage"""
    print("\n" + "=" * 70)
    print("DEMO 5: BLOCK TO JSON")
    print("=" * 70)
    
    block = Block(
        index=5,
        data={"action": "MODEL_TRAINING", "model": "yolov8n", "accuracy": 0.87},
        previous_hash="0" * 64
    )
    block.mine_block(difficulty=2)
    
    block_dict = block.to_dict()
    json_str = json.dumps(block_dict, indent=2)
    
    print("Block as JSON:")
    print(json_str)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 2: BLOCK STRUCTURE - THE BUILDING BLOCK")
    print("=" * 70)
    
    demo_create_block()
    demo_mine_block()
    demo_difficulty_comparison()
    demo_tamper_detection()
    demo_block_to_json()
    
    print("\n" + "=" * 70)
    print("PHASE 2 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. Block = container with index, timestamp, data, previous_hash, nonce, hash
  2. calculate_hash() uses all fields to produce SHA-256
  3. mine_block() finds nonce for hash prefix (Proof of Work)
  4. Higher difficulty = more attempts = more secure
  5. Tampering changes hash → detected
  6. Block can be serialized to JSON for storage
""")
