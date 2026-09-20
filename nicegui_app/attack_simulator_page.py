"""NiceGUI Attack Simulator Page - Interactive"""
from nicegui import ui
from styles import apply_styles
import sys
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from attack_simulator.simulator import AttackSimulator
    SIMULATOR_OK = True
except Exception as e:
    print(f"Simulator import error: {e}")
    SIMULATOR_OK = False

RESULTS_DIR = PROJECT_ROOT / 'attack_simulator' / 'results'
SAMPLE_IMAGES_DIR = PROJECT_ROOT / 'datasets' / 'uploaded' / 'extracted' / 'images'


def create_attack_simulator_page():
    
    @ui.page('/attack-simulator')
    def attack_simulator():
        apply_styles(ui)
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body, .q-page { font-family: 'Inter', sans-serif !important; background: #0A0E1A !important; }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            .section-title { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-left: 3px solid #EF4444; padding-left: 16px; margin-bottom: 20px; }
            .attack-card { background: rgba(15, 23, 42, 0.6) !important; border-radius: 12px !important; padding: 20px !important; border: 2px solid; }
            .img-preview { border-radius: 8px; width: 100%; height: 200px; object-fit: cover; }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(239, 68, 68, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #EF4444, #DC2626); display: flex; align-items: center; justify-content: center; font-size: 1rem;">⚔️</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [('Home', '/'), ('Cyber', '/cybersecurity'), ('Backdoor', '/backdoor'), ('Attack Sim', '/attack-simulator')]:
                    active = path == '/attack-simulator'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes('text-white' if active else 'text-gray-400')
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('flash_on').classes('text-red-400 text-4xl')
                    ui.label('Attack Simulator').classes('text-red-400 font-bold text-4xl')
                ui.label('Reproducible attacks · Before/after comparison · Poisoning scenarios').classes('text-gray-400 text-sm')
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [('Attack Types', '6', '#EF4444', 'bug_report'), ('Scenarios', '3', '#F59E0B', 'psychology'), ('Reproducible', 'Yes', '#10B981', 'check_circle'), ('Offline', 'Yes', '#38BDF8', 'wifi_off')]:
                    with ui.card().classes('p-5').style(f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Interactive Attack Runner
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('⚡').classes('text-xl')
                    ui.label('Run Attack').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-6').style('background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px;'):
                    # Select image
                    sample_images = sorted(SAMPLE_IMAGES_DIR.glob('*.jpg'))[:20] if SAMPLE_IMAGES_DIR.exists() else []
                    image_options = {str(f.name): str(f) for f in sample_images}
                    
                    if not image_options:
                        ui.label('No sample images found').classes('text-gray-400 text-sm')
                    else:
                        with ui.row().classes('w-full gap-4 items-end'):
                            image_select = ui.select(
                                options=list(image_options.keys()),
                                value=list(image_options.keys())[0],
                                label='Select Image'
                            ).classes('flex-1')
                            
                            attack_select = ui.select(
                                options=['blur', 'noise', 'brightness', 'contrast', 'rotation', 'duplicate', 'ALL'],
                                value='ALL',
                                label='Attack Type'
                            ).classes('flex-1')
                            
                            def run_attack():
                                selected_img = image_options[image_select.value]
                                attack = attack_select.value
                                
                                if not SIMULATOR_OK:
                                    ui.notify('❌ Simulator not available', type='negative')
                                    return
                                
                                sim = AttackSimulator()
                                
                                if attack == 'ALL':
                                    results = sim.run_all_attacks(selected_img)
                                    success = sum(1 for r in results.values() if r['status'] == 'SUCCESS')
                                    ui.notify(f'✅ {success}/6 attacks completed', type='positive')
                                else:
                                    attack_func = getattr(sim, f'run_{attack}_attack', None)
                                    if attack_func:
                                        attack_func(selected_img)
                                        ui.notify(f'✅ {attack} attack completed', type='positive')
                                    else:
                                        ui.notify(f'❌ Attack {attack} not found', type='negative')
                                
                                sim.save_report()
                            
                            ui.button('▶ Run Attack', on_click=run_attack).classes('px-6 py-2').style('background: linear-gradient(135deg, #EF4444, #DC2626); color: white;')
                        
                        # Original image preview
                        with ui.row().classes('w-full gap-4 mt-6'):
                            with ui.column().classes('flex-1'):
                                ui.label('ORIGINAL').classes('text-gray-500 text-xs tracking-wider mb-2')
                                orig_path = Path(image_options[image_select.value])
                                rel_orig = orig_path.relative_to(PROJECT_ROOT)
                                ui.image(f'/{rel_orig}').classes('img-preview')
            
            # Attack Types
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('⚔️').classes('text-xl')
                    ui.label('Attack Types').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 flex-wrap justify-center'):
                    for name, desc, color, icon in [
                        ('Blur', 'Gaussian blur', '#3B82F6', 'blur_on'),
                        ('Noise', 'Random noise', '#8B5CF6', 'grain'),
                        ('Brightness', 'Brightness change', '#F59E0B', 'brightness_high'),
                        ('Contrast', 'Contrast change', '#10B981', 'contrast'),
                        ('Rotation', 'Image rotation', '#EF4444', 'rotate_right'),
                        ('Duplicate', 'Near-duplicates', '#EC4899', 'content_copy'),
                    ]:
                        with ui.card().classes('attack-card').style(f'border-color: {color}; min-width: 160px;'):
                            with ui.column().classes('items-center gap-1'):
                                ui.icon(icon).classes('text-3xl').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-sm')
                                ui.label(desc).classes('text-gray-500 text-xs')
            
            # Generated Results
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📸').classes('text-xl')
                    ui.label('Generated Attack Images').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-5').style('background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px;'):
                    generated = sorted(RESULTS_DIR.glob('*.jpg'), key=lambda p: p.stat().st_mtime, reverse=True)[:6] if RESULTS_DIR.exists() else []
                    
                    if not generated:
                        ui.label('No attack images generated yet. Run an attack above.').classes('text-gray-400 text-sm')
                    else:
                        with ui.row().classes('w-full gap-4 flex-wrap'):
                            for img_path in generated:
                                with ui.column().classes('items-center').style('flex: 0 0 calc(33.33% - 16px);'):
                                    rel = img_path.relative_to(PROJECT_ROOT)
                                    ui.image(f'/{rel}').classes('img-preview')
                                    name = img_path.stem.replace('000000196843_', '')
                                    ui.label(name.upper()).classes('text-gray-400 text-xs mt-2')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/attack-simulator')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #EF4444, #DC2626); color: white;')
                ui.button('🛡️ Cybersecurity', on_click=lambda: ui.navigate.to('/cybersecurity')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


create_attack_simulator_page()
