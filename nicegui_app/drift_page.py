"""
NiceGUI Model Drift Page
Real drift data from outputs/reports/drift_*.json
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
REPORTS_DIR = PROJECT_ROOT / 'outputs' / 'reports'
sys.path.insert(0, str(PROJECT_ROOT))
from model_drift.risk_calibrator import RiskCalibrator


def load_drift_reports():
    reports = {}
    if not REPORTS_DIR.exists():
        return reports
    for model in ['good', 'bad', 'worst']:
        files = sorted(REPORTS_DIR.glob(f'drift_{model}_*.json'), reverse=True)
        if files:
            try:
                with open(files[0]) as f:
                    reports[model] = json.load(f)
            except:
                pass
    return reports


def load_drift_history(model, limit=10):
    history = []
    files = sorted(REPORTS_DIR.glob(f'drift_{model}_*.json'), reverse=True)[:limit]
    for f in files:
        try:
            with open(f) as fh:
                data = json.load(fh)
                parts = f.stem.split('_')
                data['_timestamp'] = parts[-2] + '_' + parts[-1] if len(parts) >= 2 else 'N/A'
                history.append(data)
        except:
            pass
    return history


def create_gauge_svg(value, max_val=10, color='#10B981', label='', suffix='%'):
    import math
    cx, cy = 100, 100
    radius = 80
    stroke_width = 18
    ratio = min(value / max_val, 1.0) if max_val > 0 else 0
    angle = 180 * ratio
    
    track_path = f"M {cx - radius} {cy} A {radius} {radius} 0 0 1 {cx + radius} {cy}"
    end_angle_rad = math.radians(180 - angle)
    x2 = cx + radius * math.cos(end_angle_rad)
    y2 = cy - radius * math.sin(end_angle_rad)
    large_arc = 1 if ratio > 0.5 else 0
    filled_path = f"M {cx - radius} {cy} A {radius} {radius} 0 {large_arc} 1 {x2:.2f} {y2:.2f}"
    
    return f'''
    <svg viewBox="0 0 200 130" style="width: 100%; max-width: 200px;">
        <path d="{track_path}" fill="none" stroke="#1E293B" stroke-width="{stroke_width}" stroke-linecap="round"/>
        <path d="{filled_path}" fill="none" stroke="{color}" stroke-width="{stroke_width}" stroke-linecap="round"/>
        <text x="{cx}" y="{cy - 10}" text-anchor="middle" fill="{color}" font-size="28" font-weight="800" font-family="Inter">{value:.2f}{suffix}</text>
        <text x="{cx}" y="{cy + 16}" text-anchor="middle" fill="#6B7280" font-size="10" font-weight="600" font-family="Inter" letter-spacing="1">{label}</text>
    </svg>
    '''


def create_drift_page():
    
    @ui.page('/drift')
    def drift():
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(245, 158, 11, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #F59E0B, #D97706); display: flex; align-items: center; justify-content: center; font-size: 1rem;">📈</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'), ('Datasets', '/datasets'), ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'), ('XAI', '/xai'), ('Drift', '/drift'),
                ]:
                    active = path == '/drift'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        reports = load_drift_reports()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '📈', 'Model Drift Monitor', 'Continuous monitoring of model performance drift', '#F59E0B')
            
            if not reports:
                with ui.card().classes('w-full p-12').style('border: 2px dashed #F59E0B; border-radius: 12px;'):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No drift reports found').classes('text-gray-400 text-lg')
                return
            
            # Stats
            total_models = len(reports)
            drift_detected = sum(1 for r in reports.values() if r.get('drift_detected'))
            stable_models = sum(1 for r in reports.values() if r.get('severity') == 'STABLE')
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Models Monitored', str(total_models), '#F59E0B', 'model_training'),
                    ('Stable', str(stable_models), '#10B981', 'check_circle'),
                    ('Drift Detected', str(drift_detected), '#EF4444', 'warning'),
                    ('Last Check', 'Today', '#3B82F6', 'schedule'),
                ]:
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Models section
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Model Drift Status').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-6 justify-center'):
                    for model_name, report in reports.items():
                        color = report.get('color', '#10B981')
                        severity = report.get('severity', 'UNKNOWN')
                        action = report.get('action', 'N/A')
                        max_drift = report.get('max_drift_percent', 0)
                        
                        with ui.card().classes('flex-1 p-6').style(f'border: 2px solid {color}; border-radius: 12px; max-width: 400px;'):
                            with ui.row().classes('items-center justify-between mb-4'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('model_training').classes('text-2xl').style(f'color: {color};')
                                    ui.label(model_name.upper()).classes('text-white font-bold text-lg')
                                ui.html(f'<div style="background: {color}30; color: {color}; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">{severity}</div>')
                            
                            ui.html(create_gauge_svg(max_drift, 10, color, 'DRIFT %', '%')).classes('w-full mb-4')
                            
                            metric_drifts = report.get('metric_drifts', {})
                            if metric_drifts:
                                ui.label('Metric Changes').classes('text-gray-400 text-xs mb-2 mt-2')
                                for metric, values in metric_drifts.items():
                                    baseline = values.get('baseline', 0)
                                    current = values.get('current', 0)
                                    change = values.get('change_percent', 0)
                                    
                                    with ui.column().classes('w-full gap-1 mb-2'):
                                        with ui.row().classes('w-full justify-between'):
                                            ui.label(metric.upper()).classes('text-gray-400 text-xs')
                                            ui.label(f'{change:+.2f}%').classes('text-xs font-bold').style(f'color: {color};')
                                        ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {min(abs(change)*10, 100)}%; background: {color};"></div></div>')
                                        ui.label(f'Base: {baseline:.2f} → Now: {current:.2f}').classes('text-gray-600 text-xs mono')
                            
                            with ui.row().classes('items-center gap-2 mt-3 pt-3').style('border-top: 1px solid rgba(245, 158, 11, 0.15);'):
                                ui.icon('info').classes('text-sm').style(f'color: {color};')
                                ui.label(action).classes('text-gray-400 text-xs')
            
            # Risk Calibration
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Risk Calibration').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-6').style('border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px;'):
                    ui.label('Calibrated Risk Scores with Confidence Levels').classes('text-white font-bold text-sm mb-4')
                    
                    with ui.row().classes('w-full gap-4'):
                        for model_name, report in reports.items():
                            drift = report.get('max_drift_percent', 0)
                            calib = RiskCalibrator.calibrate_drift(drift)
                            
                            if calib['calibrated_risk_score'] < 5:
                                c_color = '#10B981'
                            elif calib['calibrated_risk_score'] < 15:
                                c_color = '#F59E0B'
                            else:
                                c_color = '#EF4444'
                            
                            with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {c_color}60; border-radius: 8px;'):
                                ui.label(model_name.upper()).classes('text-white font-bold text-sm mb-2')
                                
                                with ui.row().classes('items-center gap-2 mb-2'):
                                    ui.icon('warning' if c_color == '#EF4444' else ('info' if c_color == '#F59E0B' else 'check_circle')).classes('text-lg').style(f'color: {c_color};')
                                    ui.label(f"Risk: {calib['calibrated_risk_score']}%").classes('font-bold').style(f'color: {c_color};')
                                
                                ui.label(f"Confidence: {calib['confidence_percent']}%").classes('text-gray-400 text-xs')
                                ui.label(f"Level: {calib['level']}").classes('text-gray-500 text-xs')
                                ui.label(f"Action: {calib['action']}").classes('font-medium text-xs mt-1').style(f'color: {c_color};')
                    
                    ui.label('Calibration Thresholds').classes('text-gray-400 text-xs tracking-wider mt-6 mb-3')
                    with ui.row().classes('w-full items-center gap-3 py-2').style('border-bottom: 1px solid rgba(245, 158, 11, 0.15);'):
                        ui.label('LEVEL').classes('text-gray-500 text-xs font-bold').style('width: 120px;')
                        ui.label('RANGE').classes('text-gray-500 text-xs font-bold').style('width: 120px;')
                        ui.label('CONFIDENCE').classes('text-gray-500 text-xs font-bold').style('width: 120px;')
                        ui.label('ACTION').classes('text-gray-500 text-xs font-bold flex-1')
                    
                    for row in RiskCalibrator.get_calibration_table():
                        row_color = '#10B981' if row['action'] == 'ACCEPT' else ('#F59E0B' if row['action'] == 'MONITOR' else ('#3B82F6' if row['action'] == 'REVIEW' else '#EF4444'))
                        with ui.row().classes('w-full items-center gap-3 py-2').style('border-bottom: 1px solid rgba(245, 158, 11, 0.05);'):
                            ui.label(row['level']).classes('font-bold text-xs').style(f'color: {row_color}; width: 120px;')
                            ui.label(row['range']).classes('text-gray-300 text-xs').style('width: 120px;')
                            ui.label(row['confidence']).classes('text-gray-300 text-xs').style('width: 120px;')
                            ui.label(row['action']).classes('font-medium text-xs flex-1').style(f'color: {row_color};')
            
            # History
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📈').classes('text-xl')
                    ui.label('Drift History').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-5').style('border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 12px;'):
                    history = load_drift_history('good', limit=10)
                    if not history:
                        ui.label('No history').classes('text-gray-400 text-sm')
                    else:
                        for h in history[:10]:
                            color = h.get('color', '#10B981')
                            with ui.row().classes('w-full items-center gap-4 py-2').style('border-bottom: 1px solid rgba(245, 158, 11, 0.05);'):
                                ui.label(h.get('_timestamp', 'N/A')).classes('text-white text-xs mono flex-1')
                                ui.label(h.get('model', 'N/A').upper()).classes('text-gray-400 text-xs').style('width: 100px;')
                                ui.label(f"{h.get('max_drift_percent', 0):.2f}%").classes('text-xs font-bold').style(f'color: {color}; width: 80px;')
                                ui.html(f'<div style="background: {color}30; color: {color}; padding: 2px 8px; border-radius: 8px; font-size: 0.65rem; font-weight: 600;">{h.get("severity", "N/A")}</div>')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/drift')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #F59E0B, #D97706); color: white;')
                ui.button('📊 Trust Score', on_click=lambda: ui.navigate.to('/trust')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


# Register
create_drift_page()