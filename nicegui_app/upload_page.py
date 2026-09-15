"""NiceGUI Upload Page - Real Working"""
from nicegui import ui
import hashlib, json, time
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
BLOCKCHAIN_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'blockchain.json'


def add_block_to_chain(data, difficulty=4):
    chain_data = None
    if BLOCKCHAIN_FILE.exists():
        try:
            with open(BLOCKCHAIN_FILE) as f:
                chain_data = json.load(f)
        except:
            pass
    
    if not chain_data:
        genesis = create_block(0, {'action': 'GENESIS', 'message': 'Genesis'}, '0' * 64, difficulty)
        chain_data = {'difficulty': difficulty, 'length': 1, 'chain': [genesis]}
    
    prev_hash = chain_data['chain'][-1]['hash']
    new_index = len(chain_data['chain'])
    new_block = create_block(new_index, data, prev_hash, difficulty)
    chain_data['chain'].append(new_block)
    chain_data['length'] = len(chain_data['chain'])
    chain_data['updated_at'] = datetime.utcnow().isoformat()
    
    BLOCKCHAIN_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(BLOCKCHAIN_FILE, 'w') as f:
        json.dump(chain_data, f, indent=2, default=str)
    
    return new_block


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


def create_upload_page():
    @ui.page('/upload')
    def upload():
        ui.dark_mode().enable()
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
            body, .q-page { font-family: 'Inter', sans-serif !important; background: #0A0E1A !important; }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            .mono { font-family: 'JetBrains Mono', monospace !important; word-break: break-all; }
            .section-title { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-left: 3px solid #38BDF8; padding-left: 16px; margin-bottom: 20px; }
            .drop-zone { background: rgba(15, 23, 42, 0.4) !important; border: 2px dashed #38BDF8 !important; border-radius: 16px !important; padding: 60px 40px !important; text-align: center; }
            .success-box { background: rgba(16, 185, 129, 0.1); border: 2px solid #10B981; border-radius: 12px; padding: 20px; }
            .hash-text { font-family: 'JetBrains Mono', monospace; word-break: break-all; font-size: 11px; }
        </style>
        ''')
        
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            with ui.row().classes('items-center gap-1'):
                for label, path in [('Home', '/'), ('Blockchain', '/blockchain'), ('Trust', '/trust'), ('XAI', '/xai'), ('Upload', '/upload')]:
                    active = path == '/upload'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('cloud_upload').classes('text-cyan-400 text-4xl')
                    ui.label('Upload Dataset').classes('text-cyan-400 font-bold text-4xl')
                ui.label('Upload files · SHA-256 hashing · Blockchain recording').classes('text-gray-400 text-sm')
            
            with ui.card().classes('drop-zone w-full'):
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
            
            with ui.card().classes('w-full p-5').style(
                'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'
            ):
                ui.label('What Happens on Upload').classes('text-white font-bold text-lg mb-3')
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color, icon in [
                        ('1', 'SHA-256 Hash', 'File content hashed', '#38BDF8', 'fingerprint'),
                        ('2', 'Block Created', 'Added to blockchain', '#8B5CF6', 'inventory_2'),
                        ('3', 'Mined (PoW)', 'Difficulty 4', '#10B981', 'gavel'),
                        ('4', 'Trust Evaluated', 'Score calculated', '#F59E0B', 'verified_user'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            with ui.row().classes('w-full gap-3 justify-center mt-4'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/upload')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
                ui.button('⛓️ View Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                ui.button('📊 Trust Score', on_click=lambda: ui.navigate.to('/trust')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')


create_upload_page()
