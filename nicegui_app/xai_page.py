"""
NiceGUI XAI Visualizer Page
Real GradCAM heatmaps from outputs/xai_heatmaps/
"""

from nicegui import ui
from styles import apply_styles
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
XAI_HEATMAPS = PROJECT_ROOT / 'outputs' / 'xai_heatmaps'


def get_heatmap_files():
    """Get all heatmap files grouped by image."""
    if not XAI_HEATMAPS.exists():
        return {}
    
    heatmaps = {}
    for f in sorted(XAI_HEATMAPS.glob('*.jpg')):
        parts = f.stem.split('_')
        if len(parts) >= 3:
            image_id = parts[1]
            if image_id not in heatmaps:
                heatmaps[image_id] = []
            heatmaps[image_id].append(f)
    
    return heatmaps


def create_xai_page():
    
    @ui.page('/xai')
    def xai():
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body, .q-page { font-family: 'Inter', sans-serif !important; background: #0A0E1A !important; }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            .section-title { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-left: 3px solid #8B5CF6; padding-left: 16px; margin-bottom: 20px; }
            .heatmap-img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; }
            .badge-purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; display: inline-block; }
            .info-box { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 16px; }
        </style>
        ''')
        
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(139, 92, 246, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [('Home', '/'), ('Blockchain', '/blockchain'), ('Trust', '/trust'), ('XAI', '/xai'), ('Upload', '/upload')]:
                    active = path == '/xai'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        heatmaps = get_heatmap_files()
        
        # Main content
        with ui.column().classes('w-full px-8 py-8 gap-8'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('psychology').classes('text-purple-400 text-4xl')
                    ui.label('Explainable AI Visualizer').classes('text-purple-400 font-bold text-4xl')
                ui.label('GradCAM heatmaps · Model decision explainability · Real-time visualization').classes('text-gray-400 text-sm')
            
            # Stats
            total_heatmaps = sum(len(v) for v in heatmaps.values())
            total_images = len(heatmaps)
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Total Images', str(total_images), '#8B5CF6', 'image'),
                    ('Heatmaps', str(total_heatmaps), '#3B82F6', 'whatshot'),
                    ('Model', 'YOLOv8n', '#10B981', 'model_training'),
                    ('Method', 'GradCAM', '#F59E0B', 'psychology'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Info
            with ui.card().classes('w-full p-5 info-box'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('info').classes('text-purple-400 text-2xl')
                    with ui.column().classes('gap-0'):
                        ui.label('How GradCAM Works').classes('text-white font-bold text-sm')
                        ui.label('GradCAM uses gradients flowing into the final convolutional layer to produce a coarse localization map highlighting important regions in the image.').classes('text-gray-400 text-xs')
            
            # Gallery
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔥').classes('text-xl')
                    ui.label('GradCAM Heatmap Gallery').classes('text-white font-bold text-lg')
                    ui.label(f'({total_heatmaps} heatmaps from {total_images} images)').classes('text-gray-500 text-sm ml-2')
                
                if not heatmaps:
                    with ui.card().classes('w-full p-12').style(
                        'background: rgba(15, 23, 42, 0.6); border: 2px dashed #8B5CF6; border-radius: 12px;'
                    ):
                        with ui.column().classes('items-center gap-3'):
                            ui.icon('image_not_supported').classes('text-gray-500 text-5xl')
                            ui.label('No heatmaps found').classes('text-white font-bold text-lg')
                            ui.label(f'Expected: {XAI_HEATMAPS}').classes('text-gray-500 text-xs')
                else:
                    for image_id, files in list(heatmaps.items())[:5]:
                        with ui.card().classes('w-full p-5').style(
                            'background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px;'
                        ):
                            with ui.row().classes('w-full items-center justify-between mb-4'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('image').classes('text-purple-400')
                                    ui.label(f'Image ID: {image_id}').classes('text-white font-bold text-sm')
                                ui.html(f'<div class="badge-purple">{len(files)} variants</div>')
                            
                            with ui.row().classes('w-full gap-4'):
                                for f in files[:4]:
                                    with ui.column().classes('items-center gap-2').style('flex: 1;'):
                                        rel_path = f.relative_to(PROJECT_ROOT)
                                        ui.image(f'/{rel_path}').classes('heatmap-img')
                                        parts = f.stem.split('_')
                                        ts = parts[2] if len(parts) > 2 else 'N/A'
                                        ui.label(ts).classes('text-gray-500 text-xs')
                                        ui.html('<div class="badge-purple">GradCAM</div>')
            
            # Methods
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📚').classes('text-xl')
                    ui.label('XAI Methods Used').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for name, desc, color, icon in [
                        ('GradCAM', 'Gradient-weighted Class Activation Mapping', '#8B5CF6', 'whatshot'),
                        ('SHAP', 'SHapley Additive exPlanations', '#3B82F6', 'bar_chart'),
                        ('LIME', 'Local Interpretable Model-agnostic Explanations', '#10B981', 'analytics'),
                    ]:
                        with ui.card().classes('flex-1 p-5').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}30; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-3'):
                                ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-base')
                            ui.label(desc).classes('text-gray-400 text-xs')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/xai')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white;')
                ui.button('📊 Trust Score', on_click=lambda: ui.navigate.to('/trust')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')


create_xai_page()
