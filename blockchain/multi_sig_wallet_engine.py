"""
Multi-Signature Wallet Engine — Enterprise-grade security
Requires M-of-N signatures for transactions.
"""

import hashlib
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional


class MultiSigTransaction:
    """A single multi-sig transaction requiring signatures."""
    
    def __init__(self, tx_id: str, from_wallet: str, to_wallet: str,
                 amount: float, reason: str, required_signatures: int,
                 authorized_signers: List[str], timelock_hours: int = 0):
        self.tx_id = tx_id
        self.from_wallet = from_wallet
        self.to_wallet = to_wallet
        self.amount = amount
        self.reason = reason
        self.required_signatures = required_signatures
        self.authorized_signers = authorized_signers
        self.signatures: List[Dict[str, Any]] = []
        self.status = "PENDING"
        self.created_at = datetime.utcnow()
        self.timelock_hours = timelock_hours
        self.executable_at = self.created_at + timedelta(hours=timelock_hours)
        self.executed_at: Optional[datetime] = None
        
        # Compute transaction hash
        tx_data = f"{tx_id}{from_wallet}{to_wallet}{amount}{reason}{self.created_at.isoformat()}"
        self.tx_hash = hashlib.sha256(tx_data.encode()).hexdigest()
    
    def sign(self, signer: str) -> Dict[str, Any]:
        """Add signature from an authorized signer."""
        result = {
            "tx_id": self.tx_id,
            "signer": signer,
            "success": False,
            "message": "",
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Check if signer is authorized
        if signer not in self.authorized_signers:
            result["message"] = f"Signer {signer} not authorized"
            return result
        
        # Check if already signed
        if any(s["signer"] == signer for s in self.signatures):
            result["message"] = f"Signer {signer} already signed"
            return result
        
        # Check if transaction already completed
        if self.status != "PENDING":
            result["message"] = f"Transaction already {self.status}"
            return result
        
        # Add signature
        signature = {
            "signer": signer,
            "signed_at": datetime.utcnow().isoformat(),
            "signature_hash": hashlib.sha256(f"{signer}{self.tx_hash}".encode()).hexdigest()[:16],
        }
        self.signatures.append(signature)
        
        result["success"] = True
        result["message"] = f"Signature added ({len(self.signatures)}/{self.required_signatures})"
        result["signatures_count"] = len(self.signatures)
        
        # Check if ready to execute
        if len(self.signatures) >= self.required_signatures:
            self.status = "READY"
            result["message"] += " — Transaction ready to execute!"
        
        return result
    
    def execute(self) -> Dict[str, Any]:
        """Execute transaction if all conditions met."""
        result = {
            "tx_id": self.tx_id,
            "success": False,
            "message": "",
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Check status
        if self.status == "EXECUTED":
            result["message"] = "Already executed"
            return result
        
        if self.status == "PENDING":
            result["message"] = f"Not enough signatures ({len(self.signatures)}/{self.required_signatures})"
            return result
        
        # Check timelock
        if datetime.utcnow() < self.executable_at:
            remaining = (self.executable_at - datetime.utcnow()).total_seconds() / 60
            result["message"] = f"Timelock active — {remaining:.0f} minutes remaining"
            return result
        
        # Execute
        self.status = "EXECUTED"
        self.executed_at = datetime.utcnow()
        result["success"] = True
        result["message"] = f"Transaction executed: {self.amount} CVIT from {self.from_wallet} to {self.to_wallet}"
        result["tx_hash"] = self.tx_hash
        
        return result
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tx_id": self.tx_id,
            "from_wallet": self.from_wallet,
            "to_wallet": self.to_wallet,
            "amount": self.amount,
            "reason": self.reason,
            "required_signatures": self.required_signatures,
            "current_signatures": len(self.signatures),
            "signatures": self.signatures,
            "authorized_signers": self.authorized_signers,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "executable_at": self.executable_at.isoformat(),
            "executed_at": self.executed_at.isoformat() if self.executed_at else None,
            "tx_hash": self.tx_hash,
            "timelock_hours": self.timelock_hours,
        }


class MultiSigWallet:
    """A multi-signature wallet."""
    
    def __init__(self, wallet_id: str, owner: str, required: int, total: int):
        self.wallet_id = wallet_id
        self.owner = owner
        self.required_signatures = required
        self.total_signers = total
        self.signers: List[str] = []
        self.balance = 0.0
        self.transactions: List[MultiSigTransaction] = []
        self.created_at = datetime.utcnow()
    
    def add_signer(self, signer: str) -> Dict[str, Any]:
        """Add a signer to the wallet."""
        if len(self.signers) >= self.total_signers:
            return {"success": False, "message": "Max signers reached"}
        
        if signer in self.signers:
            return {"success": False, "message": "Signer already added"}
        
        self.signers.append(signer)
        return {
            "success": True,
            "message": f"Signer added ({len(self.signers)}/{self.total_signers})",
            "signer": signer,
        }
    
    def deposit(self, amount: float) -> Dict[str, Any]:
        """Deposit to wallet."""
        self.balance += amount
        return {
            "success": True,
            "new_balance": self.balance,
            "amount": amount,
        }
    
    def create_transaction(self, to_wallet: str, amount: float, reason: str,
                          timelock_hours: int = 0) -> Dict[str, Any]:
        """Create a new multi-sig transaction."""
        if amount > self.balance:
            return {"success": False, "message": "Insufficient balance"}
        
        if len(self.signers) < self.required_signatures:
            return {"success": False, "message": "Not enough signers configured"}
        
        tx_id = f"tx_{len(self.transactions) + 1}_{int(datetime.utcnow().timestamp())}"
        tx = MultiSigTransaction(
            tx_id=tx_id,
            from_wallet=self.wallet_id,
            to_wallet=to_wallet,
            amount=amount,
            reason=reason,
            required_signatures=self.required_signatures,
            authorized_signers=self.signers,
            timelock_hours=timelock_hours,
        )
        
        self.transactions.append(tx)
        
        return {
            "success": True,
            "tx_id": tx_id,
            "message": f"Transaction created — requires {self.required_signatures} signatures",
            "tx_hash": tx.tx_hash,
        }
    
    def sign_transaction(self, tx_id: str, signer: str) -> Dict[str, Any]:
        """Sign a transaction."""
        tx = self._get_transaction(tx_id)
        if not tx:
            return {"success": False, "message": f"Transaction {tx_id} not found"}
        
        return tx.sign(signer)
    
    def execute_transaction(self, tx_id: str) -> Dict[str, Any]:
        """Execute a transaction."""
        tx = self._get_transaction(tx_id)
        if not tx:
            return {"success": False, "message": f"Transaction {tx_id} not found"}
        
        result = tx.execute()
        
        # Update balance if executed
        if result["success"]:
            self.balance -= tx.amount
        
        return result
    
    def _get_transaction(self, tx_id: str) -> Optional[MultiSigTransaction]:
        for tx in self.transactions:
            if tx.tx_id == tx_id:
                return tx
        return None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "wallet_id": self.wallet_id,
            "owner": self.owner,
            "required_signatures": self.required_signatures,
            "total_signers": self.total_signers,
            "signers": self.signers,
            "balance": self.balance,
            "transactions": [tx.to_dict() for tx in self.transactions],
            "created_at": self.created_at.isoformat(),
        }


class MultiSigEngine:
    """Engine managing multiple multi-sig wallets."""
    
    def __init__(self):
        self.wallets: Dict[str, MultiSigWallet] = {}
        self._setup_demo_wallets()
    
    def _setup_demo_wallets(self):
        """Setup demo wallets for demonstration."""
        # 2-of-3 wallet (standard)
        wallet1 = MultiSigWallet("wallet_2of3", "CV-INTEGRITY Team", required=2, total=3)
        wallet1.add_signer("Aryan")
        wallet1.add_signer("Priya")
        wallet1.add_signer("Rohan")
        wallet1.deposit(1000.0)
        self.wallets["wallet_2of3"] = wallet1
        
        # 3-of-5 wallet (enterprise)
        wallet2 = MultiSigWallet("wallet_3of5", "Enterprise Corp", required=3, total=5)
        wallet2.add_signer("CEO")
        wallet2.add_signer("CFO")
        wallet2.add_signer("CTO")
        wallet2.add_signer("Auditor")
        wallet2.add_signer("Legal")
        wallet2.deposit(5000.0)
        self.wallets["wallet_3of5"] = wallet2
    
    def get_wallet(self, wallet_id: str) -> Optional[MultiSigWallet]:
        return self.wallets.get(wallet_id)
    
    def list_wallets(self) -> List[Dict[str, Any]]:
        return [
            {
                "wallet_id": w.wallet_id,
                "owner": w.owner,
                "required": w.required_signatures,
                "total": w.total_signers,
                "signers": w.signers,
                "balance": w.balance,
                "transaction_count": len(w.transactions),
            }
            for w in self.wallets.values()
        ]


# Global engine instance
_engine = None

def get_engine() -> MultiSigEngine:
    global _engine
    if _engine is None:
        _engine = MultiSigEngine()
    return _engine


if __name__ == "__main__":
    engine = get_engine()
    
    print("=== MULTI-SIG WALLETS ===")
    for w in engine.list_wallets():
        print(f"  {w['wallet_id']}: {w['required']}-of-{w['total']}")
        print(f"    Owner: {w['owner']}")
        print(f"    Signers: {', '.join(w['signers'])}")
        print(f"    Balance: {w['balance']} CVIT")
    
    print()
    print("=== TESTING 2-of-3 WALLET ===")
    wallet = engine.get_wallet("wallet_2of3")
    
    # Create transaction
    tx_result = wallet.create_transaction(
        to_wallet="external_wallet",
        amount=100.0,
        reason="Dataset purchase",
    )
    print(f"  Create TX: {tx_result['message']}")
    tx_id = tx_result["tx_id"]
    
    # Sign with first signer
    sign1 = wallet.sign_transaction(tx_id, "Aryan")
    print(f"  Aryan signs: {sign1['message']}")
    
    # Try to execute (should fail - need 2 signatures)
    exec1 = wallet.execute_transaction(tx_id)
    print(f"  Execute attempt: {exec1['message']}")
    
    # Sign with second signer
    sign2 = wallet.sign_transaction(tx_id, "Priya")
    print(f"  Priya signs: {sign2['message']}")
    
    # Execute
    exec2 = wallet.execute_transaction(tx_id)
    print(f"  Execute: {exec2['message']}")
    
    print(f"  New balance: {wallet.balance} CVIT")
