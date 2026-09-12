"""
Consensus Algorithm (PBFT-inspired)
Distributed agreement among blockchain nodes
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime
from pathlib import Path


class ConsensusEngine:
    """PBFT-inspired Consensus Engine"""
    
    def __init__(self, nodes):
        self.nodes = nodes
        self.total_nodes = len(nodes)
        self.faulty_tolerance = (self.total_nodes - 1) // 3
        self.consensus_threshold = (2 * self.total_nodes) // 3 + 1
        self.rounds = []
    
    def propose_block(self, block):
        """Propose block to all nodes for consensus"""
        round_data = {
            'round_id': len(self.rounds) + 1,
            'block_hash': block['hash'],
            'proposed_at': datetime.now().isoformat(),
            'votes': {},
            'status': 'voting'
        }
        
        print(f"\n🗳️  Consensus Round {round_data['round_id']}")
        print(f"   Block: {block['hash'][:30]}...")
        print(f"   Total nodes: {self.total_nodes}")
        print(f"   Threshold: {self.consensus_threshold}")
        print(f"   Faulty tolerance: {self.faulty_tolerance}")
        
        # Each node votes
        votes_for = 0
        votes_against = 0
        
        for node in self.nodes:
            # Simulate vote (in real system, node validates independently)
            vote = self._node_vote(node, block)
            
            round_data['votes'][node.node_id] = vote
            
            if vote['vote'] == 'accept':
                votes_for += 1
                print(f"   ✅ {node.node_id}: ACCEPT")
            else:
                votes_against += 1
                print(f"   ❌ {node.node_id}: REJECT - {vote['reason']}")
        
        # Determine consensus
        if votes_for >= self.consensus_threshold:
            round_data['status'] = 'accepted'
            round_data['result'] = f'Consensus reached ({votes_for}/{self.total_nodes})'
            print(f"\n   🎉 CONSENSUS REACHED: {votes_for}/{self.total_nodes}")
        else:
            round_data['status'] = 'rejected'
            round_data['result'] = f'Consensus failed ({votes_for}/{self.total_nodes})'
            print(f"\n   ❌ CONSENSUS FAILED: {votes_for}/{self.total_nodes}")
        
        round_data['votes_for'] = votes_for
        round_data['votes_against'] = votes_against
        round_data['completed_at'] = datetime.now().isoformat()
        
        self.rounds.append(round_data)
        return round_data
    
    def _node_vote(self, node, block):
        """Simulate node voting"""
        # Check if block is valid for node
        if len(node.chain) == 0:
            return {'vote': 'reject', 'reason': 'Empty chain'}
        
        last_block = node.chain[-1]
        
        # Verify previous hash
        if block['previous_hash'] != last_block['hash']:
            return {'vote': 'reject', 'reason': 'Previous hash mismatch'}
        
        # Verify block hash
        if block['hash'] != node._hash_block(block):
            return {'vote': 'reject', 'reason': 'Invalid hash'}
        
        return {'vote': 'accept', 'reason': 'Valid block'}
    
    def get_consensus_history(self):
        """Get consensus history"""
        return {
            'total_rounds': len(self.rounds),
            'accepted_rounds': sum(1 for r in self.rounds if r['status'] == 'accepted'),
            'rejected_rounds': sum(1 for r in self.rounds if r['status'] == 'rejected'),
            'rounds': self.rounds
        }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("⚡ PBFT CONSENSUS DEMO")
    print("="*60)
    
    # Import Node
    from node import Node
    
    # Create 4 nodes
    nodes = [
        Node("Node-1", 8001),
        Node("Node-2", 8002),
        Node("Node-3", 8003),
        Node("Node-4", 8004)
    ]
    
    print(f"\n✅ {len(nodes)} nodes initialized")
    
    # Create consensus engine
    engine = ConsensusEngine(nodes)
    print(f"✅ Consensus engine initialized")
    print(f"   Threshold: {engine.consensus_threshold}")
    print(f"   Faulty tolerance: {engine.faulty_tolerance}")
    
    # Test 1: Valid block
    print("\n" + "="*60)
    print("TEST 1: Valid Block Consensus")
    print("="*60)
    
    block = nodes[0].create_block({
        'action': 'DATASET_UPLOAD',
        'dataset': 'good_dataset'
    })
    
    result1 = engine.propose_block(block)
    
    # Test 2: Invalid block (tampered)
    print("\n" + "="*60)
    print("TEST 2: Invalid Block Consensus")
    print("="*60)
    
    tampered_block = block.copy()
    tampered_block['hash'] = 'TAMPERED_HASH_12345'
    
    result2 = engine.propose_block(tampered_block)
    
    # History
    print("\n" + "="*60)
    print("📊 CONSENSUS HISTORY")
    print("="*60)
    history = engine.get_consensus_history()
    print(f"   Total Rounds: {history['total_rounds']}")
    print(f"   Accepted: {history['accepted_rounds']}")
    print(f"   Rejected: {history['rejected_rounds']}")
    
    print("\n" + "="*60)
    print("✅ Consensus engine ready!")
    print("="*60)