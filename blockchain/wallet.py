"""
Digital Wallet System
User wallets with balance, transactions, and rewards
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
from datetime import datetime
from pathlib import Path


class Wallet:
    """Individual user wallet"""
    
    def __init__(self, owner_name, owner_email=None):
        self.owner_name = owner_name
        self.owner_email = owner_email
        self.address = self._generate_address()
        self.private_key = self._generate_private_key()
        self.public_key = self._generate_public_key()
        self.balance = 0
        self.transactions = []
        self.created_at = datetime.now().isoformat()
    
    def _generate_address(self):
        data = f"{self.owner_name}:{datetime.now().isoformat()}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()[:40]
    
    def _generate_private_key(self):
        data = f"private:{self.owner_name}:{datetime.now().isoformat()}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _generate_public_key(self):
        data = f"public:{self.private_key}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def credit(self, amount, reason, from_address=None):
        """Add balance to wallet"""
        if amount <= 0:
            return {'status': 'error', 'message': 'Amount must be positive'}
        
        self.balance += amount
        
        tx = {
            'type': 'CREDIT',
            'amount': amount,
            'reason': reason,
            'from': from_address or 'SYSTEM',
            'to': self.address,
            'balance_after': self.balance,
            'timestamp': datetime.now().isoformat()
        }
        self.transactions.append(tx)
        
        return {'status': 'success', 'transaction': tx, 'new_balance': self.balance}
    
    def debit(self, amount, reason, to_address=None):
        """Remove balance from wallet"""
        if amount <= 0:
            return {'status': 'error', 'message': 'Amount must be positive'}
        
        if amount > self.balance:
            return {'status': 'error', 'message': 'Insufficient balance'}
        
        self.balance -= amount
        
        tx = {
            'type': 'DEBIT',
            'amount': amount,
            'reason': reason,
            'from': self.address,
            'to': to_address or 'SYSTEM',
            'balance_after': self.balance,
            'timestamp': datetime.now().isoformat()
        }
        self.transactions.append(tx)
        
        return {'status': 'success', 'transaction': tx, 'new_balance': self.balance}
    
    def get_balance(self):
        return self.balance
    
    def get_info(self):
        return {
            'owner': self.owner_name,
            'address': self.address,
            'balance': self.balance,
            'total_transactions': len(self.transactions),
            'created_at': self.created_at
        }


class WalletSystem:
    """Manages all user wallets"""
    
    def __init__(self):
        self.wallets = {}
        self.token_name = "CVIT"  # CV Integrity Token
        self.total_supply = 1000000
    
    def create_wallet(self, owner_name, owner_email=None):
        """Create new wallet"""
        if owner_name in self.wallets:
            return {'status': 'error', 'message': 'Wallet already exists'}
        
        wallet = Wallet(owner_name, owner_email)
        self.wallets[owner_name] = wallet
        
        # Give welcome bonus
        wallet.credit(100, 'Welcome bonus')
        
        return {'status': 'success', 'wallet': wallet.get_info()}
    
    def get_wallet(self, owner_name):
        """Get wallet by owner name"""
        return self.wallets.get(owner_name)
    
    def transfer(self, from_owner, to_owner, amount, reason):
        """Transfer tokens between wallets"""
        if from_owner not in self.wallets:
            return {'status': 'error', 'message': 'Sender wallet not found'}
        
        if to_owner not in self.wallets:
            return {'status': 'error', 'message': 'Receiver wallet not found'}
        
        sender = self.wallets[from_owner]
        receiver = self.wallets[to_owner]
        
        # Debit sender
        debit_result = sender.debit(amount, reason, receiver.address)
        if debit_result['status'] == 'error':
            return debit_result
        
        # Credit receiver
        receiver.credit(amount, reason, sender.address)
        
        return {
            'status': 'success',
            'from': from_owner,
            'to': to_owner,
            'amount': amount,
            'reason': reason,
            'sender_balance': sender.balance,
            'receiver_balance': receiver.balance
        }
    
    def reward_user(self, owner_name, amount, reason):
        """Reward user with tokens"""
        if owner_name not in self.wallets:
            return {'status': 'error', 'message': 'Wallet not found'}
        
        wallet = self.wallets[owner_name]
        return wallet.credit(amount, f'Reward: {reason}')
    
    def get_system_info(self):
        """Get wallet system info"""
        total_balance = sum(w.balance for w in self.wallets.values())
        return {
            'token_name': self.token_name,
            'total_supply': self.total_supply,
            'circulating_supply': total_balance,
            'total_wallets': len(self.wallets),
            'wallets': [w.get_info() for w in self.wallets.values()]
        }
    
    def save(self, path='outputs/reports/wallets.json'):
        """Save wallets to file"""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            'token_name': self.token_name,
            'total_supply': self.total_supply,
            'wallets': {}
        }
        
        for name, wallet in self.wallets.items():
            data['wallets'][name] = {
                'owner': wallet.owner_name,
                'address': wallet.address,
                'balance': wallet.balance,
                'transactions': wallet.transactions,
                'created_at': wallet.created_at
            }
        
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"💾 Wallets saved: {path}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("👛 WALLET SYSTEM DEMO")
    print("="*60)
    
    system = WalletSystem()
    print(f"\n✅ Token System: {system.token_name}")
    print(f"   Total Supply: {system.total_supply:,}")
    
    # Create wallets
    print("\n" + "="*60)
    print("CREATING WALLETS")
    print("="*60)
    
    for name in ["Arya Ranjan", "Contributor1", "Reviewer1"]:
        result = system.create_wallet(name)
        if result['status'] == 'success':
            w = result['wallet']
            print(f"\n✅ {name}")
            print(f"   Address: {w['address'][:30]}...")
            print(f"   Balance: {w['balance']} {system.token_name}")
    
    # Reward for actions
    print("\n" + "="*60)
    print("REWARDING USERS")
    print("="*60)
    
    rewards = [
        ("Arya Ranjan", 500, "Uploaded GOOD dataset"),
        ("Contributor1", 300, "Trained YOLOv8 model"),
        ("Reviewer1", 200, "Verified blockchain integrity")
    ]
    
    for user, amount, reason in rewards:
        result = system.reward_user(user, amount, reason)
        wallet = system.get_wallet(user)
        print(f"\n✅ {user}")
        print(f"   Reward: +{amount} {system.token_name}")
        print(f"   Reason: {reason}")
        print(f"   New Balance: {wallet.balance} {system.token_name}")
    
    # Transfer
    print("\n" + "="*60)
    print("TRANSFERRING TOKENS")
    print("="*60)
    
    result = system.transfer(
        from_owner="Arya Ranjan",
        to_owner="Contributor1",
        amount=100,
        reason="Payment for dataset upload"
    )
    
    if result['status'] == 'success':
        print(f"\n✅ Transfer successful")
        print(f"   From: {result['from']}")
        print(f"   To: {result['to']}")
        print(f"   Amount: {result['amount']} {system.token_name}")
        print(f"   Reason: {result['reason']}")
        print(f"   Sender Balance: {result['sender_balance']} {system.token_name}")
        print(f"   Receiver Balance: {result['receiver_balance']} {system.token_name}")
    
    # System info
    print("\n" + "="*60)
    print("📊 SYSTEM INFO")
    print("="*60)
    
    info = system.get_system_info()
    print(f"\n🪙 Token: {info['token_name']}")
    print(f"   Total Supply: {info['total_supply']:,}")
    print(f"   Circulating: {info['circulating_supply']:,}")
    print(f"   Total Wallets: {info['total_wallets']}")
    
    print(f"\n👛 Wallets:")
    for wallet in info['wallets']:
        print(f"   {wallet['owner']}: {wallet['balance']} {info['token_name']}")
    
    # Save
    system.save()
    
    print("\n" + "="*60)
    print("✅ Wallet System ready!")
    print("="*60)