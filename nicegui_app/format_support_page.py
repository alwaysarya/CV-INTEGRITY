"""
NiceGUI Format Support Page
ONNX + COCO + PyTorch format compatibility
"""

from nicegui import ui
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def create_format_support_page():
    
    @ui.page('/formats')
    def formats():
        ui.dark_mode().enable()
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body, .q-page { font-family: 'Inter', sans-serif !important; background: #0A0E1A !important; }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            .section-title { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-left: 3px solid #38BDF8; padding-left: 16px; margin-bottom: 20px; }
            .format-card { background: rgba(15, 23, 42, 0.6) !important; border-radius: 12px !important; padding: 20px !important; border: 2px solid; }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; font-size: 1rem;">📦</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Datasets', '/datasets'),
                    ('Formats', '/formats'),
                    ('Reports', '/reports'),
                ]:
                    active = path == '/formats'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('extension').classes('text-cyan-400 text-4xl')
                    ui.label('Format Support').classes('text-cyan-400 font-bold text-4xl')
                ui.label('COCO · YOLO · ONNX · PyTorch · TorchScript — Air-gapped · No cloud').classes('text-gray-400 text-sm')
            
            # Model Formats
            with ui.column().classes('w-full gap-4 mt-2'):
                with ui.element('div').classes('section-title'):
                    ui.label('🤖').classes('text-xl')
                    ui.label('Model Format Support').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    model_formats = [
                        ('ONNX', '.onnx', 'Full metadata parsing', True, '#10B981', 'memory'),
                        ('PyTorch', '.pt / .pth', 'Native loading', True, '#10B981', 'memory'),
                        ('TorchScript', '.ts', 'Via torch.jit', True, '#10B981', 'memory'),
                        ('TensorFlow', '.pb / .h5', 'Not in scope', False, '#EF4444', 'block'),
                    ]
                    for name, ext, notes, supported, color, icon in model_formats:
                        with ui.card().classes('format-card flex-1').style(f'border-color: {color}60; max-width: 280px;'):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-base')
                            ui.label(ext).classes('text-gray-400 text-xs mono mb-2')
                            ui.label(notes).classes('text-gray-500 text-xs')
                            with ui.row().classes('items-center gap-1 mt-3'):
                                ui.icon('check_circle' if supported else 'cancel').classes('text-sm').style(f'color: {color};')
                                ui.label('Supported' if supported else 'Not Supported').classes('text-xs font-bold').style(f'color: {color};')
            
            # Dataset Formats
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Dataset Format Support').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    dataset_formats = [
                        ('COCO', 'JSON annotations', 'Full parsing', True, '#10B981', 'description'),
                        ('YOLO', 'YAML + txt labels', 'Full parsing', True, '#10B981', 'description'),
                        ('Pascal VOC', 'XML annotations', 'Partial', False, '#F59E0B', 'warning'),
                        ('Custom', 'Adapter required', 'Not supported', False, '#EF4444', 'block'),
                    ]
                    for name, ext, notes, supported, color, icon in dataset_formats:
                        with ui.card().classes('format-card flex-1').style(f'border-color: {color}60; max-width: 280px;'):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-base')
                            ui.label(ext).classes('text-gray-400 text-xs mono mb-2')
                            ui.label(notes).classes('text-gray-500 text-xs')
                            with ui.row().classes('items-center gap-1 mt-3'):
                                ui.icon('check_circle' if supported else 'cancel').classes('text-sm').style(f'color: {color};')
                                ui.label('Supported' if supported else 'Not Supported').classes('text-xs font-bold').style(f'color: {color};')
            
            # Live Detection Demo
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('⚡').classes('text-xl')
                    ui.label('Live Format Detection').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-6').style('background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'):
                    ui.label('Detected formats in project:').classes('text-white font-bold text-sm mb-4')
                    
                    with ui.row().classes('w-full gap-4'):
                        # Model files
                        with ui.column().classes('flex-1 gap-2'):
                            ui.label('MODEL FILES').classes('text-gray-500 text-xs tracking-wider')
                            for model_file in ['yolov8n.pt', 'good_model.pt', 'bad_model.pt']:
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('check_circle').classes('text-green-400 text-xs')
                                    ui.label(model_file).classes('text-gray-300 text-xs mono')
                        
                        # Dataset files
                        with ui.column().classes('flex-1 gap-2'):
                            ui.label('DATASET FILES').classes('text-gray-500 text-xs tracking-wider')
                            for dataset_file in ['good_dataset.zip', 'bad_dataset.zip', 'worst_dataset.zip']:
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('check_circle').classes('text-green-400 text-xs')
                                    ui.label(dataset_file).classes('text-gray-300 text-xs mono')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/formats')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
                ui.button('📊 Datasets', on_click=lambda: ui.navigate.to('/datasets')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                ui.button('📄 Reports', on_click=lambda: ui.navigate.to('/reports')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')


create_format_support_page()
