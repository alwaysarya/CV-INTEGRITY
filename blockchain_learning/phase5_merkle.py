"""
PHASE 5: Merkle Tree
Efficient data structure for transaction verification.
"""

import hashlib
import json
from typing import List, Optional


# ============================================================
# HASH HELPER
# ============================================================

def sha256(data: str) -> str:
    """SHA-256 hash helper."""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha256(data).hexdigest()


def hash_pair(left: str, right: str) -> str:
    """Hash two hashes together."""
    return sha256(left + right)


# ============================================================
# MERKLE TREE
# ============================================================

class MerkleTree:
    """
    Merkle Tree implementation.
    
    Stores transactions and builds a hash tree.
    Root hash = single hash representing all transactions.
    """
    
    def __init__(self, transactions: List[str]):
        self.transactions = [str(tx) for tx in transactions]
        self.leaves = [sha256(tx) for tx in self.transactions]
        self.levels = []   # levels[0] = leaves, levels[-1] = [root]
        self.root = None
        self._build_tree()
    
    def _build_tree(self):
        """Build the entire tree bottom-up."""
        if not self.leaves:
            self.root = None
            return
        
        # Level 0 = leaves
        self.levels.append(self.leaves[:])
        current_level = self.leaves[:]
        
        # Build up
        while len(current_level) > 1:
            next_level = []
            
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                # If odd number, duplicate the last one
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                next_level.append(hash_pair(left, right))
            
            self.levels.append(next_level)
            current_level = next_level
        
        self.root = current_level[0]
    
    def get_root(self) -> str:
        """Return the Merkle root."""
        return self.root
    
    def get_proof(self, tx_index: int) -> List[dict]:
        """
        Get Merkle proof for a transaction.
        
        Returns list of {position, hash} needed to verify.
        """
        if tx_index < 0 or tx_index >= len(self.transactions):
            return []
        
        proof = []
        index = tx_index
        
        # Walk up the tree
        for level_idx in range(len(self.levels) - 1):
            level = self.levels[level_idx]
            
            # Determine sibling
            if index % 2 == 0:
                # Current is left, sibling is right
                sibling_idx = index + 1
                position = 'right'
            else:
                # Current is right, sibling is left
                sibling_idx = index - 1
                position = 'left'
            
            # If sibling doesn't exist (odd level), sibling = self
            if sibling_idx >= len(level):
                sibling_hash = level[index]
            else:
                sibling_hash = level[sibling_idx]
            
            proof.append({
                'position': position,
                'hash': sibling_hash
            })
            
            # Move to parent index
            index = index // 2
        
        return proof
    
    def verify_proof(self, tx: str, proof: List[dict], root: str) -> bool:
        """
        Verify a transaction using its Merkle proof.
        """
        current = sha256(tx)
        
        for step in proof:
            if step['position'] == 'right':
                current = hash_pair(current, step['hash'])
            else:
                current = hash_pair(step['hash'], current)
        
        return current == root
    
    def print_tree(self):
        """Print tree levels."""
        print(f"\nMerkle Tree ({len(self.transactions)} transactions)")
        print("=" * 70)
        for i, level in enumerate(self.levels):
            label = "Leaves" if i == 0 else ("Root" if i == len(self.levels) - 1 else f"Level {i}")
            print(f"\n{label} ({len(level)} nodes):")
            for j, h in enumerate(level):
                print(f"  [{j}] {h}")


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_basic_tree():
    """Demo 1: Build a simple Merkle tree"""
    print("\n" + "=" * 70)
    print("DEMO 1: BUILD BASIC MERKLE TREE")
    print("=" * 70)
    
    transactions = ["TxA", "TxB", "TxC", "TxD"]
    tree = MerkleTree(transactions)
    
    print(f"\nTransactions: {transactions}")
    print(f"Merkle Root: {tree.get_root()}")
    tree.print_tree()


def demo_odd_transactions():
    """Demo 2: Tree with odd number of transactions"""
    print("\n" + "=" * 70)
    print("DEMO 2: ODD NUMBER OF TRANSACTIONS")
    print("=" * 70)
    
    transactions = ["TxA", "TxB", "TxC"]  # 3 transactions (odd)
    tree = MerkleTree(transactions)
    
    print(f"\nTransactions: {transactions} (3 — odd!)")
    print(f"Merkle Root: {tree.get_root()}")
    print("\nObservation: Last node is duplicated to make pair.")
    tree.print_tree()


def demo_merkle_proof():
    """Demo 3: Generate and verify Merkle proof"""
    print("\n" + "=" * 70)
    print("DEMO 3: MERKLE PROOF")
    print("=" * 70)
    
    transactions = ["TxA", "TxB", "TxC", "TxD", "TxE", "TxF", "TxG", "TxH"]
    tree = MerkleTree(transactions)
    
    print(f"\nTree with {len(transactions)} transactions")
    print(f"Merkle Root: {tree.get_root()}")
    
    # Get proof for TxC
    tx_index = 2
    proof = tree.get_proof(tx_index)
    
    print(f"\nMerkle proof for '{transactions[tx_index]}':")
    for i, step in enumerate(proof, 1):
        print(f"  {i}. {step['position'].upper():5} → {step['hash'][:32]}...")
    
    # Verify
    is_valid = tree.verify_proof(transactions[tx_index], proof, tree.get_root())
    print(f"\nVerification: {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Try fake proof
    print(f"\nTrying with wrong transaction 'FAKE':")
    fake_valid = tree.verify_proof("FAKE", proof, tree.get_root())
    print(f"Verification: {'✅ VALID' if fake_valid else '❌ INVALID'}")


def demo_all_proofs():
    """Demo 4: Verify all transactions"""
    print("\n" + "=" * 70)
    print("DEMO 4: VERIFY ALL TRANSACTIONS")
    print("=" * 70)
    
    transactions = ["TxA", "TxB", "TxC", "TxD", "TxE", "TxF", "TxG", "TxH"]
    tree = MerkleTree(transactions)
    root = tree.get_root()
    
    print(f"\nMerkle Root: {root}")
    print(f"\nVerifying all {len(transactions)} transactions:\n")
    
    for i, tx in enumerate(transactions):
        proof = tree.get_proof(i)
        is_valid = tree.verify_proof(tx, proof, root)
        proof_size = len(proof)
        print(f"  {tx}: {'✅' if is_valid else '❌'} (proof size: {proof_size} hashes)")


def demo_efficiency():
    """Demo 5: Efficiency of Merkle tree"""
    print("\n" + "=" * 70)
    print("DEMO 5: MERKLE TREE EFFICIENCY")
    print("=" * 70)
    
    print("\nNumber of transactions vs proof size:")
    print("-" * 60)
    print(f"{'Transactions':<15} {'Tree Height':<15} {'Proof Size':<15}")
    print("-" * 60)
    
    for n in [2, 4, 8, 16, 256, 1024, 65536, 1048576]:
        # Tree height = log2(n)
        import math
        height = math.ceil(math.log2(n)) if n > 1 else 0
        proof_size = height
        
        print(f"{n:<15,} {height:<15} {proof_size:<15}")
    
    print("\nObservation: 1M transactions → only ~20 hashes to verify!")


def demo_tamper_detection():
    """Demo 6: Tamper detection via Merkle root"""
    print("\n" + "=" * 70)
    print("DEMO 6: TAMPER DETECTION VIA MERKLE ROOT")
    print("=" * 70)
    
    # Original
    original_txs = ["TxA", "TxB", "TxC", "TxD"]
    original_tree = MerkleTree(original_txs)
    original_root = original_tree.get_root()
    
    print(f"Original transactions: {original_txs}")
    print(f"Original root: {original_root}")
    
    # Tampered
    tampered_txs = ["TxA", "TxB", "HACKED", "TxD"]  # TxC → HACKED
    tampered_tree = MerkleTree(tampered_txs)
    tampered_root = tampered_tree.get_root()
    
    print(f"\nTampered transactions: {tampered_txs}")
    print(f"Tampered root: {tampered_root}")
    
    print(f"\nRoot match? {original_root == tampered_root}")
    print("Observation: One transaction change → root changes → tamper detected!")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 5: MERKLE TREE")
    print("=" * 70)
    
    demo_basic_tree()
    demo_odd_transactions()
    demo_merkle_proof()
    demo_all_proofs()
    demo_efficiency()
    demo_tamper_detection()
    
    print("\n" + "=" * 70)
    print("PHASE 5 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. Merkle Tree = hash tree of all transactions
  2. Root = single hash representing ALL transactions
  3. Leaf = SHA-256 of each transaction
  4. Parent = SHA-256(left_child_hash + right_child_hash)
  5. Proof size = O(log n) — efficient!
  6. 1M transactions → only ~20 hashes needed for proof
  7. Tamper detection: change any tx → root changes
  8. Bitcoin uses Merkle root in every block header
""")
