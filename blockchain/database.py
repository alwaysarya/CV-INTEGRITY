"""
SQLite Database for CV-INTEGRITY Blockchain
Persistent storage for blocks, transactions, and audit trail
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sqlite3
import json
from datetime import datetime
from pathlib import Path


class BlockchainDB:
    """SQLite Database for blockchain storage"""
    
    def __init__(self, db_path='outputs/reports/blockchain.db'):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._create_tables()
    
    def _create_tables(self):
        """Create database tables"""
        # Blocks table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS blocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                block_index INTEGER UNIQUE,
                timestamp TEXT,
                data TEXT,
                previous_hash TEXT,
                block_hash TEXT,
                nonce INTEGER,
                merkle_root TEXT
            )
        ''')
        
        # Audit log table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT,
                user TEXT,
                details TEXT,
                timestamp TEXT
            )
        ''')
        
        # Smart contract executions
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS contract_executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contract_address TEXT,
                dataset TEXT,
                trust_score REAL,
                decision TEXT,
                action TEXT,
                timestamp TEXT
            )
        ''')
        
        # Attack log
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS attacks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                attack_id TEXT,
                name TEXT,
                severity TEXT,
                detected INTEGER,
                details TEXT,
                timestamp TEXT
            )
        ''')
        
        # Users table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                role TEXT,
                permissions TEXT,
                registered_at TEXT,
                active INTEGER
            )
        ''')
        
        self.conn.commit()
        print(f"✅ Database tables created: {self.db_path}")
    
    def add_block(self, block_data):
        """Add block to database"""
        self.cursor.execute('''
            INSERT OR REPLACE INTO blocks 
            (block_index, timestamp, data, previous_hash, block_hash, nonce, merkle_root)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            block_data.get('index'),
            block_data.get('datetime', datetime.now().isoformat()),
            json.dumps(block_data.get('data', {})),
            block_data.get('previous_hash'),
            block_data.get('hash'),
            block_data.get('nonce', 0),
            block_data.get('merkle_root', '')
        ))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def get_block(self, block_index):
        """Get block by index"""
        self.cursor.execute('SELECT * FROM blocks WHERE block_index = ?', (block_index,))
        row = self.cursor.fetchone()
        if row:
            return {
                'id': row[0],
                'index': row[1],
                'timestamp': row[2],
                'data': json.loads(row[3]),
                'previous_hash': row[4],
                'hash': row[5],
                'nonce': row[6],
                'merkle_root': row[7]
            }
        return None
    
    def get_all_blocks(self):
        """Get all blocks"""
        self.cursor.execute('SELECT * FROM blocks ORDER BY block_index')
        rows = self.cursor.fetchall()
        return [{
            'id': r[0], 'index': r[1], 'timestamp': r[2],
            'data': json.loads(r[3]), 'previous_hash': r[4],
            'hash': r[5], 'nonce': r[6], 'merkle_root': r[7]
        } for r in rows]
    
    def log_audit(self, action, user, details):
        """Log audit entry"""
        self.cursor.execute('''
            INSERT INTO audit_log (action, user, details, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (action, user, json.dumps(details), datetime.now().isoformat()))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def get_audit_log(self, limit=100):
        """Get audit log"""
        self.cursor.execute('SELECT * FROM audit_log ORDER BY id DESC LIMIT ?', (limit,))
        return [{'id': r[0], 'action': r[1], 'user': r[2],
                 'details': json.loads(r[3]), 'timestamp': r[4]}
                for r in self.cursor.fetchall()]
    
    def log_contract_execution(self, contract_address, dataset, trust_score, decision, action):
        """Log smart contract execution"""
        self.cursor.execute('''
            INSERT INTO contract_executions 
            (contract_address, dataset, trust_score, decision, action, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (contract_address, dataset, trust_score, decision, action, datetime.now().isoformat()))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def log_attack(self, attack_id, name, severity, detected, details):
        """Log cyber attack"""
        self.cursor.execute('''
            INSERT INTO attacks (attack_id, name, severity, detected, details, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (attack_id, name, severity, 1 if detected else 0, json.dumps(details), datetime.now().isoformat()))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def register_user(self, username, role, permissions):
        """Register user"""
        self.cursor.execute('''
            INSERT OR REPLACE INTO users (username, role, permissions, registered_at, active)
            VALUES (?, ?, ?, ?, 1)
        ''', (username, role, json.dumps(permissions), datetime.now().isoformat()))
        self.conn.commit()
        return self.cursor.lastrowid
    
    def get_stats(self):
        """Get database statistics"""
        stats = {}
        
        self.cursor.execute('SELECT COUNT(*) FROM blocks')
        stats['total_blocks'] = self.cursor.fetchone()[0]
        
        self.cursor.execute('SELECT COUNT(*) FROM audit_log')
        stats['total_audit_entries'] = self.cursor.fetchone()[0]
        
        self.cursor.execute('SELECT COUNT(*) FROM contract_executions')
        stats['total_contract_executions'] = self.cursor.fetchone()[0]
        
        self.cursor.execute('SELECT COUNT(*) FROM attacks')
        stats['total_attacks'] = self.cursor.fetchone()[0]
        
        self.cursor.execute('SELECT COUNT(*) FROM attacks WHERE detected = 1')
        stats['detected_attacks'] = self.cursor.fetchone()[0]
        
        self.cursor.execute('SELECT COUNT(*) FROM users WHERE active = 1')
        stats['active_users'] = self.cursor.fetchone()[0]
        
        return stats
    
    def close(self):
        """Close database connection"""
        self.conn.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("💾 SQLITE DATABASE DEMO")
    print("="*60 + "\n")
    
    db = BlockchainDB()
    
    # Test 1: Add blocks
    print("📝 Test 1: Adding blocks...")
    db.add_block({
        'index': 0,
        'data': {'message': 'Genesis Block'},
        'previous_hash': '0',
        'hash': '00abc123',
        'nonce': 100
    })
    print("   ✅ Block 0 added")
    
    db.add_block({
        'index': 1,
        'data': {'action': 'DATASET_UPLOAD', 'dataset': 'good'},
        'previous_hash': '00abc123',
        'hash': '00def456',
        'nonce': 200
    })
    print("   ✅ Block 1 added")
    
    # Test 2: Audit log
    print("\n📝 Test 2: Adding audit log...")
    db.log_audit('DATASET_UPLOAD', 'Arya Ranjan', {'dataset': 'good', 'images': 300})
    print("   ✅ Audit entry added")
    
    # Test 3: Contract execution
    print("\n📝 Test 3: Logging contract execution...")
    db.log_contract_execution('0xTRUST_CONTRACT_v1', 'good', 88.0, 'ACCEPT', 'deploy_to_production')
    print("   ✅ Contract execution logged")
    
    # Test 4: Attack log
    print("\n📝 Test 4: Logging attack...")
    db.log_attack('ATTACK_001', 'Data Poisoning', 'HIGH', True, {'detection': 'hash_mismatch'})
    print("   ✅ Attack logged")
    
    # Test 5: Register user
    print("\n📝 Test 5: Registering user...")
    db.register_user('Arya Ranjan', 'admin', ['upload', 'train', 'deploy'])
    print("   ✅ User registered")
    
    # Stats
    print("\n" + "="*60)
    print("📊 DATABASE STATISTICS")
    print("="*60)
    stats = db.get_stats()
    for key, value in stats.items():
        print(f"   {key.replace('_', ' ').title()}: {value}")
    
    db.close()
    
    print("\n" + "="*60)
    print("✅ SQLite Database ready!")
    print("="*60)