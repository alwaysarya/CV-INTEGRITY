"""
Advanced API Routes — Smart Contracts, Multi-sig, Audit, Cyber Attack
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from pathlib import Path
import sys
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/advanced", tags=["advanced"])


# ============================================================
# SMART CONTRACTS
# ============================================================
@router.get("/contracts")
async def list_contracts():
    try:
        from blockchain.smart_contracts import get_engine
        engine = get_engine()
        return {
            "status": "success",
            "contracts": engine.get_contracts(),
            "execution_log": engine.get_execution_log(limit=20),
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}


class ExecuteContractRequest(BaseModel):
    trust_score: float = 75.0
    asset_name: str = "test_asset"
    action: Optional[str] = None


@router.post("/contracts/execute")
async def execute_contracts(req: ExecuteContractRequest):
    try:
        from blockchain.smart_contracts import get_engine
        engine = get_engine()
        context = {"trust_score": req.trust_score, "asset_name": req.asset_name}
        if req.action:
            context["action"] = req.action
        results = engine.execute_all(context)
        return {"status": "success", "context": context, "results": results}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


# ============================================================
# MULTI-SIG WALLETS
# ============================================================
@router.get("/multisig/wallets")
async def list_multisig_wallets():
    try:
        from blockchain.multi_sig_wallet_engine import get_engine
        engine = get_engine()
        return {"status": "success", "wallets": engine.list_wallets()}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.get("/multisig/wallet/{wallet_id}")
async def get_wallet_details(wallet_id: str):
    try:
        from blockchain.multi_sig_wallet_engine import get_engine
        engine = get_engine()
        wallet = engine.get_wallet(wallet_id)
        if not wallet:
            return {"status": "failed", "error": "Wallet not found"}
        return {"status": "success", "wallet": wallet.to_dict()}
    except Exception as e:
        return {"status": "failed", "error": str(e)}




@router.post("/multisig/wallets/{wallet_id}/transactions")
async def create_multisig_transaction(wallet_id: str, req: dict = None):
    try:
        from blockchain.multi_sig_wallet_engine import get_engine
        engine = get_engine()
        wallet = engine.get_wallet(wallet_id)
        if not wallet:
            return {"status": "failed", "error": "Wallet not found"}
        tx_data = req or {}
        result = wallet.create_transaction(
            to_wallet=tx_data.get("to_wallet", tx_data.get("to", "unknown")),
            amount=float(tx_data.get("amount", 0)),
            reason=tx_data.get("reason", "API transaction"),
            timelock_hours=int(tx_data.get("timelock_hours", 0))
        )
        return {"status": "success", "transaction": result}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.post("/multisig/wallets/{wallet_id}/sign")
async def sign_multisig_transaction(wallet_id: str, req: dict = None):
    try:
        from blockchain.multi_sig_wallet_engine import get_engine
        engine = get_engine()
        wallet = engine.get_wallet(wallet_id)
        if not wallet:
            return {"status": "failed", "error": "Wallet not found"}
        tx_data = req or {}
        result = wallet.sign_transaction(
            tx_id=tx_data.get("tx_id"),
            signer=tx_data.get("signer", "unknown")
        )
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "failed", "error": str(e)}




@router.post("/multisig/wallets/{wallet_id}/execute")
async def execute_multisig_transaction(wallet_id: str, req: dict = None):
    try:
        from blockchain.multi_sig_wallet_engine import get_engine
        engine = get_engine()
        wallet = engine.get_wallet(wallet_id)
        if not wallet:
            return {"status": "failed", "error": "Wallet not found"}
        tx_data = req or {}
        tx_id = tx_data.get("tx_id")
        if not tx_id:
            return {"status": "failed", "error": "tx_id required"}
        # Try different method names
        if hasattr(wallet, 'execute_transaction'):
            result = wallet.execute_transaction(tx_id)
        elif hasattr(wallet, 'execute'):
            result = wallet.execute(tx_id)
        else:
            return {"status": "failed", "error": "No execute method on wallet"}
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

# ============================================================
# AUDIT TRAIL
# ============================================================
@router.get("/audit/trail")
async def get_audit_trail(limit: int = 50):
    try:
        from blockchain.enhanced_audit_engine import get_audit_trail as get_trail
        audit = get_trail()
        return {
            "status": "success",
            "entries": audit.query(limit=limit),
            "stats": audit.get_stats(),
            "verification": audit.verify_chain(),
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.get("/audit/verify")
async def verify_audit_chain():
    try:
        from blockchain.enhanced_audit_engine import get_audit_trail as get_trail
        audit = get_trail()
        return {"status": "success", "verification": audit.verify_chain()}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


# ============================================================
# CYBER ATTACK
# ============================================================
@router.get("/cyber/attacks")
async def list_cyber_attacks():
    try:
        from blockchain.cyber_attack_integrated import CyberAttackSimulator
        sim = CyberAttackSimulator()
        return {"status": "success", "attacks": [{"id": k, **v} for k, v in sim.ATTACK_TYPES.items()]}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


class RunCyberAttackRequest(BaseModel):
    attack_id: str
    target: str = "model"


@router.post("/cyber/run")
async def run_cyber_attack(req: RunCyberAttackRequest):
    try:
        from blockchain.cyber_attack_integrated import get_simulator
        sim = get_simulator()
        result = sim.run_attack(req.attack_id, req.target)
        return result
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.get("/cyber/stats")
async def get_cyber_stats():
    try:
        from blockchain.cyber_attack_integrated import get_simulator
        sim = get_simulator()
        return {"status": "success", "stats": sim.get_stats(), "history": sim.get_history(limit=20)}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
