"""
NiceGUI Dataset Quality Analysis Page
Real data from outputs/reports/*_quality_report.json
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
REPORTS_DIR = PROJECT_ROOT / 'outputs' / 'reports'


def load_quality_reports():
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


def create_quality_page():
    
    @ui.page('/quality')
    def quality():
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(16, 185, 129, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; font-size: 1rem;">✓</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Datasets', '/datasets'),
                    ('Quality', '/quality'),
                    ('Reports', '/reports'),
                ]:
                    active = path == '/quality'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        reports = load_quality_reports()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '✓', 'Dataset Quality Analysis', 'Blur detection · Duplicate detection · Noise analysis · Real metrics', '#10B981')
            
            if not reports:
                with ui.card().classes('w-full p-12').style('border: 2px dashed #10B981; border-radius: 12px;'):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No quality reports found').classes('text-gray-400 text-lg')
                return
            
            total_datasets = len(reports)
            total_images = sum(r.get('total_images', 0) for r in reports.values())
            avg_overall = sum(r.get('scores', {}).get('overall_score', 0) for r in reports.values()) / total_datasets if total_datasets else 0
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Datasets', str(total_datasets), '#10B981', 'storage'),
                    ('Total Images', str(total_images), '#38BDF8', 'image'),
                    ('Avg Quality', f'{avg_overall:.1f}%', '#8B5CF6', 'verified'),
                    ('Metrics', '4', '#F59E0B', 'analytics'),
                ]:
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Dataset Cards
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Quality Breakdown by Dataset').classes('text-white font-bold text-lg')
                
                for dataset_name, report in reports.items():
                    category = report.get('quality_category', 'UNKNOWN')
                    if category == 'GOOD':
                        color = '#10B981'
                    elif category == 'BAD':
                        color = '#F59E0B'
                    else:
                        color = '#EF4444'
                    
                    scores = report.get('scores', {})
                    overall = scores.get('overall_score', 0)
                    recommendation = report.get('recommendation', 'N/A')
                    
                    with ui.card().classes('w-full p-6').style(f'border: 2px solid {color}60; border-radius: 12px;'):
                        with ui.row().classes('w-full items-center justify-between mb-4'):
                            with ui.row().classes('items-center gap-3'):
                                ui.icon('dataset').classes('text-2xl').style(f'color: {color};')
                                with ui.column().classes('gap-0'):
                                    ui.label(dataset_name.upper()).classes('text-white font-bold text-xl')
                                    ui.label(f'{report.get("total_images", 0)} images').classes('text-gray-500 text-xs')
                            with ui.column().classes('items-end'):
                                ui.label(f'{overall:.1f}%').classes('font-bold').style(f'color: {color}; font-size: 2rem;')
                                ui.label(f'RECOMMENDATION: {recommendation}').classes('text-xs tracking-wider').style(f'color: {color};')
                        
                        with ui.row().classes('w-full gap-4'):
                            for metric_name, value in [
                                ('Blur', scores.get('blur_score', 0)),
                                ('Duplicate', scores.get('duplicate_score', 0)),
                                ('Noise', scores.get('noise_score', 0)),
                                ('Overall', overall),
                            ]:
                                with ui.column().classes('flex-1 gap-1'):
                                    with ui.row().classes('w-full justify-between'):
                                        ui.label(metric_name).classes('text-gray-400 text-xs')
                                        ui.label(f'{value:.1f}%').classes('text-white text-xs font-bold')
                                    ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {value}%; background: {color};"></div></div>')
                        
                        details = report.get('details', {})
                        blur_details = details.get('blur', {})
                        
                        if blur_details:
                            ui.label('Blur Analysis').classes('text-gray-400 text-xs tracking-wider mt-4 mb-2')
                            with ui.row().classes('w-full gap-4'):
                                for label, value, c in [
                                    ('Average', f'{blur_details.get("average_blur_score", 0):.1f}', '#3B82F6'),
                                    ('Sharp', str(blur_details.get("sharp_images", 0)), '#10B981'),
                                    ('Blurry', str(blur_details.get("blurry_images", 0)), '#EF4444'),
                                    ('Blurry %', f'{blur_details.get("blurry_percentage", 0):.1f}%', '#F59E0B'),
                                ]:
                                    with ui.column().classes('items-center gap-0 flex-1'):
                                        ui.label(value).classes('font-bold text-base').style(f'color: {c};')
                                        ui.label(label).classes('text-gray-500 text-xs')
            
            # Info section
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('Quality Metrics Explained').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for icon_name, title, desc, color in [
                        ('blur_on', 'Blur Score', 'Detects out-of-focus images using Laplacian variance', '#3B82F6'),
                        ('content_copy', 'Duplicate Score', 'Identifies duplicate images via perceptual hashing', '#8B5CF6'),
                        ('grain', 'Noise Score', 'Measures image noise and grain level', '#F59E0B'),
                        ('verified', 'Overall Score', 'Weighted combination of all metrics', '#10B981'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            ui.icon(icon_name).classes('text-2xl mb-2').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/quality')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #10B981, #059669); color: white;')
                ui.button('📊 Datasets', on_click=lambda: ui.navigate.to('/datasets')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')
                ui.button('📄 Reports', on_click=lambda: ui.navigate.to('/reports')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


# Register
create_quality_page()