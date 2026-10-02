"""
NiceGUI Robustness Testing Page
Real data from outputs/reports/robustness_results.json
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
ROBUSTNESS_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'robustness_results.json'


def load_robustness():
    if not ROBUSTNESS_FILE.exists():
        return None
    try:
        with open(ROBUSTNESS_FILE) as f:
            return json.load(f)
    except:
        return None


def create_robustness_page():
    
    @ui.page('/robustness')
    def robustness():
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(245, 158, 11, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #F59E0B, #D97706); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧪</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Datasets', '/datasets'),
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('Robust', '/robustness'),
                ]:
                    active = path == '/robustness'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        data = load_robustness()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '🧪', 'Robustness Testing', 'Stress testing models under adversarial conditions · Real attack simulation', '#F59E0B')
            
            if not data:
                with ui.card().classes('w-full p-12').style('border: 2px dashed #F59E0B; border-radius: 12px;'):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No robustness data found').classes('text-gray-400 text-lg')
                return
            
            all_models = list(data.keys())
            avg_all = sum(data[m].get('average_robustness', 0) for m in all_models) / len(all_models) if all_models else 0
            total_samples = sum(data[m].get('samples_tested', 0) for m in all_models)
            total_attacks = 6
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Models Tested', str(len(all_models)), '#38BDF8', 'model_training'),
                    ('Samples', str(total_samples), '#8B5CF6', 'image'),
                    ('Attack Types', str(total_attacks), '#EF4444', 'flash_on'),
                    ('Avg Robustness', f'{avg_all:.1f}%', '#F59E0B', 'shield'),
                ]:
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Model cards
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Model Robustness Scores').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for model_name, metrics in data.items():
                        color = '#10B981' if model_name == 'good' else ('#F59E0B' if model_name == 'bad' else '#EF4444')
                        
                        avg_rob = metrics.get('average_robustness', 0)
                        min_rob = metrics.get('min_robustness', 0)
                        max_rob = metrics.get('max_robustness', 0)
                        samples = metrics.get('samples_tested', 0)
                        
                        with ui.card().classes('flex-1 p-6').style(f'border: 1px solid {color}40; border-radius: 12px; max-width: 400px;'):
                            with ui.row().classes('items-center gap-2 mb-4'):
                                ui.icon('model_training').classes('text-2xl').style(f'color: {color};')
                                ui.label(model_name.upper()).classes('text-white font-bold text-lg')
                                ui.label(f'{samples} samples').classes('text-gray-500 text-xs ml-auto')
                            
                            with ui.column().classes('items-center gap-1 mb-4'):
                                ui.label(f'{avg_rob:.1f}%').classes('font-bold').style(f'color: {color}; font-size: 3rem;')
                                ui.label('AVERAGE ROBUSTNESS').classes('text-gray-500 text-xs tracking-wider')
                            
                            ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {avg_rob}%; background: {color};"></div></div>')
                            
                            with ui.row().classes('w-full gap-3 mt-4'):
                                with ui.column().classes('items-center flex-1'):
                                    ui.label('MIN').classes('text-gray-500 text-xs tracking-wider')
                                    ui.label(f'{min_rob:.1f}%').classes('text-white font-bold text-base')
                                with ui.column().classes('items-center flex-1'):
                                    ui.label('MAX').classes('text-gray-500 text-xs tracking-wider')
                                    ui.label(f'{max_rob:.1f}%').classes('text-white font-bold text-base')
            
            # Attack types
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('⚔️').classes('text-xl')
                    ui.label('Attack Types Tested').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for name, icon, color in [
                        ('Brightness', 'flash_on', '#F59E0B'),
                        ('Darkness', 'nightlight', '#3B82F6'),
                        ('Blur', 'blur_on', '#8B5CF6'),
                        ('Noise', 'grain', '#10B981'),
                        ('Rotation', 'rotate_right', '#EF4444'),
                        ('Original', 'image', '#38BDF8'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {color}40; border-radius: 12px; text-align: center;'):
                            ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                            ui.label(name).classes('text-white font-bold text-sm')
            
            # Per-model detailed breakdown
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔬').classes('text-xl')
                    ui.label('Detailed Model Analysis').classes('text-white font-bold text-lg')
                
                for model_name, metrics in data.items():
                    color = '#10B981' if model_name == 'good' else ('#F59E0B' if model_name == 'bad' else '#EF4444')
                    details = metrics.get('details', {})
                    
                    with ui.card().classes('w-full p-5').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                        with ui.row().classes('w-full items-center justify-between mb-4'):
                            with ui.row().classes('items-center gap-2'):
                                ui.icon('analytics').classes('text-xl').style(f'color: {color};')
                                ui.label(model_name.upper()).classes('text-white font-bold text-base')
                            ui.label(f'{len(details)} images tested').classes('text-gray-500 text-xs')
                        
                        with ui.column().classes('w-full gap-2'):
                            for img_name, img_data in list(details.items())[:5]:
                                rob_score = img_data.get('robustness_score', 0)
                                predictions = img_data.get('predictions', {})
                                
                                if rob_score > 50:
                                    score_color = '#10B981'
                                elif rob_score > 25:
                                    score_color = '#F59E0B'
                                else:
                                    score_color = '#EF4444'
                                
                                with ui.row().classes('w-full items-center gap-3 py-2').style('border-bottom: 1px solid rgba(245, 158, 11, 0.1);'):
                                    ui.icon('image').classes('text-gray-500 text-sm')
                                    ui.label(img_name).classes('text-gray-400 text-xs mono').style('width: 200px;')
                                    
                                    ui.html(f'<div class="progress-bar" style="flex: 1;"><div class="progress-fill" style="width: {rob_score}%; background: {score_color};"></div></div>')
                                    
                                    ui.label(f'{rob_score:.1f}%').classes('text-xs font-bold').style(f'color: {score_color}; width: 60px;')
                                    
                                    with ui.row().classes('items-center gap-2').style('width: 200px;'):
                                        for attack_name in ['brightness', 'darkness', 'blur', 'noise', 'rotation']:
                                            attack_data = predictions.get(attack_name, {})
                                            count = attack_data.get('count', 0)
                                            if count > 0:
                                                ui.label('●').classes('text-xs').style(f'color: {color};')
                                            else:
                                                ui.label('○').classes('text-xs text-gray-700')
            
            # Info section
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('How Robustness Testing Works').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color, icon in [
                        ('1', 'Baseline', 'Original prediction', '#38BDF8', 'image'),
                        ('2', 'Apply Attacks', '6 transformations', '#F59E0B', 'flash_on'),
                        ('3', 'Compare', 'Performance under stress', '#8B5CF6', 'compare_arrows'),
                        ('4', 'Score', 'Robustness percentage', '#10B981', 'verified'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/robustness')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #F59E0B, #D97706); color: white;')
                
                ui.button('🛡️ Cybersecurity', on_click=lambda: ui.navigate.to('/cybersecurity')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid #EF4444;')
                
                ui.button('📊 Analytics', on_click=lambda: ui.navigate.to('/analytics')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


# Register
create_robustness_page()