"""Enhanced Audit Log - Reproducible, hash-chained, tamper-evident."""

import hashlib
import json
import sys
import platform
from pathlib import Path
from datetime import datetime


class EnhancedAuditLog:
    """Reproducible audit log with hash chaining."""
    
    def __init__(self, output_file='outputs/reports/enhanced_audit.json'):
        self.output_file = Path(output_file)
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        self.entries = []
        self.last_hash = '0' * 64
        self.setup_metadata = None
    
    def capture_setup(self):
        try:
            import nicegui
            nicegui_version = nicegui.__version__
        except:
            nicegui_version = 'unknown'
        
        self.setup_metadata = {
            'captured_at': datetime.utcnow().isoformat(),
            'python_version': sys.version.split()[0],
            'platform': platform.system(),
            'platform_release': platform.release(),
            'machine': platform.machine(),
            'nicegui_version': nicegui_version,
            'setup_hash': self._compute_setup_hash(),
        }
        return self.setup_metadata
    
    def _compute_setup_hash(self):
        setup_str = json.dumps({
            'python': sys.version,
            'platform': platform.platform(),
        }, sort_keys=True)
        return hashlib.sha256(setup_str.encode()).hexdigest()
    
    def add_entry(self, event_type, data, user=None):
        entry = {
            'index': len(self.entries),
            'timestamp': datetime.utcnow().isoformat(),
            'event': event_type,
            'data': data,
            'user': user or 'system',
            'previous_hash': self.last_hash,
        }
        entry_str = json.dumps(entry, sort_keys=True, default=str)
        entry_hash = hashlib.sha256(entry_str.encode()).hexdigest()
        entry['hash'] = entry_hash
        self.entries.append(entry)
        self.last_hash = entry_hash
        return entry
    
    def verify_chain(self):
        if not self.entries:
            return {'valid': True, 'entries': 0, 'message': 'Empty chain'}
        prev_hash = '0' * 64
        for i, entry in enumerate(self.entries):
            if entry.get('previous_hash') != prev_hash:
                return {'valid': False, 'entries': len(self.entries), 'broken_at': i,
                        'message': f'Chain broken at entry {i}'}
            entry_copy = {k: v for k, v in entry.items() if k != 'hash'}
            entry_str = json.dumps(entry_copy, sort_keys=True, default=str)
            expected_hash = hashlib.sha256(entry_str.encode()).hexdigest()
            if entry.get('hash') != expected_hash:
                return {'valid': False, 'entries': len(self.entries), 'broken_at': i,
                        'message': f'Entry {i} hash mismatch'}
            prev_hash = entry['hash']
        return {'valid': True, 'entries': len(self.entries),
                'message': f'All {len(self.entries)} entries verified'}
    
    def save(self):
        output = {
            'log_version': '2.0',
            'generated_at': datetime.utcnow().isoformat(),
            'setup_metadata': self.setup_metadata or self.capture_setup(),
            'total_entries': len(self.entries),
            'chain_hash': self.last_hash,
            'entries': self.entries,
            'verification': self.verify_chain(),
        }
        with open(self.output_file, 'w') as f:
            json.dump(output, f, indent=2, default=str)
        return str(self.output_file)
    
    def load(self):
        if not self.output_file.exists():
            return None
        try:
            with open(self.output_file) as f:
                data = json.load(f)
            self.entries = data.get('entries', [])
            self.setup_metadata = data.get('setup_metadata')
            if self.entries:
                self.last_hash = self.entries[-1].get('hash', '0' * 64)
            return data
        except:
            return None