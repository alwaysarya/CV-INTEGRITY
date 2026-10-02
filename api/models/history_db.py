"""
CV-INTEGRITY History Database (SQLite)
Stores: assets, findings, decisions, reports, ledger_blocks
Fully offline, air-gapped compatible.
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# Database file location
DB_PATH = Path(__file__).parent.parent.parent / "data" / "cv_integrity.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_connection():
    """Get SQLite connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create all tables if they don't exist."""
    conn = get_connection()
    c = conn.cursor()

    # ============================================================
    # TABLE 1: assets (datasets + models)
    # ============================================================
    c.execute('''CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        hash TEXT,
        format TEXT,
        contributor TEXT,
        size_mb REAL,
        upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_level TEXT DEFAULT 'black-box',
        status TEXT DEFAULT 'pending',
        metadata TEXT
    )''')

    # ============================================================
    # TABLE 2: findings (every flag/issue)
    # ============================================================
    c.execute('''CREATE TABLE IF NOT EXISTS findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id TEXT NOT NULL,
        module TEXT NOT NULL,
        reason TEXT,
        evidence TEXT,
        severity TEXT DEFAULT 'medium',
        confidence REAL DEFAULT 0.0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id)
    )''')

    # ============================================================
    # TABLE 3: decisions (Accept/Review/Quarantine)
    # ============================================================
    c.execute('''CREATE TABLE IF NOT EXISTS decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        note TEXT,
        analyst TEXT DEFAULT 'system',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id)
    )''')

    # ============================================================
    # TABLE 4: reports (final assurance reports)
    # ============================================================
    c.execute('''CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id TEXT NOT NULL,
        report_json TEXT NOT NULL,
        overall_score REAL,
        grade TEXT,
        verdict TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id)
    )''')

    # ============================================================
    # TABLE 5: ledger_blocks (blockchain)
    # ============================================================
    c.execute('''CREATE TABLE IF NOT EXISTS ledger_blocks (
        block_index INTEGER PRIMARY KEY,
        asset_id TEXT,
        hash TEXT NOT NULL,
        prev_hash TEXT,
        data TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id)
    )''')

    # ============================================================
    # INDEXES (fast queries)
    # ============================================================
    c.execute('CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_assets_contributor ON assets(contributor)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_assets_upload_time ON assets(upload_time)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_findings_asset ON findings(asset_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_decisions_asset ON decisions(asset_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_decisions_decision ON decisions(decision)')

    conn.commit()
    conn.close()
    print(f"✅ Database initialized: {DB_PATH}")


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def add_asset(asset_id: str, name: str, type_: str, hash_: str = None,
              format_: str = None, contributor: str = None,
              size_mb: float = None, access_level: str = 'black-box',
              metadata: dict = None) -> bool:
    """Add a new asset (dataset or model)."""
    conn = get_connection()
    try:
        conn.execute('''INSERT OR REPLACE INTO assets 
            (id, name, type, hash, format, contributor, size_mb, access_level, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (asset_id, name, type_, hash_, format_, contributor, size_mb,
             access_level, json.dumps(metadata) if metadata else None))
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ add_asset error: {e}")
        return False
    finally:
        conn.close()


def add_finding(asset_id: str, module: str, reason: str,
                evidence: str = None, severity: str = 'medium',
                confidence: float = 0.0) -> bool:
    """Add a finding for an asset."""
    conn = get_connection()
    try:
        conn.execute('''INSERT INTO findings 
            (asset_id, module, reason, evidence, severity, confidence)
            VALUES (?, ?, ?, ?, ?, ?)''',
            (asset_id, module, reason, evidence, severity, confidence))
        conn.commit()
        return True
    finally:
        conn.close()


def add_decision(asset_id: str, decision: str, note: str = None,
                 analyst: str = 'system') -> bool:
    """Add a decision (accept/review/quarantine)."""
    conn = get_connection()
    try:
        conn.execute('''INSERT INTO decisions 
            (asset_id, decision, note, analyst)
            VALUES (?, ?, ?, ?)''',
            (asset_id, decision, note, analyst))
        conn.commit()
        return True
    finally:
        conn.close()


def add_report(asset_id: str, report_json: dict, overall_score: float = None,
               grade: str = None, verdict: str = None) -> bool:
    """Add a full assurance report."""
    conn = get_connection()
    try:
        conn.execute('''INSERT INTO reports 
            (asset_id, report_json, overall_score, grade, verdict)
            VALUES (?, ?, ?, ?, ?)''',
            (asset_id, json.dumps(report_json), overall_score, grade, verdict))
        conn.commit()
        return True
    finally:
        conn.close()


# ============================================================
# QUERY FUNCTIONS
# ============================================================

def get_all_assets(type_filter: str = None, limit: int = 100) -> List[Dict]:
    """Get all assets, optionally filtered by type."""
    conn = get_connection()
    try:
        if type_filter:
            rows = conn.execute(
                'SELECT * FROM assets WHERE type = ? ORDER BY upload_time DESC LIMIT ?',
                (type_filter, limit)
            ).fetchall()
        else:
            rows = conn.execute(
                'SELECT * FROM assets ORDER BY upload_time DESC LIMIT ?',
                (limit,)
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_asset(asset_id: str) -> Optional[Dict]:
    """Get a single asset by ID."""
    conn = get_connection()
    try:
        row = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_asset_findings(asset_id: str) -> List[Dict]:
    """Get all findings for an asset."""
    conn = get_connection()
    try:
        rows = conn.execute(
            'SELECT * FROM findings WHERE asset_id = ? ORDER BY timestamp DESC',
            (asset_id,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_asset_decisions(asset_id: str) -> List[Dict]:
    """Get all decisions for an asset."""
    conn = get_connection()
    try:
        rows = conn.execute(
            'SELECT * FROM decisions WHERE asset_id = ? ORDER BY timestamp DESC',
            (asset_id,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_asset_report(asset_id: str) -> Optional[Dict]:
    """Get the latest report for an asset."""
    conn = get_connection()
    try:
        row = conn.execute(
            'SELECT * FROM reports WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1',
            (asset_id,)
        ).fetchone()
        if row:
            r = dict(row)
            r['report_json'] = json.loads(r['report_json'])
            return r
        return None
    finally:
        conn.close()


def query_history(asset_type: str = None, verdict: str = None,
                  contributor: str = None, search: str = None,
                  limit: int = 50) -> List[Dict]:
    """Advanced history query with filters."""
    conn = get_connection()
    try:
        sql = '''
            SELECT a.*, 
                   (SELECT verdict FROM reports WHERE asset_id = a.id ORDER BY timestamp DESC LIMIT 1) as latest_verdict,
                   (SELECT overall_score FROM reports WHERE asset_id = a.id ORDER BY timestamp DESC LIMIT 1) as latest_score,
                   (SELECT decision FROM decisions WHERE asset_id = a.id ORDER BY timestamp DESC LIMIT 1) as latest_decision
            FROM assets a
            WHERE 1=1
        '''
        params = []

        if asset_type:
            sql += ' AND a.type = ?'
            params.append(asset_type)
        if contributor:
            sql += ' AND a.contributor = ?'
            params.append(contributor)
        if search:
            sql += ' AND (a.name LIKE ? OR a.contributor LIKE ?)'
            params.extend([f'%{search}%', f'%{search}%'])
        if verdict:
            sql += ' AND (SELECT verdict FROM reports WHERE asset_id = a.id ORDER BY timestamp DESC LIMIT 1) = ?'
            params.append(verdict)

        sql += ' ORDER BY a.upload_time DESC LIMIT ?'
        params.append(limit)

        rows = conn.execute(sql, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_stats() -> Dict:
    """Get overall stats."""
    conn = get_connection()
    try:
        stats = {}
        stats['total_assets'] = conn.execute('SELECT COUNT(*) FROM assets').fetchone()[0]
        stats['total_datasets'] = conn.execute("SELECT COUNT(*) FROM assets WHERE type='dataset'").fetchone()[0]
        stats['total_models'] = conn.execute("SELECT COUNT(*) FROM assets WHERE type='model'").fetchone()[0]
        stats['total_findings'] = conn.execute('SELECT COUNT(*) FROM findings').fetchone()[0]
        stats['total_decisions'] = conn.execute('SELECT COUNT(*) FROM decisions').fetchone()[0]
        stats['total_blocks'] = conn.execute('SELECT COUNT(*) FROM ledger_blocks').fetchone()[0]

        # Decision counts
        stats['accept_count'] = conn.execute("SELECT COUNT(*) FROM decisions WHERE decision='accept'").fetchone()[0]
        stats['review_count'] = conn.execute("SELECT COUNT(*) FROM decisions WHERE decision='review'").fetchone()[0]
        stats['quarantine_count'] = conn.execute("SELECT COUNT(*) FROM decisions WHERE decision='quarantine'").fetchone()[0]

        return stats
    finally:
        conn.close()


# ============================================================
# AUTO-INIT on import
# ============================================================
if __name__ == "__main__":
    init_db()
    print("✅ Database ready")
    print(f"📊 Stats: {get_stats()}")
