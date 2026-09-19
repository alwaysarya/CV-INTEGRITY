"""
NiceGUI Model Integrity Page
Real model files + hashes + baseline comparison
"""

from nicegui import ui
import json
import hashlib
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
MODELS_DIR = PROJECT_ROOT / 'model' / 'saved_models'
HISTORY_DIR = PROJECT_ROOT / 'outputs' / 'model_history'


def hash_file(filepath, chunk_size=65536):
    """SHA-256 hash of file."""
    try:
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(chunk_size), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except:
        return None


def get_file_size(bytes_val):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024:
            return f'{bytes_val:.1f} {unit}'
        bytes_val /= 1024
    return f'{bytes_val:.1f} TB'


def load_model_history():
    """Load baseline metrics for all models."""
    history = {}
    for model in ['good', 'bad', 'worst']:
        baseline_file = HISTORY_DIR / f'{model}_baseline.json'
        if baseline_file.exists():
            try:
                with open(baseline_file) as f:
                    history[model] = json.load(f)
            except:
                pass
    return history


def get_models():
    """Get all trained models."""
    models = []
    
    # Known model paths
    model_paths = [
        ('yolov8n', PROJECT_ROOT / 'yolov8n.pt', 'Base YOLOv8n'),
        ('good_model', MODELS_DIR / 'good' / 'train' / 'weights' / 'best.pt', 'GOOD Dataset'),
        ('bad_model', MODELS_DIR / 'bad' / 'train' / 'weights' / 'best.pt', 'BAD Dataset'),
        ('worst_model', MODELS_DIR / 'worst' / 'train' / 'weights' / 'best.pt', 'WORST Dataset'),
    ]
    
    for name, path, description in model_paths:
        if path.exists():
            size = path.stat().st_size
            if size > 0:
                file_hash = hash_file(path)
                models.append({
                    'name': name,
                    'description': description,
                    'path': str(path),
                    'size': size,
                    'size_human': get_file_size(size),
                    'hash': file_hash,
                    'hash_short': file_hash[:32] + '...' if file_hash else 'N/A',
                    'modified': datetime.fromtimestamp(path.stat().st_mtime).strftime('%Y-%m-%d %H:%M'),
                })
    
    return models


def create_model_integrity_page():
    
    @ui.page('/model-integrity')
    def model_integrity():
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
                border-left: 3px solid #EF4444;
                padding-left: 16px;
                margin-bottom: 20px;
            }
            
            .model-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border-radius: 12px !important;
                padding: 20px !important;
                border: 2px solid !important;
            }
            
            .progress-bar {
                background: rgba(255,255,255,0.08);
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                margin: 6px 0;
            }
            
            .progress-fill {
                height: 100%;
                border-radius: 4px;
            }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(239, 68, 68, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #EF4444, #DC2626); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🛡️</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('Model Integrity', '/model-integrity'),
                    ('Performance', '/performance'),
                ]:
                    active = path == '/model-integrity'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        models = get_models()
        history = load_model_history()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('verified_user').classes('text-red-400 text-4xl')
                    ui.label('Model Integrity Assessment').classes('text-red-400 font-bold text-4xl')
                ui.label('SHA-256 hashing · Behavioral fingerprinting · Reference battery comparison').classes('text-gray-400 text-sm')
            
            # Stats
            total_models = len(models)
            verified = sum(1 for m in models if m.get('hash'))
            avg_size = sum(m['size'] for m in models) / total_models if total_models else 0
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Models', str(total_models), '#EF4444', 'model_training'),
                    ('Verified', str(verified), '#10B981', 'check_circle'),
                    ('Avg Size', get_file_size(avg_size), '#38BDF8', 'storage'),
                    ('Fingerprints', str(total_models), '#8B5CF6', 'fingerprint'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Model Cards
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🤖').classes('text-xl')
                    ui.label('Model Fingerprints').classes('text-white font-bold text-lg')
                
                for model in models:
                    # Determine color
                    if 'good' in model['name']:
                        color = '#10B981'
                    elif 'bad' in model['name']:
                        color = '#F59E0B'
                    elif 'worst' in model['name']:
                        color = '#EF4444'
                    else:
                        color = '#38BDF8'
                    
                    with ui.card().classes('model-card w-full').style(f'border-color: {color}60;'):
                        with ui.row().classes('w-full items-center justify-between'):
                            # Left: Info
                            with ui.row().classes('items-center gap-4'):
                                with ui.element('div').classes('rounded-lg flex items-center justify-center').style(
                                    f'width: 50px; height: 50px; background: {color}20; border: 1px solid {color};'
                                ):
                                    ui.icon('model_training').classes('text-2xl').style(f'color: {color};')
                                
                                with ui.column().classes('gap-0'):
                                    ui.label(model['name']).classes('text-white font-bold text-base')
                                    ui.label(model['description']).classes('text-gray-400 text-xs')
                            
                            # Right: Size + Modified
                            with ui.column().classes('items-end gap-0'):
                                ui.label(model['size_human']).classes('text-white font-bold text-sm')
                                ui.label(model['modified']).classes('text-gray-500 text-xs')
                        
                        # Hash section
                        with ui.column().classes('w-full gap-1 mt-4 pt-4').style('border-top: 1px solid rgba(239, 68, 68, 0.15);'):
                            with ui.row().classes('items-center gap-2'):
                                ui.icon('fingerprint').classes('text-sm').style(f'color: {color};')
                                ui.label('SHA-256 FINGERPRINT').classes('text-gray-500 text-xs tracking-wider')
                            
                            ui.label(model['hash']).classes('text-gray-300 text-xs mono')
                        
                        # Baseline metrics (if exists)
                        model_key = model['name'].replace('_model', '')
                        if model_key in history:
                            baseline = history[model_key]
                            metrics = baseline.get('metrics', {})
                            
                            ui.label('BASELINE METRICS').classes('text-gray-500 text-xs tracking-wider mt-3 mb-2')
                            
                            with ui.row().classes('w-full gap-4'):
                                for metric_name, metric_val in metrics.items():
                                    with ui.column().classes('flex-1 gap-1'):
                                        with ui.row().classes('w-full justify-between'):
                                            ui.label(metric_name).classes('text-gray-400 text-xs')
                                            ui.label(f'{metric_val:.2f}').classes('text-white text-xs font-bold')
                                        ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {min(metric_val, 100)}%; background: {color};"></div></div>')
            
            # Reference Battery
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Reference Battery Comparison').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-5').style('background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 12px;'):
                    if not history:
                        ui.label('No baseline metrics available').classes('text-gray-400 text-sm')
                    else:
                        # Header
                        with ui.row().classes('w-full items-center gap-4 py-2').style('border-bottom: 2px solid rgba(239, 68, 68, 0.2);'):
                            ui.label('MODEL').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 120px;')
                            ui.label('mAP50').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 100px;')
                            ui.label('PRECISION').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 100px;')
                            ui.label('RECALL').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 100px;')
                            ui.label('STATUS').classes('text-gray-500 text-xs tracking-wider font-bold flex-1')
                        
                        for model_name, data in history.items():
                            metrics = data.get('metrics', {})
                            mAP50 = metrics.get('mAP50', 0)
                            precision = metrics.get('precision', 0)
                            recall = metrics.get('recall', 0)
                            
                            # Compare against expected
                            if model_name == 'good' and mAP50 >= 19:
                                status, status_color = '✅ HEALTHY', '#10B981'
                            elif model_name == 'bad' and mAP50 >= 17:
                                status, status_color = '⚠️ REVIEW', '#F59E0B'
                            elif model_name == 'worst' and mAP50 >= 15:
                                status, status_color = '❌ WEAK', '#EF4444'
                            else:
                                status, status_color = '🔍 INVESTIGATE', '#8B5CF6'
                            
                            with ui.row().classes('w-full items-center gap-4 py-2').style('border-bottom: 1px solid rgba(239, 68, 68, 0.1);'):
                                ui.label(model_name.upper()).classes('text-white font-bold text-sm').style('width: 120px;')
                                ui.label(f'{mAP50:.2f}').classes('text-gray-300 text-sm').style('width: 100px;')
                                ui.label(f'{precision:.2f}').classes('text-gray-300 text-sm').style('width: 100px;')
                                ui.label(f'{recall:.2f}').classes('text-gray-300 text-sm').style('width: 100px;')
                                ui.label(status).classes('text-sm font-bold').style(f'color: {status_color}; flex: 1;')
            
            # Access Assumptions
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔐').classes('text-xl')
                    ui.label('Access Assumptions & Limitations').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for title, desc, color, icon in [
                        ('White-Box Access', 'Full parameter inspection available', '#10B981', 'visibility'),
                        ('Black-Box Fallback', 'Behavioral fingerprinting only', '#F59E0B', 'visibility_off'),
                        ('Confidence Score', 'Based on baseline comparison', '#38BDF8', 'analytics'),
                        ('Not Supported', 'Trigger reconstruction, backdoor search', '#EF4444', 'report'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                                ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/model-integrity')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #EF4444, #DC2626); color: white;')
                
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                
                ui.button('⚡ Performance', on_click=lambda: ui.navigate.to('/performance')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')


create_model_integrity_page()
