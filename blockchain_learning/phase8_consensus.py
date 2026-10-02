"""
PHASE 8: Multi-Node Consensus
Multiple nodes agreeing on a single blockchain state.
"""

import hashlib
import json
import time
from typing import List, Dict, Optional
from datetime import datetime


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
    
    @classmethod
    def from_dict(cls, d):
        b = cls(d['index'], d['data'], d['previous_hash'], d['timestamp'])
        b.nonce = d['nonce']
        b.hash = d['hash']
        return b


# ============================================================
# NODE
# ============================================================

class Node:
    """
    A single node in the blockchain network.
    
    Each node maintains its own copy of the chain.
    Nodes communicate to reach consensus.
    """
    
    def __init__(self, name: str, difficulty: int = 2):
        self.name = name
        self.difficulty = difficulty
        self.chain: List[Block] = []
        self.peers: List['Node'] = []
        self._create_genesis()
    
    def _create_genesis(self):
        genesis = Block(0, {"message": f"Genesis for {self.name}"}, "0" * 64)
        genesis.mine_block(self.difficulty)
        self.chain.append(genesis)
    
    def connect(self, peer: 'Node'):
        """Connect to another node."""
        if peer not in self.peers:
            self.peers.append(peer)
        if self not in peer.peers:
            peer.peers.append(self)
    
    def get_latest(self):
        return self.chain[-1]
    
    def chain_length(self):
        return len(self.chain)
    
    def mine_and_add(self, data) -> Block:
        """Mine a new block and add to local chain."""
        prev = self.get_latest()
        new_block = Block(len(self.chain), data, prev.hash)
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        return new_block
    
    def broadcast(self, block: Block):
        """Send a block to all peers."""
        for peer in self.peers:
            peer.receive_block(block)
    
    def receive_block(self, block: Block):
        """Receive a block from a peer."""
        latest = self.get_latest()
        
        # Check if block extends our chain
        if block.previous_hash == latest.hash and block.index == len(self.chain):
            # Validate PoW
            if block.hash[:self.difficulty] == '0' * self.difficulty:
                self.chain.append(block)
                return True
        return False
    
    def is_valid(self) -> bool:
        """Validate entire chain."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            prev = self.chain[i - 1]
            if current.hash != current.calculate_hash():
                return False
            if current.previous_hash != prev.hash:
                return False
        return True
    
    def replace_chain(self, other_chain: List[Block]) -> bool:
        """
        Replace our chain with a longer valid one.
        Longest chain rule (Nakamoto consensus).
        """
        if len(other_chain) > len(self.chain) and self._validate_chain(other_chain):
            self.chain = other_chain
            return True
        return False
    
    def _validate_chain(self, chain: List[Block]) -> bool:
        for i in range(1, len(chain)):
            if chain[i].hash != chain[i].calculate_hash():
                return False
            if chain[i].previous_hash != chain[i-1].hash:
                return False
        return True
    
    def __repr__(self):
        return f"Node({self.name}, chain_len={len(self.chain)})"


# ============================================================
# CONSENSUS
# ============================================================

class Consensus:
    """
    Consensus mechanism for the network.
    
    Rules:
      1. Longest chain wins
      2. All chains must be valid
      3. Ties broken by timestamp or node priority
    """
    
    def __init__(self, nodes: List[Node]):
        self.nodes = nodes
    
    def get_longest_chain(self) -> List[Block]:
        """Find the longest chain among all nodes."""
        longest = max(self.nodes, key=lambda n: len(n.chain))
        return longest.chain
    
    def achieve_consensus(self) -> Dict:
        """
        Run one round of consensus.
        
        1. Find longest chain
        2. Tell shorter-chain nodes to switch
        """
        longest_chain = self.get_longest_chain()
        longest_len = len(longest_chain)
        
        switched = []
        for node in self.nodes:
            if len(node.chain) < longest_len:
                if node.replace_chain(longest_chain):
                    switched.append(node.name)
        
        return {
            'longest_chain_length': longest_len,
            'nodes_switched': switched,
            'total_nodes': len(self.nodes)
        }
    
    def broadcast_to_all(self, source_node: Node, block: Block):
        """Broadcast a block from source to all other nodes."""
        for node in self.nodes:
            if node != source_node:
                node.receive_block(block)
    
    def network_status(self) -> Dict:
        """Get status of all nodes."""
        return {
            'total_nodes': len(self.nodes),
            'chains': {n.name: len(n.chain) for n in self.nodes},
            'all_valid': all(n.is_valid() for n in self.nodes),
            'consensus_reached': len(set(len(n.chain) for n in self.nodes)) == 1
        }


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_setup_network():
    """Demo 1: Create a network of nodes"""
    print("\n" + "=" * 70)
    print("DEMO 1: SETUP NETWORK")
    print("=" * 70)
    
    node_a = Node("Node-A")
    node_b = Node("Node-B")
    node_c = Node("Node-C")
    
    # Connect peers
    node_a.connect(node_b)
    node_b.connect(node_c)
    node_a.connect(node_c)
    
    network = Consensus([node_a, node_b, node_c])
    
    print(f"\nNetwork created:")
    print(f"  Nodes: {[n.name for n in network.nodes]}")
    print(f"  Node-A peers: {[p.name for p in node_a.peers]}")
    
    status = network.network_status()
    print(f"\nInitial status:")
    print(f"  Chains: {status['chains']}")
    print(f"  All valid: {status['all_valid']}")
    print(f"  Consensus: {status['consensus_reached']}")


def demo_broadcast_block():
    """Demo 2: Mine block on one node, broadcast to all"""
    print("\n" + "=" * 70)
    print("DEMO 2: BROADCAST BLOCK")
    print("=" * 70)
    
    node_a = Node("Node-A")
    node_b = Node("Node-B")
    node_c = Node("Node-C")
    
    node_a.connect(node_b)
    node_b.connect(node_c)
    node_a.connect(node_c)
    
    network = Consensus([node_a, node_b, node_c])
    
    print(f"\nBefore mining:")
    for n in network.nodes:
        print(f"  {n.name}: chain length = {len(n.chain)}")
    
    # Node-A mines and broadcasts
    print(f"\nNode-A mines a block...")
    block = node_a.mine_and_add({"action": "DATASET_UPLOAD", "dataset": "ImageNet"})
    network.broadcast_to_all(node_a, block)
    
    print(f"\nAfter broadcast:")
    for n in network.nodes:
        print(f"  {n.name}: chain length = {len(n.chain)}")


def demo_longest_chain_rule():
    """Demo 3: Longest chain wins"""
    print("\n" + "=" * 70)
    print("DEMO 3: LONGEST CHAIN RULE")
    print("=" * 70)
    
    node_a = Node("Node-A")
    node_b = Node("Node-B")
    node_a.connect(node_b)
    
    print(f"\nInitial: A={len(node_a.chain)}, B={len(node_b.chain)}")
    
    # Node-A mines 3 blocks (offline)
    print(f"\nNode-A mines 3 blocks while B is offline...")
    for i in range(3):
        node_a.mine_and_add({"action": f"tx_{i}"})
    
    # Node-B mines 1 block (offline)
    print(f"Node-B mines 1 block while A is offline...")
    node_b.mine_and_add({"action": "tx_b"})
    
    print(f"\nAfter mining:")
    print(f"  Node-A: {len(node_a.chain)} blocks")
    print(f"  Node-B: {len(node_b.chain)} blocks")
    
    # Consensus
    network = Consensus([node_a, node_b])
    result = network.achieve_consensus()
    
    print(f"\nConsensus result:")
    print(f"  Longest chain: {result['longest_chain_length']} blocks")
    print(f"  Nodes switched: {result['nodes_switched']}")
    
    print(f"\nAfter consensus:")
    for n in network.nodes:
        print(f"  {n.name}: {len(n.chain)} blocks")


def demo_fork_resolution():
    """Demo 4: Fork and resolution"""
    print("\n" + "=" * 70)
    print("DEMO 4: FORK RESOLUTION")
    print("=" * 70)
    
    node_a = Node("Node-A")
    node_b = Node("Node-B")
    node_a.connect(node_b)
    
    # Both start same
    print(f"\nStarting state: A={len(node_a.chain)}, B={len(node_b.chain)}")
    
    # Network splits — fork
    print(f"\n--- Network fork ---")
    print(f"Node-A mines 2 blocks (partition 1)")
    node_a.mine_and_add({"action": "A_block_1"})
    node_a.mine_and_add({"action": "A_block_2"})
    
    print(f"Node-B mines 3 blocks (partition 2)")
    node_b.mine_and_add({"action": "B_block_1"})
    node_b.mine_and_add({"action": "B_block_2"})
    node_b.mine_and_add({"action": "B_block_3"})
    
    print(f"\nAfter fork:")
    print(f"  Node-A: {len(node_a.chain)} blocks (A-branch)")
    print(f"  Node-B: {len(node_b.chain)} blocks (B-branch)")
    
    # Network rejoins — consensus
    print(f"\n--- Network rejoins ---")
    network = Consensus([node_a, node_b])
    result = network.achieve_consensus()
    
    print(f"\nConsensus result:")
    print(f"  Winner: {result['longest_chain_length']} blocks")
    print(f"  Nodes switched: {result['nodes_switched']}")
    
    print(f"\nAfter consensus:")
    for n in network.nodes:
        print(f"  {n.name}: {len(n.chain)} blocks")


def demo_network_status():
    """Demo 5: Real-time network status"""
    print("\n" + "=" * 70)
    print("DEMO 5: NETWORK STATUS")
    print("=" * 70)
    
    nodes = [Node(f"Node-{chr(65+i)}") for i in range(4)]
    
    # Full mesh
    for i, n in enumerate(nodes):
        for j, m in enumerate(nodes):
            if i < j:
                n.connect(m)
    
    network = Consensus(nodes)
    
    print(f"\n4-node network, full mesh:")
    status = network.network_status()
    print(f"  Total nodes: {status['total_nodes']}")
    print(f"  Chains: {status['chains']}")
    
    # Mine on one node, broadcast
    print(f"\nNode-A mines a block...")
    block = nodes[0].mine_and_add({"action": "test"})
    network.broadcast_to_all(nodes[0], block)
    
    status = network.network_status()
    print(f"  After broadcast: {status['chains']}")
    print(f"  Consensus: {status['consensus_reached']}")
    
    # Multiple blocks
    print(f"\nNode-B mines 2 more blocks...")
    for i in range(2):
        block = nodes[1].mine_and_add({"action": f"b_{i}"})
        network.broadcast_to_all(nodes[1], block)
    
    status = network.network_status()
    print(f"  Final chains: {status['chains']}")


def demo_51_percent_attack():
    """Demo 6: 51% attack simulation"""
    print("\n" + "=" * 70)
    print("DEMO 6: 51% ATTACK SIMULATION")
    print("=" * 70)
    
    print("""
Setup:
  Honest network: 5 nodes, each mines 1 block → chain length 6
  Attacker: 1 node (but 51% power) → can mine 6+ blocks faster
    """)
    
    # Honest nodes
    honest_nodes = [Node(f"Honest-{i}") for i in range(5)]
    honest = honest_nodes[0]
    for n in honest_nodes[1:]:
        honest.connect(n)
    
    print("\nHonest network mines 5 blocks:")
    for i in range(5):
        block = honest.mine_and_add({"action": f"honest_{i}"})
        for n in honest_nodes[1:]:
            n.receive_block(block)
    
    print(f"  Honest chain length: {len(honest.chain)}")
    
    # Attacker node
    attacker = Node("Attacker")
    attacker.chain = [Block.from_dict(b.to_dict()) for b in honest.chain[:1]]  # Same genesis
    
    print(f"\nAttacker starts with same genesis, mines faster...")
    for i in range(7):
        attacker.mine_and_add({"action": f"attack_{i}"})
    
    print(f"  Attacker chain length: {len(attacker.chain)}")
    
    # Consensus
    all_nodes = honest_nodes + [attacker]
    network = Consensus(all_nodes)
    result = network.achieve_consensus()
    
    print(f"\nConsensus result:")
    print(f"  Winner chain: {result['longest_chain_length']} blocks")
    print(f"  Nodes switched: {result['nodes_switched']}")
    
    print(f"\nObservation:")
    print(f"  Honest nodes accepted attacker's longer chain!")
    print(f"  In real Bitcoin, attacker needs 51%+ of NETWORK power")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 8: MULTI-NODE CONSENSUS")
    print("=" * 70)
    
    demo_setup_network()
    demo_broadcast_block()
    demo_longest_chain_rule()
    demo_fork_resolution()
    demo_network_status()
    demo_51_percent_attack()
    
    print("\n" + "=" * 70)
    print("PHASE 8 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. Node = independent copy of blockchain
  2. Nodes connect as peers (P2P network)
  3. Broadcast = send block to all peers
  4. Consensus = agreement on canonical chain
  5. Longest chain rule = Nakamoto consensus
  6. Fork resolution = shorter chain switches to longer
  7. 51% attack = attacker with majority power can rewrite
  8. Network status = real-time view of all nodes
""")
