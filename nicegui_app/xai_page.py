"""
NiceGUI XAI Visualizer Page
Real GradCAM heatmaps from outputs/xai_heatmaps/
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
from pathlib import Path
from datetime import datetime

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
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
                ui.label('AI TRUST PLATFORM').classes('text-gray-500 text-xs tracking-wider')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('XAI', '/xai'),
                    ('Upload', '/upload'),
                ]:
                    active = path == '/xai'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
            
            with ui.row().classes('items-center gap-3'):
                ui.icon('notifications_none').classes('text-gray-400')
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.75rem;">AT</div>')
        
        # Load data
        heatmaps = get_heatmap_files()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '🧠', 'Explainable AI Visualizer', 'GradCAM heatmaps · Model decision explainability · Real-time visualization', '#8B5CF6')
            
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
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Info
            with ui.card().classes('w-full p-5').style('border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;'):
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
                    with ui.card().classes('w-full p-12').style('border: 2px dashed #8B5CF6; border-radius: 12px;'):
                        with ui.column().classes('items-center gap-3'):
                            ui.icon('image_not_supported').classes('text-gray-500 text-5xl')
                            ui.label('No heatmaps found').classes('text-white font-bold text-lg')
                            ui.label(f'Expected: {XAI_HEATMAPS}').classes('text-gray-500 text-xs')
                else:
                    for image_id, files in list(heatmaps.items())[:5]:
                        with ui.card().classes('w-full p-5').style('border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px;'):
                            with ui.row().classes('w-full items-center justify-between mb-4'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('image').classes('text-purple-400')
                                    ui.label(f'Image ID: {image_id}').classes('text-white font-bold text-sm')
                                ui.html(f'<div style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">{len(files)} variants</div>')
                            
                            with ui.row().classes('w-full gap-4'):
                                for f in files[:4]:
                                    with ui.column().classes('items-center gap-2').style('flex: 1;'):
                                        rel_path = f.relative_to(PROJECT_ROOT)
                                        ui.image(f'/{rel_path}').style('width: 100%; height: 180px; object-fit: cover; border-radius: 8px;')
                                        parts = f.stem.split('_')
                                        ts = parts[2] if len(parts) > 2 else 'N/A'
                                        ui.label(ts).classes('text-gray-500 text-xs')
                                        ui.html('<div style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; display: inline-block;">GradCAM</div>')
            
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
                        with ui.card().classes('flex-1 p-5').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            with ui.row().classes('items-center gap-2 mb-3'):
                                ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-base')
                            ui.label(desc).classes('text-gray-400 text-xs')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/xai')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white;')
                
                ui.button('📊 Trust Score', on_click=lambda: ui.navigate.to('/trust')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')
                
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')


create_xai_page()