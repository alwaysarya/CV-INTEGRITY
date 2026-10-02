"""
PHASE 3: Blockchain - Chain of Blocks
Connecting blocks into an immutable chain.
"""

import hashlib
import json
import time
from datetime import datetime


# ============================================================
# BLOCK CLASS (from Phase 2)
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
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty=2):
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
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'hash': self.hash,
        }


# ============================================================
# BLOCKCHAIN CLASS
# ============================================================

class Blockchain:
    """
    A chain of blocks.
    
    Manages:
      - Genesis block creation
      - Adding new blocks
      - Chain validation
      - Chain inspection
    """
    
    def __init__(self, difficulty=2):
        self.chain = []
        self.difficulty = difficulty
        self._create_genesis_block()
    
    def _create_genesis_block(self):
        """Create the first block (index 0)."""
        genesis = Block(
            index=0,
            data={"message": "Genesis Block", "created": datetime.now().isoformat()},
            previous_hash="0" * 64
        )
        genesis.mine_block(self.difficulty)
        self.chain.append(genesis)
    
    def get_latest_block(self):
        """Return the last block in the chain."""
        return self.chain[-1]
    
    def add_block(self, data):
        """
        Add a new block to the chain.
        
        Uses latest block's hash as previous_hash.
        """
        latest = self.get_latest_block()
        new_block = Block(
            index=len(self.chain),
            data=data,
            previous_hash=latest.hash
        )
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        return new_block
    
    def is_chain_valid(self):
        """
        Validate the entire chain.
        
        Returns:
            (is_valid, reason_if_invalid)
        """
        # Check genesis block
        genesis = self.chain[0]
        if genesis.previous_hash != "0" * 64:
            return False, "Genesis block has wrong previous_hash"
        
        if genesis.hash != genesis.calculate_hash():
            return False, "Genesis block hash is invalid"
        
        # Check each subsequent block
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]
            
            # Check hash integrity
            if current.hash != current.calculate_hash():
                return False, f"Block {i} hash is invalid (data tampered)"
            
            # Check chain link
            if current.previous_hash != previous.hash:
                return False, f"Block {i} previous_hash doesn't match block {i-1}"
        
        return True, "Chain is valid"
    
    def get_chain_length(self):
        return len(self.chain)
    
    def to_dict(self):
        return {
            'difficulty': self.difficulty,
            'length': len(self.chain),
            'chain': [b.to_dict() for b in self.chain]
        }
    
    def print_chain(self, show_data=True):
        """Pretty print the chain."""
        print(f"\n{'='*70}")
        print(f"BLOCKCHAIN ({len(self.chain)} blocks, difficulty={self.difficulty})")
        print(f"{'='*70}")
        
        for block in self.chain:
            print(f"\nBlock #{block.index}")
            print(f"  Timestamp:     {datetime.fromtimestamp(block.timestamp).isoformat()}")
            print(f"  Nonce:         {block.nonce}")
            print(f"  Hash:          {block.hash}")
            print(f"  Previous Hash: {block.previous_hash[:32]}...")
            if show_data:
                print(f"  Data:          {json.dumps(block.data, indent=18)[:200]}")


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_create_blockchain():
    """Demo 1: Create a blockchain with genesis block"""
    print("\n" + "=" * 70)
    print("DEMO 1: CREATE BLOCKCHAIN")
    print("=" * 70)
    
    bc = Blockchain(difficulty=2)
    
    print(f"Blockchain created!")
    print(f"  Length: {bc.get_chain_length()}")
    print(f"  Difficulty: {bc.difficulty}")
    
    genesis = bc.get_latest_block()
    print(f"\nGenesis block:")
    print(f"  Index: {genesis.index}")
    print(f"  Nonce: {genesis.nonce}")
    print(f"  Hash:  {genesis.hash}")
    print(f"  Prev:  {genesis.previous_hash[:32]}... (all zeros)")


def demo_add_blocks():
    """Demo 2: Add multiple blocks"""
    print("\n" + "=" * 70)
    print("DEMO 2: ADD BLOCKS TO CHAIN")
    print("=" * 70)
    
    bc = Blockchain(difficulty=2)
    
    # Add blocks
    events = [
        {"action": "DATASET_UPLOAD", "dataset": "ImageNet-1K", "user": "aryan"},
        {"action": "MODEL_TRAINING", "model": "yolov8n", "epochs": 50},
        {"action": "TRUST_EVALUATION", "score": 87, "decision": "ACCEPTED"},
        {"action": "INFERENCE", "model_hash": "abc...", "result": "APPROVED"},
    ]
    
    for event in events:
        block = bc.add_block(event)
        print(f"Added block #{block.index}: {event.get('action')} (nonce={block.nonce})")
    
    print(f"\nChain length: {bc.get_chain_length()}")
    bc.print_chain(show_data=False)


def demo_chain_validation():
    """Demo 3: Validate a healthy chain"""
    print("\n" + "=" * 70)
    print("DEMO 3: CHAIN VALIDATION (HEALTHY)")
    print("=" * 70)
    
    bc = Blockchain(difficulty=2)
    bc.add_block({"action": "DATASET_UPLOAD", "dataset": "good_dataset"})
    bc.add_block({"action": "MODEL_TRAINING", "model": "yolov8n"})
    bc.add_block({"action": "TRUST_EVALUATION", "score": 87})
    
    is_valid, reason = bc.is_chain_valid()
    
    print(f"Chain length: {bc.get_chain_length()}")
    print(f"Valid: {is_valid}")
    print(f"Reason: {reason}")


def demo_tamper_detection():
    """Demo 4: Tamper with a block and see chain break"""
    print("\n" + "=" * 70)
    print("DEMO 4: TAMPER DETECTION")
    print("=" * 70)
    
    bc = Blockchain(difficulty=2)
    bc.add_block({"action": "DATASET_UPLOAD", "dataset": "good_dataset", "images": 300})
    bc.add_block({"action": "MODEL_TRAINING", "model": "yolov8n"})
    bc.add_block({"action": "TRUST_EVALUATION", "score": 87})
    
    print("Before tampering:")
    is_valid, reason = bc.is_chain_valid()
    print(f"  Valid: {is_valid} — {reason}")
    
    # Tamper with block 1
    print("\n--- Tampering with block 1 ---")
    bc.chain[1].data["images"] = 999999  # changed!
    print(f"  Changed block 1 data: images 300 → 999999")
    
    # Validate
    print("\nAfter tampering:")
    is_valid, reason = bc.is_chain_valid()
    print(f"  Valid: {is_valid} — {reason}")
    
    print("\nObservation: Tampering is detected immediately!")


def demo_rechain_attack():
    """Demo 5: Show that re-mining doesn't help"""
    print("\n" + "=" * 70)
    print("DEMO 5: RE-MINING DOESN'T HELP")
    print("=" * 70)
    
    bc = Blockchain(difficulty=2)
    bc.add_block({"action": "DATASET_UPLOAD", "dataset": "good_dataset"})
    bc.add_block({"action": "MODEL_TRAINING", "model": "yolov8n"})
    bc.add_block({"action": "TRUST_EVALUATION", "score": 87})
    
    print(f"Original chain valid: {bc.is_chain_valid()[0]}")
    
    # Tamper and re-mine only block 1
    bc.chain[1].data["dataset"] = "HACKED"
    bc.chain[1].nonce = 0
    bc.chain[1].hash = bc.chain[1].calculate_hash()
    bc.chain[1].mine_block(difficulty=2)  # re-mine it
    
    print(f"After re-mining block 1:")
    print(f"  Chain valid: {bc.is_chain_valid()[0]}")
    print(f"  Reason: {bc.is_chain_valid()[1]}")
    print("\nObservation: Block 2's previous_hash still points to OLD hash.")
    print("To fix, attacker must re-mine ALL subsequent blocks!")


def demo_json_export():
    """Demo 6: Export chain to JSON"""
    print("\n" + "=" * 70)
    print("DEMO 6: EXPORT CHAIN TO JSON")
    print("=" * 70)
    
    bc = Blockchain(difficulty=2)
    bc.add_block({"action": "DATASET_UPLOAD", "dataset": "test"})
    bc.add_block({"action": "MODEL_TRAINING", "model": "yolov8n"})
    
    chain_dict = bc.to_dict()
    json_str = json.dumps(chain_dict, indent=2, default=str)
    
    print(f"JSON length: {len(json_str)} characters")
    print(f"First 500 chars:\n{json_str[:500]}...")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 3: BLOCKCHAIN - CHAIN OF BLOCKS")
    print("=" * 70)
    
    demo_create_blockchain()
    demo_add_blocks()
    demo_chain_validation()
    demo_tamper_detection()
    demo_rechain_attack()
    demo_json_export()
    
    print("\n" + "=" * 70)
    print("PHASE 3 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. Blockchain = list of blocks linked by previous_hash
  2. Genesis block = first block (index 0, previous_hash = 64 zeros)
  3. Each new block uses previous block's hash as previous_hash
  4. Chain validation = check all hashes and links
  5. Tampering breaks the chain → detected immediately
  6. Re-mining one block doesn't help — must re-mine ALL subsequent blocks
  7. Chain can be exported to JSON for storage
""")
