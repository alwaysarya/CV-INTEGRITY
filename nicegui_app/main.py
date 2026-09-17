"""
CV-INTEGRITY AI - NiceGUI 3.x App
FIXED NAVIGATION - All links working
"""

from nicegui import ui, app
from blockchain_page import create_blockchain_page  # noqa
from trust_page import create_trust_page  # noqa
from xai_page import create_xai_page  # noqa
from upload_page import create_upload_page  # noqa
from auth_page import create_auth_page  # noqa
from datasets_page import create_datasets_page  # noqa
from drift_page import create_drift_page  # noqa
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from blockchain.blockchain import Block, Blockchain
    from blockchain.file_hasher import FileHasher
    from auth.auth_manager import AuthManager
    BACKEND_OK = True
except Exception as e:
    print(f"Backend import error: {e}")
    BACKEND_OK = False


# ============================================================
# SHARED SETUP
# ============================================================
def setup_page():
    ui.dark_mode().enable()
    ui.add_head_html('''
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body, .q-page {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
            background: linear-gradient(180deg, #0A0A14 0%, #0F0F1F 100%) !important;
        }
        .q-page-container { padding: 0 !important; }
        .nicegui-content { padding: 0 !important; }
        .q-icon { display: inline-flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; }
        .q-card { background: transparent !important; box-shadow: none !important; }
        .section-tight { padding: 32px 64px !important; }
        .section-hero { padding: 60px 64px !important; }
        .nav-btn {
            color: #9CA3AF !important;
            font-weight: 500 !important;
            font-size: 0.875rem !important;
            text-decoration: none !important;
            cursor: pointer !important;
            padding: 6px 10px !important;
            border-radius: 6px !important;
            transition: all 0.2s !important;
        }
        .nav-btn:hover {
            color: #A78BFA !important;
            background: rgba(139, 92, 246, 0.1) !important;
        }
        .nav-btn.active { color: white !important; }
    </style>
    ''')


def navigation():
    with ui.row().classes('w-full items-center justify-between px-8 py-3').style(
        'background: rgba(10, 10, 20, 0.95); border-bottom: 1px solid rgba(139, 92, 246, 0.2); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100;'
    ):
        with ui.row().classes('items-center gap-3'):
            ui.html('''
                <div style="width: 36px; height: 36px; border-radius: 50%; 
                            background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                            display: flex; align-items: center; justify-content: center;
                            font-size: 1.1rem;">🧠</div>
            ''')
            with ui.column().classes('gap-0'):
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
                ui.label('AI TRUST PLATFORM').classes('text-gray-500 text-xs tracking-wider')
        
        # NAVIGATION - using ui.button with navigate
        with ui.row().classes('items-center gap-1'):
            nav_items = [
                ('Home', '/'),
                ('Solutions', '/solutions'),
                ('Datasets', '/datasets'),
                ('Blockchain', '/blockchain'),
                ('Trust', '/trust'),
                ('XAI', '/xai'),
                ('Drift', '/drift'),
                ('Upload', '/upload'),
                ('About', '/about'),
            ]
            for label, path in nav_items:
                ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).classes('nav-btn').props('flat no-caps')
        
        with ui.row().classes('items-center gap-3'):
            with ui.row().classes('items-center gap-2 px-3 py-1 rounded-lg').style(
                'background: rgba(21, 21, 42, 0.8); border: 1px solid #252540; width: 220px;'
            ):
                ui.icon('search').classes('text-gray-500 text-sm')
                ui.label('Search...').classes('text-gray-500 text-xs')
            ui.icon('notifications_none').classes('text-gray-400')
            ui.html('''
                <div style="width: 32px; height: 32px; border-radius: 50%; 
                            background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                            display: flex; align-items: center; justify-content: center;
                            color: white; font-weight: 700; font-size: 0.75rem;">AT</div>
            ''')


def footer():
    with ui.row().classes('w-full items-center justify-between px-16 py-4').style(
        'border-top: 1px solid #252540; margin-top: 40px;'
    ):
        ui.label('© 2026 CV-INTEGRITY AI. All rights reserved.').classes('text-gray-500 text-xs')
        ui.label(f'Backend: {"✅ Connected" if BACKEND_OK else "❌ Not connected"}').classes('text-gray-500 text-xs')


# ============================================================
# HOME
# ============================================================
def hero_section():
    with ui.row().classes('w-full items-center justify-between gap-8 section-hero'):
        with ui.column().classes('gap-5').style('max-width: 560px;'):
            with ui.row().classes('items-center gap-2 px-3 py-1 rounded-full').style(
                'background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); width: fit-content;'
            ):
                ui.label('⚡').classes('text-purple-400 text-sm')
                ui.label('AI-Powered Dataset Integrity').classes('text-purple-400 text-xs font-medium')
            ui.label('Verify Your AI Datasets with Confidence').classes('text-white font-bold').style('font-size: 2.75rem; line-height: 1.15;')
            ui.label('Detect tampering, ensure authenticity, and build trust in your AI models with blockchain-verified dataset integrity.').classes('text-gray-400 text-base').style('line-height: 1.6;')
            with ui.row().classes('gap-3 mt-2'):
                ui.button('Upload Dataset →', on_click=lambda: ui.navigate.to('/upload')).classes('px-5 py-2 rounded-lg font-medium text-sm').style('background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white;')
                ui.button('▶ View Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-5 py-2 rounded-lg font-medium text-sm').style('background: transparent; border: 1px solid #252540; color: white;')
            with ui.row().classes('items-center gap-6 mt-3'):
                for val, label in [('99.9%', 'Accuracy'), ('50K+', 'Datasets'), ('1M+', 'Verifications')]:
                    with ui.column().classes('gap-0'):
                        ui.label(val).classes('text-white font-bold text-xl')
                        ui.label(label).classes('text-gray-500 text-xs')
        
        with ui.card().classes('p-6').style('background: rgba(21, 21, 42, 0.6); border: 1px solid #252540; border-radius: 16px; min-width: 320px; max-width: 380px;'):
            for icon, title, sub, color in [('verified', 'Dataset Verified', 'Blockchain confirmed', 'green'), ('fingerprint', 'Hash: 0x7a3f...9b2c', 'SHA-256', 'purple'), ('schedule', 'Last verified', '2 minutes ago', 'blue')]:
                with ui.row().classes('items-center gap-3 mb-4'):
                    ui.icon(icon).classes(f'text-{color}-400 text-2xl')
                    with ui.column().classes('gap-0'):
                        ui.label(title).classes('text-white font-semibold text-sm')
                        ui.label(sub).classes('text-gray-500 text-xs')


def stats_row():
    with ui.row().classes('w-full items-center justify-between gap-4 section-tight'):
        feature_cards = [
            ('shield', 'Blockchain Secured', 'Immutable records', '#8B5CF6', '/blockchain'),
            ('psychology', 'XAI Powered', 'Explainable AI', '#3B82F6', '/xai'),
            ('videocam', 'Video Analysis', 'Deepfake detection', '#10B981', '/video'),
            ('trending_up', 'Drift Detection', 'Model monitoring', '#F59E0B', '/drift'),
        ]
        for icon, title, subtitle, color, path in feature_cards:
            with ui.card().classes('flex-1 p-4 cursor-pointer').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px;').on('click', lambda p=path: ui.navigate.to(p)):
                with ui.row().classes('items-center gap-3'):
                    ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                    with ui.column().classes('gap-0'):
                        ui.label(title).classes('text-white font-semibold text-sm')
                        ui.label(subtitle).classes('text-gray-500 text-xs')


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
                ui.button('View All →', on_click=lambda: ui.navigate.to('/datasets')).classes('text-purple-400 text-xs').props('flat no-caps dense')
            for name, status, color in [('ImageNet-1K', 'Verified', 'green'), ('COCO-2017', 'Verified', 'green'), ('OpenImages-v7', 'Pending', 'yellow'), ('LAION-5B', 'Verified', 'green')]:
                with ui.row().classes('items-center justify-between w-full py-2').style('border-bottom: 1px solid #252540;'):
                    with ui.row().classes('items-center gap-2'):
                        ui.icon('folder').classes('text-gray-400 text-sm')
                        ui.label(name).classes('text-white text-xs')
                    ui.badge(status).classes(f'bg-{color}-500 text-xs')


@ui.page('/')
def home():
    setup_page()
    navigation()
    hero_section()
    stats_row()
    trust_and_insights()
    footer()


# ============================================================
# DATASETS
# ============================================================
# [REPLACED] Old datasets route
def datasets():
    setup_page()
    navigation()
    with ui.column().classes('w-full section-tight gap-6'):
        ui.label('Dataset Library').classes('text-white font-bold text-4xl')
        ui.label('Browse, verify, and manage your AI datasets.').classes('text-gray-400 text-base')
        
        with ui.row().classes('w-full gap-3 mt-2 items-center'):
            ui.button('+ Upload New Dataset', on_click=lambda: ui.navigate.to('/upload')).classes('px-5 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white;')
            ui.input(placeholder='Search datasets...').classes('flex-1').style('background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;')
        
        with ui.column().classes('w-full gap-2 mt-2'):
            for name, meta, status, color, hash_val in [
                ('ImageNet-1K', '1.2M images · 1000 classes', 'Verified', 'green', '0x7a3f...9b2c'),
                ('COCO-2017', '330K images · 80 categories', 'Verified', 'green', '0x4d2e...8f1a'),
                ('OpenImages-v7', '9M images · 600 classes', 'Pending', 'yellow', '0x9c1b...3d5e'),
                ('LAION-5B', '5B image-text pairs', 'Verified', 'green', '0x2f8a...6c4d'),
                ('CIFAR-100', '60K images · 100 classes', 'Verified', 'green', '0x1e7b...4a9c'),
            ]:
                with ui.card().classes('w-full p-4').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px;'):
                    with ui.row().classes('w-full items-center justify-between'):
                        with ui.row().classes('items-center gap-3'):
                            ui.icon('storage').classes('text-purple-400 text-2xl')
                            with ui.column().classes('gap-0'):
                                ui.label(name).classes('text-white font-bold text-base')
                                ui.label(meta).classes('text-gray-500 text-xs')
                        with ui.row().classes('items-center gap-3'):
                            with ui.column().classes('gap-0 items-end'):
                                ui.label(f'Hash: {hash_val}').classes('text-gray-400 font-mono text-xs')
                            ui.badge(status).classes(f'bg-{color}-500 text-white px-2 py-1 text-xs')
    footer()


# ============================================================
# BLOCKCHAIN
# ============================================================
# ============================================================
# UPLOAD
# ============================================================
# [REPLACED] Old upload route
def upload():
    setup_page()
    navigation()
    with ui.column().classes('w-full section-tight gap-6'):
        ui.label('Upload Dataset').classes('text-white font-bold text-4xl')
        ui.label('Drag & drop your dataset to verify its integrity.').classes('text-gray-400 text-base')
        
        upload_result = ui.label('').classes('text-gray-400 text-xs mt-2')
        
        def handle_upload(e):
            try:
                if BACKEND_OK:
                    content = e.content.read()
                    h = FileHasher.hash_string(str(content[:1000]))
                    upload_result.text = f'✅ Uploaded: {e.name} · Hash: {h[:32]}...'
                else:
                    upload_result.text = f'✅ File received: {e.name} (backend not connected)'
            except Exception as ex:
                upload_result.text = f'❌ Error: {ex}'
        
        with ui.card().classes('w-full p-8').style('background: rgba(21, 21, 42, 0.4); border: 2px dashed #8B5CF6; border-radius: 16px;'):
            with ui.column().classes('items-center gap-2'):
                ui.icon('cloud_upload').classes('text-purple-400').style('font-size: 4rem;')
                ui.label('Drag & drop files here').classes('text-white font-bold text-xl mt-2')
                ui.label('or click to browse · Max 10GB · CSV, JSON, Parquet, ZIP').classes('text-gray-500 text-sm mt-1')
                ui.upload(on_upload=handle_upload, auto_upload=True).classes('mt-4')
        
        with ui.card().classes('w-full p-5 mt-2').style('background: rgba(21, 21, 42, 0.4); border: 1px solid #252540; border-radius: 12px;'):
            ui.label('Verification Options').classes('text-white font-bold text-lg mb-3')
            with ui.column().classes('gap-2'):
                ui.checkbox('Blockchain verification (SHA-256)').value = True
                ui.checkbox('Deepfake detection')
                ui.checkbox('Data drift analysis')
                ui.checkbox('Generate XAI report')
    footer()


# ============================================================
# SOLUTIONS
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
# ABOUT
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
# RUN
# ============================================================
# Register blockchain page
create_blockchain_page()
create_trust_page()
create_xai_page()
create_upload_page()
create_auth_page()
create_datasets_page()
create_drift_page()


# Serve static files (heatmaps, images, reports)
from pathlib import Path as _Path
_project_root = _Path(__file__).parent.parent
app.add_static_files('/outputs', str(_project_root / 'outputs'))
app.add_static_files('/datasets', str(_project_root / 'datasets'))

if __name__ in {"__main__", "__mp_main__"}:
    ui.run(
        storage_secret='cv-integrity-secret-key-2026',
        title='CV-INTEGRITY AI',
        port=8520,
        reload=False,
        show=False,
        favicon='🧠',
    )
