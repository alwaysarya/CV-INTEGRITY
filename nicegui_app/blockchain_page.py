"""
NiceGUI Blockchain Visualization
Real blockchain data from outputs/reports/blockchain.json
"""

from nicegui import ui, app
from styles import apply_styles
import json
import sys
from pathlib import Path
from datetime import datetime

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
BLOCKCHAIN_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'blockchain.json'


# ============================================================
# DATA LOADER
# ============================================================

def load_blockchain():
    """Load blockchain from JSON."""
    if not BLOCKCHAIN_FILE.exists():
        return None
    try:
        with open(BLOCKCHAIN_FILE) as f:
            return json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return None


def validate_chain(data):
    """Validate chain integrity."""
    if not data or 'chain' not in data:
        return False, "No chain data"
    
    import hashlib
    chain = data['chain']
    
    for i in range(1, len(chain)):
        current = chain[i]
        prev = chain[i - 1]
        
        if current['previous_hash'] != prev['hash']:
            return False, f"Block {i} broken link"
        
        # Recalculate hash
        block_str = json.dumps({
            'index': current['index'],
            'timestamp': current['timestamp'],
            'data': current['data'],
            'previous_hash': current['previous_hash'],
            'nonce': current['nonce']
        }, sort_keys=True, default=str)
        calc_hash = hashlib.sha256(block_str.encode()).hexdigest()
        
        if calc_hash != current['hash']:
            return False, f"Block {i} hash tampered"
    
    return True, "Chain is valid"


# ============================================================
# PAGE STYLES
# ============================================================

def setup_blockchain_styles():
    ui.add_head_html('''
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .block-card {
            background: rgba(15, 23, 42, 0.6) !important;
            border: 1px solid rgba(56, 189, 248, 0.15) !important;
            border-radius: 12px !important;
            padding: 0 !important;
            margin-bottom: 16px !important;
            overflow: hidden !important;
        }
        .block-header {
            background: rgba(30, 41, 59, 0.7) !important;
            padding: 12px 16px !important;
            border-bottom: 1px solid rgba(56, 189, 248, 0.15) !important;
        }
        .block-body {
            padding: 16px !important;
        }
        .stat-card {
            background: rgba(15, 23, 42, 0.6) !important;
            border-radius: 12px !important;
            padding: 20px !important;
            text-align: center !important;
            border: 2px solid !important;
        }
        .data-box {
            background: rgba(0,0,0,0.4) !important;
            padding: 12px !important;
            border-radius: 6px !important;
            color: #94A3B8 !important;
            font-family: 'JetBrains Mono', monospace !important;
            font-size: 11px !important;
            white-space: pre-wrap !important;
            overflow-x: auto !important;
        }
    </style>
    ''')


# ============================================================
# BLOCKCHAIN PAGE
# ============================================================

def create_blockchain_page():
    """Create the blockchain visualization page."""
    
    @ui.page('/blockchain')
    def blockchain():
        setup_blockchain_styles()
        apply_styles(ui)
        
        # Body background
        ui.add_head_html('''
        <style>
            body, .q-page { background: #0A0E1A !important; }
            .q-page-container { padding: 0 !important; }
        </style>
        ''')
        
        # Navigation (simple)
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15);'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [('Home', '/'), ('Blockchain', '/blockchain'), ('Upload', '/upload')]:
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-gray-400 text-sm'
                    )
        
        # Main content
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('link').classes('text-cyan-400 text-4xl')
                    ui.label('Blockchain Integrity').classes('text-cyan-400 font-bold text-3xl')
                ui.label('Immutable audit trail with SHA-256 hashing').classes('text-gray-400 text-sm')
            
            # Load data
            data = load_blockchain()
            
            if not data:
                # Empty state
                with ui.card().classes('w-full p-8 mt-4').style(
                    'background: rgba(15, 23, 42, 0.6); border: 2px dashed #F59E0B; border-radius: 12px;'
                ):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-amber-400 text-5xl')
                        ui.label('No Blockchain Data').classes('text-white font-bold text-xl')
                        ui.label(f'Expected: {BLOCKCHAIN_FILE}').classes('text-gray-500 text-xs mono')
                        ui.label('Run phase9_integration.py to create blockchain').classes('text-gray-400 text-sm')
                return
            
            # Stats
            is_valid, msg = validate_chain(data)
            chain = data.get('chain', [])
            difficulty = data.get('difficulty', 0)
            
            with ui.row().classes('w-full gap-4 justify-center'):
                # Total blocks
                with ui.card().classes('stat-card').style('border-color: #10B981; min-width: 200px;'):
                    ui.icon('inventory_2').classes('text-4xl text-amber-400 mb-2')
                    ui.label(str(len(chain))).classes('text-white font-bold text-4xl')
                    ui.label('TOTAL BLOCKS').classes('text-gray-500 text-xs tracking-wider mt-1')
                
                # Status
                with ui.card().classes('stat-card').style(f'border-color: {"#10B981" if is_valid else "#EF4444"}; min-width: 200px;'):
                    ui.icon('verified' if is_valid else 'error').classes(f'text-4xl {"text-green-400" if is_valid else "text-red-400"} mb-2')
                    ui.label('VALID' if is_valid else 'INVALID').classes(f'font-bold text-3xl {"text-green-400" if is_valid else "text-red-400"}')
                    ui.label('CHAIN STATUS').classes('text-gray-500 text-xs tracking-wider mt-1')
                
                # Difficulty
                with ui.card().classes('stat-card').style('border-color: #8B5CF6; min-width: 200px;'):
                    ui.icon('settings').classes('text-4xl text-purple-400 mb-2')
                    ui.label(str(difficulty)).classes('text-white font-bold text-4xl')
                    ui.label('DIFFICULTY').classes('text-gray-500 text-xs tracking-wider mt-1')
                
                # Hash algo
                with ui.card().classes('stat-card').style('border-color: #F59E0B; min-width: 200px;'):
                    ui.icon('lock').classes('text-4xl text-amber-400 mb-2')
                    ui.label('SHA-256').classes('text-amber-400 font-bold text-xl')
                    ui.label('HASH ALGO').classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Chain section
            with ui.card().classes('w-full p-6').style(
                'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'
            ):
                with ui.row().classes('items-center gap-3 mb-4'):
                    ui.icon('link').classes('text-cyan-400 text-2xl')
                    ui.label('Blockchain Chain').classes('text-cyan-400 font-bold text-xl')
                
                # Render each block
                for block in chain:
                    render_block(block)
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-4'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/blockchain')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
                
                ui.button('✅ Verify Chain', on_click=lambda: ui.notify(msg, type='positive' if is_valid else 'negative')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid #10B981;')


def render_block(block):
    """Render a single block card."""
    idx = block.get('index', 0)
    ts = block.get('datetime', block.get('timestamp', 'N/A'))
    nonce = block.get('nonce', 0)
    block_hash = block.get('hash', '')
    prev_hash = block.get('previous_hash', '')
    data = block.get('data', {})
    action = data.get('action', 'UNKNOWN') if isinstance(data, dict) else 'UNKNOWN'
    
    with ui.card().classes('block-card w-full'):
        # Header
        with ui.row().classes('block-header items-center gap-2 w-full'):
            ui.icon('inventory_2').classes('text-cyan-400 text-sm')
            ui.label(f'Block #{idx} — {action}').classes('text-cyan-300 text-sm font-medium mono')
            ui.label(f'— {str(ts)[:19]}').classes('text-gray-500 text-xs mono')
        
        # Body
        with ui.row().classes('block-body w-full gap-6'):
            # Left
            with ui.column().classes('gap-3').style('flex: 1;'):
                with ui.column().classes('gap-0'):
                    ui.label('INDEX').classes('text-gray-500 text-xs tracking-wider')
                    ui.label(f'#{idx}').classes('text-cyan-400 font-bold text-2xl mono')
                
                with ui.column().classes('gap-0'):
                    ui.label('⏱  TIMESTAMP').classes('text-gray-500 text-xs tracking-wider')
                    ui.label(str(ts)[:19]).classes('text-white text-xs mono')
                
                with ui.column().classes('gap-0'):
                    ui.label('🔢  NONCE').classes('text-gray-500 text-xs tracking-wider')
                    ui.label(f'{nonce:,}').classes('text-white text-sm mono')
            
            # Right
            with ui.column().classes('gap-3').style('flex: 1;'):
                with ui.column().classes('gap-0'):
                    ui.label('🔒  BLOCK HASH').classes('text-gray-500 text-xs tracking-wider')
                    ui.label(block_hash).classes('text-white text-xs mono').style('word-break: break-all;')
                
                with ui.column().classes('gap-0'):
                    ui.label('🔗  PREVIOUS HASH').classes('text-gray-500 text-xs tracking-wider')
                    ui.label(prev_hash).classes('text-white text-xs mono').style('word-break: break-all;')
        
        # Data
        if data:
            with ui.column().classes('block-body gap-2 w-full').style('padding-top: 0 !important;'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon('description').classes('text-gray-500 text-sm')
                    ui.label('DATA').classes('text-gray-500 text-xs tracking-wider')
                
                data_str = json.dumps(data, indent=2, default=str)
                ui.label(data_str).classes('data-box w-full')


# ============================================================
# AUTO-REGISTER
# ============================================================

create_blockchain_page()
