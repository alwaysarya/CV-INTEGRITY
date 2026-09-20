"""
NiceGUI Reports & Certificates Page
Real PDFs from outputs/reports/
"""

from nicegui import ui, app
from styles import apply_styles
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
import sys
sys.path.insert(0, str(PROJECT_ROOT))
from blockchain.enhanced_audit import EnhancedAuditLog
PDF_DIR = PROJECT_ROOT / 'outputs' / 'reports' / 'pdf'
CERT_DIR = PROJECT_ROOT / 'outputs' / 'reports' / 'certificates'


def get_reports():
    """Get all PDF reports."""
    reports = []
    
    # Full reports
    if PDF_DIR.exists():
        for f in sorted(PDF_DIR.glob('*.pdf')):
            reports.append({
                'name': f.stem.replace('_', ' '),
                'filename': f.name,
                'path': f,
                'size': f.stat().st_size,
                'type': 'Full Report',
                'color': '#38BDF8',
                'icon': 'description',
            })
    
    # Certificates
    if CERT_DIR.exists():
        for f in sorted(CERT_DIR.glob('*.pdf')):
            name = f.stem.replace('Trust_Certificate_', '').replace('_', ' ')
            reports.append({
                'name': f'{name} Certificate',
                'filename': f.name,
                'path': f,
                'size': f.stat().st_size,
                'type': 'Certificate',
                'color': '#10B981',
                'icon': 'verified',
            })
    
    return reports


def create_reports_page():
    
    @ui.page('/reports')
    def reports():
        apply_styles(ui)
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
            
            .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 0;
                border-left: 3px solid #38BDF8;
                padding-left: 16px;
                margin-bottom: 20px;
            }
            
            .report-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border: 1px solid rgba(56, 189, 248, 0.2) !important;
                border-radius: 12px !important;
                padding: 20px !important;
                transition: all 0.3s ease;
            }
            
            .report-card:hover {
                border-color: rgba(56, 189, 248, 0.6) !important;
                transform: translateY(-2px);
            }
        </style>
        ''')
        
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
                    ('Reports', '/reports'),
                ]:
                    active = path == '/reports'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load reports
        reports_list = get_reports()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('description').classes('text-cyan-400 text-4xl')
                    ui.label('Reports & Certificates').classes('text-cyan-400 font-bold text-4xl')
                ui.label('Generate PDF reports · Trust certificates · Blockchain verification').classes('text-gray-400 text-sm')
            
            if not reports_list:
                with ui.card().classes('w-full p-12').style(
                    'background: rgba(15, 23, 42, 0.4); border: 2px dashed #38BDF8; border-radius: 12px;'
                ):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('description').classes('text-gray-500 text-5xl')
                        ui.label('No reports generated yet').classes('text-gray-400 text-lg')
                return
            
            # Stats
            total_reports = len(reports_list)
            full_reports = sum(1 for r in reports_list if r['type'] == 'Full Report')
            certificates = sum(1 for r in reports_list if r['type'] == 'Certificate')
            total_size = sum(r['size'] for r in reports_list)
            
            def format_size(bytes_val):
                for unit in ['B', 'KB', 'MB']:
                    if bytes_val < 1024:
                        return f'{bytes_val:.1f} {unit}'
                    bytes_val /= 1024
                return f'{bytes_val:.1f} GB'
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Total Reports', str(total_reports), '#38BDF8', 'description'),
                    ('Full Reports', str(full_reports), '#8B5CF6', 'article'),
                    ('Certificates', str(certificates), '#10B981', 'verified'),
                    ('Total Size', format_size(total_size), '#F59E0B', 'storage'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Reports List
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('📄').classes('text-xl')
                    ui.label('Available Reports').classes('text-white font-bold text-lg')
                
                for report in reports_list:
                    with ui.card().classes('report-card w-full'):
                        with ui.row().classes('w-full items-center justify-between'):
                            # Left: Info
                            with ui.row().classes('items-center gap-4'):
                                with ui.element('div').classes('rounded-lg flex items-center justify-center').style(
                                    f'width: 50px; height: 50px; background: {report["color"]}20; border: 1px solid {report["color"]};'
                                ):
                                    ui.icon(report['icon']).classes('text-2xl').style(f'color: {report["color"]};')
                                
                                with ui.column().classes('gap-0'):
                                    ui.label(report['name']).classes('text-white font-bold text-base')
                                    ui.label(f"{report['type']} · {format_size(report['size'])}").classes('text-gray-500 text-xs')
                            
                            # Right: Actions
                            with ui.row().classes('items-center gap-3'):
                                # Badge
                                ui.html(f'<div style="background: {report["color"]}20; color: {report["color"]}; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">{report["type"].upper()}</div>')
                                
                                # Download button
                                rel_path = report['path'].relative_to(PROJECT_ROOT)
                                ui.button('📥 Download', on_click=lambda p=f'/{rel_path}': ui.run_javascript(f'window.open("{p}", "_blank")')).classes(
                                    'px-4 py-2 rounded-lg text-xs'
                                ).style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
            
            # Info Section
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('About Reports').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color, icon in [
                        ('1', 'Full Report', 'Complete analysis with charts', '#38BDF8', 'article'),
                        ('2', 'Trust Certificate', 'Per-dataset verification', '#10B981', 'verified'),
                        ('3', 'Blockchain Proof', 'Immutable hash reference', '#8B5CF6', 'link'),
                        ('4', 'PDF Format', 'Shareable & printable', '#F59E0B', 'picture_as_pdf'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Enhanced Audit Log
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔗').classes('text-xl')
                    ui.label('Enhanced Audit Log').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-5').style('background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'):
                    ui.label('Reproducible · Hash-chained · Tamper-evident').classes('text-gray-400 text-sm mb-4')
                    
                    # Load or create audit
                    log = EnhancedAuditLog()
                    log_data = log.load()
                    
                    if not log_data:
                        log.capture_setup()
                        log.save()
                        log_data = log.load()
                    
                    setup = log_data.get('setup_metadata', {}) if log_data else {}
                    verification = log_data.get('verification', {}) if log_data else {}
                    
                    # Setup metadata
                    with ui.row().classes('w-full gap-4 mb-4'):
                        for label, value, color, icon in [
                            ('Python', setup.get('python_version', 'N/A'), '#38BDF8', 'code'),
                            ('Platform', setup.get('platform', 'N/A'), '#8B5CF6', 'computer'),
                            ('NiceGUI', setup.get('nicegui_version', 'N/A'), '#10B981', 'web'),
                            ('Chain Hash', (log_data.get('chain_hash', '')[:16] + '...') if log_data else 'N/A', '#F59E0B', 'link'),
                        ]:
                            with ui.column().classes('items-center gap-1 flex-1'):
                                ui.icon(icon).classes('text-xl').style(f'color: {color};')
                                ui.label(str(value)).classes('text-white font-bold text-sm mono')
                                ui.label(label).classes('text-gray-500 text-xs')
                    
                    # Verification status
                    is_valid = verification.get('valid', False)
                    v_color = '#10B981' if is_valid else '#EF4444'
                    
                    with ui.row().classes('items-center gap-3 px-4 py-3 rounded-lg').style(f'background: {v_color}15; border: 1px solid {v_color};'):
                        ui.icon('verified' if is_valid else 'error').classes('text-2xl').style(f'color: {v_color};')
                        with ui.column().classes('gap-0'):
                            ui.label('Chain Integrity: ' + ('VALID' if is_valid else 'BROKEN')).classes('font-bold').style(f'color: {v_color};')
                            ui.label(verification.get('message', 'N/A')).classes('text-gray-400 text-xs')
            
            # Coverage Statement
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📋').classes('text-xl')
                    ui.label('Coverage Statement').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-5').style(
                    'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px;'
                ):
                    ui.label('Supported Attack Classes').classes('text-green-400 font-bold text-sm mb-3')
                    with ui.column().classes('gap-1 mb-4'):
                        for attack in [
                            'Data Poisoning (label flipping, mislabelling)',
                            'Near-Duplicate Flooding',
                            'Model Substitution (hash mismatch detection)',
                            'Model Tampering (SHA-256 verification)',
                            'Audit Log Tampering (blockchain hash chain)',
                            'Inference Manipulation (RSA signature)',
                            'Replay Attacks (timestamp binding)',
                            'Trigger-based Backdoors (pattern detection)',
                            'Out-of-Distribution Samples (statistical anomaly)',
                            'Blur/Noise/Quality Degradation',
                        ]:
                            with ui.row().classes('items-center gap-2'):
                                ui.icon('check_circle').classes('text-green-400 text-xs')
                                ui.label(f'• {attack}').classes('text-gray-300 text-xs')
                    
                    ui.label('Assumptions').classes('text-amber-400 font-bold text-sm mb-3 mt-4').style('border-top: 1px solid rgba(56, 189, 248, 0.15); padding-top: 16px;')
                    with ui.column().classes('gap-1 mb-4'):
                        for assumption in [
                            'Contributor metadata may be available for source-level aggregation',
                            'SHA-256 hashing provides cryptographic integrity',
                            'RSA-2048 signatures for authentication',
                            'Reference baseline captured at enrollment time',
                            'Trusted computing environment for execution',
                        ]:
                            with ui.row().classes('items-center gap-2'):
                                ui.icon('info').classes('text-amber-400 text-xs')
                                ui.label(f'• {assumption}').classes('text-gray-300 text-xs')
                    
                    ui.label('Limitations & Not Supported').classes('text-red-400 font-bold text-sm mb-3 mt-4').style('border-top: 1px solid rgba(56, 189, 248, 0.15); padding-top: 16px;')
                    with ui.column().classes('gap-1'):
                        for limitation in [
                            'Black-box models: behavioral fingerprinting only (no param inspection)',
                            'No retraining of contributed models (as per constraints)',
                            'Deep backdoor trigger reconstruction not supported',
                            'Adversarial examples generation not included',
                            'Zero-day attacks not predictable',
                            'Model architecture reverse engineering not supported',
                        ]:
                            with ui.row().classes('items-center gap-2'):
                                ui.icon('cancel').classes('text-red-400 text-xs')
                                ui.label(f'• {limitation}').classes('text-gray-300 text-xs')
                    
                    ui.label('Confidence Level: HIGH').classes('text-cyan-400 font-bold text-sm mt-4').style('border-top: 1px solid rgba(56, 189, 248, 0.15); padding-top: 16px;')
                    ui.label('All findings include supporting evidence, SHA-256 hashes, and RSA signatures for verification.').classes('text-gray-400 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/reports')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: white;')
                
                ui.button('📊 Analytics', on_click=lambda: ui.navigate.to('/analytics')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


create_reports_page()
