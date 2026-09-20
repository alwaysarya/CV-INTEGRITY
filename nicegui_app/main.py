"""
CV-INTEGRITY AI - NiceGUI Application
All 21 pages registered + Enhanced Balanced Home Page + How It Works
"""

from nicegui import ui, app
from pathlib import Path
from search import search as global_search
from styles import apply_styles

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
    """Grouped navigation with dropdowns."""
    with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
        'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15); position: sticky; top: 0; z-index: 100;'
    ):
        with ui.row().classes('items-center gap-3'):
            ui.html('''
                <div style="width: 32px; height: 32px; border-radius: 50%; 
                            background: linear-gradient(135deg, #38BDF8, #0EA5E9); 
                            display: flex; align-items: center; justify-content: center;
                            font-size: 1rem;">🧠</div>
            ''')
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
            with ui.row().classes('items-center gap-2 px-3 py-1 rounded-lg').style('background: rgba(21, 21, 42, 0.8); border: 1px solid #252540; width: 220px;'):
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
                ui.html('''
                    <div style="width: 32px; height: 32px; border-radius: 50%; 
                                background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                                display: flex; align-items: center; justify-content: center;
                                color: white; font-weight: 700; font-size: 0.75rem;">AT</div>
                ''')
                with ui.column().classes('gap-0'):
                    ui.label('Aryan Thakur').classes('text-white text-xs font-medium')
                    ui.label('Administrator').classes('text-gray-500 text-xs')


def footer():
    with ui.row().classes('w-full items-center justify-between px-16 py-4').style('border-top: 1px solid #252540; margin-top: 40px;'):
        ui.label('© 2026 CV-INTEGRITY AI. All rights reserved.').classes('text-gray-500 text-xs')
        ui.label('Backend: ✅ Connected').classes('text-gray-500 text-xs')


# ============================================================
# HERO SECTION
# ============================================================
def hero_section():
    """Enhanced hero section with balanced spacing."""
    ui.add_head_html('''
    <style>
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes float-up {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(56, 189, 248, 0.2); }
            50% { box-shadow: 0 0 30px rgba(56, 189, 248, 0.7), 0 0 60px rgba(56, 189, 248, 0.4); }
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
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: pulse-glow 3s ease-in-out infinite;
        }
        .hero-cta-primary:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 0 40px rgba(56, 189, 248, 0.8), 0 0 80px rgba(56, 189, 248, 0.4);
        }
        .hero-cta-secondary {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(139, 92, 246, 0.4);
            color: white;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        .hero-cta-secondary:hover {
            border-color: rgba(139, 92, 246, 0.8);
            background: rgba(139, 92, 246, 0.1);
            transform: translateY(-2px);
        }
        .floating-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: float-up 6s ease-in-out infinite;
        }
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
        .stat-glow { transition: all 0.3s ease; }
        .stat-glow:hover { transform: scale(1.05); filter: drop-shadow(0 0 20px currentColor); }
        
        .hero-balanced {
            padding: 60px 80px !important;
            gap: 60px !important;
            max-width: 1400px;
            margin: 0 auto;
        }
        .hero-left { flex: 1 1 55%; max-width: 640px; }
        .hero-right { flex: 1 1 40%; max-width: 440px; }
        
        @media (max-width: 1200px) {
            .hero-balanced { padding: 40px 40px !important; gap: 40px !important; }
        }
    </style>
    ''')
    
    ui.add_body_html('''
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden;">
        <div class="floating-particle" style="width: 4px; height: 4px; background: #38BDF8; top: 15%; left: 10%; opacity: 0.4; animation-delay: 0s;"></div>
        <div class="floating-particle" style="width: 6px; height: 6px; background: #8B5CF6; top: 25%; left: 85%; opacity: 0.3; animation-delay: 1s;"></div>
        <div class="floating-particle" style="width: 3px; height: 3px; background: #10B981; top: 60%; left: 15%; opacity: 0.5; animation-delay: 2s;"></div>
        <div class="floating-particle" style="width: 5px; height: 5px; background: #F59E0B; top: 70%; left: 80%; opacity: 0.3; animation-delay: 3s;"></div>
        <div class="floating-particle" style="width: 4px; height: 4px; background: #38BDF8; top: 40%; left: 50%; opacity: 0.4; animation-delay: 4s;"></div>
        <div class="floating-particle" style="width: 7px; height: 7px; background: #8B5CF6; top: 80%; left: 40%; opacity: 0.2; animation-delay: 5s;"></div>
    </div>
    ''')
    
    with ui.row().classes('w-full items-center justify-center hero-balanced').style('position: relative; z-index: 1;'):
        with ui.column().classes('gap-6 hero-left'):
            with ui.row().classes('items-center gap-2 px-4 py-2 rounded-full').style(
                'background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); width: fit-content; backdrop-filter: blur(10px);'
            ):
                ui.html('<div class="live-dot"></div>')
                ui.label('AI-Powered Dataset Integrity').classes('text-purple-400 text-xs font-medium tracking-wide')
            
            ui.label('Verify Your AI Datasets with Confidence').classes('hero-gradient-text font-bold').style('font-size: 3rem; line-height: 1.15; font-weight: 800;')
            
            ui.label('Detect tampering, ensure authenticity, and build trust in your AI models with blockchain-verified dataset integrity.').classes('text-gray-400 text-base').style('line-height: 1.7; max-width: 520px;')
            
            with ui.row().classes('gap-3 mt-2'):
                ui.button('Upload Dataset →', on_click=lambda: ui.navigate.to('/upload')).classes('hero-cta-primary px-6 py-3 rounded-xl font-medium text-sm')
                ui.button('▶ Watch Demo').classes('hero-cta-secondary px-6 py-3 rounded-xl font-medium text-sm')
            
            with ui.row().classes('items-center gap-10 mt-6'):
                for val, label, color in [('99.9%', 'Accuracy', '#38BDF8'), ('50K+', 'Datasets', '#8B5CF6'), ('1M+', 'Verifications', '#10B981')]:
                    with ui.column().classes('gap-0 stat-glow').style(f'color: {color};'):
                        ui.label(val).classes('font-bold text-2xl').style(f'color: {color}; text-shadow: 0 0 20px {color}60;')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wide')
        
        with ui.column().classes('gap-4 hero-right'):
            with ui.card().classes('w-full p-6').style(
                'background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(56, 189, 248, 0.1);'
            ):
                with ui.row().classes('w-full items-center justify-between mb-5'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('verified').classes('text-green-400 text-2xl')
                        with ui.column().classes('gap-0'):
                            ui.label('Dataset Verified').classes('text-white font-bold text-sm')
                            ui.label('Blockchain confirmed').classes('text-gray-500 text-xs')
                    with ui.row().classes('items-center gap-1 px-3 py-1 rounded-full').style('background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);'):
                        ui.html('<div class="live-dot"></div>')
                        ui.label('LIVE').classes('text-green-400 text-xs font-bold tracking-wider')
                
                with ui.column().classes('w-full gap-2 mb-4 p-4 rounded-xl').style('background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(139, 92, 246, 0.2);'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('fingerprint').classes('text-purple-400 text-lg')
                        ui.label('SHA-256 Hash').classes('text-gray-400 text-xs tracking-wider')
                    ui.label('0x7a3f...9b2c').classes('text-purple-300 text-sm mono font-medium')
                
                with ui.column().classes('w-full gap-2 mb-4 p-4 rounded-xl').style('background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(56, 189, 248, 0.2);'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('schedule').classes('text-cyan-400 text-lg')
                        ui.label('Last Verified').classes('text-gray-400 text-xs tracking-wider')
                    ui.label('2 minutes ago').classes('text-cyan-300 text-sm font-medium')
                
                with ui.column().classes('w-full gap-2 pt-4').style('border-top: 1px solid rgba(56, 189, 248, 0.15);'):
                    with ui.row().classes('w-full justify-between items-center'):
                        ui.label('Trust Score').classes('text-gray-400 text-xs tracking-wider')
                        ui.label('87%').classes('text-green-400 font-bold text-lg')
                    ui.html('<div style="background: rgba(255,255,255,0.08); height: 6px; border-radius: 3px; overflow: hidden;"><div style="width: 87%; height: 100%; background: linear-gradient(90deg, #10B981, #38BDF8); border-radius: 3px;"></div></div>')


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
            with ui.card().classes('flex-1 p-3 cursor-pointer').style(
                'background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px; transition: all 0.3s ease;'
            ).on('click', lambda p=path: ui.navigate.to(p)):
                with ui.column().classes('items-center gap-1'):
                    ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                    ui.label(title).classes('text-white font-semibold text-xs text-center')
                    ui.label(subtitle).classes('text-gray-500 text-xs text-center')


# ============================================================
# HOW IT WORKS SECTION
# ============================================================
def how_it_works():
    """4-step process flow with animated connectors."""
    ui.add_head_html('''
    <style>
        .step-card {
            background: rgba(15, 23, 42, 0.6) !important;
            border: 1px solid rgba(56, 189, 248, 0.2) !important;
            border-radius: 16px !important;
            padding: 24px !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative;
            overflow: hidden;
        }
        .step-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #38BDF8, #8B5CF6);
            transition: width 0.3s ease;
        }
        .step-card:hover {
            transform: translateY(-4px);
            border-color: rgba(56, 189, 248, 0.5) !important;
            box-shadow: 0 12px 40px rgba(56, 189, 248, 0.15);
        }
        .step-card:hover::before {
            width: 6px;
        }
        .step-number {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            font-weight: 800;
            color: white;
            box-shadow: 0 0 20px currentColor;
        }
        @keyframes dash-flow {
            0% { background-position: 0 0; }
            100% { background-position: 40px 0; }
        }
        .connector-line {
            height: 2px;
            background: linear-gradient(90deg, rgba(56, 189, 248, 0.6) 0%, rgba(56, 189, 248, 0.6) 50%, transparent 50%, transparent 100%);
            background-size: 20px 100%;
            animation: dash-flow 1s linear infinite;
        }
    </style>
    ''')
    
    with ui.column().classes('w-full section-tight gap-6'):
        # Section header
        with ui.column().classes('items-center gap-2 w-full mb-4'):
            with ui.row().classes('items-center gap-3'):
                ui.icon('route').classes('text-cyan-400 text-3xl')
                ui.label('How It Works').classes('text-white font-bold text-3xl')
            ui.label('Four simple steps to verify your AI datasets').classes('text-gray-400 text-sm')
        
        # 4 steps
        with ui.row().classes('w-full items-stretch justify-center gap-4'):
            steps = [
                ('1', 'Upload Dataset', 'Drag & drop your dataset file', '#38BDF8', 'cloud_upload'),
                ('2', 'Generate Hash', 'SHA-256 cryptographic fingerprint', '#8B5CF6', 'fingerprint'),
                ('3', 'Mine Block', 'Proof of Work on blockchain', '#10B981', 'gavel'),
                ('4', 'Evaluate Trust', 'Weighted trust scoring', '#F59E0B', 'verified_user'),
            ]
            for i, (num, title, desc, color, icon) in enumerate(steps):
                # Card
                with ui.card().classes('step-card flex-1').style(f'max-width: 280px;'):
                    with ui.column().classes('gap-3'):
                        with ui.row().classes('items-center gap-3'):
                            ui.html(f'<div class="step-number" style="background: linear-gradient(135deg, {color}, {color}dd); color: {color};">{num}</div>')
                            ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                        
                        ui.label(title).classes('text-white font-bold text-base')
                        ui.label(desc).classes('text-gray-400 text-xs').style('line-height: 1.5;')
                
                # Connector (between cards)
                if i < len(steps) - 1:
                    with ui.column().classes('items-center justify-center').style('min-width: 30px;'):
                        ui.html('<div style="width: 30px; height: 2px; background: linear-gradient(90deg, rgba(56, 189, 248, 0.6), rgba(56, 189, 248, 0.1)); position: relative;"></div>')
                        ui.icon('arrow_forward').classes('text-cyan-400 text-sm').style('margin-top: -6px;')


# ============================================================
# TRUST & INSIGHTS
# ============================================================
def trust_and_insights():
    with ui.row().classes('w-full gap-6 section-tight'):
        with ui.card().classes('flex-1 p-5').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px;'):
            with ui.row().classes('w-full items-center justify-between mb-4'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon('verified_user').classes('text-purple-400 text-xl')
                    ui.label('Trust Score').classes('text-white font-semibold text-base')
            with ui.row().classes('w-full gap-6 items-center'):
                with ui.column().classes('items-center'):
                    ui.html('''
                        <div style="width: 100px; height: 100px; border-radius: 50%; 
                                    background: conic-gradient(#8B5CF6 0% 87%, #252540 87% 100%);
                                    display: flex; align-items: center; justify-content: center;">
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
        
        with ui.card().classes('flex-1 p-5').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px;'):
            with ui.row().classes('w-full items-center justify-between mb-4'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon('storage').classes('text-blue-400 text-xl')
                    ui.label('Recent Datasets').classes('text-white font-semibold text-base')
                ui.button('View All →', on_click=lambda: ui.navigate.to('/datasets')).props('flat dense no-caps').classes('text-purple-400 text-xs')
            for name, status, color in [('ImageNet-1K', 'Verified', 'green'), ('COCO-2017', 'Verified', 'green'), ('OpenImages-v7', 'Pending', 'yellow'), ('LAION-5B', 'Verified', 'green')]:
                with ui.row().classes('items-center justify-between w-full py-2').style('border-bottom: 1px solid #252540;'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('folder').classes('text-gray-400 text-sm')
                        ui.label(name).classes('text-white text-xs')
                    ui.badge(status).classes(f'bg-{color}-500 text-xs')


# ============================================================
# HOME PAGE
# ============================================================
@ui.page('/')
def home():
    apply_styles(ui)
    navigation()
    hero_section()
    feature_cards()
    how_it_works()  # ← NEW SECTION
    trust_and_insights()
    footer()


# ============================================================
# SOLUTIONS PAGE
# ============================================================
@ui.page('/solutions')
def solutions():
    apply_styles(ui)
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
                with ui.card().classes('p-5').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px; min-width: 280px; flex: 1;'):
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
    navigation()
    with ui.column().classes('w-full section-tight gap-6'):
        ui.label('About CV-INTEGRITY AI').classes('text-white font-bold text-4xl')
        ui.label('Building trust in AI through verification and transparency.').classes('text-gray-400 text-base')
        with ui.card().classes('w-full p-6 mt-2').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px;'):
            ui.label('Our Mission').classes('text-white font-bold text-xl mb-3')
            ui.label('We believe that trust is the foundation of AI adoption. Our platform ensures that every dataset used to train AI models is verified, authentic, and tamper-proof. By combining blockchain technology, explainable AI, and advanced forensics, we help organizations build AI systems that people can trust.').classes('text-gray-300 text-sm').style('line-height: 1.8;')
        with ui.row().classes('w-full gap-4 mt-2'):
            for val, label in [('2024', 'Founded'), ('50K+', 'Datasets Verified'), ('1M+', 'Verifications'), ('120+', 'Enterprise Clients')]:
                with ui.card().classes('flex-1 p-4 text-center').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px;'):
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