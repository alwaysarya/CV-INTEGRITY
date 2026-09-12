"""
Merkle Tree Implementation
Efficient cryptographic hashing for blockchain blocks
"""

import hashlib
import json
from datetime import datetime
from pathlib import Path


class MerkleTree:
    """Merkle Tree for efficient block verification"""
    
    def __init__(self, data_list):
        """
        Initialize Merkle Tree with data
        data_list: list of strings/dicts to hash
        """
        self.data_list = data_list
        self.leaves = []
        self.tree = []
        self.root = None
        self._build_tree()
    
    def _hash(self, data):
        """SHA-256 hash"""
        if isinstance(data, dict):
            data = json.dumps(data, sort_keys=True)
        return hashlib.sha256(str(data).encode()).hexdigest()
    
    def _build_tree(self):
        """Build the Merkle Tree"""
        # Create leaves
        self.leaves = [self._hash(item) for item in self.data_list]
        
        if not self.leaves:
            self.root = self._hash("empty")
            return
        
        # Build tree level by level
        self.tree = [self.leaves[:]]
        current_level = self.leaves[:]
        
        while len(current_level) > 1:
            next_level = []
            
            # If odd number, duplicate last element
            if len(current_level) % 2 != 0:
                current_level.append(current_level[-1])
            
            # Hash pairs
            for i in range(0, len(current_level), 2):
                combined = current_level[i] + current_level[i + 1]
                parent_hash = self._hash(combined)
                next_level.append(parent_hash)
            
            self.tree.append(next_level)
            current_level = next_level
        
        self.root = current_level[0]
    
    def get_root(self):
        """Get Merkle Root"""
        return self.root
    
    def get_proof(self, index):
        """Get Merkle Proof for a leaf"""
        if index >= len(self.leaves):
            return None
        
        proof = []
        current_index = index
        
        for level in self.tree[:-1]:
            if current_index % 2 == 0:
                # Right sibling
                sibling_index = current_index + 1
            else:
                # Left sibling
                sibling_index = current_index - 1
            
            if sibling_index < len(level):
                proof.append({
                    'position': 'right' if current_index % 2 == 0 else 'left',
                    'hash': level[sibling_index]
                })
            
            current_index = current_index // 2
        
        return proof
    
    def verify_proof(self, leaf_data, proof):
        """Verify a Merkle Proof"""
        current_hash = self._hash(leaf_data)
        
        for step in proof:
            if step['position'] == 'right':
                combined = current_hash + step['hash']
            else:
                combined = step['hash'] + current_hash
            current_hash = self._hash(combined)
        
        return current_hash == self.root
    
    def to_dict(self):
        """Convert tree to dictionary"""
        return {
            'root': self.root,
            'leaves_count': len(self.leaves),
            'tree_height': len(self.tree),
            'leaves': self.leaves,
            'tree_levels': [len(level) for level in self.tree]
        }
    
    @staticmethod
    def create_block_merkle_tree(block_data):
        """Create Merkle Tree for a block"""
        if isinstance(block_data, dict):
            # Convert block data to list of items
            items = []
            for key, value in block_data.items():
                items.append(f"{key}:{value}")
        elif isinstance(block_data, list):
            items = block_data
        else:
            items = [str(block_data)]
        
        return MerkleTree(items)


class MerkleBlockchain:
    """Blockchain with Merkle Tree support"""
    
    def __init__(self):
        self.blocks = []
        self.merkle_roots = []
    
    def add_block_with_merkle(self, data):
        """Add block with Merkle Tree"""
        # Create Merkle Tree for this block
        merkle = MerkleTree.create_block_merkle_tree(data)
        
        block = {
            'index': len(self.blocks),
            'data': data,
            'merkle_root': merkle.get_root(),
            'merkle_proof': merkle.to_dict(),
            'timestamp': datetime.now().isoformat()
        }
        
        self.blocks.append(block)
        self.merkle_roots.append(merkle.get_root())
        
        return block
    
    def verify_block(self, block_index, data):
        """Verify block data using Merkle Root"""
        if block_index >= len(self.blocks):
            return False
        
        block = self.blocks[block_index]
        new_merkle = MerkleTree.create_block_merkle_tree(data)
        
        return new_merkle.get_root() == block['merkle_root']
    
    def save(self, path='outputs/reports/merkle_blocks.json'):
        """Save Merkle blockchain"""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w') as f:
            json.dump({
                'blocks': self.blocks,
                'total_blocks': len(self.blocks),
                'merkle_roots': self.merkle_roots
            }, f, indent=2)


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌳 MERKLE TREE DEMO")
    print("="*60 + "\n")
    
    # Test 1: Basic Merkle Tree
    print("📝 Test 1: Basic Merkle Tree")
    data = ['dataset_hash_1', 'dataset_hash_2', 'dataset_hash_3', 'dataset_hash_4']
    tree = MerkleTree(data)
    
    print(f"   Data items: {len(data)}")
    print(f"   Merkle Root: {tree.get_root()[:40]}...")
    print(f"   Tree Levels: {len(tree.tree)}")
    
    # Test 2: Merkle Proof
    print("\n📝 Test 2: Merkle Proof Verification")
    index = 1
    proof = tree.get_proof(index)
    is_valid = tree.verify_proof(data[index], proof)
    print(f"   Leaf index: {index}")
    print(f"   Proof length: {len(proof)}")
    print(f"   Verification: {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Test 3: Tamper Detection
    print("\n📝 Test 3: Tamper Detection")
    tampered_data = data.copy()
    tampered_data[index] = "TAMPERED_HASH"
    is_tampered = not tree.verify_proof(tampered_data[index], proof)
    print(f"   Tampered data: {'⚠️ DETECTED' if is_tampered else '❌ NOT DETECTED'}")
    
    # Test 4: Blockchain with Merkle
    print("\n📝 Test 4: Merkle Blockchain")
    bc = MerkleBlockchain()
    
    bc.add_block_with_merkle({
        'dataset': 'good_dataset',
        'hash': 'abc123',
        'contributor': 'Arya Ranjan'
    })
    print("   ✅ Block 1 added with Merkle Root")
    
    bc.add_block_with_merkle({
        'model': 'yolov8_good',
        'hash': 'xyz789',
        'metrics': {'mAP50': 0.1928}
    })
    print("   ✅ Block 2 added with Merkle Root")
    
    # Verify block
    original_data = {
        'dataset': 'good_dataset',
        'hash': 'abc123',
        'contributor': 'Arya Ranjan'
    }
    is_valid = bc.verify_block(0, original_data)
    print(f"\n   Block 0 verification: {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Save
    bc.save()
    print(f"\n💾 Merkle blockchain saved")
    
    print("\n" + "="*60)
    print("✅ Merkle Trees ready!")
    print("="*60)