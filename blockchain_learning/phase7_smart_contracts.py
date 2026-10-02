"""
PHASE 7: Smart Contracts
Self-executing contracts with automated rules.
"""

import hashlib
import json
import time
from typing import Any, Callable, Dict, List, Optional


# ============================================================
# SMART CONTRACT BASE
# ============================================================

class SmartContract:
    """
    Base class for all smart contracts.
    
    Features:
      - State management
      - Rule execution
      - Event logging
      - Access control
    """
    
    def __init__(self, name: str, owner: str):
        self.name = name
        self.owner = owner
        self.state = {}
        self.events = []
        self.deployed_at = time.time()
        self.execution_count = 0
        self.address = self._generate_address()
    
    def _generate_address(self) -> str:
        """Generate unique contract address."""
        data = f"{self.name}{self.owner}{self.deployed_at}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()[:40]
    
    def emit_event(self, event_type: str, data: Dict):
        """Log an event."""
        self.events.append({
            'type': event_type,
            'data': data,
            'timestamp': time.time(),
            'block': self.execution_count
        })
    
    def execute(self, caller: str, function: str, *args, **kwargs) -> Dict:
        """Execute a contract function."""
        self.execution_count += 1
        
        func = getattr(self, function, None)
        if not func:
            return {'success': False, 'error': f'Function {function} not found'}
        
        try:
            result = func(caller, *args, **kwargs)
            return {'success': True, 'result': result, 'block': self.execution_count}
        except Exception as e:
            return {'success': False, 'error': str(e), 'block': self.execution_count}
    
    def get_state(self) -> Dict:
        return self.state.copy()
    
    def get_events(self) -> List[Dict]:
        return self.events.copy()


# ============================================================
# TRUST CONTRACT
# ============================================================

class TrustContract(SmartContract):
    """
    Trust evaluation contract for CV-INTEGRITY.
    
    Rules:
      - ACCEPT if all scores >= threshold
      - QUARANTINE if any score < min_threshold
      - REVIEW otherwise
    """
    
    def __init__(self, owner: str):
        super().__init__("TrustContract", owner)
        self.state = {
            'thresholds': {
                'accept': 80,
                'review': 50,
                'quarantine': 0
            },
            'evaluations': [],
            'decisions': {
                'ACCEPTED': 0,
                'REVIEW': 0,
                'QUARANTINE': 0
            }
        }
    
    def set_threshold(self, caller: str, name: str, value: int) -> str:
        """Update threshold (only owner)."""
        if caller != self.owner:
            raise Exception("Only owner can change thresholds")
        
        if name not in self.state['thresholds']:
            raise Exception(f"Unknown threshold: {name}")
        
        old_value = self.state['thresholds'][name]
        self.state['thresholds'][name] = value
        
        self.emit_event('THRESHOLD_CHANGED', {
            'name': name,
            'old_value': old_value,
            'new_value': value,
            'caller': caller
        })
        
        return f"Threshold '{name}' updated: {old_value} → {value}"
    
    def evaluate(self, caller: str, dataset_hash: str, scores: Dict[str, float]) -> Dict:
        """
        Evaluate a dataset/model using scores.
        
        Args:
            scores: dict of metric name → score (0-100)
        """
        if not scores:
            raise Exception("Scores cannot be empty")
        
        # Calculate weighted average (equal weights for simplicity)
        avg_score = sum(scores.values()) / len(scores)
        
        # Determine decision
        thresholds = self.state['thresholds']
        
        if avg_score >= thresholds['accept']:
            decision = 'ACCEPTED'
        elif avg_score >= thresholds['review']:
            decision = 'REVIEW'
        else:
            decision = 'QUARANTINE'
        
        # Record evaluation
        evaluation = {
            'dataset_hash': dataset_hash,
            'scores': scores,
            'avg_score': round(avg_score, 2),
            'decision': decision,
            'caller': caller,
            'timestamp': time.time()
        }
        
        self.state['evaluations'].append(evaluation)
        self.state['decisions'][decision] += 1
        
        self.emit_event('TRUST_EVALUATED', evaluation)
        
        return evaluation
    
    def get_decision_count(self) -> Dict:
        return self.state['decisions'].copy()


# ============================================================
# ACCESS CONTRACT
# ============================================================

class AccessContract(SmartContract):
    """
    Access control contract.
    
    Manages user roles and permissions.
    """
    
    ROLES = ['admin', 'auditor', 'user', 'guest']
    
    def __init__(self, owner: str):
        super().__init__("AccessContract", owner)
        self.state = {
            'users': {
                owner: {'role': 'admin', 'active': True}
            },
            'permissions': {
                'admin':   ['read', 'write', 'delete', 'manage_users'],
                'auditor': ['read', 'audit'],
                'user':    ['read'],
                'guest':   []
            }
        }
    
    def add_user(self, caller: str, user_address: str, role: str) -> str:
        """Add a user with role (only admin)."""
        if not self._is_admin(caller):
            raise Exception("Only admin can add users")
        
        if role not in self.ROLES:
            raise Exception(f"Invalid role: {role}")
        
        self.state['users'][user_address] = {'role': role, 'active': True}
        
        self.emit_event('USER_ADDED', {
            'user': user_address,
            'role': role,
            'by': caller
        })
        
        return f"User {user_address} added as {role}"
    
    def check_permission(self, caller: str, user_address: str, action: str) -> bool:
        """Check if user can perform action."""
        if user_address not in self.state['users']:
            return False
        
        user = self.state['users'][user_address]
        if not user['active']:
            return False
        
        permissions = self.state['permissions'].get(user['role'], [])
        
        self.emit_event('PERMISSION_CHECKED', {
            'user': user_address,
            'action': action,
            'allowed': action in permissions
        })
        
        return action in permissions
    
    def deactivate_user(self, caller: str, user_address: str) -> str:
        """Deactivate a user."""
        if not self._is_admin(caller):
            raise Exception("Only admin can deactivate users")
        
        if user_address not in self.state['users']:
            raise Exception("User not found")
        
        self.state['users'][user_address]['active'] = False
        
        self.emit_event('USER_DEACTIVATED', {
            'user': user_address,
            'by': caller
        })
        
        return f"User {user_address} deactivated"
    
    def _is_admin(self, address: str) -> bool:
        user = self.state['users'].get(address)
        return user and user['role'] == 'admin' and user['active']
    
    def get_users(self) -> Dict:
        return self.state['users'].copy()


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_trust_contract():
    """Demo 1: Trust contract evaluation"""
    print("\n" + "=" * 70)
    print("DEMO 1: TRUST CONTRACT")
    print("=" * 70)
    
    owner = "0xALICE"
    contract = TrustContract(owner)
    
    print(f"\nContract deployed:")
    print(f"  Name:    {contract.name}")
    print(f"  Owner:   {contract.owner}")
    print(f"  Address: {contract.address}")
    print(f"  Thresholds: {contract.state['thresholds']}")
    
    # Evaluate datasets
    print(f"\n--- Evaluating datasets ---")
    
    evaluations = [
        ("hash_good", {'quality': 92, 'performance': 88, 'robustness': 85, 'stability': 90}),
        ("hash_mid",  {'quality': 65, 'performance': 70, 'robustness': 60, 'stability': 68}),
        ("hash_bad",  {'quality': 30, 'performance': 25, 'robustness': 40, 'stability': 35}),
    ]
    
    for hash_val, scores in evaluations:
        result = contract.execute(owner, 'evaluate', hash_val, scores)
        if result['success']:
            r = result['result']
            print(f"\n  Dataset: {hash_val}")
            print(f"    Scores: {scores}")
            print(f"    Avg:    {r['avg_score']}")
            print(f"    Decision: {r['decision']}")
    
    print(f"\n--- Decision counts ---")
    print(f"  {contract.get_decision_count()}")


def demo_access_control():
    """Demo 2: Access control contract"""
    print("\n" + "=" * 70)
    print("DEMO 2: ACCESS CONTROL CONTRACT")
    print("=" * 70)
    
    owner = "0xADMIN"
    contract = AccessContract(owner)
    
    print(f"\nContract deployed at {contract.address}")
    print(f"Initial users: {list(contract.state['users'].keys())}")
    
    # Add users
    print(f"\n--- Adding users ---")
    contract.execute(owner, 'add_user', "0xALICE", "auditor")
    contract.execute(owner, 'add_user', "0xBOB", "user")
    contract.execute(owner, 'add_user', "0xEVE", "guest")
    
    for user, info in contract.get_users().items():
        print(f"  {user}: {info['role']}")
    
    # Check permissions
    print(f"\n--- Permission checks ---")
    checks = [
        ("0xADMIN", "delete"),
        ("0xALICE", "read"),
        ("0xALICE", "delete"),
        ("0xBOB", "read"),
        ("0xBOB", "write"),
        ("0xEVE", "read"),
    ]
    
    for user, action in checks:
        allowed = contract.check_permission(owner, user, action)
        symbol = "✅" if allowed else "❌"
        print(f"  {symbol} {user} can {action}: {allowed}")
    
    # Deactivate user
    print(f"\n--- Deactivating Bob ---")
    contract.execute(owner, 'deactivate_user', "0xBOB")
    
    allowed = contract.check_permission(owner, "0xBOB", "read")
    print(f"  Bob after deactivation can read: {allowed}")


def demo_contract_immutability():
    """Demo 3: Contract events (audit trail)"""
    print("\n" + "=" * 70)
    print("DEMO 3: CONTRACT EVENTS (AUDIT TRAIL)")
    print("=" * 70)
    
    owner = "0xALICE"
    contract = TrustContract(owner)
    
    # Do some operations
    contract.execute(owner, 'evaluate', "hash_1", {'quality': 90, 'performance': 85})
    contract.execute(owner, 'evaluate', "hash_2", {'quality': 45, 'performance': 50})
    contract.execute(owner, 'set_threshold', 'accept', 85)
    contract.execute(owner, 'evaluate', "hash_3", {'quality': 88, 'performance': 90})
    
    # Show events
    print(f"\nTotal events: {len(contract.get_events())}")
    print("\nEvent log:")
    for i, event in enumerate(contract.get_events(), 1):
        print(f"\n  Event #{i}: {event['type']}")
        print(f"    Block: {event['block']}")
        print(f"    Data:  {json.dumps(event['data'], indent=6, default=str)[:200]}...")


def demo_contract_rules():
    """Demo 4: Complex contract rules"""
    print("\n" + "=" * 70)
    print("DEMO 4: COMPLEX RULES")
    print("=" * 70)
    
    class TieredContract(SmartContract):
        """Contract with tiered pricing."""
        
        def __init__(self, owner):
            super().__init__("TieredContract", owner)
            self.state = {
                'tiers': {
                    'basic':    {'price': 0,    'max_uploads': 100},
                    'pro':      {'price': 4999, 'max_uploads': 10000},
                    'enterprise': {'price': -1,  'max_uploads': -1}  # unlimited
                },
                'subscriptions': {}
            }
        
        def subscribe(self, caller, tier: str) -> str:
            if tier not in self.state['tiers']:
                raise Exception(f"Unknown tier: {tier}")
            
            self.state['subscriptions'][caller] = {
                'tier': tier,
                'since': time.time(),
                'uploads_used': 0
            }
            
            self.emit_event('SUBSCRIBED', {'user': caller, 'tier': tier})
            return f"Subscribed to {tier}"
        
        def can_upload(self, caller) -> bool:
            sub = self.state['subscriptions'].get(caller)
            if not sub:
                return False
            
            tier = self.state['tiers'][sub['tier']]
            if tier['max_uploads'] == -1:
                return True  # unlimited
            
            return sub['uploads_used'] < tier['max_uploads']
    
    owner = "0xALICE"
    contract = TieredContract(owner)
    
    # Subscribe users
    print("\n--- Subscriptions ---")
    users = [("0xUSER1", "basic"), ("0xUSER2", "pro"), ("0xUSER3", "enterprise")]
    for user, tier in users:
        result = contract.execute(owner, 'subscribe', user, tier)
        print(f"  {user}: {result.get('result', 'error')}")
    
    # Check upload permissions
    print("\n--- Upload permissions ---")
    for user, _ in users:
        allowed = contract.execute(owner, 'can_upload', user)
        print(f"  {user}: {'✅ can upload' if allowed['result'] else '❌ denied'}")


def demo_deploy_to_blockchain():
    """Demo 5: Deploy contract to a blockchain"""
    print("\n" + "=" * 70)
    print("DEMO 5: DEPLOY CONTRACT TO BLOCKCHAIN")
    print("=" * 70)
    
    # Simple chain
    chain = []
    
    def add_block(data):
        prev_hash = chain[-1]['hash'] if chain else "0" * 64
        block = {
            'index': len(chain),
            'data': data,
            'prev_hash': prev_hash,
            'timestamp': time.time()
        }
        block_str = json.dumps(block, sort_keys=True, default=str)
        block['hash'] = hashlib.sha256(block_str.encode()).hexdigest()
        chain.append(block)
        return block
    
    # Deploy contract
    owner = "0xALICE"
    contract = TrustContract(owner)
    
    # Add deployment to blockchain
    add_block({
        'action': 'CONTRACT_DEPLOYED',
        'contract_address': contract.address,
        'contract_name': contract.name,
        'owner': owner,
        'bytecode_hash': hashlib.sha256(str(contract.state).encode()).hexdigest()[:32]
    })
    
    # Execute contract, add to chain
    result = contract.execute(owner, 'evaluate', "hash_1", {'quality': 90, 'performance': 85})
    
    add_block({
        'action': 'CONTRACT_EXECUTED',
        'contract_address': contract.address,
        'function': 'evaluate',
        'result': result
    })
    
    # Show chain
    print(f"\nBlockchain ({len(chain)} blocks):")
    for block in chain:
        print(f"\n  Block #{block['index']}: {block['data']['action']}")
        print(f"    Hash:  {block['hash'][:32]}...")
        print(f"    Prev:  {block['prev_hash'][:32]}...")
        print(f"    Data:  {json.dumps(block['data'], default=str)[:150]}...")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 7: SMART CONTRACTS")
    print("=" * 70)
    
    demo_trust_contract()
    demo_access_control()
    demo_contract_immutability()
    demo_contract_rules()
    demo_deploy_to_blockchain()
    
    print("\n" + "=" * 70)
    print("PHASE 7 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. Smart contract = self-executing program on blockchain
  2. Has: state, rules, functions, events, access control
  3. Contract address = hash of (name + owner + deployed_at)
  4. Events = audit trail of all actions
  5. Access control = role-based permissions
  6. Rules can be complex (tiers, thresholds, conditions)
  7. Contracts are deployed to blockchain as transactions
  8. Every execution is logged immutably
""")
