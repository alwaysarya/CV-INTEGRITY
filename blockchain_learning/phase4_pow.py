"""
PHASE 4: Proof of Work (Mining Deep Dive)
Understanding the mining algorithm and difficulty adjustment.
"""

import hashlib
import json
import time
from datetime import datetime


# ============================================================
# MINING CORE
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
    
    def mine_block(self, difficulty=2, verbose=False):
        """
        Mine block with proof of work.
        
        Returns:
            dict with attempts, time, nonce
        """
        target = '0' * difficulty
        attempts = 0
        start = time.time()
        
        if verbose:
            print(f"  Mining with difficulty {difficulty} (target: '{target}...')")
        
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
            attempts += 1
            
            # Show progress every 5000 attempts
            if verbose and attempts % 5000 == 0:
                elapsed = time.time() - start
                rate = attempts / elapsed if elapsed > 0 else 0
                print(f"    {attempts:,} attempts · {elapsed:.2f}s · {rate:,.0f} H/s")
        
        elapsed = time.time() - start
        return {
            'attempts': attempts,
            'time': elapsed,
            'nonce': self.nonce,
            'hash': self.hash,
            'hash_rate': attempts / elapsed if elapsed > 0 else 0
        }


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_pow_basic():
    """Demo 1: Basic PoW with different difficulties"""
    print("\n" + "=" * 70)
    print("DEMO 1: PROOF OF WORK - DIFFERENT DIFFICULTIES")
    print("=" * 70)
    
    results = []
    for difficulty in [1, 2, 3, 4]:
        block = Block(0, {"test": f"diff_{difficulty}"}, "0" * 64)
        result = block.mine_block(difficulty=difficulty)
        
        results.append({
            'difficulty': difficulty,
            'attempts': result['attempts'],
            'time': result['time'],
            'hash_rate': result['hash_rate'],
            'hash': result['hash']
        })
        
        print(f"\nDifficulty {difficulty}:")
        print(f"  Hash:      {result['hash']}")
        print(f"  Attempts:  {result['attempts']:,}")
        print(f"  Time:      {result['time']*1000:.2f} ms")
        print(f"  Hash rate: {result['hash_rate']:,.0f} H/s")
    
    print("\n" + "-" * 70)
    print("Expected ratio between difficulties: ~16x per level")
    print("-" * 70)
    for i in range(1, len(results)):
        ratio = results[i]['attempts'] / results[i-1]['attempts']
        print(f"  Diff {results[i-1]['difficulty']} → {results[i]['difficulty']}: "
              f"{results[i-1]['attempts']:,} → {results[i]['attempts']:,} "
              f"({ratio:.1f}x)")


def demo_pow_verification():
    """Demo 2: Fast verification vs slow mining"""
    print("\n" + "=" * 70)
    print("DEMO 2: FAST VERIFICATION VS SLOW MINING")
    print("=" * 70)
    
    block = Block(0, {"test": "verification"}, "0" * 64)
    
    # Mining (slow)
    print("Mining block (slow)...")
    mine_result = block.mine_block(difficulty=4)
    print(f"  Mined in {mine_result['time']*1000:.2f} ms")
    print(f"  Attempts: {mine_result['attempts']:,}")
    print(f"  Nonce: {mine_result['nonce']}")
    print(f"  Hash: {mine_result['hash']}")
    
    # Verification (fast)
    print("\nVerification (fast):")
    start = time.time()
    for i in range(1000):
        recalculated = block.calculate_hash()
        is_valid = recalculated == block.hash and block.hash.startswith('0' * 4)
    elapsed = time.time() - start
    
    print(f"  Verified 1000 times in {elapsed*1000:.2f} ms")
    print(f"  Per verification: {elapsed*1000/1000:.4f} ms")
    print(f"  Result: {'VALID' if is_valid else 'INVALID'}")
    
    print("\nObservation:")
    print(f"  Mining: ~{mine_result['time']*1000:.0f} ms (slow)")
    print(f"  Verification: ~{elapsed*1000/1000:.4f} ms (fast, {mine_result['time']/(elapsed/1000):,.0f}x faster)")


def demo_difficulty_target():
    """Demo 3: Visualize difficulty target"""
    print("\n" + "=" * 70)
    print("DEMO 3: DIFFICULTY TARGET VISUALIZATION")
    print("=" * 70)
    
    print("\nDifficulty → target hash pattern → success probability")
    print("-" * 70)
    for d in range(1, 7):
        target = '0' * d
        total = 16 ** d
        prob = 1 / total
        print(f"  Difficulty {d}: {target}{'.'*(6-d)}  "
              f"1 in {total:,}  ({prob*100:.6f}%)")


def demo_chain_mining():
    """Demo 4: Mine a full blockchain"""
    print("\n" + "=" * 70)
    print("DEMO 4: MINE FULL CHAIN")
    print("=" * 70)
    
    difficulty = 3
    chain = []
    
    # Genesis
    genesis = Block(0, {"message": "Genesis"}, "0" * 64)
    result = genesis.mine_block(difficulty=difficulty)
    chain.append(genesis)
    print(f"Block 0 (Genesis): {result['attempts']:,} attempts, {result['time']*1000:.0f} ms")
    
    # Add 4 more blocks
    events = [
        {"action": "DATASET_UPLOAD", "dataset": "ImageNet"},
        {"action": "MODEL_TRAINING", "model": "yolov8n"},
        {"action": "TRUST_EVALUATION", "score": 87},
        {"action": "INFERENCE", "result": "APPROVED"},
    ]
    
    total_attempts = result['attempts']
    total_time = result['time']
    
    for i, event in enumerate(events, start=1):
        prev = chain[-1]
        block = Block(i, event, prev.hash)
        result = block.mine_block(difficulty=difficulty)
        chain.append(block)
        
        total_attempts += result['attempts']
        total_time += result['time']
        
        print(f"Block {i}: {result['attempts']:>6,} attempts, {result['time']*1000:>6.0f} ms, hash={result['hash'][:16]}...")
    
    print(f"\nChain summary:")
    print(f"  Total blocks: {len(chain)}")
    print(f"  Total attempts: {total_attempts:,}")
    print(f"  Total time: {total_time:.2f} s")
    print(f"  Average per block: {total_time/len(chain)*1000:.0f} ms")


def demo_difficulty_adjustment():
    """Demo 5: Auto-adjust difficulty to maintain block time"""
    print("\n" + "=" * 70)
    print("DEMO 5: DIFFICULTY ADJUSTMENT (Bitcoin-style)")
    print("=" * 70)
    
    target_time = 0.5  # seconds per block
    
    print(f"\nGoal: Keep block time around {target_time}s\n")
    
    difficulty = 2
    
    for block_num in range(1, 6):
        block = Block(block_num, {"test": f"block_{block_num}"}, "0" * 64)
        result = block.mine_block(difficulty=difficulty)
        
        print(f"Block {block_num}:")
        print(f"  Difficulty: {difficulty}")
        print(f"  Time:       {result['time']:.3f}s")
        print(f"  Attempts:   {result['attempts']:,}")
        
        # Adjust difficulty
        if result['time'] > target_time * 2:
            difficulty = max(1, difficulty - 1)
            print(f"  → Too slow! Decreasing difficulty to {difficulty}")
        elif result['time'] < target_time / 2:
            difficulty += 1
            print(f"  → Too fast! Increasing difficulty to {difficulty}")
        else:
            print(f"  → Perfect! Keeping difficulty at {difficulty}")


def demo_51_percent():
    """Demo 6: 51% attack simulation"""
    print("\n" + "=" * 70)
    print("DEMO 6: 51% ATTACK SIMULATION")
    print("=" * 70)
    
    print("""
Scenario: Attacker wants to change block 1.
To do this, they must:
  1. Change block 1's data
  2. Re-mine block 1
  3. Re-mine block 2 (because its previous_hash points to old block 1)
  4. Re-mine block 3 (because its previous_hash points to old block 2)
  5. ...and so on
    """)
    
    difficulty = 3
    print(f"With difficulty {difficulty}, let's simulate...\n")
    
    # Honest chain
    print("Honest chain mining:")
    honest_chain = [Block(0, {"msg": "Genesis"}, "0" * 64)]
    honest_chain[0].mine_block(difficulty=difficulty)
    honest_time = honest_chain[0].timestamp
    
    honest_total = 0
    for i in range(1, 6):
        prev = honest_chain[-1]
        block = Block(i, {"block": i, "value": 100}, prev.hash)
        result = block.mine_block(difficulty=difficulty)
        honest_total += result['time']
        honest_chain.append(block)
        print(f"  Block {i}: {result['time']*1000:.0f} ms, {result['attempts']:,} attempts")
    
    # Attacker chain — change block 1
    print(f"\nAttacker chain (changed block 1):")
    attacker_chain = [Block(0, {"msg": "Genesis"}, "0" * 64)]
    attacker_chain[0].hash = honest_chain[0].hash  # same genesis
    attacker_chain[0].nonce = honest_chain[0].nonce
    
    attacker_total = 0
    for i in range(1, 6):
        prev = attacker_chain[-1]
        # Block 1 changed!
        if i == 1:
            data = {"block": i, "value": 999999}  # ATTACK
        else:
            data = {"block": i, "value": 100}
        
        block = Block(i, data, prev.hash)
        result = block.mine_block(difficulty=difficulty)
        attacker_total += result['time']
        attacker_chain.append(block)
        print(f"  Block {i}: {result['time']*1000:.0f} ms, {result['attempts']:,} attempts" + 
              (" ← CHANGED" if i == 1 else ""))
    
    print(f"\nHonest total time:    {honest_total:.2f}s")
    print(f"Attacker total time:  {attacker_total:.2f}s")
    print(f"\nObservation:")
    print(f"  Attacker must re-mine ALL blocks — no shortcut.")
    print(f"  In real Bitcoin, attacker needs >50% of network power to win the race.")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 4: PROOF OF WORK - MINING DEEP DIVE")
    print("=" * 70)
    
    demo_pow_basic()
    demo_pow_verification()
    demo_difficulty_target()
    demo_chain_mining()
    demo_difficulty_adjustment()
    demo_51_percent()
    
    print("\n" + "=" * 70)
    print("PHASE 4 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. PoW = find nonce so hash starts with N zeros
  2. Difficulty 1 → ~16 attempts, difficulty 4 → ~65,536 attempts
  3. Ratio between difficulties = 16x (hex base)
  4. Mining is slow (many attempts), verification is instant (1 hash calc)
  5. Difficulty auto-adjusts to maintain target block time
  6. 51% attack = attacker must re-mine all subsequent blocks
  7. Real Bitcoin difficulty ≈ 20+ zeros (harder than any home computer)
""")
