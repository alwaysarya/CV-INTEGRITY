"""
Enhanced Audit Trail — Tamper-evident event logging
Each log entry is cryptographically linked to the previous one.
"""

import hashlib
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional


class AuditEntry:
    """Single audit log entry with cryptographic chain."""
    
    def __init__(self, entry_id: int, action: str, user: str,
                 details: Dict[str, Any], previous_hash: str = "0" * 64):
        self.entry_id = entry_id
        self.action = action
        self.user = user
        self.details = details
        self.timestamp = datetime.utcnow().isoformat()
        self.previous_hash = previous_hash
        self.hash = self._compute_hash()
    
    def _compute_hash(self) -> str:
        """Compute SHA-256 hash including previous hash (chain)."""
        data = {
            "entry_id": self.entry_id,
            "action": self.action,
            "user": self.user,
            "details": self.details,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
        }
        block_string = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "entry_id": self.entry_id,
            "action": self.action,
            "user": self.user,
            "details": self.details,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
        }


class EnhancedAuditTrail:
    """Enhanced audit trail with tamper detection."""
    
    def __init__(self):
        self.entries: List[AuditEntry] = []
        self._load_or_init()
    
    def _load_or_init(self):
        """Load existing entries or start fresh."""
        if not self.entries:
            # Genesis entry
            self.add_entry(
                action="AUDIT_INITIALIZED",
                user="system",
                details={"message": "Audit trail initialized", "version": "1.0"},
            )
    
    def add_entry(self, action: str, user: str,
                  details: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new audit entry."""
        entry_id = len(self.entries)
        previous_hash = self.entries[-1].hash if self.entries else "0" * 64
        
        entry = AuditEntry(
            entry_id=entry_id,
            action=action,
            user=user,
            details=details,
            previous_hash=previous_hash,
        )
        
        self.entries.append(entry)
        
        return {
            "success": True,
            "entry_id": entry_id,
            "hash": entry.hash,
            "message": f"Audit entry #{entry_id} added: {action}",
        }
    
    def verify_chain(self) -> Dict[str, Any]:
        """Verify the entire audit chain integrity."""
        result = {
            "valid": True,
            "total_entries": len(self.entries),
            "broken_at": None,
            "message": "Audit chain is valid",
        }
        
        for i, entry in enumerate(self.entries):
            # Recompute hash
            expected_hash = entry._compute_hash()
            
            # Check current hash matches
            if entry.hash != expected_hash:
                result["valid"] = False
                result["broken_at"] = i
                result["message"] = f"Entry #{i} hash mismatch — tampered!"
                return result
            
            # Check chain link (except genesis)
            if i > 0:
                if entry.previous_hash != self.entries[i-1].hash:
                    result["valid"] = False
                    result["broken_at"] = i
                    result["message"] = f"Entry #{i} chain broken — previous_hash mismatch!"
                    return result
        
        return result
    
    def query(self, action: Optional[str] = None, user: Optional[str] = None,
              limit: int = 50) -> List[Dict[str, Any]]:
        """Query audit entries with filters."""
        results = self.entries
        
        if action:
            results = [e for e in results if action.lower() in e.action.lower()]
        
        if user:
            results = [e for e in results if user.lower() in e.user.lower()]
        
        return [e.to_dict() for e in results[-limit:]]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get audit statistics."""
        action_counts: Dict[str, int] = {}
        user_counts: Dict[str, int] = {}
        
        for entry in self.entries:
            action_counts[entry.action] = action_counts.get(entry.action, 0) + 1
            user_counts[entry.user] = user_counts.get(entry.user, 0) + 1
        
        return {
            "total_entries": len(self.entries),
            "unique_actions": len(action_counts),
            "unique_users": len(user_counts),
            "top_actions": sorted(action_counts.items(), key=lambda x: -x[1])[:5],
            "top_users": sorted(user_counts.items(), key=lambda x: -x[1])[:5],
        }
    
    def export(self, filepath: Optional[Path] = None) -> str:
        """Export audit trail as JSON."""
        data = {
            "exported_at": datetime.utcnow().isoformat(),
            "total_entries": len(self.entries),
            "chain_valid": self.verify_chain()["valid"],
            "entries": [e.to_dict() for e in self.entries],
        }
        
        json_str = json.dumps(data, indent=2, default=str)
        
        if filepath:
            filepath.parent.mkdir(parents=True, exist_ok=True)
            filepath.write_text(json_str)
        
        return json_str


# Global engine
_engine = None

def get_audit_trail() -> EnhancedAuditTrail:
    global _engine
    if _engine is None:
        _engine = EnhancedAuditTrail()
    return _engine


if __name__ == "__main__":
    audit = get_audit_trail()
    
    print("=== ADDING TEST ENTRIES ===")
    
    # Add various entries
    audit.add_entry("DATASET_UPLOAD", "Aryan", {"dataset": "good_dataset", "size_mb": 52})
    audit.add_entry("MODEL_TRAINING", "Priya", {"model": "yolov8n", "epochs": 50})
    audit.add_entry("TRUST_EVALUATION", "Rohan", {"dataset": "good_dataset", "score": 87})
    audit.add_entry("INFERENCE_RECORD", "Aryan", {"model_hash": "abc123", "decision": "APPROVED"})
    audit.add_entry("ATTACK_BLOCKED", "system", {"attack": "Data Poisoning", "severity": "HIGH"})
    
    print()
    print("=== CHAIN VERIFICATION ===")
    verification = audit.verify_chain()
    print(f"  Valid: {verification['valid']}")
    print(f"  Total entries: {verification['total_entries']}")
    print(f"  Message: {verification['message']}")
    
    print()
    print("=== STATISTICS ===")
    stats = audit.get_stats()
    print(f"  Total entries: {stats['total_entries']}")
    print(f"  Unique actions: {stats['unique_actions']}")
    print(f"  Unique users: {stats['unique_users']}")
    print(f"  Top actions: {stats['top_actions']}")
    
    print()
    print("=== QUERY: Aryan's entries ===")
    aryan_entries = audit.query(user="Aryan")
    for e in aryan_entries:
        print(f"  [{e['entry_id']}] {e['action']} - {e['timestamp'][:19]}")
    
    print()
    print("=== TAMPER TEST ===")
    # Tamper with an entry
    if len(audit.entries) > 2:
        original_action = audit.entries[2].action
        audit.entries[2].action = "TAMPERED_ACTION"
        verification = audit.verify_chain()
        print(f"  After tampering entry #2:")
        print(f"  Valid: {verification['valid']}")
        print(f"  Message: {verification['message']}")
        # Restore
        audit.entries[2].action = original_action
