"""
Smart Contracts Engine — Automated verification rules on blockchain
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Callable


class SmartContract:
    """A single smart contract with trigger conditions and actions."""
    
    def __init__(self, contract_id: str, name: str, description: str,
                 trigger: Dict[str, Any], action: Dict[str, Any]):
        self.contract_id = contract_id
        self.name = name
        self.description = description
        self.trigger = trigger
        self.action = action
        self.executions = []
    
    def evaluate(self, context: Dict[str, Any]) -> bool:
        """Check if trigger condition is met."""
        trigger_type = self.trigger.get("type")
        
        if trigger_type == "trust_score":
            score = context.get("trust_score", 0)
            threshold = self.trigger.get("threshold", 0)
            operator = self.trigger.get("operator", ">=")
            
            if operator == ">=":
                return score >= threshold
            elif operator == "<":
                return score < threshold
            elif operator == "<=":
                return score <= threshold
            else:
                return score > threshold
        
        elif trigger_type == "trust_score_range":
            score = context.get("trust_score", 0)
            min_val = self.trigger.get("min", 0)
            max_val = self.trigger.get("max", 100)
            return min_val <= score <= max_val
        
        elif trigger_type == "action":
            return context.get("action") == self.trigger.get("value")
        
        elif trigger_type == "hash_match":
            expected = self.trigger.get("expected_hash")
            actual = context.get("hash")
            return expected == actual
        
        return False
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the contract action."""
        action_type = self.action.get("type")
        
        result = {
            "contract_id": self.contract_id,
            "contract_name": self.name,
            "triggered": False,
            "action_taken": None,
            "result": None,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if self.evaluate(context):
            result["triggered"] = True
            
            if action_type == "approve":
                result["action_taken"] = "APPROVE"
                result["result"] = f"Auto-approved: {context.get('asset_name', 'asset')}"
            
            elif action_type == "review":
                result["action_taken"] = "REVIEW"
                result["result"] = f"Auto-review triggered: {context.get('asset_name', 'asset')}"
            
            elif action_type == "quarantine":
                result["action_taken"] = "QUARANTINE"
                result["result"] = f"Auto-quarantined: {context.get('asset_name', 'asset')}"
            
            elif action_type == "reject":
                result["action_taken"] = "REJECT"
                result["result"] = f"Auto-rejected: {context.get('asset_name', 'asset')}"
            
            elif action_type == "record":
                result["action_taken"] = "RECORD"
                result["result"] = f"Recorded on blockchain: {context.get('asset_name', 'asset')}"
            
            elif action_type == "alert":
                result["action_taken"] = "ALERT"
                result["result"] = f"Alert sent: {self.action.get('message', '')}"
            
            self.executions.append(result)
        
        return result


class SmartContractEngine:
    """Engine to manage and execute multiple smart contracts."""
    
    def __init__(self):
        self.contracts: List[SmartContract] = []
        self.execution_log: List[Dict[str, Any]] = []
        self._load_default_contracts()
    
    def _load_default_contracts(self):
        """Load default CV-INTEGRITY contracts."""
        
        # Contract 1: Auto-approve high trust
        self.add_contract(SmartContract(
            contract_id="auto_approve",
            name="Auto-Approve High Trust",
            description="Auto-approves datasets/models with trust score >= 80",
            trigger={"type": "trust_score", "operator": ">=", "threshold": 80},
            action={"type": "approve", "message": "Trust score is excellent"},
        ))
        
        # Contract 2: Auto-review medium trust (50-79)
        self.add_contract(SmartContract(
            contract_id="auto_review",
            name="Auto-Review Medium Trust",
            description="Triggers review for trust scores between 50-79",
            trigger={"type": "trust_score_range", "min": 50, "max": 79.99},
            action={"type": "review", "message": "Manual review needed"},
        ))
        
        # Contract 3: Auto-quarantine low trust (< 50)
        self.add_contract(SmartContract(
            contract_id="auto_quarantine",
            name="Auto-Quarantine Low Trust",
            description="Quarantines assets with trust score < 50",
            trigger={"type": "trust_score_range", "min": 0, "max": 49.99},
            action={"type": "quarantine", "message": "Trust score critically low"},
        ))
        
        # Contract 4: Block dataset uploads
        self.add_contract(SmartContract(
            contract_id="block_upload",
            name="Block Dataset Upload",
            description="Blocks uploads that fail integrity checks",
            trigger={"type": "action", "value": "DATASET_UPLOAD_FAILED"},
            action={"type": "reject", "message": "Upload blocked - integrity failed"},
        ))
        
        # Contract 5: Record model training
        self.add_contract(SmartContract(
            contract_id="record_model",
            name="Record Model Training",
            description="Automatically records model training on blockchain",
            trigger={"type": "action", "value": "MODEL_TRAINING"},
            action={"type": "record", "message": "Model training recorded"},
        ))
        
        # Contract 6: Alert on attack
        self.add_contract(SmartContract(
            contract_id="alert_attack",
            name="Alert on Attack",
            description="Sends alert when attack is detected",
            trigger={"type": "action", "value": "ATTACK_DETECTED"},
            action={"type": "alert", "message": "Attack detected - investigate immediately"},
        ))
    
    def add_contract(self, contract: SmartContract):
        """Add a new contract."""
        self.contracts.append(contract)
    
    def execute_all(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute all contracts against given context."""
        results = []
        for contract in self.contracts:
            result = contract.execute(context)
            if result["triggered"]:
                results.append(result)
                self.execution_log.append(result)
        return results
    
    def get_contracts(self) -> List[Dict[str, Any]]:
        """List all contracts."""
        return [
            {
                "id": c.contract_id,
                "name": c.name,
                "description": c.description,
                "trigger": c.trigger,
                "action": c.action,
                "executions": len(c.executions),
            }
            for c in self.contracts
        ]
    
    def get_execution_log(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent executions."""
        return self.execution_log[-limit:]


# Global engine instance
_engine = None

def get_engine() -> SmartContractEngine:
    """Get or create global engine."""
    global _engine
    if _engine is None:
        _engine = SmartContractEngine()
    return _engine


if __name__ == "__main__":
    # Test
    engine = get_engine()
    print("=== CONTRACTS ===")
    for c in engine.get_contracts():
        print(f"  {c['id']}: {c['name']}")
    
    print()
    print("=== TESTING ===")
    test_cases = [
        {"trust_score": 95, "asset_name": "good_dataset"},
        {"trust_score": 65, "asset_name": "medium_dataset"},
        {"trust_score": 30, "asset_name": "bad_dataset"},
    ]
    
    for ctx in test_cases:
        results = engine.execute_all(ctx)
        print(f"  {ctx['asset_name']} (trust={ctx['trust_score']}):")
        for r in results:
            print(f"    → {r['action_taken']}: {r['result']}")
