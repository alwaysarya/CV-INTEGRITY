"""
Blockchain Node
Individual node in the multi-node network
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
from datetime import datetime
from pathlib import Path


class Node:
    """Individual blockchain node"""
    
    def __init__(self, node_id, port):
        self.node_id = node_id
        self.port = port
        self.chain = []
        self.peers = []
        self.pending_blocks = []
        self.status = "active"
        self.blocks_received = 0
        self.blocks_created = 0
        
        # Create genesis block
        self._create_genesis()
    
    def _create_genesis(self):
        """Create genesis block for this node"""
        genesis = {
            'index': 0,
            'timestamp': datetime.now().isoformat(),
            'data': {'message': f'Genesis Block - Node {self.node_id}'},
            'previous_hash': '0',
            'node_id': self.node_id,
            'nonce': 0
        }
        genesis['hash'] = self._hash_block(genesis)
        self.chain.append(genesis)
    
    def _hash_block(self, block):
        """Hash a block"""
        block_string = json.dumps({
            'index': block['index'],
            'timestamp': block['timestamp'],
            'data': block['data'],
            'previous_hash': block['previous_hash'],
            'nonce': block.get('nonce', 0)
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def add_peer(self, peer):
        """Add a peer node"""
        self.peers.append(peer)
    
    def receive_block(self, block):
        """Receive block from peer"""
        # Verify block
        if self._verify_block(block):
            self.chain.append(block)
            self.blocks_received += 1
            return True
        return False
    
    def _verify_block(self, block):
        """Verify incoming block"""
        if len(self.chain) == 0:
            return block['previous_hash'] == '0'
        
        last_block = self.chain[-1]
        
        # Check previous hash matches
        if block['previous_hash'] != last_block['hash']:
            return False
        
        # Verify hash
        if block['hash'] != self._hash_block(block):
            return False
        
        return True
    
    def create_block(self, data):
        """Create a new block"""
        last_block = self.chain[-1]
        
        block = {
            'index': len(self.chain),
            'timestamp': datetime.now().isoformat(),
            'data': data,
            'previous_hash': last_block['hash'],
            'node_id': self.node_id,
            'nonce': 0
        }
        
        block['hash'] = self._hash_block(block)
        self.chain.append(block)
        self.blocks_created += 1
        
        return block
    
    def broadcast_block(self, block):
        """Broadcast block to all peers"""
        results = []
        for peer in self.peers:
            success = peer.receive_block(block)
            results.append({
                'peer': peer.node_id,
                'success': success
            })
        return results
    
    def get_status(self):
        """Get node status"""
        return {
            'node_id': self.node_id,
            'port': self.port,
            'status': self.status,
            'chain_length': len(self.chain),
            'peers_count': len(self.peers),
            'blocks_received': self.blocks_received,
            'blocks_created': self.blocks_created,
            'last_block_hash': self.chain[-1]['hash'][:20] + '...' if self.chain else None
        }
    
    def sync_with_peer(self, peer):
        """Sync chain with a peer"""
        if len(peer.chain) > len(self.chain):
            # Adopt longer chain
            self.chain = peer.chain.copy()
            return {'status': 'synced', 'new_length': len(self.chain)}
        return {'status': 'already_synced', 'length': len(self.chain)}
    
    def validate_chain(self):
        """Validate entire chain"""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]
            
            if current['previous_hash'] != previous['hash']:
                return False, f"Block {i} previous hash mismatch"
            
            if current['hash'] != self._hash_block(current):
                return False, f"Block {i} hash invalid"
        
        return True, "Chain is valid"


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌐 NODE DEMO")
    print("="*60 + "\n")
    
    # Create 3 nodes
    node1 = Node("Node-1", 8001)
    node2 = Node("Node-2", 8002)
    node3 = Node("Node-3", 8003)
    
    print("✅ 3 Nodes created:")
    print(f"   {node1.node_id} - Port {node1.port}")
    print(f"   {node2.node_id} - Port {node2.port}")
    print(f"   {node3.node_id} - Port {node3.port}")
    
    # Add peers
    node1.add_peer(node2)
    node1.add_peer(node3)
    node2.add_peer(node1)
    node2.add_peer(node3)
    node3.add_peer(node1)
    node3.add_peer(node2)
    
    print(f"\n✅ Peers connected:")
    print(f"   {node1.node_id} → {len(node1.peers)} peers")
    print(f"   {node2.node_id} → {len(node2.peers)} peers")
    print(f"   {node3.node_id} → {len(node3.peers)} peers")
    
    # Node 1 creates block
    print(f"\n📝 {node1.node_id} creating block...")
    block = node1.create_block({
        'action': 'DATASET_UPLOAD',
        'dataset': 'good_dataset',
        'hash': 'abc123'
    })
    print(f"   Block #{block['index']} created")
    print(f"   Hash: {block['hash'][:30]}...")
    
    # Broadcast to peers
    print(f"\n📡 Broadcasting to peers...")
    results = node1.broadcast_block(block)
    for r in results:
        status = "✅ Received" if r['success'] else "❌ Rejected"
        print(f"   {status} by {r['peer']}")
    
    # Node statuses
    print(f"\n📊 Node Statuses:")
    for node in [node1, node2, node3]:
        status = node.get_status()
        print(f"   {status['node_id']}: chain_length={status['chain_length']}, received={status['blocks_received']}")
    
    # Validate chains
    print(f"\n🔍 Validating chains...")
    for node in [node1, node2, node3]:
        valid, msg = node.validate_chain()
        print(f"   {node.node_id}: {'✅ VALID' if valid else '❌ INVALID'}")
    
    print("\n" + "="*60)
    print("✅ Multi-Node demo complete!")
    print("="*60)