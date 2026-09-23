"""
Blockchain API — Dynamic block creation and management
"""

from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, List, Dict, Any
import sys
import json
import hashlib
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/blockchain", tags=["blockchain"])


class NewBlockRequest(BaseModel):
    action: str
    data: Dict[str, Any] = {}
    user: str = "system"


def compute_block_hash(index: int, timestamp: float, data: dict, prev_hash: str, nonce: int) -> str:
    """Compute SHA-256 hash of block."""
    block_string = json.dumps({
        'index': index,
        'timestamp': timestamp,
        'data': data,
        'previous_hash': prev_hash,
        'nonce': nonce,
    }, sort_keys=True)
    return hashlib.sha256(block_string.encode()).hexdigest()


@router.get("/live")
async def get_live_blocks():
    """Get live blockchain with dynamic stats."""
    try:
        # Try to load real blockchain
        chain_file = PROJECT_ROOT / "blockchain" / "data" / "chain.json"
        chain = []
        
        if chain_file.exists():
            with open(chain_file) as f:
                chain_data = json.load(f)
                chain = chain_data.get("chain", [])
        
        # If no real chain, generate dynamic one
        if not chain:
            chain = generate_demo_chain()
        
        # Compute stats
        total_blocks = len(chain)
        total_actions = {}
        for b in chain:
            action = b.get("data", {}).get("action", "UNKNOWN")
            total_actions[action] = total_actions.get(action, 0) + 1
        
        # Validation
        is_valid = True
        for i in range(1, len(chain)):
            if chain[i].get("previous_hash") != chain[i-1].get("hash"):
                is_valid = False
                break
        
        return {
            "status": "success",
            "blocks": chain,
            "count": total_blocks,
            "validation": {
                "is_valid": is_valid,
                "chain_length": total_blocks,
                "difficulty": 4,
            },
            "stats": {
                "total_blocks": total_blocks,
                "total_actions": total_actions,
                "unique_actions": len(total_actions),
                "latest_block": chain[-1].get("index", 0) if chain else 0,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        import traceback
        return {
            "status": "failed",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }


@router.post("/add")
async def add_block(req: NewBlockRequest):
    """Add a new block to the blockchain dynamically."""
    try:
        chain_file = PROJECT_ROOT / "blockchain" / "data" / "chain.json"
        
        # Load existing chain
        chain = []
        if chain_file.exists():
            with open(chain_file) as f:
                data = json.load(f)
                chain = data.get("chain", [])
        
        # If no chain, generate genesis
        if not chain:
            chain = generate_demo_chain()
        
        # Get last block
        last_block = chain[-1] if chain else None
        prev_hash = last_block.get("hash", "0" * 64) if last_block else "0" * 64
        next_index = (last_block.get("index", -1) + 1) if last_block else 0
        
        # Mine new block
        timestamp = datetime.utcnow().timestamp()
        nonce = 0
        difficulty = 4
        target = "0" * difficulty
        
        block_data = {
            "action": req.action,
            "user": req.user,
            "timestamp": datetime.utcnow().isoformat(),
            **req.data,
        }
        
        while True:
            block_hash = compute_block_hash(next_index, timestamp, block_data, prev_hash, nonce)
            if block_hash[:difficulty] == target:
                break
            nonce += 1
        
        new_block = {
            "index": next_index,
            "timestamp": timestamp,
            "datetime": datetime.utcnow().isoformat(),
            "data": block_data,
            "previous_hash": prev_hash,
            "nonce": nonce,
            "hash": block_hash,
        }
        
        chain.append(new_block)
        
        # Save
        chain_file.parent.mkdir(parents=True, exist_ok=True)
        with open(chain_file, 'w') as f:
            json.dump({"chain": chain}, f, indent=2, default=str)
        
        return {
            "status": "success",
            "block": new_block,
            "total_blocks": len(chain),
            "message": f"Block #{next_index} mined with nonce {nonce}",
        }
    except Exception as e:
        import traceback
        return {
            "status": "failed",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }


@router.post("/simulate")
async def simulate_new_block():
    """Simulate a new block (for demo)."""
    actions = [
        {"action": "DATASET_UPLOAD", "data": {"dataset_name": f"dataset_{datetime.utcnow().strftime('%H%M%S')}", "num_images": 300, "dataset_hash": hashlib.sha256(str(datetime.utcnow()).encode()).hexdigest()[:16]}},
        {"action": "MODEL_TRAINING", "data": {"model": "yolov8n", "epochs": 50, "accuracy": 0.87}},
        {"action": "TRUST_EVALUATION", "data": {"trust_score": 87, "decision": "ACCEPTED"}},
        {"action": "INFERENCE_RECORD", "data": {"model_hash": "abc123", "input_hash": "def456", "output_hash": "ghi789", "decision": "APPROVED"}},
        {"action": "ATTACK_BLOCKED", "data": {"attack_type": "Data Poisoning", "severity": "HIGH", "blocked": True}},
    ]
    
    import random
    action = random.choice(actions)
    
    req = NewBlockRequest(
        action=action["action"],
        data=action["data"],
        user="demo_system",
    )
    
    return await add_block(req)


def generate_demo_chain() -> List[Dict[str, Any]]:
    """Generate a demo blockchain if none exists."""
    chain = []
    prev_hash = "0" * 64
    
    actions = [
        {"action": "GENESIS", "data": {"message": "CV-INTEGRITY Genesis Block", "version": "1.0.0"}},
        {"action": "DATASET_UPLOAD", "data": {"dataset_name": "good_dataset", "num_images": 300, "classes": ["car", "bike", "bus", "truck"]}},
        {"action": "DATASET_UPLOAD", "data": {"dataset_name": "bad_dataset", "num_images": 330}},
        {"action": "MODEL_TRAINING", "data": {"model": "yolov8n", "epochs": 50, "accuracy": 0.87}},
        {"action": "TRUST_EVALUATION", "data": {"trust_score": 87, "decision": "ACCEPTED"}},
        {"action": "INFERENCE_RECORD", "data": {"model_hash": "45964146a148723b", "input_hash": "9e99a2e6847c1c61", "output_hash": "01e441399b1336f0", "decision": "APPROVED"}},
    ]
    
    for i, act in enumerate(actions):
        timestamp = datetime.utcnow().timestamp() + i
        nonce = 0
        difficulty = 4
        target = "0" * difficulty
        
        block_data = {
            "action": act["action"],
            "user": "system",
            "timestamp": datetime.utcnow().isoformat(),
            **act["data"],
        }
        
        while True:
            block_hash = compute_block_hash(i, timestamp, block_data, prev_hash, nonce)
            if block_hash[:difficulty] == target:
                break
            nonce += 1
        
        block = {
            "index": i,
            "timestamp": timestamp,
            "datetime": datetime.utcnow().isoformat(),
            "data": block_data,
            "previous_hash": prev_hash,
            "nonce": nonce,
            "hash": block_hash,
        }
        chain.append(block)
        prev_hash = block_hash
    
    return chain
