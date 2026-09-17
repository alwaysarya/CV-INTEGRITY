"""
NiceGUI Cybersecurity Page
Real attack data from outputs/reports/cyber_attacks.json
"""

from nicegui import ui
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
ATTACKS_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'cyber_attacks.json'


def load_attacks():
    if not ATTACKS_FILE.exists():
        return None
    try:
        with open(ATTACKS_FILE) as f:
            return json.load(f)
    except:
        return None


def create_severity_badge(severity):
    colors = {
        'CRITICAL': '#EF4444',
        'HIGH': '#F59E0B',
        'MEDIUM': '#3B82F6',
        'LOW': '#10B981',
    }
    color = colors.get(severity, '#6B7280')
    return f'<div style="background: {color}30; color: {color}; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; display: inline-block;">{severity}</div>'


def create_cybersecurity_page():
    
    @ui.page('/cybersecurity')
    def cybersecurity():
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
            
            .attack-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border-radius: 12px !important;
                padding: 20px !important;
                border-left: 4px solid;
                margin-bottom: 12px;
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
                    ('Datasets', '/datasets'), 
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('XAI', '/xai'),
                    ('Video', '/video'),
                    ('Cyber', '/cybersecurity'),
                ]:
                    active = path == '/cybersecurity'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        data = load_attacks()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('security').classes('text-red-400 text-4xl')
                    ui.label('Cybersecurity Monitor').classes('text-red-400 font-bold text-4xl')
                ui.label('Attack detection · Threat analysis · Security response').classes('text-gray-400 text-sm')
            
            if not data:
                with ui.card().classes('w-full p-12').style(
                    'background: rgba(15, 23, 42, 0.4); border: 2px dashed #EF4444; border-radius: 12px;'
                ):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('security').classes('text-gray-500 text-5xl')
                        ui.label('No attack data found').classes('text-gray-400 text-lg')
                return
            
            attacks = data.get('attacks', [])
            total = data.get('total_attacks', 0)
            detected = data.get('detected', 0)
            rate = data.get('detection_rate', 0)
            
            # Stats
            critical = sum(1 for a in attacks if a.get('severity') == 'CRITICAL')
            high = sum(1 for a in attacks if a.get('severity') == 'HIGH')
            medium = sum(1 for a in attacks if a.get('severity') == 'MEDIUM')
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Total Attacks', str(total), '#EF4444', 'warning'),
                    ('Detected', str(detected), '#10B981', 'check_circle'),
                    ('Detection Rate', f'{rate:.0f}%', '#10B981', 'verified'),
                    ('Critical', str(critical), '#DC2626', 'error'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-3xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Severity breakdown
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('⚠️').classes('text-xl')
                    ui.label('Severity Breakdown').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for label, count, color in [
                        ('CRITICAL', critical, '#DC2626'),
                        ('HIGH', high, '#F59E0B'),
                        ('MEDIUM', medium, '#3B82F6'),
                        ('LOW', 0, '#10B981'),
                    ]:
                        with ui.card().classes('flex-1 p-5').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; text-align: center;'
                        ):
                            ui.label(label).classes('text-xs font-bold tracking-wider mb-2').style(f'color: {color};')
                            ui.label(str(count)).classes('text-white font-bold text-4xl')
                            ui.label('attacks').classes('text-gray-500 text-xs')
            
            # Attack list
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🚨').classes('text-xl')
                    ui.label(f'Attack Timeline ({len(attacks)} attacks)').classes('text-white font-bold text-lg')
                
                for attack in attacks:
                    severity = attack.get('severity', 'UNKNOWN')
                    colors = {'CRITICAL': '#DC2626', 'HIGH': '#F59E0B', 'MEDIUM': '#3B82F6'}
                    color = colors.get(severity, '#6B7280')
                    
                    with ui.card().classes('attack-card w-full').style(f'border-left-color: {color};'):
                        # Header
                        with ui.row().classes('w-full items-center justify-between mb-3'):
                            with ui.row().classes('items-center gap-3'):
                                ui.html(f'<div style="background: {color}; color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">{attack.get("id", "N/A")}</div>')
                                with ui.column().classes('gap-0'):
                                    ui.label(attack.get('name', 'Unknown')).classes('text-white font-bold text-base')
                                    ui.label(attack.get('description', '')).classes('text-gray-400 text-xs')
                            
                            with ui.row().classes('items-center gap-3'):
                                ui.html(create_severity_badge(severity))
                                with ui.row().classes('items-center gap-1'):
                                    ui.icon('check_circle').classes('text-green-400 text-lg')
                                    ui.label('DETECTED').classes('text-green-400 text-xs font-bold')
                        
                        # Detection details
                        with ui.row().classes('w-full gap-6 mt-3 pt-3').style('border-top: 1px solid rgba(239, 68, 68, 0.15);'):
                            # Detection method
                            with ui.column().classes('gap-0 flex-1'):
                                ui.label('Detection Method').classes('text-gray-500 text-xs tracking-wider mb-1')
                                methods = attack.get('detection_methods', [attack.get('detection_method', 'N/A')])
                                if isinstance(methods, str):
                                    methods = [methods]
                                for m in methods:
                                    ui.label(f'• {m}').classes('text-gray-300 text-xs')
                            
                            # Hashes (if present)
                            if attack.get('original_hash'):
                                with ui.column().classes('gap-0 flex-1'):
                                    ui.label('Original Hash').classes('text-gray-500 text-xs tracking-wider mb-1')
                                    ui.label(attack.get('original_hash', '')[:48] + '...').classes('text-gray-400 text-xs mono')
                            
                            if attack.get('tampered_hash'):
                                with ui.column().classes('gap-0 flex-1'):
                                    ui.label('Tampered Hash').classes('text-red-400 text-xs tracking-wider mb-1')
                                    ui.label(attack.get('tampered_hash', '')[:48] + '...').classes('text-red-300 text-xs mono')
                            
                            # Special cases
                            if attack.get('original_decision'):
                                with ui.column().classes('gap-0 flex-1'):
                                    ui.label('Decision Change').classes('text-gray-500 text-xs tracking-wider mb-1')
                                    ui.label(f'{attack.get("original_decision")} → {attack.get("tampered_decision")}').classes('text-red-300 text-xs')
                            
                            if attack.get('old_timestamp'):
                                with ui.column().classes('gap-0 flex-1'):
                                    ui.label('Replay Detection').classes('text-gray-500 text-xs tracking-wider mb-1')
                                    ui.label(f'Old: {attack.get("old_timestamp", "")[:10]}').classes('text-gray-400 text-xs')
                                    ui.label(f'New: {attack.get("new_timestamp", "")[:10]}').classes('text-red-300 text-xs')
                        
                        # Timestamp
                        with ui.row().classes('w-full justify-end mt-2'):
                            ts = attack.get('timestamp', '')
                            if ts:
                                ui.label(f'Detected at: {ts[:19]}').classes('text-gray-600 text-xs mono')
            
            # Protection layers
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🛡️').classes('text-xl')
                    ui.label('Protection Layers').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color, icon in [
                        ('1', 'SHA-256 Hashing', 'Detects any file tampering', '#38BDF8', 'fingerprint'),
                        ('2', 'RSA Signatures', 'Verifies authenticity', '#8B5CF6', 'key'),
                        ('3', 'Blockchain', 'Immutable audit trail', '#10B981', 'link'),
                        ('4', 'Timestamp Binding', 'Prevents replay attacks', '#F59E0B', 'schedule'),
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
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/cybersecurity')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #EF4444, #DC2626); color: white;')
                
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                
                ui.button('📊 Analytics', on_click=lambda: ui.navigate.to('/analytics')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')


# Register
create_cybersecurity_page()
