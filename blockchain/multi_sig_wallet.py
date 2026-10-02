"""
Multi-Signature Wallet
Requires multiple signatures for critical operations
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
from datetime import datetime
from pathlib import Path


class MultiSigWallet:
    """Multi-Signature Wallet for critical blockchain operations"""
    
    def __init__(self, wallet_name, owners, required_signatures):
        """
        Initialize multi-sig wallet
        
        Args:
            wallet_name: Name of wallet
            owners: List of owner addresses
            required_signatures: Number of signatures needed (M of N)
        """
        self.wallet_name = wallet_name
        self.owners = owners
        self.required_signatures = required_signatures
        self.total_owners = len(owners)
        self.wallet_address = self._generate_address()
        self.pending_transactions = {}
        self.completed_transactions = []
        self.balance = 0
    
    def _generate_address(self):
        """Generate wallet address"""
        data = f"{self.wallet_name}:{':'.join(self.owners)}:{datetime.now().isoformat()}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()[:40]
    
    def create_transaction(self, proposer, action, data):
        """Create a pending transaction"""
        if proposer not in self.owners:
            return {'status': 'error', 'message': 'Not an owner'}
        
        tx_id = hashlib.sha256(
            f"{proposer}:{action}:{datetime.now().isoformat()}".encode()
        ).hexdigest()[:16]
        
        transaction = {
            'tx_id': tx_id,
            'proposer': proposer,
            'action': action,
            'data': data,
            'signatures': [proposer],  # Proposer auto-signs
            'created_at': datetime.now().isoformat(),
            'status': 'pending',
            'required': self.required_signatures
        }
        
        self.pending_transactions[tx_id] = transaction
        
        # Check if already has enough signatures
        if len(transaction['signatures']) >= self.required_signatures:
            self._execute_transaction(tx_id)
        
        return {'status': 'success', 'transaction': transaction}
    
    def sign_transaction(self, tx_id, signer):
        """Sign a pending transaction"""
        if tx_id not in self.pending_transactions:
            return {'status': 'error', 'message': 'Transaction not found'}
        
        if signer not in self.owners:
            return {'status': 'error', 'message': 'Not an owner'}
        
        tx = self.pending_transactions[tx_id]
        
        if signer in tx['signatures']:
            return {'status': 'error', 'message': 'Already signed'}
        
        if tx['status'] != 'pending':
            return {'status': 'error', 'message': 'Transaction not pending'}
        
        tx['signatures'].append(signer)
        
        # Check if we have enough signatures
        if len(tx['signatures']) >= self.required_signatures:
            self._execute_transaction(tx_id)
        
        return {'status': 'success', 'transaction': tx}
    
    def _execute_transaction(self, tx_id):
        """Execute transaction when enough signatures"""
        tx = self.pending_transactions[tx_id]
        tx['status'] = 'executed'
        tx['executed_at'] = datetime.now().isoformat()
        tx['signature_count'] = len(tx['signatures'])
        
        self.completed_transactions.append(tx)
    
    def get_wallet_info(self):
        """Get wallet information"""
        return {
            'wallet_name': self.wallet_name,
            'wallet_address': self.wallet_address,
            'total_owners': self.total_owners,
            'required_signatures': self.required_signatures,
            'type': f'{self.required_signatures}-of-{self.total_owners} Multi-Sig',
            'owners': self.owners,
            'pending_transactions': len(self.pending_transactions),
            'completed_transactions': len(self.completed_transactions),
            'balance': self.balance
        }
    
    def get_pending_transactions(self):
        """Get pending transactions"""
        return [
            tx for tx in self.pending_transactions.values()
            if tx['status'] == 'pending'
        ]
    
    def get_transaction_history(self):
        """Get transaction history"""
        return self.completed_transactions


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔐 MULTI-SIGNATURE WALLET DEMO")
    print("="*60)
    
    # Create 3-of-5 multi-sig wallet
    print("\n📝 Creating 3-of-5 Multi-Sig Wallet...")
    
    owners = [
        "0xAlice_address_12345",
        "0xBob_address_67890",
        "0xCharlie_address_11111",
        "0xDave_address_22222",
        "0xEve_address_33333"
    ]
    
    wallet = MultiSigWallet(
        wallet_name="CV-Integrity Treasury",
        owners=owners,
        required_signatures=3
    )
    
    info = wallet.get_wallet_info()
    print(f"✅ Wallet created:")
    print(f"   Name: {info['wallet_name']}")
    print(f"   Address: {info['wallet_address']}")
    print(f"   Type: {info['type']}")
    print(f"   Owners: {info['total_owners']}")
    
    # Test 1: Propose transaction
    print("\n" + "="*60)
    print("TEST 1: Propose Transaction")
    print("="*60)
    
    result = wallet.create_transaction(
        proposer=owners[0],
        action="DEPLOY_MODEL",
        data={
            'model': 'yolov8_good',
            'trust_score': 88.0,
            'dataset': 'good_dataset'
        }
    )
    
    tx_id = result['transaction']['tx_id']
    print(f"✅ Transaction proposed by Alice")
    print(f"   TX ID: {tx_id}")
    print(f"   Signatures: 1/3")
    
    # Test 2: Sign with 2nd owner
    print("\n" + "="*60)
    print("TEST 2: Second Signature")
    print("="*60)
    
    result = wallet.sign_transaction(tx_id, owners[1])
    print(f"✅ Signed by Bob")
    print(f"   Signatures: 2/3")
    
    # Test 3: Sign with 3rd owner (should execute)
    print("\n" + "="*60)
    print("TEST 3: Third Signature (Execution)")
    print("="*60)
    
    result = wallet.sign_transaction(tx_id, owners[2])
    tx = result['transaction']
    print(f"✅ Signed by Charlie")
    print(f"   Signatures: {tx['signature_count']}/3")
    print(f"   Status: {tx['status'].upper()}")
    
    # Show history
    print("\n" + "="*60)
    print("📊 WALLET STATE")
    print("="*60)
    
    info = wallet.get_wallet_info()
    print(f"\n🔐 Wallet Info:")
    for key, value in info.items():
        if key != 'owners':
            print(f"   {key.replace('_', ' ').title()}: {value}")
    
    print(f"\n📋 Completed Transactions:")
    for tx in wallet.get_transaction_history():
        print(f"   ✅ {tx['tx_id']} - {tx['action']}")
        print(f"      Signed by: {len(tx['signatures'])} owners")
        print(f"      Executed at: {tx['executed_at'][:19]}")
    
    # Test 4: Attempt to sign already executed
    print("\n" + "="*60)
    print("TEST 4: Attempt to Sign Executed Transaction")
    print("="*60)
    
    result = wallet.sign_transaction(tx_id, owners[3])
    print(f"❌ {result['message']}")
    
    print("\n" + "="*60)
    print("✅ Multi-Signature Wallet ready!")
    print("="*60)