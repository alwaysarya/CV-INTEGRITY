"""
CV-INTEGRITY AI - NiceGUI Application
Apple Liquid Glass Premium UI + All 21 pages registered
"""

from nicegui import ui, app
from pathlib import Path
from search import search as global_search
from styles import apply_styles, apply_apple_glass

# Import all page creators
from blockchain_page import create_blockchain_page
from trust_page import create_trust_page
from xai_page import create_xai_page
from upload_page import create_upload_page
from datasets_page import create_datasets_page
from drift_page import create_drift_page
from analytics_page import create_analytics_page
from video_page import create_video_page
from cybersecurity_page import create_cybersecurity_page
from robustness_page import create_robustness_page
from performance_page import create_performance_page
from auth_page import create_auth_page
from wallet_page import create_wallet_page
from reports_page import create_reports_page
from collaboration_page import create_collaboration_page
from contributors_page import create_contributors_page
from attack_simulator_page import create_attack_simulator_page
from format_support_page import create_format_support_page
from quality_page import create_quality_page
from model_integrity_page import create_model_integrity_page
from backdoor_page import create_backdoor_page
from replay_page import create_replay_page


# ============================================================
# NAVIGATION
# ============================================================
def navigation():
    with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
        'background: rgba(10, 14, 26, 0.7); border-bottom: 1px solid rgba(255, 255, 255, 0.08); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(40px) saturate(200%); -webkit-backdrop-filter: blur(40px) saturate(200%);'
    ):
        with ui.row().classes('items-center gap-3'):
            ui.html('<div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #38BDF8, #0EA5E9); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);">🧠</div>')
            with ui.column().classes('gap-0'):
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
                ui.label('AI TRUST PLATFORM').classes('text-gray-500 text-xs tracking-wider')
        
        with ui.row().classes('items-center gap-2'):
            ui.button('Home', on_click=lambda: ui.navigate.to('/')).props('flat no-caps dense').classes('text-gray-300 text-xs')
            
            with ui.button('Data', icon='folder').props('flat no-caps dense').classes('text-cyan-400 text-xs'):
                with ui.menu().props('auto-close'):
                    ui.menu_item('Upload', on_click=lambda: ui.navigate.to('/upload'))
                    ui.menu_item('Datasets', on_click=lambda: ui.navigate.to('/datasets'))
                    ui.menu_item('Quality', on_click=lambda: ui.navigate.to('/quality'))
                    ui.menu_item('Formats', on_click=lambda: ui.navigate.to('/formats'))
            
            with ui.button('Models', icon='model_training').props('flat no-caps dense').classes('text-blue-400 text-xs'):
                with ui.menu().props('auto-close'):
                    ui.menu_item('Model Integrity', on_click=lambda: ui.navigate.to('/model-integrity'))
                    ui.menu_item('Performance', on_click=lambda: ui.navigate.to('/performance'))
                    ui.menu_item('Robustness', on_click=lambda: ui.navigate.to('/robustness'))
                    ui.menu_item('Drift', on_click=lambda: ui.navigate.to('/drift'))
            
            with ui.button('Security', icon='security').props('flat no-caps dense').classes('text-red-400 text-xs'):
                with ui.menu().props('auto-close'):
                    ui.menu_item('Blockchain', on_click=lambda: ui.navigate.to('/blockchain'))
                    ui.menu_item('Cybersecurity', on_click=lambda: ui.navigate.to('/cybersecurity'))
                    ui.menu_item('Backdoor', on_click=lambda: ui.navigate.to('/backdoor'))
                    ui.menu_item('Replay', on_click=lambda: ui.navigate.to('/replay'))
                    ui.menu_item('Wallet', on_click=lambda: ui.navigate.to('/wallet'))
                    ui.menu_item('Attack Simulator', on_click=lambda: ui.navigate.to('/attack-simulator'))
            
            with ui.button('Analytics', icon='analytics').props('flat no-caps dense').classes('text-purple-400 text-xs'):
                with ui.menu().props('auto-close'):
                    ui.menu_item('Analytics', on_click=lambda: ui.navigate.to('/analytics'))
                    ui.menu_item('Reports', on_click=lambda: ui.navigate.to('/reports'))
                    ui.menu_item('XAI', on_click=lambda: ui.navigate.to('/xai'))
                    ui.menu_item('Video', on_click=lambda: ui.navigate.to('/video'))
            
            with ui.button('Team', icon='groups').props('flat no-caps dense').classes('text-amber-400 text-xs'):
                with ui.menu().props('auto-close'):
                    ui.menu_item('Collaboration', on_click=lambda: ui.navigate.to('/collaboration'))
                    ui.menu_item('Contributors', on_click=lambda: ui.navigate.to('/contributors'))
                    ui.menu_item('Trust', on_click=lambda: ui.navigate.to('/trust'))
            
            ui.button('About', on_click=lambda: ui.navigate.to('/about')).props('flat no-caps dense').classes('text-gray-300 text-xs')
        
        with ui.row().classes('items-center gap-3'):
            with ui.row().classes('items-center gap-2 px-3 py-1 rounded-lg').style('background: rgba(21, 21, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); width: 220px; backdrop-filter: blur(20px);'):
                ui.icon('search').classes('text-gray-500 text-sm')
                search_input = ui.input(placeholder='Search...').classes('flex-1').style('background: transparent; border: none; color: white; font-size: 12px;').props('borderless dense')
                
                def do_search():
                    q = search_input.value or ''
                    if q:
                        results = global_search(q, limit=1)
                        if results:
                            ui.navigate.to(results[0]['path'])
                            search_input.value = ''
                
                search_input.on('keydown.enter', lambda: do_search())
            
            ui.icon('notifications_none').classes('text-gray-400 cursor-pointer')
            
            with ui.row().classes('items-center gap-2'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.75rem; box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);">AT</div>')
                with ui.column().classes('gap-0'):
                    ui.label('Aryan Thakur').classes('text-white text-xs font-medium')
                    ui.label('Administrator').classes('text-gray-500 text-xs')


def footer():
    with ui.row().classes('w-full items-center justify-between px-16 py-4').style('border-top: 1px solid rgba(255,255,255,0.08); margin-top: 40px; position: relative; z-index: 1;'):
        ui.label('© 2026 CV-INTEGRITY AI. All rights reserved.').classes('text-gray-500 text-xs')
        ui.label('Backend: ✅ Connected').classes('text-gray-500 text-xs')


# ============================================================
# HERO SECTION
# ============================================================
def hero_section():
    ui.add_head_html('''
    <style>
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes ping-dot {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
        }
        .hero-gradient-text {
            background: linear-gradient(90deg, #38BDF8, #8B5CF6, #10B981, #38BDF8);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradient-shift 4s ease infinite;
        }
        .hero-cta-primary {
            background: linear-gradient(135deg, #38BDF8, #0EA5E9);
            color: white;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-cta-primary:hover {
            transform: translateY(-3px) scale(1.03);
            box-shadow: 0 15px 40px rgba(56, 189, 248, 0.5), 0 0 80px rgba(56, 189, 248, 0.3);
        }
        .hero-cta-secondary {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: white;
            backdrop-filter: blur(20px);
            transition: all 0.4s ease;
        }
        .hero-cta-secondary:hover {
            border-color: rgba(255, 255, 255, 0.35);
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-3px);
        }
        .stat-glow { transition: all 0.3s ease; }
        .stat-glow:hover { transform: scale(1.05); filter: drop-shadow(0 0 25px currentColor); }
        
        .hero-balanced {
            padding: 80px 80px !important;
            gap: 60px !important;
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }
        .hero-left { flex: 1 1 55%; max-width: 640px; }
        .hero-right { flex: 1 1 40%; max-width: 460px; }
        
        .live-dot {
            position: relative;
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10B981;
        }
        .live-dot::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #10B981;
            animation: ping-dot 1.5s ease-out infinite;
        }
    </style>
    ''')
    
    with ui.row().classes('w-full items-center justify-center hero-balanced'):
        with ui.column().classes('gap-6 hero-left'):
            with ui.row().classes('items-center gap-2 px-4 py-2 rounded-full').style(
                'background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); width: fit-content; backdrop-filter: blur(20px);'
            ):
                ui.html('<div class="live-dot"></div>')
                ui.label('AI-Powered Dataset Integrity').classes('text-purple-400 text-xs font-medium tracking-wide')
            
            ui.label('Verify Your AI Datasets with Confidence').classes('hero-gradient-text font-bold').style('font-size: 3.5rem; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em;')
            
            ui.label('Detect tampering, ensure authenticity, and build trust in your AI models with blockchain-verified dataset integrity.').classes('text-gray-400 text-lg').style('line-height: 1.7; max-width: 540px;')
            
            with ui.row().classes('gap-3 mt-3'):
                ui.button('Upload Dataset →', on_click=lambda: ui.navigate.to('/upload')).classes('hero-cta-primary magnetic-btn px-7 py-3 rounded-xl font-semibold text-sm')
                ui.button('▶ Watch Demo').classes('hero-cta-secondary magnetic-btn px-7 py-3 rounded-xl font-semibold text-sm')
            
            with ui.row().classes('items-center gap-12 mt-8'):
                for val, label, color in [('99.9%', 'Accuracy', '#38BDF8'), ('50K+', 'Datasets', '#8B5CF6'), ('1M+', 'Verifications', '#10B981')]:
                    with ui.column().classes('gap-0 stat-glow').style(f'color: {color};'):
                        ui.label(val).classes('font-bold text-3xl').style(f'color: {color}; text-shadow: 0 0 30px {color}80; letter-spacing: -0.02em;')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wide uppercase')
        
        with ui.column().classes('gap-4 hero-right'):
            with ui.card().classes('liquid-glass specular w-full p-6').style('border-radius: 24px;'):
                with ui.row().classes('w-full items-center justify-between mb-5'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('verified').classes('text-green-400 text-2xl')
                        with ui.column().classes('gap-0'):
                            ui.label('Dataset Verified').classes('text-white font-bold text-sm')
                            ui.label('Blockchain confirmed').classes('text-gray-500 text-xs')
                    with ui.row().classes('items-center gap-1 px-3 py-1 rounded-full').style('background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);'):
                        ui.html('<div class="live-dot"></div>')
                        ui.label('LIVE').classes('text-green-400 text-xs font-bold tracking-wider')
                
                with ui.column().classes('w-full gap-2 mb-4 p-4 rounded-xl').style('background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(139, 92, 246, 0.2); backdrop-filter: blur(20px);'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('fingerprint').classes('text-purple-400 text-lg')
                        ui.label('SHA-256 Hash').classes('text-gray-400 text-xs tracking-wider')
                    ui.label('0x7a3f...9b2c').classes('text-purple-300 text-sm mono font-medium')
                
                with ui.column().classes('w-full gap-2 mb-4 p-4 rounded-xl').style('background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(56, 189, 248, 0.2); backdrop-filter: blur(20px);'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('schedule').classes('text-cyan-400 text-lg')
                        ui.label('Last Verified').classes('text-gray-400 text-xs tracking-wider')
                    ui.label('2 minutes ago').classes('text-cyan-300 text-sm font-medium')
                
                with ui.column().classes('w-full gap-2 pt-4').style('border-top: 1px solid rgba(255,255,255,0.08);'):
                    with ui.row().classes('w-full justify-between items-center'):
                        ui.label('Trust Score').classes('text-gray-400 text-xs tracking-wider')
                        ui.label('87%').classes('text-green-400 font-bold text-lg')
                    ui.html('<div style="background: rgba(255,255,255,0.08); height: 6px; border-radius: 3px; overflow: hidden;"><div style="width: 87%; height: 100%; background: linear-gradient(90deg, #10B981, #38BDF8); border-radius: 3px;"></div></div>')


# ============================================================
# LIVE STATS COUNTER
# ============================================================
def live_stats_counter():
    ui.add_head_html('''
    <style>
        .live-stat-card {
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: all 0.4s ease;
        }
        .live-stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 0%, var(--stat-color-alpha) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }
        .live-stat-card:hover::before {
            opacity: 1;
        }
        .live-stat-value {
            font-size: 3rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: var(--stat-color);
            text-shadow: 0 0 40px var(--stat-color);
            position: relative;
            z-index: 1;
        }
        .live-stat-label {
            color: #6B7280;
            font-size: 0.75rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-top: 8px;
            position: relative;
            z-index: 1;
        }
        .live-stat-icon {
            font-size: 2rem;
            color: var(--stat-color);
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
        }
    </style>
    ''')
    
    with ui.row().classes('w-full section-tight gap-4 justify-center'):
        stats = [
            ('1M+', 'Verifications', '#38BDF8', 'verified_user'),
            ('50K+', 'Datasets Secured', '#8B5CF6', 'storage'),
            ('99.9%', 'Detection Accuracy', '#10B981', 'analytics'),
            ('6', 'Blocks Mined', '#F59E0B', 'link'),
        ]
        for val, label, color, icon in stats:
            with ui.card().classes('liquid-glass live-stat-card specular p-6').style(f'--stat-color: {color}; --stat-color-alpha: {color}20; flex: 1; max-width: 280px; border-radius: 24px;'):
                ui.icon(icon).classes('live-stat-icon').style(f'color: {color};')
                ui.label(val).classes('live-stat-value')
                ui.label(label).classes('live-stat-label')


# ============================================================
# FEATURE CARDS
# ============================================================
def feature_cards():
    with ui.row().classes('w-full items-center justify-between gap-3 section-tight'):
        cards = [
            ('shield', 'Blockchain', 'Immutable records', '#8B5CF6', '/blockchain'),
            ('psychology', 'XAI', 'Explainable AI', '#3B82F6', '/xai'),
            ('videocam', 'Video', 'Object detection', '#10B981', '/video'),
            ('trending_up', 'Drift', 'Model monitoring', '#F59E0B', '/drift'),
            ('analytics', 'Analytics', 'Data insights', '#06B6D4', '/analytics'),
            ('security', 'Cybersecurity', 'Attack detection', '#EF4444', '/cybersecurity'),
            ('science', 'Robustness', 'Stress testing', '#A78BFA', '/robustness'),
            ('speed', 'Performance', 'Model metrics', '#F472B6', '/performance'),
        ]
        for icon, title, subtitle, color, path in cards:
            with ui.card().classes('liquid-glass specular flex-1 p-4 cursor-pointer').style('border-radius: 20px;').on('click', lambda p=path: ui.navigate.to(p)):
                with ui.column().classes('items-center gap-2'):
                    ui.icon(icon).classes('text-2xl').style(f'color: {color}; text-shadow: 0 0 20px {color}80;')
                    ui.label(title).classes('text-white font-semibold text-xs text-center')
                    ui.label(subtitle).classes('text-gray-500 text-xs text-center')


# ============================================================
# BLOCKCHAIN VISUALIZER
# ============================================================
def blockchain_visualizer():
    """Zara hatke: Live animated blockchain visualization."""
    with ui.column().classes('w-full section-tight gap-4'):
        with ui.column().classes('items-center gap-2 w-full'):
            with ui.row().classes('items-center gap-3'):
                ui.icon('link').classes('text-cyan-400 text-3xl')
                ui.label('Live Blockchain').classes('text-white font-bold text-3xl')
            ui.label('Real-time immutable ledger visualization').classes('text-gray-400 text-sm')
        
        with ui.card().classes('liquid-glass specular w-full p-8').style('border-radius: 24px;'):
            with ui.row().classes('w-full items-center justify-center gap-4'):
                # 5 blocks with connectors
                blocks = [
                    ('#0', 'GENESIS', '#10B981', '0'),
                    ('#1', 'DATASET', '#38BDF8', '1'),
                    ('#2', 'MODEL', '#8B5CF6', '2'),
                    ('#3', 'TRUST', '#F59E0B', '3'),
                    ('#4', 'INFERENCE', '#EF4444', '4'),
                ]
                for i, (num, label, color, delay) in enumerate(blocks):
                    with ui.column().classes('items-center gap-2'):
                        ui.html(f'''
                            <div class="blockchain-block" style="animation-delay: {int(delay)*0.4}s; border-color: {color}60; min-width: 100px;">
                                <div style="text-align: center;">
                                    <div style="color: {color}; font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em;">{num}</div>
                                    <div style="color: #94A3B8; font-size: 0.65rem; letter-spacing: 2px; margin-top: 4px;">{label}</div>
                                </div>
                            </div>
                        ''')
                    
                    if i < len(blocks) - 1:
                        ui.icon('arrow_forward').classes('text-cyan-400 text-xl')


# ============================================================
# HOW IT WORKS
# ============================================================
def how_it_works():
    ui.add_head_html('''
    <style>
        .step-card-upgraded {
            padding: 28px 20px !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative;
            overflow: hidden;
            text-align: center;
            border-radius: 24px;
        }
        .step-card-upgraded::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: var(--step-color);
            opacity: 0.6;
            transition: opacity 0.3s ease;
        }
        .step-badge-circle {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 800;
            color: white;
            margin: 0 auto;
            transition: all 0.4s ease;
        }
        .step-card-upgraded:hover .step-badge-circle {
            transform: scale(1.1) rotate(5deg);
        }
        .step-number-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(15, 23, 42, 0.95);
            border: 2px solid var(--step-color);
            color: var(--step-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 700;
        }
        @keyframes gradient-slide {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }
        .timeline-progress {
            height: 4px;
            background: linear-gradient(90deg, #38BDF8, #8B5CF6, #10B981, #F59E0B, #38BDF8);
            background-size: 200% auto;
            animation: gradient-slide 3s linear infinite;
            border-radius: 2px;
        }
    </style>
    ''')
    
    with ui.column().classes('w-full section-tight gap-8'):
        with ui.column().classes('items-center gap-2 w-full'):
            with ui.row().classes('items-center gap-3'):
                ui.icon('route').classes('text-cyan-400 text-3xl')
                ui.label('How It Works').classes('text-white font-bold text-3xl')
            ui.label('Four simple steps to verify your AI datasets').classes('text-gray-400 text-sm')
        
        with ui.row().classes('w-full items-center justify-center').style('max-width: 1200px; margin: 0 auto;'):
            ui.html('<div class="timeline-progress" style="width: 100%;"></div>')
        
        with ui.row().classes('w-full items-stretch justify-center').style('gap: 0; max-width: 1200px; margin: 0 auto;'):
            steps = [
                ('1', 'Upload Dataset', 'Drag & drop your dataset file', '#38BDF8', 'cloud_upload'),
                ('2', 'Generate Hash', 'SHA-256 cryptographic fingerprint', '#8B5CF6', 'fingerprint'),
                ('3', 'Mine Block', 'Proof of Work on blockchain', '#10B981', 'gavel'),
                ('4', 'Evaluate Trust', 'Weighted trust scoring', '#F59E0B', 'verified_user'),
            ]
            
            for i, (num, title, desc, color, icon) in enumerate(steps):
                with ui.card().classes('liquid-glass specular step-card-upgraded').style(f'--step-color: {color}; flex: 1; max-width: 260px; border-radius: 24px;'):
                    with ui.column().classes('gap-3 items-center'):
                        with ui.element('div').style('position: relative; display: inline-block;'):
                            ui.html(f'<div class="step-badge-circle" style="background: linear-gradient(135deg, {color}, {color}cc); box-shadow: 0 0 30px {color}60;"><span style="font-size: 1.5rem;">{icon}</span></div>')
                            ui.html(f'<div class="step-number-badge" style="--step-color: {color};">{num}</div>')
                        
                        ui.label(title).classes('text-white font-bold text-base mt-2')
                        ui.label(desc).classes('text-gray-400 text-xs').style('line-height: 1.5; max-width: 200px;')
                
                if i < len(steps) - 1:
                    with ui.column().classes('items-center justify-center').style('min-width: 50px;'):
                        ui.icon('arrow_forward').classes('text-cyan-400 text-2xl')


# ============================================================
# TRUST & INSIGHTS
# ============================================================
def trust_and_insights():
    with ui.row().classes('w-full gap-6 section-tight'):
        with ui.card().classes('liquid-glass specular flex-1 p-5').style('border-radius: 24px;'):
            with ui.row().classes('w-full items-center justify-between mb-4'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon('verified_user').classes('text-purple-400 text-xl')
                    ui.label('Trust Score').classes('text-white font-semibold text-base')
            with ui.row().classes('w-full gap-6 items-center'):
                with ui.column().classes('items-center'):
                    ui.html('''
                        <div style="width: 100px; height: 100px; border-radius: 50%; 
                                    background: conic-gradient(#8B5CF6 0% 87%, #252540 87% 100%);
                                    display: flex; align-items: center; justify-content: center;
                                    box-shadow: 0 0 40px rgba(139, 92, 246, 0.3);">
                            <div style="width: 76px; height: 76px; border-radius: 50%; 
                                        background: #0F0F1F; display: flex; flex-direction: column;
                                        align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 1.25rem; font-weight: 700;">87%</span>
                                <span style="color: #6B7280; font-size: 0.6rem;">TRUST</span>
                            </div>
                        </div>
                    ''')
                with ui.column().classes('gap-2 flex-1'):
                    for icon, title, sub, color in [('check_circle', 'Hash Verified', 'All records match', 'green'), ('check_circle', 'No Tampering', 'Integrity intact', 'green'), ('warning', 'Minor Drift', '2 features affected', 'yellow')]:
                        with ui.row().classes('items-start gap-2'):
                            ui.icon(icon).classes(f'text-{color}-400 text-sm')
                            with ui.column().classes('gap-0'):
                                ui.label(title).classes('text-white text-xs font-medium')
                                ui.label(sub).classes('text-gray-500 text-xs')
        
        with ui.card().classes('liquid-glass specular flex-1 p-5').style('border-radius: 24px;'):
            with ui.row().classes('w-full items-center justify-between mb-4'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon('storage').classes('text-blue-400 text-xl')
                    ui.label('Recent Datasets').classes('text-white font-semibold text-base')
                ui.button('View All →', on_click=lambda: ui.navigate.to('/datasets')).props('flat dense no-caps').classes('text-purple-400 text-xs')
            for name, status, color in [('ImageNet-1K', 'Verified', 'green'), ('COCO-2017', 'Verified', 'green'), ('OpenImages-v7', 'Pending', 'yellow'), ('LAION-5B', 'Verified', 'green')]:
                with ui.row().classes('items-center justify-between w-full py-2').style('border-bottom: 1px solid rgba(255,255,255,0.06);'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('folder').classes('text-gray-400 text-sm')
                        ui.label(name).classes('text-white text-xs')
                    ui.badge(status).classes(f'bg-{color}-500 text-xs')


# ============================================================
# LIVE ACTIVITY FEED
# ============================================================
def live_activity_feed():
    ui.add_head_html('''
    <style>
        .activity-item {
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 14px 18px;
            transition: all 0.3s ease;
            border-left: 3px solid var(--activity-color);
            backdrop-filter: blur(20px);
        }
        .activity-item:hover {
            background: rgba(15, 23, 42, 0.6);
            border-left-width: 5px;
            transform: translateX(4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
    </style>
    ''')
    
    with ui.column().classes('w-full section-tight gap-4'):
        with ui.element('div').classes('section-title'):
            ui.label('📡').classes('text-xl')
            ui.label('Live Activity Feed').classes('text-white font-bold text-lg')
            ui.html('<div class="live-dot" style="margin-left: 8px;"></div>')
        
        activities = [
            ('✅', 'ImageNet-1K verified on blockchain', '2 min ago', '#10B981', 'verified'),
            ('🔗', 'Block #6 mined with difficulty 4', '5 min ago', '#38BDF8', 'link'),
            ('🚨', 'Data poisoning attack detected & blocked', '12 min ago', '#EF4444', 'security'),
            ('📤', 'good_dataset.zip uploaded (49.6 MB)', '15 min ago', '#8B5CF6', 'cloud_upload'),
            ('🧠', 'XAI GradCAM heatmaps generated (12 images)', '28 min ago', '#F59E0B', 'psychology'),
            ('📊', 'Trust score recalculated: 87% ACCEPTED', '1 hour ago', '#10B981', 'verified_user'),
        ]
        
        with ui.column().classes('w-full gap-2'):
            for icon, text, time, color, material_icon in activities:
                with ui.element('div').classes('activity-item').style(f'--activity-color: {color};'):
                    with ui.row().classes('w-full items-center justify-between'):
                        with ui.row().classes('items-center gap-3'):
                            ui.icon(material_icon).classes('text-xl').style(f'color: {color};')
                            ui.label(text).classes('text-gray-300 text-sm')
                        ui.label(time).classes('text-gray-500 text-xs')


# ============================================================
# TECH STACK BAND
# ============================================================
def tech_stack_band():
    with ui.column().classes('w-full section-tight gap-4'):
        with ui.column().classes('items-center gap-2 w-full'):
            with ui.row().classes('items-center gap-3'):
                ui.icon('memory').classes('text-purple-400 text-2xl')
                ui.label('Powered By').classes('text-white font-bold text-2xl')
            ui.label('Enterprise-grade technologies').classes('text-gray-400 text-sm')
        
        with ui.row().classes('w-full gap-3 justify-center flex-wrap'):
            techs = [
                ('SHA-256', 'fingerprint', '#38BDF8'),
                ('RSA-2048', 'key', '#8B5CF6'),
                ('YOLOv8n', 'model_training', '#10B981'),
                ('NiceGUI', 'web', '#F59E0B'),
                ('Python 3.11', 'code', '#EF4444'),
                ('Proof of Work', 'gavel', '#06B6D4'),
            ]
            for name, icon, color in techs:
                with ui.card().classes('liquid-glass specular px-5 py-3').style(f'border-radius: 16px;'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon(icon).classes('text-lg').style(f'color: {color}; text-shadow: 0 0 15px {color}80;')
                        ui.label(name).classes('text-white font-medium text-sm')


# ============================================================
# CTA SECTION
# ============================================================
def cta_section():
    with ui.column().classes('w-full section-tight'):
        with ui.card().classes('liquid-glass specular w-full p-12').style('border-radius: 32px; background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(139, 92, 246, 0.08)) !important;'):
            with ui.column().classes('items-center gap-4 w-full'):
                ui.icon('rocket_launch').classes('text-cyan-400 text-5xl').style('text-shadow: 0 0 40px rgba(56, 189, 248, 0.6);')
                ui.label('Ready to Secure Your AI Pipeline?').classes('text-white font-bold text-3xl text-center')
                ui.label('Join 120+ enterprises already verifying their AI datasets with blockchain-grade integrity.').classes('text-gray-400 text-base text-center').style('max-width: 600px;')
                with ui.row().classes('gap-3 mt-2'):
                    ui.button('Get Started Free →', on_click=lambda: ui.navigate.to('/upload')).classes('hero-cta-primary magnetic-btn px-8 py-3 rounded-xl font-semibold text-sm')
                    ui.button('View Documentation', on_click=lambda: ui.navigate.to('/about')).classes('hero-cta-secondary magnetic-btn px-8 py-3 rounded-xl font-semibold text-sm')


# ============================================================
# HOME PAGE
# ============================================================
@ui.page('/')
def home():
    apply_styles(ui)
    apply_apple_glass(ui)
    navigation()
    hero_section()
    live_stats_counter()
    feature_cards()
    blockchain_visualizer()
    how_it_works()
    trust_and_insights()
    live_activity_feed()
    tech_stack_band()
    cta_section()
    footer()


# ============================================================
# SOLUTIONS PAGE
# ============================================================
@ui.page('/solutions')
def solutions():
    apply_styles(ui)
    apply_apple_glass(ui)
    navigation()
    with ui.column().classes('w-full section-tight gap-6'):
        ui.label('Our Solutions').classes('text-white font-bold text-4xl')
        ui.label('Comprehensive AI dataset integrity solutions for modern enterprises.').classes('text-gray-400 text-base')
        with ui.row().classes('w-full gap-4 mt-4'):
            for icon, title, desc in [
                ('🔐', 'Blockchain Verification', 'Immutable hash storage ensures your datasets can never be tampered with.'),
                ('🧠', 'Explainable AI', 'Understand why your model makes decisions with SHAP and LIME integration.'),
                ('🎥', 'Deepfake Detection', 'Advanced video analysis to detect manipulated media in real-time.'),
                ('📊', 'Drift Detection', 'Monitor model performance and detect data drift before it affects results.'),
                ('🔍', 'Dataset Forensics', 'Deep inspection of dataset provenance and integrity chains.'),
                ('🤝', 'Collaboration Tools', 'Team workspaces with role-based access and audit trails.'),
            ]:
                with ui.card().classes('liquid-glass specular p-5').style('border-radius: 24px; min-width: 280px; flex: 1;'):
                    ui.label(icon).classes('text-3xl mb-2')
                    ui.label(title).classes('text-white font-bold text-base mb-2')
                    ui.label(desc).classes('text-gray-400 text-xs').style('line-height: 1.6;')
    footer()


# ============================================================
# ABOUT PAGE
# ============================================================
@ui.page('/about')
def about():
    apply_styles(ui)
    apply_apple_glass(ui)
    navigation()
    with ui.column().classes('w-full section-tight gap-6'):
        ui.label('About CV-INTEGRITY AI').classes('text-white font-bold text-4xl')
        ui.label('Building trust in AI through verification and transparency.').classes('text-gray-400 text-base')
        with ui.card().classes('liquid-glass specular w-full p-6 mt-2').style('border-radius: 24px;'):
            ui.label('Our Mission').classes('text-white font-bold text-xl mb-3')
            ui.label('We believe that trust is the foundation of AI adoption. Our platform ensures that every dataset used to train AI models is verified, authentic, and tamper-proof. By combining blockchain technology, explainable AI, and advanced forensics, we help organizations build AI systems that people can trust.').classes('text-gray-300 text-sm').style('line-height: 1.8;')
        with ui.row().classes('w-full gap-4 mt-2'):
            for val, label in [('2024', 'Founded'), ('50K+', 'Datasets Verified'), ('1M+', 'Verifications'), ('120+', 'Enterprise Clients')]:
                with ui.card().classes('liquid-glass specular flex-1 p-4 text-center').style('border-radius: 24px;'):
                    ui.label(val).classes('text-purple-400 font-bold text-2xl')
                    ui.label(label).classes('text-gray-400 text-xs mt-1')
    footer()


# ============================================================
# REGISTER ALL PAGES
# ============================================================
create_blockchain_page()
create_trust_page()
create_xai_page()
create_upload_page()
create_datasets_page()
create_drift_page()
create_analytics_page()
create_video_page()
create_cybersecurity_page()
create_robustness_page()
create_performance_page()
create_auth_page()
create_wallet_page()
create_reports_page()
create_collaboration_page()
create_contributors_page()
create_attack_simulator_page()
create_format_support_page()
create_quality_page()
create_model_integrity_page()
create_backdoor_page()
create_replay_page()


# ============================================================
# SERVE STATIC FILES
# ============================================================
_project_root = Path(__file__).parent.parent
app.add_static_files('/outputs', str(_project_root / 'outputs'))
app.add_static_files('/datasets', str(_project_root / 'datasets'))
app.add_static_files('/attack_simulator', str(_project_root / 'attack_simulator'))


# ============================================================
# RUN
# ============================================================
if __name__ in {"__main__", "__mp_main__"}:
    ui.run(
        storage_secret='cv-integrity-secret-key-2026',
        title='CV-INTEGRITY AI',
        port=8520,
        reload=False,
        show=False,
        favicon='🧠',
    )