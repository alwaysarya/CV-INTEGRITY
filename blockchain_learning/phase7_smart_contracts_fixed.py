"""
PHASE 7 (FIXED): Smart Contracts
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
    """Base class for all smart contracts."""
    
    def __init__(self, name: str, owner: str):
        self.name = name
        self.owner = owner
        self.state = {}
        self.events = []
        self.deployed_at = time.time()
        self.execution_count = 0
        self.address = self._generate_address()
    
    def _generate_address(self) -> str:
        data = f"{self.name}{self.owner}{self.deployed_at}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()[:40]
    
    def emit_event(self, event_type: str, data: Dict):
        self.events.append({
            'type': event_type,
            'data': data,
            'timestamp': time.time(),
            'block': self.execution_count
        })
    
    def execute(self, caller: str, function: str, *args, **kwargs) -> Dict:
        """Execute a contract function. Caller is passed as first arg to function."""
        self.execution_count += 1
        
        func = getattr(self, function, None)
        if not func:
            return {'success': False, 'error': f'Function {function} not found', 'block': self.execution_count}
        
        try:
            # Pass caller as first argument
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
    """Trust evaluation contract."""
    
    def __init__(self, owner: str):
        super().__init__("TrustContract", owner)
        self.state = {
            'thresholds': {'accept': 80, 'review': 50, 'quarantine': 0},
            'evaluations': [],
            'decisions': {'ACCEPTED': 0, 'REVIEW': 0, 'QUARANTINE': 0}
        }
    
    def set_threshold(self, caller: str, name: str, value: int) -> str:
        if caller != self.owner:
            raise Exception("Only owner can change thresholds")
        if name not in self.state['thresholds']:
            raise Exception(f"Unknown threshold: {name}")
        
        old_value = self.state['thresholds'][name]
        self.state['thresholds'][name] = value
        self.emit_event('THRESHOLD_CHANGED', {
            'name': name, 'old_value': old_value,
            'new_value': value, 'caller': caller
        })
        return f"Threshold '{name}' updated: {old_value} → {value}"
    
    def evaluate(self, caller: str, dataset_hash: str, scores: Dict[str, float]) -> Dict:
        if not scores:
            raise Exception("Scores cannot be empty")
        
        avg_score = sum(scores.values()) / len(scores)
        thresholds = self.state['thresholds']
        
        if avg_score >= thresholds['accept']:
            decision = 'ACCEPTED'
        elif avg_score >= thresholds['review']:
            decision = 'REVIEW'
        else:
            decision = 'QUARANTINE'
        
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
    """Access control contract."""
    
    ROLES = ['admin', 'auditor', 'user', 'guest']
    
    def __init__(self, owner: str):
        super().__init__("AccessContract", owner)
        self.state = {
            'users': {owner: {'role': 'admin', 'active': True}},
            'permissions': {
                'admin':   ['read', 'write', 'delete', 'manage_users'],
                'auditor': ['read', 'audit'],
                'user':    ['read'],
                'guest':   []
            }
        }
    
    def add_user(self, caller: str, user_address: str, role: str) -> str:
        if not self._is_admin(caller):
            raise Exception("Only admin can add users")
        if role not in self.ROLES:
            raise Exception(f"Invalid role: {role}")
        
        self.state['users'][user_address] = {'role': role, 'active': True}
        self.emit_event('USER_ADDED', {'user': user_address, 'role': role, 'by': caller})
        return f"User {user_address} added as {role}"
    
    def check_permission(self, caller: str, user_address: str, action: str) -> bool:
        if user_address not in self.state['users']:
            return False
        user = self.state['users'][user_address]
        if not user['active']:
            return False
        permissions = self.state['permissions'].get(user['role'], [])
        self.emit_event('PERMISSION_CHECKED', {
            'user': user_address, 'action': action,
            'allowed': action in permissions
        })
        return action in permissions
    
    def deactivate_user(self, caller: str, user_address: str) -> str:
        if not self._is_admin(caller):
            raise Exception("Only admin can deactivate users")
        if user_address not in self.state['users']:
            raise Exception("User not found")
        
        self.state['users'][user_address]['active'] = False
        self.emit_event('USER_DEACTIVATED', {'user': user_address, 'by': caller})
        return f"User {user_address} deactivated"
    
    def _is_admin(self, address: str) -> bool:
        user = self.state['users'].get(address)
        return user and user['role'] == 'admin' and user['active']
    
    def get_users(self) -> Dict:
        return self.state['users'].copy()


# ============================================================
# FIXED TIERED CONTRACT
# ============================================================

class TieredContract(SmartContract):
    """Contract with tiered pricing (FIXED)."""
    
    def __init__(self, owner):
        super().__init__("TieredContract", owner)
        self.state = {
            'tiers': {
                'basic':      {'price': 0,    'max_uploads': 100},
                'pro':        {'price': 4999, 'max_uploads': 10000},
                'enterprise': {'price': -1,   'max_uploads': -1}  # unlimited
            },
            'subscriptions': {}
        }
    
    def subscribe(self, caller: str, user: str, tier: str) -> str:
        """Subscribe a user to a tier. Caller must be owner."""
        if caller != self.owner:
            raise Exception("Only owner can subscribe users")
        if tier not in self.state['tiers']:
            raise Exception(f"Unknown tier: {tier}")
        
        self.state['subscriptions'][user] = {
            'tier': tier,
            'since': time.time(),
            'uploads_used': 0
        }
        self.emit_event('SUBSCRIBED', {'user': user, 'tier': tier, 'by': caller})
        return f"{user} subscribed to {tier}"
    
    def can_upload(self, caller: str, user: str) -> bool:
        """Check if user can upload."""
        sub = self.state['subscriptions'].get(user)
        if not sub:
            return False
        tier = self.state['tiers'][sub['tier']]
        if tier['max_uploads'] == -1:
            return True
        return sub['uploads_used'] < tier['max_uploads']
    
    def record_upload(self, caller: str, user: str) -> str:
        """Record an upload for user."""
        sub = self.state['subscriptions'].get(user)
        if not sub:
            raise Exception(f"User {user} not subscribed")
        
        tier = self.state['tiers'][sub['tier']]
        if tier['max_uploads'] != -1 and sub['uploads_used'] >= tier['max_uploads']:
            raise Exception(f"Upload limit reached for {user}")
        
        sub['uploads_used'] += 1
        self.emit_event('UPLOAD_RECORDED', {
            'user': user, 'uploads_used': sub['uploads_used'],
            'max': tier['max_uploads']
        })
        return f"Upload recorded for {user} ({sub['uploads_used']}/{tier['max_uploads']})"


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_trust_contract():
    print("\n" + "=" * 70)
    print("DEMO 1: TRUST CONTRACT")
    print("=" * 70)
    
    owner = "0xALICE"
    contract = TrustContract(owner)
    
    print(f"\nContract deployed at {contract.address}")
    print(f"Thresholds: {contract.state['thresholds']}")
    
    evaluations = [
        ("hash_good", {'quality': 92, 'performance': 88, 'robustness': 85, 'stability': 90}),
        ("hash_mid",  {'quality': 65, 'performance': 70, 'robustness': 60, 'stability': 68}),
        ("hash_bad",  {'quality': 30, 'performance': 25, 'robustness': 40, 'stability': 35}),
    ]
    
    print(f"\n--- Evaluating datasets ---")
    for hash_val, scores in evaluations:
        result = contract.execute(owner, 'evaluate', hash_val, scores)
        if result['success']:
            r = result['result']
            print(f"  {hash_val}: avg={r['avg_score']}, decision={r['decision']}")
    
    print(f"\nDecision counts: {contract.get_decision_count()}")


def demo_access_control():
    print("\n" + "=" * 70)
    print("DEMO 2: ACCESS CONTROL CONTRACT")
    print("=" * 70)
    
    owner = "0xADMIN"
    contract = AccessContract(owner)
    
    contract.execute(owner, 'add_user', "0xALICE", "auditor")
    contract.execute(owner, 'add_user', "0xBOB", "user")
    contract.execute(owner, 'add_user', "0xEVE", "guest")
    
    print(f"\nUsers: {list(contract.get_users().keys())}")
    
    print(f"\n--- Permission checks ---")
    for user, action in [("0xADMIN", "delete"), ("0xALICE", "read"), ("0xALICE", "delete"), ("0xBOB", "read")]:
        allowed = contract.check_permission(owner, user, action)
        print(f"  {'✅' if allowed else '❌'} {user} can {action}: {allowed}")


def demo_contract_events():
    print("\n" + "=" * 70)
    print("DEMO 3: CONTRACT EVENTS")
    print("=" * 70)
    
    contract = TrustContract("0xALICE")
    contract.execute("0xALICE", 'evaluate', "hash_1", {'quality': 90, 'performance': 85})
    contract.execute("0xALICE", 'evaluate', "hash_2", {'quality': 45, 'performance': 50})
    contract.execute("0xALICE", 'set_threshold', 'accept', 85)
    
    print(f"\nTotal events: {len(contract.get_events())}")
    for i, event in enumerate(contract.get_events(), 1):
        print(f"  Event #{i}: {event['type']} (block {event['block']})")


def demo_contract_rules():
    print("\n" + "=" * 70)
    print("DEMO 4: TIERED CONTRACT (FIXED)")
    print("=" * 70)
    
    owner = "0xALICE"
    contract = TieredContract(owner)
    
    print(f"\nContract deployed at {contract.address}")
    print(f"Tiers: {list(contract.state['tiers'].keys())}")
    
    # Subscribe users
    print(f"\n--- Subscriptions ---")
    for user, tier in [("0xUSER1", "basic"), ("0xUSER2", "pro"), ("0xUSER3", "enterprise")]:
        result = contract.execute(owner, 'subscribe', user, tier)
        if result['success']:
            print(f"  ✅ {result['result']}")
        else:
            print(f"  ❌ {user}: {result['error']}")
    
    # Check upload permissions
    print(f"\n--- Upload permissions ---")
    for user in ["0xUSER1", "0xUSER2", "0xUSER3", "0xUNKNOWN"]:
        result = contract.execute(owner, 'can_upload', user)
        if result['success']:
            print(f"  {user}: {'✅ can upload' if result['result'] else '❌ denied'}")
    
    # Record some uploads
    print(f"\n--- Recording uploads for 0xUSER1 (basic tier, max 100) ---")
    for i in range(3):
        result = contract.execute(owner, 'record_upload', "0xUSER1")
        if result['success']:
            print(f"  {result['result']}")


def demo_deploy_to_blockchain():
    print("\n" + "=" * 70)
    print("DEMO 5: DEPLOY CONTRACT TO BLOCKCHAIN")
    print("=" * 70)
    
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
    
    owner = "0xALICE"
    contract = TrustContract(owner)
    
    # Deploy
    add_block({
        'action': 'CONTRACT_DEPLOYED',
        'contract_address': contract.address,
        'contract_name': contract.name,
        'owner': owner
    })
    
    # Execute
    result = contract.execute(owner, 'evaluate', "hash_1", {'quality': 90, 'performance': 85})
    add_block({
        'action': 'CONTRACT_EXECUTED',
        'contract_address': contract.address,
        'function': 'evaluate',
        'decision': result['result']['decision']
    })
    
    print(f"\nBlockchain ({len(chain)} blocks):")
    for block in chain:
        print(f"\n  Block #{block['index']}: {block['data']['action']}")
        print(f"    Hash: {block['hash'][:32]}...")
        print(f"    Prev: {block['prev_hash'][:32]}...")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 7 (FIXED): SMART CONTRACTS")
    print("=" * 70)
    
    demo_trust_contract()
    demo_access_control()
    demo_contract_events()
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
  4. Events = audit trail
  5. Access control = role-based permissions
  6. Complex rules: tiers, thresholds, conditions
  7. Always validate caller and arguments
  8. Deploy + execute = blockchain transactions
""")
