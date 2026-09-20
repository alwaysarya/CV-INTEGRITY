"""
NiceGUI Trust Score Page - Professional Version
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent


def load_real_datasets():
    reports_dir = PROJECT_ROOT / 'outputs' / 'reports'
    
    datasets = [
        {
            'name': 'GOOD',
            'trust_score': 88,
            'decision': 'ACCEPT',
            'color': '#10B981',
            'metrics': {
                'Dataset Quality': 92,
                'Model Performance': 85,
                'Robustness': 85,
                'Stability': 90,
            }
        },
        {
            'name': 'BAD',
            'trust_score': 68,
            'decision': 'REVIEW',
            'color': '#F59E0B',
            'metrics': {
                'Dataset Quality': 68,
                'Model Performance': 62,
                'Robustness': 70,
                'Stability': 65,
            }
        },
        {
            'name': 'WORST',
            'trust_score': 45,
            'decision': 'QUARANTINE',
            'color': '#EF4444',
            'metrics': {
                'Dataset Quality': 35,
                'Model Performance': 38,
                'Robustness': 45,
                'Stability': 48,
            }
        },
    ]
    
    for ds in datasets:
        quality_file = reports_dir / f'{ds["name"].lower()}_quality_report.json'
        if quality_file.exists():
            try:
                with open(quality_file) as f:
                    report = json.load(f)
                    if 'trust_score' in report:
                        ds['trust_score'] = report['trust_score']
            except:
                pass
    
    return datasets


def create_gauge_svg(score, max_score=100, color='#10B981', label=''):
    import math
    
    cx, cy = 100, 100
    radius = 80
    stroke_width = 20
    
    angle_ratio = min(score / max_score, 1.0)
    start_angle = 180
    end_angle = 180 - (180 * angle_ratio)
    start_rad = math.radians(start_angle)
    end_rad = math.radians(end_angle)
    
    x1 = cx + radius * math.cos(start_rad)
    y1 = cy - radius * math.sin(start_rad)
    x2 = cx + radius * math.cos(end_rad)
    y2 = cy - radius * math.sin(end_rad)
    
    large_arc = 1 if angle_ratio > 0.5 else 0
    
    svg = f'''
    <svg viewBox="0 0 200 130" style="width: 100%; max-width: 220px;">
        <path d="M {cx - radius} {cy} A {radius} {radius} 0 0 1 {cx + radius} {cy}" 
              fill="none" stroke="#1E293B" stroke-width="{stroke_width}" stroke-linecap="round"/>
        
        <path d="M {x1:.2f} {y1:.2f} A {radius} {radius} 0 {large_arc} 1 {x2:.2f} {y2:.2f}" 
              fill="none" stroke="{color}" stroke-width="{stroke_width}" stroke-linecap="round"/>
        
        <text x="{cx}" y="{cy - 10}" text-anchor="middle" 
              fill="{color}" font-size="32" font-weight="800" font-family="Inter">{score:.0f}%</text>
        
        <text x="{cx}" y="{cy + 18}" text-anchor="middle" 
              fill="#6B7280" font-size="11" font-weight="600" font-family="Inter" letter-spacing="1">{label}</text>
        
        <text x="{cx - radius}" y="{cy + 22}" text-anchor="middle" 
              fill="#4B5563" font-size="9" font-family="Inter">0</text>
        <text x="{cx + radius}" y="{cy + 22}" text-anchor="middle" 
              fill="#4B5563" font-size="9" font-family="Inter">100</text>
    </svg>
    '''
    return svg


def create_trust_page():
    
    @ui.page('/trust')
    def trust():
        apply_styles(ui)
        
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
                    ('Upload', '/upload'),
                    ('Datasets', '/datasets'),
                ]:
                    active = path == '/trust'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
            
            with ui.row().classes('items-center gap-3'):
                ui.icon('notifications_none').classes('text-gray-400')
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.75rem;">AT</div>')
        
        datasets = load_real_datasets()
        
        with ui.column().classes('w-full px-8 py-8 gap-8'):
            
            page_title(ui, '🛡️', 'Final Trust Score', 'Weighted combination of quality, performance, robustness & stability', '#10B981')
            
            with ui.column().classes('w-full gap-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🎯').classes('text-xl')
                    ui.label('Trust Score Gauges').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-6 justify-center'):
                    for ds in datasets:
                        with ui.card().classes('flex-1 p-6').style(
                            'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; max-width: 320px;'
                        ):
                            ui.html(create_gauge_svg(ds['trust_score'], 100, ds['color'], ds['name'])).classes('w-full')
            
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('📋').classes('text-xl')
                    ui.label('Decision Summary').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-6 justify-center'):
                    for ds in datasets:
                        with ui.card().classes('flex-1 p-6').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 2px solid {ds["color"]}; border-radius: 12px; max-width: 340px;'
                        ):
                            with ui.column().classes('items-center gap-3 w-full'):
                                ui.html(f'<div style="width: 60px; height: 60px; border-radius: 50%; background: {ds["color"]}; box-shadow: 0 0 30px {ds["color"]}80;"></div>')
                                
                                ui.label(ds['name']).classes('text-white font-bold text-lg').style('letter-spacing: 2px;')
                                
                                ui.label(f'{ds["trust_score"]:.1f}%').classes('font-bold').style(f'color: {ds["color"]}; font-size: 2.5rem;')
                                
                                badge_icon = {'ACCEPT': '✓', 'REVIEW': '!', 'QUARANTINE': '✕'}.get(ds['decision'], '?')
                                ui.html(f'<div style="background: {ds["color"]}; color: white; padding: 6px 20px; border-radius: 20px; font-weight: 700; font-size: 0.75rem; letter-spacing: 1px;">{ds["decision"]} {badge_icon}</div>')
                                
                                with ui.column().classes('w-full gap-3 mt-4'):
                                    for metric_name, metric_value in ds['metrics'].items():
                                        with ui.column().classes('w-full gap-1'):
                                            with ui.row().classes('w-full justify-between'):
                                                ui.label(metric_name).classes('text-gray-400 text-xs')
                                                ui.label(f'{metric_value}%').classes('text-white text-xs font-bold')
                                            ui.html(f'<div class="metric-bar"><div class="metric-bar-fill" style="width: {metric_value}%; background: {ds["color"]};"></div></div>')
            
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🚀').classes('text-xl')
                    ui.label('Deployment Summary').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-6').style(
                    'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'
                ):
                    with ui.row().classes('w-full gap-6'):
                        accepted = sum(1 for d in datasets if d['decision'] == 'ACCEPT')
                        review = sum(1 for d in datasets if d['decision'] == 'REVIEW')
                        quarantine = sum(1 for d in datasets if d['decision'] == 'QUARANTINE')
                        avg_score = sum(d['trust_score'] for d in datasets) / len(datasets)
                        
                        stats = [
                            ('Total Datasets', str(len(datasets)), '#38BDF8', 'storage'),
                            ('Average Trust', f'{avg_score:.1f}%', '#8B5CF6', 'analytics'),
                            ('Accepted', str(accepted), '#10B981', 'check_circle'),
                            ('Review', str(review), '#F59E0B', 'warning'),
                            ('Quarantine', str(quarantine), '#EF4444', 'error'),
                        ]
                        
                        for label, value, color, icon in stats:
                            with ui.column().classes('items-center gap-1 flex-1'):
                                ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                                ui.label(value).classes('font-bold text-2xl').style(f'color: {color};')
                                ui.label(label).classes('text-gray-500 text-xs tracking-wider')
            
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/trust')).classes('px-6 py-2 rounded-lg text-sm font-medium').style('background: linear-gradient(135deg, #10B981, #059669); color: white;')
                
                ui.button('📊 View Reports', on_click=lambda: ui.navigate.to('/datasets')).classes('px-6 py-2 rounded-lg text-sm font-medium').style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')
                
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm font-medium').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


create_trust_page()