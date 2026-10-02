"""
NiceGUI Upload Page - Real Working
Upload → SHA-256 → Blockchain → Trust evaluation
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import hashlib
import json
import time
import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

BLOCKCHAIN_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'blockchain.json'
UPLOAD_DIR = PROJECT_ROOT / 'datasets' / 'uploaded'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def load_blockchain():
    if not BLOCKCHAIN_FILE.exists():
        return None
    try:
        with open(BLOCKCHAIN_FILE) as f:
            return json.load(f)
    except:
        return None


def save_blockchain(data):
    BLOCKCHAIN_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(BLOCKCHAIN_FILE, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def create_block(index, data, previous_hash, difficulty=4):
    timestamp = time.time()
    nonce = 0
    while True:
        block_str = json.dumps({
            'index': index, 'timestamp': timestamp, 'data': data,
            'previous_hash': previous_hash, 'nonce': nonce
        }, sort_keys=True, default=str)
        h = hashlib.sha256(block_str.encode()).hexdigest()
        if h[:difficulty] == '0' * difficulty:
            break
        nonce += 1
    return {
        'index': index, 'timestamp': timestamp,
        'datetime': datetime.fromtimestamp(timestamp).isoformat(),
        'data': data, 'previous_hash': previous_hash,
        'nonce': nonce, 'hash': h,
    }


def add_block_to_chain(data, difficulty=4):
    chain_data = load_blockchain()
    if not chain_data:
        genesis = create_block(0, {'action': 'GENESIS', 'message': 'Genesis'}, '0' * 64, difficulty)
        chain_data = {'difficulty': difficulty, 'length': 1, 'chain': [genesis]}
    
    prev_hash = chain_data['chain'][-1]['hash']
    new_index = len(chain_data['chain'])
    new_block = create_block(new_index, data, prev_hash, difficulty)
    chain_data['chain'].append(new_block)
    chain_data['length'] = len(chain_data['chain'])
    chain_data['updated_at'] = datetime.utcnow().isoformat()
    save_blockchain(chain_data)
    return new_block


def create_upload_page():
    
    @ui.page('/upload')
    def upload():
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; font-size: 1rem;">📤</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('Upload', '/upload'),
                    ('Datasets', '/datasets'),
                ]:
                    active = path == '/upload'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '📤', 'Upload Dataset', 'Upload files · SHA-256 hashing · Blockchain recording', '#38BDF8')
            
            # Upload zone
            with ui.card().classes('w-full p-12').style('border: 2px dashed #38BDF8; border-radius: 16px;'):
                with ui.column().classes('items-center gap-3 w-full'):
                    ui.icon('cloud_upload').classes('text-cyan-400').style('font-size: 5rem;')
                    ui.label('Drag & drop files here').classes('text-white font-bold text-2xl')
                    ui.label('or click to browse · Max 10GB').classes('text-gray-500 text-sm')
                    
                    def handle_upload(e):
                        try:
                            content = e.content.read()
                            file_hash = hashlib.sha256(content).hexdigest()
                            file_size = len(content)
                            
                            block_data = {
                                'action': 'DATASET_UPLOAD',
                                'user': 'aryan',
                                'filename': e.name,
                                'file_size': file_size,
                                'file_hash': file_hash,
                                'timestamp': datetime.utcnow().isoformat(),
                            }
                            
                            ui.notify(f'⛏️ Mining block for {e.name}...', type='info')
                            new_block = add_block_to_chain(block_data)
                            ui.notify(f'✅ Uploaded! Block #{new_block["index"]} · Hash: {file_hash[:16]}...', type='positive', position='top', timeout=5000)
                        except Exception as ex:
                            ui.notify(f'❌ Error: {ex}', type='negative')
                    
                    ui.upload(on_upload=handle_upload, auto_upload=True, max_file_size=10_000_000_000).props('accept=*/*').classes('mt-4')
            
            # Info
            with ui.card().classes('w-full p-5').style('border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'):
                ui.label('What Happens on Upload').classes('text-white font-bold text-lg mb-3')
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color, icon in [
                        ('1', 'SHA-256 Hash', 'File content hashed', '#38BDF8', 'fingerprint'),
                        ('2', 'Block Created', 'Added to blockchain', '#8B5CF6', 'inventory_2'),
                        ('3', 'Mined (PoW)', 'Difficulty 4', '#10B981', 'gavel'),
                        ('4', 'Trust Evaluated', 'Score calculated', '#F59E0B', 'verified_user'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-4'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/upload')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
                ui.button('⛓️ View Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                ui.button('📊 Trust Score', on_click=lambda: ui.navigate.to('/trust')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')


# Register
create_upload_page()