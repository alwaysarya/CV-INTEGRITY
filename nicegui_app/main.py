"""
CV-INTEGRITY AI - NiceGUI Application
All 12 pages registered
"""

from nicegui import ui, app
from pathlib import Path

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
from wallet_page import create_wallet_page
from reports_page import create_reports_page
from quality_page import create_quality_page
from collaboration_page import create_collaboration_page
from model_integrity_page import create_model_integrity_page
from backdoor_page import create_backdoor_page
from contributors_page import create_contributors_page
from replay_page import create_replay_page
from format_support_page import create_format_support_page
from attack_simulator_page import create_attack_simulator_page
from auth_page import create_auth_page


# ============================================================
# SHARED SETUP
# ============================================================
def setup_page():
    ui.dark_mode().enable()
    ui.add_head_html('''
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        body, .q-page { 
            font-family: 'Inter', -apple-system, sans-serif !important;
            background: #0A0E1A !important; 
        }
        .q-page-container { padding: 0 !important; }
        .nicegui-content { padding: 0 !important; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .q-icon { display: inline-flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; }
        .q-card { background: transparent !important; box-shadow: none !important; }
        .section-tight { padding: 32px 64px !important; }
        .section-hero { padding: 60px 64px !important; }
    </style>
    ''')


def navigation():
    """Shared navigation bar with search + user info."""
    with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
        'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.15); position: sticky; top: 0; z-index: 100;'
    ):
        # Left: Logo
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
        
        # Center: Nav links
        with ui.row().classes('items-center gap-1'):
            for label, path in [
                ('Home', '/'),
                ('Blockchain', '/blockchain'),
                ('Trust', '/trust'),
                ('Model Integrity', '/model-integrity'),
                ('Backdoor', '/backdoor'),
                ('Wallet', '/wallet'),
                ('Collaboration', '/collaboration'),
                ('Contributors', '/contributors'),
                ('Reports', '/reports'),
                ('XAI', '/xai'),
                ('Upload', '/upload'),
                ('Datasets', '/datasets'),
                ('Formats', '/formats'),
                ('Quality', '/quality'),
                ('Drift', '/drift'),
                ('Analytics', '/analytics'),
                ('Video', '/video'),
                ('Attack Sim', '/attack-simulator'),
                ('Cyber', '/cybersecurity'),
                ('Replay', '/replay'),
                ('Robust', '/robustness'),
                ('Performance', '/performance'),
            ]:
                ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps dense').classes('text-gray-400 text-xs')
        
        # Right: Search + Notification + User
        with ui.row().classes('items-center gap-3'):
            # Search bar
            with ui.row().classes('items-center gap-2 px-3 py-1 rounded-lg').style(
                'background: rgba(21, 21, 42, 0.8); border: 1px solid #252540; width: 200px;'
            ):
                ui.icon('search').classes('text-gray-500 text-sm')
                ui.label('Search...').classes('text-gray-500 text-xs')
            
            # Notification
            ui.icon('notifications_none').classes('text-gray-400 cursor-pointer')
            
            # User avatar + info
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
    with ui.row().classes('w-full items-center justify-between px-16 py-4').style(
        'border-top: 1px solid #252540; margin-top: 40px;'
    ):
        ui.label('© 2026 CV-INTEGRITY AI. All rights reserved.').classes('text-gray-500 text-xs')
        ui.label('Backend: ✅ Connected').classes('text-gray-500 text-xs')


# ============================================================
# HOME PAGE SECTIONS
# ============================================================
def hero_section():
    with ui.row().classes('w-full items-center justify-between gap-8 section-hero'):
        with ui.column().classes('gap-5').style('max-width: 560px;'):
            with ui.row().classes('items-center gap-2 px-3 py-1 rounded-full').style(
                'background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); width: fit-content;'
            ):
                ui.label('⚡').classes('text-cyan-400 text-sm')
                ui.label('AI-Powered Dataset Integrity').classes('text-cyan-400 text-xs font-medium')
            ui.label('Verify Your AI Datasets with Confidence').classes('text-white font-bold').style('font-size: 2.75rem; line-height: 1.15;')
            ui.label('Detect tampering, ensure authenticity, and build trust in your AI models with blockchain-verified dataset integrity.').classes('text-gray-400 text-base').style('line-height: 1.6;')
            with ui.row().classes('gap-3 mt-2'):
                ui.button('Upload Dataset →', on_click=lambda: ui.navigate.to('/upload')).classes('px-5 py-2 rounded-lg font-medium text-sm').style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
                ui.button('▶ View Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-5 py-2 rounded-lg font-medium text-sm').style('background: transparent; border: 1px solid #252540; color: white;')
            with ui.row().classes('items-center gap-6 mt-3'):
                for val, label in [('99.9%', 'Accuracy'), ('50K+', 'Datasets'), ('1M+', 'Verifications')]:
                    with ui.column().classes('gap-0'):
                        ui.label(val).classes('text-white font-bold text-xl')
                        ui.label(label).classes('text-gray-500 text-xs')
        
        with ui.card().classes('p-6').style('background: rgba(15, 23, 42, 0.6); border: 1px solid #252540; border-radius: 16px; min-width: 320px; max-width: 380px;'):
            for icon, title, sub, color in [('verified', 'Dataset Verified', 'Blockchain confirmed', 'green'), ('fingerprint', 'Hash: 0x7a3f...9b2c', 'SHA-256', 'purple'), ('schedule', 'Last verified', '2 minutes ago', 'blue')]:
                with ui.row().classes('items-center gap-3 mb-4'):
                    ui.icon(icon).classes(f'text-{color}-400 text-2xl')
                    with ui.column().classes('gap-0'):
                        ui.label(title).classes('text-white font-semibold text-sm')
                        ui.label(sub).classes('text-gray-500 text-xs')


def feature_cards():
    """4 feature cards - CLICKABLE."""
    with ui.row().classes('w-full items-center justify-between gap-4 section-tight'):
        cards = [
            ('shield', 'Blockchain Secured', 'Immutable records', '#8B5CF6', '/blockchain'),
            ('psychology', 'XAI Powered', 'Explainable AI', '#3B82F6', '/xai'),
            ('videocam', 'Video Analysis', 'Deepfake detection', '#10B981', '/video'),
            ('trending_up', 'Drift Detection', 'Model monitoring', '#F59E0B', '/drift'),
            ('analytics', 'Analytics', 'Data insights', '#06B6D4', '/analytics'),
            ('security', 'Cybersecurity', 'Attack detection', '#EF4444', '/cybersecurity'),
            ('science', 'Robustness', 'Stress testing', '#A78BFA', '/robustness'),
            ('speed', 'Performance', 'Model metrics', '#F472B6', '/performance'),
        ]
        for icon, title, subtitle, color, path in cards:
            with ui.card().classes('flex-1 p-4 cursor-pointer').style(
                'background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px; transition: all 0.3s ease;'
            ).on('click', lambda p=path: ui.navigate.to(p)):
                with ui.row().classes('items-center gap-3'):
                    ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                    with ui.column().classes('gap-0'):
                        ui.label(title).classes('text-white font-semibold text-sm')
                        ui.label(subtitle).classes('text-gray-500 text-xs')


def trust_and_insights():
    with ui.row().classes('w-full gap-6 section-tight'):
        # Trust Score
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
        
        # Recent Datasets
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
    setup_page()
    navigation()
    hero_section()
    feature_cards()
    trust_and_insights()
    footer()


# ============================================================
# SOLUTIONS PAGE
# ============================================================
@ui.page('/solutions')
def solutions():
    setup_page()
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
    setup_page()
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
create_wallet_page()
create_reports_page()
create_quality_page()
create_collaboration_page()
create_model_integrity_page()
create_backdoor_page()
create_contributors_page()
create_replay_page()
create_format_support_page()
create_attack_simulator_page()
create_auth_page()


# ============================================================
# SERVE STATIC FILES
# ============================================================
_project_root = Path(__file__).parent.parent
app.add_static_files('/outputs', str(_project_root / 'outputs'))
app.add_static_files('/datasets', str(_project_root / 'datasets'))


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
