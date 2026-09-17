"""
NiceGUI Analytics Dashboard
"""
from nicegui import ui
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
ANALYTICS_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'analytics_summary.json'


def load_analytics():
    if not ANALYTICS_FILE.exists():
        return None
    try:
        with open(ANALYTICS_FILE) as f:
            return json.load(f)
    except:
        return None


def create_donut_svg(value, max_val=100, color='#10B981', size=120):
    import math
    percent = min(value / max_val, 1.0) if max_val > 0 else 0
    radius = (size - 20) / 2
    cx = cy = size / 2
    circumference = 2 * math.pi * radius
    dash_array = f'{circumference * percent} {circumference}'
    return f'''<svg width="{size}" height="{size}"><circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="#1E293B" stroke-width="14"/><circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="{color}" stroke-width="14" stroke-dasharray="{dash_array}" transform="rotate(-90 {cx} {cy})" stroke-linecap="round"/><text x="{cx}" y="{cy+6}" text-anchor="middle" fill="{color}" font-size="22" font-weight="800" font-family="Inter">{value:.0f}</text></svg>'''


def create_analytics_page():
    @ui.page('/analytics')
    def analytics():
        ui.dark_mode().enable()
        ui.add_head_html('''<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');body,.q-page{font-family:Inter,sans-serif!important;background:#0A0E1A!important;}.q-page-container{padding:0!important;}.nicegui-content{padding:0!important;}.section-title{display:flex;align-items:center;gap:10px;padding:12px 0;border-left:3px solid #8B5CF6;padding-left:16px;margin-bottom:20px;}.metric-card{background:rgba(15,23,42,0.4)!important;border:1px solid rgba(56,189,248,0.15)!important;border-radius:12px!important;padding:16px!important;}.progress-bar{background:rgba(255,255,255,0.08);height:6px;border-radius:3px;overflow:hidden;margin:4px 0;}.progress-fill{height:100%;border-radius:3px;}</style>''')
        
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style('background:rgba(10,14,26,0.95);border-bottom:1px solid rgba(139,92,246,0.15);position:sticky;top:0;z-index:100;'):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#7C3AED);display:flex;align-items:center;justify-content:center;font-size:1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            with ui.row().classes('items-center gap-1'):
                for label, path in [('Home','/'),('Datasets','/datasets'),('Blockchain','/blockchain'),('Trust','/trust'),('XAI','/xai'),('Drift','/drift'),('Analytics','/analytics')]:
                    active = path == '/analytics'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes('text-white' if active else 'text-gray-400')
        
        data = load_analytics()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('analytics').classes('text-purple-400 text-4xl')
                    ui.label('Analytics Dashboard').classes('text-purple-400 font-bold text-4xl')
                ui.label('Comprehensive analytics across all subsystems').classes('text-gray-400 text-sm')
            
            if not data:
                ui.label('No data').classes('text-gray-400')
                return
            
            training = data.get('training_metrics', {})
            dataset_q = data.get('dataset_quality', {})
            trust = data.get('trust_scores', {})
            blockchain = data.get('blockchain_stats', {})
            attacks = data.get('attack_stats', {})
            wallet = data.get('wallet_stats', {})
            robustness = data.get('robustness_data', {})
            
            with ui.row().classes('w-full gap-4 justify-center'):
                avg_trust = sum(t.get('score',0) for t in trust.values())/len(trust) if trust else 0
                for label, value, color, icon in [('Models',str(len(training)),'#38BDF8','model_training'),('Datasets',str(len(dataset_q)),'#8B5CF6','storage'),('Avg Trust',f'{avg_trust:.0f}%','#10B981','verified_user'),('Attack Detection',f"{attacks.get('detection_rate',0):.0f}%",'#EF4444','security')]:
                    with ui.card().classes('p-5').style(f'background:rgba(15,23,42,0.6);border:2px solid {color};border-radius:12px;min-width:180px;text-align:center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color:{color};')
                        ui.label(value).classes('text-white font-bold text-3xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            for section_icon, section_title, section_data, section_type in [
                ('🎯','Model Training Metrics',training,'training'),
                ('📊','Dataset Quality',dataset_q,'quality'),
                ('🛡️','Trust Score Distribution',trust,'trust'),
                ('🧪','Robustness Testing',robustness,'robustness'),
            ]:
                with ui.column().classes('w-full gap-4 mt-6'):
                    with ui.element('div').classes('section-title'):
                        ui.label(section_icon).classes('text-xl')
                        ui.label(section_title).classes('text-white font-bold text-lg')
                    
                    with ui.row().classes('w-full gap-4 justify-center'):
                        for name, metrics in section_data.items():
                            color = '#10B981' if name=='good' else ('#F59E0B' if name=='bad' else '#EF4444')
                            with ui.card().classes('metric-card flex-1').style(f'border-color:{color}40;'):
                                ui.label(name.upper()).classes('text-white font-bold text-base mb-3')
                                for m_name, m_val in metrics.items():
                                    if m_name in ['epochs','total_images']: continue
                                    if isinstance(m_val, dict):
                                        continue
                                    with ui.column().classes('w-full gap-1 mb-2'):
                                        with ui.row().classes('w-full justify-between'):
                                            ui.label(m_name.replace('_',' ').title()).classes('text-gray-400 text-xs')
                                            ui.label(f'{m_val:.2f}' if isinstance(m_val,(int,float)) else str(m_val)).classes('text-white text-xs font-bold')
                                        ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width:{min(m_val,100) if isinstance(m_val,(int,float)) else 0}%;background:{color};"></div></div>')
            
            with ui.row().classes('w-full gap-4 mt-6'):
                with ui.card().classes('metric-card flex-1'):
                    with ui.row().classes('items-center gap-2 mb-4'):
                        ui.icon('link').classes('text-cyan-400 text-xl')
                        ui.label('Blockchain').classes('text-white font-bold text-base')
                    for label, value, color in [('Total Blocks',blockchain.get('total_blocks',0),'#38BDF8'),('Difficulty',blockchain.get('difficulty',0),'#8B5CF6'),('Valid','✅' if blockchain.get('is_valid') else '❌','#10B981')]:
                        with ui.row().classes('w-full justify-between items-center py-2').style('border-bottom:1px solid rgba(56,189,248,0.1);'):
                            ui.label(label).classes('text-gray-400 text-sm')
                            ui.label(str(value)).classes('font-bold').style(f'color:{color};')
                
                with ui.card().classes('metric-card flex-1'):
                    with ui.row().classes('items-center gap-2 mb-4'):
                        ui.icon('security').classes('text-red-400 text-xl')
                        ui.label('Cyber Attacks').classes('text-white font-bold text-base')
                    for label, value, color in [('Total',attacks.get('total_attacks',0),'#EF4444'),('Detected',attacks.get('detected',0),'#10B981'),('Detection Rate',f"{attacks.get('detection_rate',0):.0f}%",'#10B981')]:
                        with ui.row().classes('w-full justify-between items-center py-2').style('border-bottom:1px solid rgba(239,68,68,0.1);'):
                            ui.label(label).classes('text-gray-400 text-sm')
                            ui.label(str(value)).classes('font-bold').style(f'color:{color};')
                
                with ui.card().classes('metric-card flex-1'):
                    with ui.row().classes('items-center gap-2 mb-4'):
                        ui.icon('account_balance_wallet').classes('text-amber-400 text-xl')
                        ui.label('Wallet').classes('text-white font-bold text-base')
                    for label, value, color in [('Token',wallet.get('token_name','N/A'),'#F59E0B'),('Total Supply',f"{wallet.get('total_supply',0):,}",'#8B5CF6'),('Circulating',f"{wallet.get('circulating',0):,}",'#10B981'),('Wallets',wallet.get('total_wallets',0),'#38BDF8')]:
                        with ui.row().classes('w-full justify-between items-center py-2').style('border-bottom:1px solid rgba(245,158,11,0.1);'):
                            ui.label(label).classes('text-gray-400 text-sm')
                            ui.label(str(value)).classes('font-bold').style(f'color:{color};')
            
            with ui.row().classes('w-full gap-3 justify-center mt-8'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/analytics')).classes('px-6 py-2 rounded-lg text-sm').style('background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:white;')
                ui.button('📊 Trust Score', on_click=lambda: ui.navigate.to('/trust')).classes('px-6 py-2 rounded-lg text-sm').style('background:rgba(16,185,129,0.15);color:#10B981;border:1px solid #10B981;')
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm').style('background:rgba(56,189,248,0.15);color:#38BDF8;border:1px solid #38BDF8;')


create_analytics_page()
