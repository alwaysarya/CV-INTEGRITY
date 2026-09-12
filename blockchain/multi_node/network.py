"""
Blockchain Network
Manages multiple nodes and their communication
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime
from pathlib import Path


class BlockchainNetwork:
    """Network of blockchain nodes"""
    
    def __init__(self, num_nodes=4):
        from node import Node
        from consensus import ConsensusEngine
        
        self.nodes = []
        self.num_nodes = num_nodes
        
        # Create nodes
        for i in range(num_nodes):
            node = Node(f"Node-{i+1}", 8000 + i + 1)
            self.nodes.append(node)
        
        # Connect all nodes as peers
        for node in self.nodes:
            for other in self.nodes:
                if node.node_id != other.node_id:
                    node.add_peer(other)
        
        # Initialize consensus
        self.consensus = ConsensusEngine(self.nodes)
        
        self.network_log = []
    
    def broadcast_transaction(self, data):
        """Broadcast transaction to network"""
        print(f"\n📡 Broadcasting transaction to network...")
        
        # Creator node
        creator = self.nodes[0]
        block = creator.create_block(data)
        
        print(f"   Created by: {creator.node_id}")
        print(f"   Block #{block['index']}")
        
        # Consensus
        consensus_result = self.consensus.propose_block(block)
        
        # If consensus reached, broadcast to all
        if consensus_result['status'] == 'accepted':
            print(f"\n📡 Broadcasting to all nodes...")
            for node in self.nodes:
                if node.node_id != creator.node_id:
                    success = node.receive_block(block)
                    status = "✅" if success else "❌"
                    print(f"   {status} {node.node_id} received block")
        
        # Log
        self.network_log.append({
            'transaction': data,
            'block': block,
            'consensus': consensus_result,
            'timestamp': datetime.now().isoformat()
        })
        
        return block, consensus_result
    
    def get_network_status(self):
        """Get network status"""
        status = {
            'total_nodes': len(self.nodes),
            'nodes': [],
            'consensus_history': self.consensus.get_consensus_history(),
            'total_transactions': len(self.network_log)
        }
        
        for node in self.nodes:
            status['nodes'].append(node.get_status())
        
        return status
    
    def sync_all_nodes(self):
        """Sync all nodes to longest chain"""
        print("\n🔄 Syncing all nodes...")
        
        # Find longest chain
        longest = max(self.nodes, key=lambda n: len(n.chain))
        
        for node in self.nodes:
            if node.node_id != longest.node_id:
                result = node.sync_with_peer(longest)
                print(f"   {node.node_id}: {result['status']}")
    
    def save_network_state(self, path='outputs/reports/network_state.json'):
        """Save network state"""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        
        state = self.get_network_status()
        
        with open(path, 'w') as f:
            json.dump(state, f, indent=2)
        
        print(f"\n💾 Network state saved: {path}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌐 MULTI-NODE NETWORK DEMO")
    print("="*60)
    
    # Create network
    network = BlockchainNetwork(num_nodes=4)
    
    print(f"\n✅ Network created with {network.num_nodes} nodes")
    
    # Show initial state
    print("\n📊 Initial Network State:")
    for node in network.nodes:
        status = node.get_status()
        print(f"   {status['node_id']}: chain={status['chain_length']}, peers={status['peers_count']}")
    
    # Transaction 1: Dataset Upload
    print("\n" + "="*60)
    print("TRANSACTION 1: Dataset Upload")
    print("="*60)
    
    network.broadcast_transaction({
        'action': 'DATASET_UPLOAD',
        'dataset': 'good_dataset',
        'hash': 'abc123',
        'contributor': 'Arya Ranjan'
    })
    
    # Transaction 2: Model Training
    print("\n" + "="*60)
    print("TRANSACTION 2: Model Training")
    print("="*60)
    
    network.broadcast_transaction({
        'action': 'MODEL_TRAINING',
        'model': 'yolov8_good',
        'dataset_hash': 'abc123',
        'metrics': {'mAP50': 0.1928}
    })
    
    # Transaction 3: Inference
    print("\n" + "="*60)
    print("TRANSACTION 3: Inference Output")
    print("="*60)
    
    network.broadcast_transaction({
        'action': 'INFERENCE',
        'model_hash': 'xyz789',
        'decision': 'ACCEPT',
        'confidence': 0.95
    })
    
    # Final state
    print("\n" + "="*60)
    print("📊 FINAL NETWORK STATE")
    print("="*60)
    
    status = network.get_network_status()
    
    print(f"\n🌐 Network:")
    print(f"   Total Nodes: {status['total_nodes']}")
    print(f"   Total Transactions: {status['total_transactions']}")
    
    print(f"\n📦 Nodes:")
    for node in status['nodes']:
        print(f"   {node['node_id']}: chain={node['chain_length']}, received={node['blocks_received']}, created={node['blocks_created']}")
    
    print(f"\n⚡ Consensus:")
    ch = status['consensus_history']
    print(f"   Total Rounds: {ch['total_rounds']}")
    print(f"   Accepted: {ch['accepted_rounds']}")
    print(f"   Rejected: {ch['rejected_rounds']}")
    
    # Save
    network.save_network_state()
    
    print("\n" + "="*60)
    print("✅ Multi-Node Network ready!")
    print("="*60)