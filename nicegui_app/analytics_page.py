"""
NiceGUI Analytics Dashboard
Real data from outputs/reports/analytics_summary.json
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
ANALYTICS_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'analytics_summary.json'


def load_analytics():
    """Load analytics data."""
    if not ANALYTICS_FILE.exists():
        return None
    try:
        with open(ANALYTICS_FILE) as f:
            return json.load(f)
    except:
        return None


def create_donut_svg(value, max_val=100, color='#10B981', size=120):
    """Create a donut chart SVG."""
    import math
    percent = min(value / max_val, 1.0) if max_val > 0 else 0
    radius = (size - 20) / 2
    cx = cy = size / 2
    stroke_width = 14
    circumference = 2 * math.pi * radius
    dash_array = f'{circumference * percent} {circumference}'
    
    return f'''
    <svg width="{size}" height="{size}" viewBox="0 0 {size} {size}">
        <circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="#1E293B" stroke-width="{stroke_width}"/>
        <circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="{color}" stroke-width="{stroke_width}"
                stroke-dasharray="{dash_array}" transform="rotate(-90 {cx} {cy})" stroke-linecap="round"/>
        <text x="{cx}" y="{cy + 6}" text-anchor="middle" fill="{color}" font-size="22" font-weight="800" font-family="Inter">{value:.0f}</text>
    </svg>
    '''


def create_analytics_page():
    
    @ui.page('/analytics')
    def analytics():
        apply_styles(ui)
        
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
                    ('Analytics', '/analytics'),
                ]:
                    active = path == '/analytics'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        data = load_analytics()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '📊', 'Analytics Dashboard', 'Comprehensive analytics across all subsystems', '#8B5CF6')
            
            if not data:
                with ui.card().classes('w-full p-12').style('border: 2px dashed #8B5CF6; border-radius: 12px;'):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No analytics data').classes('text-gray-400 text-lg')
                return
            
            training = data.get('training_metrics', {})
            dataset_q = data.get('dataset_quality', {})
            trust = data.get('trust_scores', {})
            blockchain = data.get('blockchain_stats', {})
            attacks = data.get('attack_stats', {})
            wallet = data.get('wallet_stats', {})
            robustness = data.get('robustness_data', {})
            
            # Overall Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                avg_trust = sum(t.get('score', 0) for t in trust.values()) / len(trust) if trust else 0
                detection_rate = attacks.get('detection_rate', 0)
                
                for label, value, color, icon in [
                    ('Models', str(len(training)), '#38BDF8', 'model_training'),
                    ('Datasets', str(len(dataset_q)), '#8B5CF6', 'storage'),
                    ('Avg Trust', f'{avg_trust:.0f}%', '#10B981', 'verified_user'),
                    ('Attack Detection', f'{detection_rate:.0f}%', '#EF4444', 'security'),
                ]:
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-3xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Training Metrics
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🎯').classes('text-xl')
                    ui.label('Model Training Metrics').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for model_name, metrics in training.items():
                        color = '#10B981' if model_name == 'good' else ('#F59E0B' if model_name == 'bad' else '#EF4444')
                        with ui.card().classes('flex-1 p-5').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            with ui.row().classes('items-center gap-2 mb-3'):
                                ui.icon('model_training').classes('text-xl').style(f'color: {color};')
                                ui.label(model_name.upper()).classes('text-white font-bold text-base')
                            
                            for metric, value in metrics.items():
                                if metric == 'epochs': continue
                                with ui.column().classes('w-full gap-1 mb-2'):
                                    with ui.row().classes('w-full justify-between'):
                                        ui.label(metric).classes('text-gray-400 text-xs')
                                        ui.label(f'{value:.2f}').classes('text-white text-xs font-bold')
                                    ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {min(value, 100)}%; background: {color};"></div></div>')
            
            # Dataset Quality
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Dataset Quality').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for ds_name, quality in dataset_q.items():
                        color = '#10B981' if ds_name == 'good' else ('#F59E0B' if ds_name == 'bad' else '#EF4444')
                        with ui.card().classes('flex-1 p-5').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            with ui.row().classes('items-center justify-between mb-3'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('folder').classes('text-xl').style(f'color: {color};')
                                    ui.label(ds_name.upper()).classes('text-white font-bold text-base')
                                ui.label(f'{quality.get("total_images", 0)} imgs').classes('text-gray-500 text-xs')
                            
                            overall = quality.get('overall', 0)
                            with ui.column().classes('w-full gap-2 mb-3'):
                                with ui.row().classes('w-full justify-between'):
                                    ui.label('Overall').classes('text-gray-400 text-xs')
                                    ui.label(f'{overall:.1f}%').classes('text-lg font-bold').style(f'color: {color};')
                                ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {overall}%; background: {color};"></div></div>')
                            
                            for metric in ['blur', 'duplicate', 'noise']:
                                value = quality.get(metric, 0)
                                with ui.column().classes('w-full gap-1 mb-1'):
                                    with ui.row().classes('w-full justify-between'):
                                        ui.label(metric.capitalize()).classes('text-gray-500 text-xs')
                                        ui.label(f'{value:.1f}%').classes('text-gray-300 text-xs')
                                    ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {value}%; background: {color}80;"></div></div>')
            
            # Trust Scores
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🛡️').classes('text-xl')
                    ui.label('Trust Score Distribution').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for ds_name, t in trust.items():
                        color = '#10B981' if ds_name == 'good' else ('#F59E0B' if ds_name == 'bad' else '#EF4444')
                        score = t.get('score', 0)
                        decision = t.get('decision', 'N/A')
                        components = t.get('components', {})
                        
                        with ui.card().classes('flex-1 p-5').style(f'border: 1px solid {color}40; border-radius: 12px; text-align: center;'):
                            ui.label(ds_name.upper()).classes('text-white font-bold text-base mb-2')
                            ui.html(create_donut_svg(score, 100, color, 120)).classes('mx-auto')
                            ui.html(f'<div style="background: {color}30; color: {color}; padding: 4px 12px; border-radius: 12px; display: inline-block; margin-top: 8px; font-size: 0.7rem; font-weight: 700;">{decision}</div>')
                            
                            with ui.column().classes('w-full gap-2 mt-4'):
                                for comp_name, comp_val in components.items():
                                    with ui.column().classes('w-full gap-1'):
                                        with ui.row().classes('w-full justify-between'):
                                            ui.label(comp_name.replace('_', ' ').title()).classes('text-gray-500 text-xs')
                                            ui.label(f'{comp_val:.0f}').classes('text-gray-300 text-xs')
                                        ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {comp_val}%; background: {color};"></div></div>')
            
            # Blockchain + Attacks + Wallet
            with ui.row().classes('w-full gap-4 mt-6'):
                with ui.card().classes('flex-1 p-5').style('border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'):
                    with ui.row().classes('items-center gap-2 mb-4'):
                        ui.icon('link').classes('text-cyan-400 text-xl')
                        ui.label('Blockchain').classes('text-white font-bold text-base')
                    for label, value, color in [('Total Blocks', blockchain.get('total_blocks', 0), '#38BDF8'), ('Difficulty', blockchain.get('difficulty', 0), '#8B5CF6'), ('Valid', '✅' if blockchain.get('is_valid') else '❌', '#10B981')]:
                        with ui.row().classes('w-full justify-between items-center py-2').style('border-bottom: 1px solid rgba(56, 189, 248, 0.1);'):
                            ui.label(label).classes('text-gray-400 text-sm')
                            ui.label(str(value)).classes('font-bold').style(f'color: {color};')
                
                with ui.card().classes('flex-1 p-5').style('border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 12px;'):
                    with ui.row().classes('items-center gap-2 mb-4'):
                        ui.icon('security').classes('text-red-400 text-xl')
                        ui.label('Cyber Attacks').classes('text-white font-bold text-base')
                    for label, value, color in [('Total', attacks.get('total_attacks', 0), '#EF4444'), ('Detected', attacks.get('detected', 0), '#10B981'), ('Detection Rate', f"{attacks.get('detection_rate', 0):.0f}%", '#10B981')]:
                        with ui.row().classes('w-full justify-between items-center py-2').style('border-bottom: 1px solid rgba(239, 68, 68, 0.1);'):
                            ui.label(label).classes('text-gray-400 text-sm')
                            ui.label(str(value)).classes('font-bold').style(f'color: {color};')
                
                with ui.card().classes('flex-1 p-5').style('border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 12px;'):
                    with ui.row().classes('items-center gap-2 mb-4'):
                        ui.icon('account_balance_wallet').classes('text-amber-400 text-xl')
                        ui.label('Wallet').classes('text-white font-bold text-base')
                    for label, value, color in [('Token', wallet.get('token_name', 'N/A'), '#F59E0B'), ('Total Supply', f"{wallet.get('total_supply', 0):,}", '#8B5CF6'), ('Circulating', f"{wallet.get('circulating', 0):,}", '#10B981'), ('Wallets', wallet.get('total_wallets', 0), '#38BDF8')]:
                        with ui.row().classes('w-full justify-between items-center py-2').style('border-bottom: 1px solid rgba(245, 158, 11, 0.1);'):
                            ui.label(label).classes('text-gray-400 text-sm')
                            ui.label(str(value)).classes('font-bold').style(f'color: {color};')
            
            # Robustness
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🧪').classes('text-xl')
                    ui.label('Robustness Testing').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for model_name, metrics in robustness.items():
                        color = '#10B981' if model_name == 'good' else ('#F59E0B' if model_name == 'bad' else '#EF4444')
                        with ui.card().classes('flex-1 p-5').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            ui.label(model_name.upper()).classes('text-white font-bold text-base mb-3')
                            for metric_name, value in metrics.items():
                                with ui.column().classes('w-full gap-1 mb-2'):
                                    with ui.row().classes('w-full justify-between'):
                                        ui.label(metric_name.title()).classes('text-gray-400 text-xs')
                                        ui.label(f'{value:.2f}').classes('text-white text-xs font-bold')
                                    ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {min(value, 100)}%; background: {color};"></div></div>')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-8'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/analytics')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white;')
                ui.button('📊 Trust Score', on_click=lambda: ui.navigate.to('/trust')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')


# Register
create_analytics_page()