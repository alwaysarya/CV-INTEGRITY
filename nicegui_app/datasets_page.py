"""
NiceGUI Datasets Page - Real Data
Loads datasets from filesystem + blockchain + reports.
"""

from nicegui import ui
import json
import hashlib
import os
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
UPLOADED_DIR = PROJECT_ROOT / 'datasets' / 'uploaded'
PROCESSED_DIR = PROJECT_ROOT / 'datasets' / 'processed'
REPORTS_DIR = PROJECT_ROOT / 'outputs' / 'reports'
BLOCKCHAIN_FILE = REPORTS_DIR / 'blockchain.json'


# ============================================================
# DATA LOADERS
# ============================================================

def load_blockchain_datasets():
    """Load dataset hashes from blockchain."""
    if not BLOCKCHAIN_FILE.exists():
        return {}
    
    try:
        with open(BLOCKCHAIN_FILE) as f:
            data = json.load(f)
    except:
        return {}
    
    datasets = {}
    for block in data.get('chain', []):
        block_data = block.get('data', {})
        if block_data.get('action') == 'DATASET_UPLOAD':
            name = block_data.get('filename') or block_data.get('dataset_name', 'unknown')
            datasets[name] = {
                'hash': block_data.get('file_hash') or block_data.get('dataset_hash', ''),
                'block_index': block.get('index', 0),
                'timestamp': block.get('datetime', ''),
                'user': block_data.get('user', 'unknown'),
                'size': block_data.get('file_size', 0),
            }
    
    return datasets


def format_size(bytes_val):
    """Format bytes to human readable."""
    if not bytes_val:
        return '0 B'
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024:
            return f'{bytes_val:.1f} {unit}'
        bytes_val /= 1024
    return f'{bytes_val:.1f} TB'


def get_file_hash(filepath, chunk_size=65536):
    """SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(chunk_size), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except:
        return None


def load_datasets():
    """Load all datasets from filesystem + blockchain."""
    blockchain_data = load_blockchain_datasets()
    datasets = []
    
    # Load uploaded files
    if UPLOADED_DIR.exists():
        for f in sorted(UPLOADED_DIR.iterdir()):
            if f.is_file() and not f.name.startswith('.'):
                size = f.stat().st_size
                mod_time = datetime.fromtimestamp(f.stat().st_mtime)
                
                # Find in blockchain
                bc_info = blockchain_data.get(f.name, {})
                
                # Determine status
                if bc_info:
                    status = 'Verified'
                    status_color = 'green'
                else:
                    status = 'Pending'
                    status_color = 'yellow'
                
                # Quality from name
                if 'good' in f.name.lower():
                    quality = 'Good'
                    quality_color = 'green'
                elif 'bad' in f.name.lower():
                    quality = 'Bad'
                    quality_color = 'orange'
                elif 'worst' in f.name.lower():
                    quality = 'Worst'
                    quality_color = 'red'
                else:
                    quality = 'Unknown'
                    quality_color = 'gray'
                
                datasets.append({
                    'name': f.name,
                    'path': str(f),
                    'size': size,
                    'size_human': format_size(size),
                    'modified': mod_time.strftime('%Y-%m-%d %H:%M'),
                    'hash': bc_info.get('hash', '')[:32] + '...' if bc_info.get('hash') else 'Not in blockchain',
                    'status': status,
                    'status_color': status_color,
                    'quality': quality,
                    'quality_color': quality_color,
                    'block_index': bc_info.get('block_index', '—'),
                    'user': bc_info.get('user', 'system'),
                    'type': 'uploaded',
                })
    
    # Load processed directories
    if PROCESSED_DIR.exists():
        for d in sorted(PROCESSED_DIR.iterdir()):
            if d.is_dir() and not d.name.startswith('.'):
                # Count files inside
                file_count = sum(1 for _ in d.rglob('*') if _.is_file())
                
                datasets.append({
                    'name': d.name + '/',
                    'path': str(d),
                    'size': 0,
                    'size_human': f'{file_count} files',
                    'modified': datetime.fromtimestamp(d.stat().st_mtime).strftime('%Y-%m-%d %H:%M'),
                    'hash': '—',
                    'status': 'Processed',
                    'status_color': 'blue',
                    'quality': 'Processed',
                    'quality_color': 'blue',
                    'block_index': '—',
                    'user': 'system',
                    'type': 'processed',
                })
    
    return datasets


# ============================================================
# PAGE CREATOR
# ============================================================

def create_datasets_page():
    
    @ui.page('/datasets')
    def datasets():
        ui.dark_mode().enable()
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
            
            body, .q-page { 
                font-family: 'Inter', sans-serif !important;
                background: #0A0E1A !important; 
            }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            .mono { font-family: 'JetBrains Mono', monospace !important; word-break: break-all; }
            
            .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 0;
                border-left: 3px solid #38BDF8;
                padding-left: 16px;
                margin-bottom: 20px;
            }
            
            .dataset-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border: 1px solid rgba(56, 189, 248, 0.2) !important;
                border-radius: 12px !important;
                padding: 20px !important;
                transition: all 0.3s ease;
            }
            
            .dataset-card:hover {
                border-color: rgba(56, 189, 248, 0.6) !important;
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(56, 189, 248, 0.1);
            }
            
            .stat-mini {
                background: rgba(15, 23, 42, 0.6);
                border-radius: 8px;
                padding: 12px 16px;
                border: 1px solid rgba(56, 189, 248, 0.15);
            }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'), 
                    ('Datasets', '/datasets'),
                    ('Blockchain', '/blockchain'), 
                    ('Trust', '/trust'),
                    ('XAI', '/xai'),
                    ('Upload', '/upload'),
                ]:
                    active = path == '/datasets'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        all_datasets = load_datasets()
        
        # Main content
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('storage').classes('text-cyan-400 text-4xl')
                    ui.label('Dataset Library').classes('text-cyan-400 font-bold text-4xl')
                ui.label('Browse, verify, and manage AI datasets · Blockchain-verified hashes').classes('text-gray-400 text-sm')
            
            # Stats
            total_size = sum(d['size'] for d in all_datasets if d['type'] == 'uploaded')
            verified = sum(1 for d in all_datasets if d['status'] == 'Verified')
            pending = sum(1 for d in all_datasets if d['status'] == 'Pending')
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Total Datasets', str(len(all_datasets)), '#38BDF8', 'folder'),
                    ('Total Size', format_size(total_size), '#8B5CF6', 'storage'),
                    ('Verified', str(verified), '#10B981', 'verified'),
                    ('Pending', str(pending), '#F59E0B', 'schedule'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Search + Filter
            with ui.row().classes('w-full gap-3 items-center'):
                search_input = ui.input(placeholder='🔍 Search datasets...').classes('flex-1').style(
                    'background: rgba(15, 23, 42, 0.8); border: 1px solid #252540; border-radius: 8px;'
                )
                ui.button('+ Upload New', on_click=lambda: ui.navigate.to('/upload')).classes(
                    'px-5 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
            
            # Dataset list container
            datasets_container = ui.column().classes('w-full gap-3')
            
            def render_datasets(filter_text=''):
                datasets_container.clear()
                
                filtered = all_datasets
                if filter_text:
                    filter_text = filter_text.lower()
                    filtered = [d for d in all_datasets if filter_text in d['name'].lower()]
                
                if not filtered:
                    with datasets_container:
                        with ui.card().classes('w-full p-12').style(
                            'background: rgba(15, 23, 42, 0.4); border: 2px dashed #38BDF8; border-radius: 12px;'
                        ):
                            with ui.column().classes('items-center gap-2'):
                                ui.icon('search_off').classes('text-gray-500 text-5xl')
                                ui.label('No datasets match your search').classes('text-gray-400 text-lg')
                    return
                
                with datasets_container:
                    for ds in filtered:
                        with ui.card().classes('dataset-card w-full'):
                            with ui.row().classes('w-full items-center justify-between'):
                                # Left: info
                                with ui.row().classes('items-center gap-4'):
                                    ui.icon('folder' if ds['type'] == 'uploaded' else 'inventory_2').classes('text-cyan-400 text-3xl')
                                    with ui.column().classes('gap-0'):
                                        ui.label(ds['name']).classes('text-white font-bold text-base')
                                        ui.label(f"{ds['size_human']} · {ds['modified']}").classes('text-gray-500 text-xs')
                                
                                # Right: badges + hash
                                with ui.row().classes('items-center gap-3'):
                                    # Quality
                                    ui.html(f'<div style="background: rgba(56, 189, 248, 0.15); color: {ds["quality_color"]}; padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">{ds["quality"]}</div>')
                                    
                                    # Status
                                    ui.html(f'<div style="background: rgba(56, 189, 248, 0.15); color: {ds["status_color"]}; padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">{ds["status"]}</div>')
                                    
                                    ui.icon('chevron_right').classes('text-gray-500')
                            
                            # Hash row
                            if ds['hash'] and ds['hash'] != 'Not in blockchain':
                                with ui.row().classes('w-full items-center gap-3 mt-3 pt-3').style('border-top: 1px solid rgba(56, 189, 248, 0.1);'):
                                    ui.icon('fingerprint').classes('text-purple-400 text-sm')
                                    with ui.column().classes('gap-0 flex-1'):
                                        ui.label(f"SHA-256: {ds['hash']}").classes('text-gray-400 text-xs mono')
                                        if ds['block_index'] != '—':
                                            ui.label(f"Block #{ds['block_index']} · {ds['user']}").classes('text-gray-600 text-xs')
            
            render_datasets()
            search_input.on('update:model-value', lambda: render_datasets(search_input.value))
            
            # Info section
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('About Dataset Verification').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color, icon in [
                        ('1', 'SHA-256 Hash', 'Every dataset gets a unique hash', '#38BDF8', 'fingerprint'),
                        ('2', 'Blockchain Record', 'Hash stored immutably on chain', '#8B5CF6', 'link'),
                        ('3', 'Quality Check', 'Automatic quality assessment', '#10B981', 'analytics'),
                        ('4', 'Trust Score', 'Weighted trust evaluation', '#F59E0B', 'verified_user'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/datasets')).classes(
                    'px-6 py-2 rounded-lg text-sm font-medium'
                ).style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
                
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes(
                    'px-6 py-2 rounded-lg text-sm font-medium'
                ).style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                
                ui.button('📤 Upload', on_click=lambda: ui.navigate.to('/upload')).classes(
                    'px-6 py-2 rounded-lg text-sm font-medium'
                ).style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')


# Register
create_datasets_page()
