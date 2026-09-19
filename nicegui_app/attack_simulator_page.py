"""NiceGUI Attack Simulator Page"""
from nicegui import ui
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


def create_attack_simulator_page():
    
    @ui.page('/attack-simulator')
    def attack_simulator():
        ui.dark_mode().enable()
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body, .q-page { font-family: 'Inter', sans-serif !important; background: #0A0E1A !important; }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            .section-title { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-left: 3px solid #EF4444; padding-left: 16px; margin-bottom: 20px; }
            .attack-card { background: rgba(15, 23, 42, 0.6) !important; border-radius: 12px !important; padding: 20px !important; border: 2px solid; }
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
                for label, path in [
                    ('Home', '/'),
                    ('Cyber', '/cybersecurity'),
                    ('Backdoor', '/backdoor'),
                    ('Attack Sim', '/attack-simulator'),
                ]:
                    active = path == '/attack-simulator'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('flash_on').classes('text-red-400 text-4xl')
                    ui.label('Attack Simulator').classes('text-red-400 font-bold text-4xl')
                ui.label('Reproducible attacks · Before/after comparison · Poisoning scenarios').classes('text-gray-400 text-sm')
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Attack Types', '7', '#EF4444', 'bug_report'),
                    ('Scenarios', '3', '#F59E0B', 'psychology'),
                    ('Reproducible', 'Yes', '#10B981', 'check_circle'),
                    ('Offline', 'Yes', '#38BDF8', 'wifi_off'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Attack Types
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('⚔️').classes('text-xl')
                    ui.label('Attack Types').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 flex-wrap justify-center'):
                    attacks = [
                        ('Blur', 'Gaussian blur', '#3B82F6', 'blur_on'),
                        ('Noise', 'Random noise', '#8B5CF6', 'grain'),
                        ('Brightness', 'Brightness change', '#F59E0B', 'brightness_high'),
                        ('Contrast', 'Contrast change', '#10B981', 'contrast'),
                        ('Rotation', 'Image rotation', '#EF4444', 'rotate_right'),
                        ('Duplicate', 'Near-duplicates', '#EC4899', 'content_copy'),
                        ('Label Flip', 'Label poisoning', '#06B6D4', 'swap_horiz'),
                    ]
                    for name, desc, color, icon in attacks:
                        with ui.card().classes('attack-card').style(f'border-color: {color}; min-width: 160px;'):
                            with ui.column().classes('items-center gap-1'):
                                ui.icon(icon).classes('text-3xl').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-sm')
                                ui.label(desc).classes('text-gray-500 text-xs')
            
            # Scenarios
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🎯').classes('text-xl')
                    ui.label('Test Scenarios').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for name, desc, color, icon in [
                        ('Mild Attack', 'Low intensity (20%)', '#10B981', 'sentiment_satisfied'),
                        ('Moderate Attack', 'Medium intensity (50%)', '#F59E0B', 'sentiment_neutral'),
                        ('Severe Attack', 'High intensity (80%)', '#EF4444', 'sentiment_dissatisfied'),
                    ]:
                        with ui.card().classes('attack-card flex-1').style(f'border-color: {color}60; max-width: 350px;'):
                            with ui.column().classes('items-center gap-2'):
                                ui.icon(icon).classes('text-4xl').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-base')
                                ui.label(desc).classes('text-gray-400 text-xs')
            
            # Info
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('How It Works').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color in [
                        ('1', 'Load Image', 'Pick from extracted dataset', '#38BDF8'),
                        ('2', 'Apply Attack', 'Run specific attack', '#F59E0B'),
                        ('3', 'Save Output', 'Reproducible result', '#10B981'),
                        ('4', 'Compare', 'Before/after impact', '#8B5CF6'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/attack-simulator')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #EF4444, #DC2626); color: white;')
                ui.button('🛡️ Cybersecurity', on_click=lambda: ui.navigate.to('/cybersecurity')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


create_attack_simulator_page()
