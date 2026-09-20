"""
NiceGUI Backdoor & Anomaly Detection Page
Real data from outputs/reports/*_quality_report.json
"""

from nicegui import ui
from styles import apply_styles
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
import sys
sys.path.insert(0, str(PROJECT_ROOT))
from dataset_analyzer.ood_detector import OODDetector
REPORTS_DIR = PROJECT_ROOT / 'outputs' / 'reports'


def load_quality_reports():
    """Load all quality reports."""
    reports = {}
    for dataset in ['good', 'bad', 'worst']:
        file = REPORTS_DIR / f'{dataset}_quality_report.json'
        if file.exists():
            try:
                with open(file) as f:
                    reports[dataset] = json.load(f)
            except:
                pass
    return reports


def analyze_suspicious_samples(report):
    """Analyze suspicious samples from quality report (deduplicated)."""
    details = report.get('details', {})
    blur_details = details.get('blur', {})
    duplicate_details = details.get('duplicate', {})
    noise_details = details.get('noise', {})
    
    # Use dict to deduplicate by image name
    suspicious_map = {}
    
    # Blurry images
    for img in blur_details.get('details', []):
        if img.get('status') == 'BLURRY ❌' or img.get('blur_score', 100) < 50:
            img_name = img.get('image', 'N/A')
            suspicious_map[img_name] = {
                'image': img_name,
                'type': 'BLUR',
                'reason': f"Low blur score: {img.get('blur_score', 0):.1f}",
                'severity': 'MEDIUM',
                'color': '#F59E0B',
                'icon': 'blur_on',
            }
    
    # Duplicate images (overwrites if already exists)
    for dup in duplicate_details.get('duplicates', []):
        if isinstance(dup, dict):
            img_name = dup.get('image', 'N/A')
            suspicious_map[img_name] = {
                'image': img_name,
                'type': 'DUPLICATE',
                'reason': f"Duplicate of {dup.get('duplicate_of', 'N/A')}",
                'severity': 'HIGH',
                'color': '#EF4444',
                'icon': 'content_copy',
            }
    
    # Noisy images (only add if not already there)
    for img in noise_details.get('details', []):
        if img.get('status') == 'NOISY ❌' or img.get('noise_score', 100) < 50:
            img_name = img.get('image', 'N/A')
            if img_name not in suspicious_map:
                suspicious_map[img_name] = {
                    'image': img_name,
                    'type': 'NOISE',
                    'reason': f"High noise level: {img.get('noise_score', 0):.1f}",
                    'severity': 'MEDIUM',
                    'color': '#8B5CF6',
                    'icon': 'grain',
                }
    
    return list(suspicious_map.values())


def create_backdoor_page():
    
    @ui.page('/backdoor')
    def backdoor():
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
            .mono { font-family: 'JetBrains Mono', monospace !important; }
            
            .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 0;
                border-left: 3px solid #EF4444;
                padding-left: 16px;
                margin-bottom: 20px;
            }
            
            .alert-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border-radius: 12px !important;
                padding: 16px !important;
                border-left: 4px solid;
                margin-bottom: 12px;
            }
            
            .progress-bar {
                background: rgba(255,255,255,0.08);
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                margin: 6px 0;
            }
            
            .progress-fill {
                height: 100%;
                border-radius: 4px;
            }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(239, 68, 68, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #EF4444, #DC2626); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🚨</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('Quality', '/quality'),
                    ('Backdoor', '/backdoor'),
                    ('Cybersecurity', '/cybersecurity'),
                ]:
                    active = path == '/backdoor'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        reports = load_quality_reports()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('warning').classes('text-red-400 text-4xl')
                    ui.label('Backdoor & Anomaly Detection').classes('text-red-400 font-bold text-4xl')
                ui.label('Trigger injection · Label flipping · Duplicate flooding · OOD insertion').classes('text-gray-400 text-sm')
            
            if not reports:
                with ui.card().classes('w-full p-12').style(
                    'background: rgba(15, 23, 42, 0.4); border: 2px dashed #EF4444; border-radius: 12px;'
                ):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No quality reports found').classes('text-gray-400 text-lg')
                return
            
            # Analyze all suspicious samples
            all_suspicious = {}
            for dataset_name, report in reports.items():
                all_suspicious[dataset_name] = analyze_suspicious_samples(report)
            
            total_suspicious = sum(len(s) for s in all_suspicious.values())
            total_samples = sum(r.get('total_images', 0) for r in reports.values())
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Total Samples', str(total_samples), '#38BDF8', 'image'),
                    ('Suspicious', str(total_suspicious), '#EF4444', 'warning'),
                    ('Clean', str(max(total_samples - total_suspicious, 0)), '#10B981', 'check_circle'),
                    ('Risk Score', f'{(total_suspicious/max(total_samples,1))*100:.1f}%', '#F59E0B', 'security'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Per-Dataset Risk Assessment
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🎯').classes('text-xl')
                    ui.label('Source-Level Risk Assessment').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for dataset_name, report in reports.items():
                        suspicious_list = all_suspicious[dataset_name]
                        total = report.get('total_images', 0)
                        suspicious_count = len(suspicious_list)
                        risk_percent = min((suspicious_count / max(total, 1)) * 100, 100)
                        
                        # Determine color based on risk
                        if risk_percent < 5:
                            color = '#10B981'
                            status = 'LOW RISK'
                            icon = 'check_circle'
                        elif risk_percent < 15:
                            color = '#F59E0B'
                            status = 'MEDIUM RISK'
                            icon = 'warning'
                        else:
                            color = '#EF4444'
                            status = 'HIGH RISK'
                            icon = 'error'
                        
                        with ui.card().classes('flex-1 p-5').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; max-width: 380px;'
                        ):
                            with ui.row().classes('w-full items-center justify-between mb-3'):
                                ui.label(dataset_name.upper()).classes('text-white font-bold text-lg')
                                ui.icon(icon).classes('text-2xl').style(f'color: {color};')
                            
                            # Risk score
                            with ui.column().classes('items-center gap-1 mb-3'):
                                ui.label(f'{risk_percent:.1f}%').classes('font-bold').style(f'color: {color}; font-size: 2.5rem;')
                                ui.label('RISK SCORE').classes('text-gray-500 text-xs tracking-wider')
                            
                            ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {risk_percent}%; background: {color};"></div></div>')
                            
                            with ui.row().classes('w-full justify-between mt-3'):
                                ui.label(f'{suspicious_count} suspicious').classes('text-gray-400 text-xs')
                                ui.label(f'{total} total').classes('text-gray-400 text-xs')
                            
                            with ui.row().classes('items-center gap-2 mt-3 pt-3').style('border-top: 1px solid rgba(239, 68, 68, 0.15);'):
                                ui.icon(icon).classes('text-sm').style(f'color: {color};')
                                ui.label(status).classes('text-xs font-bold').style(f'color: {color};')
            
            # Suspicious Samples List
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🚨').classes('text-xl')
                    ui.label(f'Suspicious Samples ({total_suspicious} found)').classes('text-white font-bold text-lg')
                
                for dataset_name, suspicious_list in all_suspicious.items():
                    if not suspicious_list:
                        continue
                    
                    ui.label(f'{dataset_name.upper()} — {len(suspicious_list)} suspicious samples').classes('text-gray-400 text-sm tracking-wider mt-3 mb-2')
                    
                    for sample in suspicious_list[:5]:  # Show first 5
                        with ui.card().classes('alert-card w-full').style(f'border-left-color: {sample["color"]};'):
                            with ui.row().classes('w-full items-center gap-3'):
                                ui.icon(sample['icon']).classes('text-2xl').style(f'color: {sample["color"]};')
                                with ui.column().classes('gap-0 flex-1'):
                                    with ui.row().classes('items-center gap-2'):
                                        ui.label(sample['image']).classes('text-white text-sm mono')
                                        ui.html(f'<div style="background: {sample["color"]}30; color: {sample["color"]}; padding: 2px 8px; border-radius: 8px; font-size: 0.65rem; font-weight: 700;">{sample["type"]}</div>')
                                    ui.label(sample['reason']).classes('text-gray-400 text-xs')
                                ui.html(f'<div style="background: {sample["color"]}30; color: {sample["color"]}; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">{sample["severity"]}</div>')
            
            # OOD Detection
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🌐').classes('text-xl')
                    ui.label('Out-of-Distribution (OOD) Detection').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-6').style('background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px;'):
                    ui.label('Statistical deviation from reference distribution').classes('text-gray-400 text-sm mb-4')
                    
                    # Run OOD scan
                    detector = OODDetector()
                    scan = detector.scan_directory(str(PROJECT_ROOT / 'datasets' / 'uploaded' / 'extracted' / 'images'), max_files=50)
                    
                    if 'error' in scan:
                        ui.label(f"⚠️ {scan['error']}").classes('text-gray-500 text-sm')
                    else:
                        total = scan.get('total_scanned', 0)
                        ood_count = scan.get('ood_count', 0)
                        ood_pct = scan.get('ood_percentage', 0)
                        status = scan.get('status', 'UNKNOWN')
                        color = scan.get('color', '#6B7280')
                        
                        # Status row
                        with ui.row().classes('items-center gap-3 px-4 py-3 rounded-lg mb-4').style(f'background: {color}15; border: 1px solid {color};'):
                            ui.icon('check_circle' if status == 'CLEAN' else 'warning').classes('text-2xl').style(f'color: {color};')
                            with ui.column().classes('gap-0'):
                                ui.label(f'Status: {status.replace("_", " ")}').classes('font-bold').style(f'color: {color};')
                                ui.label(f'{ood_count} out of {total} samples are OOD ({ood_pct}%)').classes('text-gray-400 text-xs')
                        
                        # Stats
                        with ui.row().classes('w-full gap-4 mb-4'):
                            for label, value, c_color, icon in [
                                ('Total Scanned', str(total), '#38BDF8', 'image'),
                                ('OOD Samples', str(ood_count), '#EF4444', 'warning'),
                                ('OOD %', f'{ood_pct}%', '#F59E0B', 'percent'),
                                ('Reference', 'Baseline', '#10B981', 'analytics'),
                            ]:
                                with ui.card().classes('flex-1 p-3').style(f'background: rgba(15, 23, 42, 0.4); border: 1px solid {c_color}40; border-radius: 8px; text-align: center;'):
                                    ui.icon(icon).classes('text-xl mb-1').style(f'color: {c_color};')
                                    ui.label(value).classes('text-white font-bold text-base')
                                    ui.label(label).classes('text-gray-500 text-xs')
                        
                        # OOD samples list
                        samples = scan.get('samples', [])
                        if samples:
                            ui.label('SAMPLE ANALYSIS (Top 10)').classes('text-gray-500 text-xs tracking-wider mt-4 mb-2')
                            for sample in samples[:10]:
                                s_color = '#EF4444' if sample['is_ood'] else '#10B981'
                                with ui.row().classes('w-full items-center gap-3 py-2').style('border-bottom: 1px solid rgba(59, 130, 246, 0.1);'):
                                    ui.icon('warning' if sample['is_ood'] else 'check_circle').classes('text-sm').style(f'color: {s_color};')
                                    ui.label(sample['image']).classes('text-gray-400 text-xs mono').style('width: 200px;')
                                    ui.label(f"z-score: {max(sample['brightness_z'], sample['contrast_z']):.2f}").classes('text-gray-500 text-xs')
                                    ui.label(f"ood_score: {sample['ood_score']}").classes('text-xs font-bold').style(f'color: {s_color};')
                                    ui.html(f'<div style="background: {s_color}30; color: {s_color}; padding: 2px 8px; border-radius: 8px; font-size: 0.65rem; font-weight: 600;">{sample["severity"]}</div>')
            
            # Detection Methods
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔬').classes('text-xl')
                    ui.label('Detection Methods').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for title, desc, color, icon in [
                        ('Trigger Injection', 'Pattern-based suspicious pixel detection', '#EF4444', 'bug_report'),
                        ('Label Flipping', 'Statistical label distribution anomalies', '#F59E0B', 'swap_horiz'),
                        ('Near-Duplicate', 'Perceptual hash comparison', '#8B5CF6', 'content_copy'),
                        ('OOD Insertion', 'Out-of-distribution sample detection', '#3B82F6', 'explore'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            ui.icon(icon).classes('text-2xl mb-2').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/backdoor')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #EF4444, #DC2626); color: white;')
                
                ui.button('📊 Quality', on_click=lambda: ui.navigate.to('/quality')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')
                
                ui.button('🛡️ Cybersecurity', on_click=lambda: ui.navigate.to('/cybersecurity')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


create_backdoor_page()
