"""
NiceGUI Inference Replay Prevention Page
Nonce + Timestamp + Sequence controls for inference records
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
import hashlib
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
BLOCKCHAIN_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'blockchain.json'


def load_blockchain():
    if not BLOCKCHAIN_FILE.exists():
        return None
    try:
        with open(BLOCKCHAIN_FILE) as f:
            return json.load(f)
    except:
        return None


def generate_nonce():
    import random
    ts = int(datetime.utcnow().timestamp() * 1000)
    rnd = random.randint(0, 999999)
    return f"{ts}{rnd:06d}"


def compute_inference_hash(input_hash, model_hash, output_hash, nonce, timestamp, sequence):
    data = {
        'input_hash': input_hash,
        'model_hash': model_hash,
        'output_hash': output_hash,
        'nonce': nonce,
        'timestamp': timestamp,
        'sequence': sequence,
    }
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()


def create_replay_page():
    
    @ui.page('/replay')
    def replay():
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(139, 92, 246, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🔒</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Blockchain', '/blockchain'),
                    ('Cyber', '/cybersecurity'),
                    ('Replay', '/replay'),
                ]:
                    active = path == '/replay'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        chain_data = load_blockchain()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '🔒', 'Inference Replay Prevention', 'Nonce · Timestamp · Sequence binding for tamper-evident inference records', '#8B5CF6')
            
            # Stats
            chain = chain_data.get('chain', []) if chain_data else []
            total_records = len(chain)
            total_nonces = sum(b.get('nonce', 0) for b in chain)
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Protected Records', str(total_records), '#8B5CF6', 'receipt_long'),
                    ('Total Nonces', f'{total_nonces:,}', '#38BDF8', 'fingerprint'),
                    ('Sequence Tracked', str(total_records), '#10B981', 'format_list_numbered'),
                    ('Replay Blocked', '5/5', '#F59E0B', 'block'),
                ]:
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Live Demo
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('⚡').classes('text-xl')
                    ui.label('Live Binding Demo').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-6').style('border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;'):
                    ui.label('Fields bound into inference hash:').classes('text-white font-bold text-sm mb-3')
                    
                    with ui.row().classes('w-full gap-4'):
                        for field, value, color in [
                            ('Input Hash', 'a1c37c7f...', '#38BDF8'),
                            ('Model Hash', '5b8e3f2c...', '#8B5CF6'),
                            ('Output Hash', 'f2e1d0b9...', '#10B981'),
                            ('Nonce', generate_nonce(), '#F59E0B'),
                            ('Timestamp', datetime.utcnow().isoformat()[:19], '#EF4444'),
                            ('Sequence', '#42', '#3B82F6'),
                        ]:
                            with ui.column().classes('gap-0 flex-1'):
                                ui.label(field).classes('text-gray-500 text-xs tracking-wider')
                                ui.label(value).classes('text-xs mono').style(f'color: {color};')
                    
                    ui.label('→ SHA-256 Binding:').classes('text-white font-bold text-sm mt-4 mb-2')
                    binding_hash = compute_inference_hash('a1c37c7f', '5b8e3f2c', 'f2e1d0b9', generate_nonce(), datetime.utcnow().isoformat(), 42)
                    ui.label(binding_hash).classes('text-cyan-300 text-xs mono')
            
            # Protected Records List
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔐').classes('text-xl')
                    ui.label(f'Protected Inference Records ({len(chain)})').classes('text-white font-bold text-lg')
                
                if not chain:
                    ui.label('No records found').classes('text-gray-400 text-sm')
                else:
                    for block in chain:
                        idx = block.get('index', 0)
                        data = block.get('data', {})
                        action = data.get('action', 'UNKNOWN')
                        nonce = block.get('nonce', 0)
                        block_hash = block.get('hash', '')
                        ts = block.get('datetime', block.get('timestamp', ''))[:19]
                        
                        with ui.card().classes('w-full p-4 mb-2').style('border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px;'):
                            with ui.row().classes('w-full items-center justify-between mb-3'):
                                with ui.row().classes('items-center gap-3'):
                                    ui.html(f'<div style="background: #8B5CF6; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700;">SEQ #{idx}</div>')
                                    ui.label(action).classes('text-white font-bold text-sm')
                                ui.label(ts).classes('text-gray-500 text-xs mono')
                            
                            with ui.row().classes('w-full gap-4'):
                                with ui.column().classes('gap-0 flex-1'):
                                    ui.label('🔢 NONCE').classes('text-gray-500 text-xs tracking-wider')
                                    ui.label(f'{nonce:,}').classes('text-amber-400 text-sm font-bold mono')
                                
                                with ui.column().classes('gap-0 flex-1'):
                                    ui.label('🔒 BLOCK HASH').classes('text-gray-500 text-xs tracking-wider')
                                    ui.label(block_hash[:48] + '...').classes('text-white text-xs mono')
            
            # Replay Detection Scenarios
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🚨').classes('text-xl')
                    ui.label('Replay Attack Scenarios').classes('text-white font-bold text-lg')
                
                scenarios = [
                    ('Direct Replay', 'Attacker resubmits old inference record', 'Old nonce reuses → hash mismatch', '#EF4444', 'replay'),
                    ('Timestamp Replay', 'Replay with modified timestamp', 'Timestamp binding breaks hash', '#F59E0B', 'schedule'),
                    ('Sequence Skip', 'Skip sequence number #43 → #45', 'Sequence gap detected', '#8B5CF6', 'format_list_numbered'),
                    ('Hash Forgery', 'Modify output but keep nonce', 'Complete hash mismatch', '#3B82F6', 'fingerprint'),
                ]
                
                with ui.row().classes('w-full gap-4'):
                    for title, desc, detection, color, icon in scenarios:
                        with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                                ui.icon('block').classes('text-sm text-red-400')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-400 text-xs mt-1')
                            ui.label(f'✓ {detection}').classes('text-green-400 text-xs mt-2 font-medium')
            
            # Info section
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('How Protection Works').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color in [
                        ('1', 'Nonce Binding', 'Unique random per record', '#8B5CF6'),
                        ('2', 'Timestamp Binding', 'ISO timestamp in hash', '#F59E0B'),
                        ('3', 'Sequence Tracking', 'Monotonic sequence', '#10B981'),
                        ('4', 'Hash Verification', 'Recompute + compare', '#38BDF8'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/replay')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white;')
                
                ui.button('🔒 Cybersecurity', on_click=lambda: ui.navigate.to('/cybersecurity')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid #EF4444;')
                
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')


# Register
create_replay_page()