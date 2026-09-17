"""
NiceGUI Model Performance Page
Real training metrics from analytics_summary.json
"""

from nicegui import ui
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
ANALYTICS_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'analytics_summary.json'
HISTORY_DIR = PROJECT_ROOT / 'outputs' / 'model_history'


def load_metrics():
    if not ANALYTICS_FILE.exists():
        return None
    try:
        with open(ANALYTICS_FILE) as f:
            data = json.load(f)
        return data.get('training_metrics', {})
    except:
        return None


def create_performance_page():
    
    @ui.page('/performance')
    def performance():
        ui.dark_mode().enable()
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
                border-left: 3px solid #3B82F6;
                padding-left: 16px;
                margin-bottom: 20px;
            }
            
            .metric-card {
                background: rgba(15, 23, 42, 0.4) !important;
                border: 1px solid rgba(59, 130, 246, 0.15) !important;
                border-radius: 12px !important;
                padding: 16px !important;
            }
            
            .metric-bar {
                background: rgba(255,255,255,0.08);
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                margin: 6px 0;
            }
            
            .metric-bar-fill {
                height: 100%;
                border-radius: 4px;
                transition: width 0.5s ease;
            }
            
            .winner-badge {
                background: linear-gradient(135deg, #10B981, #059669);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 700;
            }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(59, 130, 246, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3B82F6, #2563EB); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'), 
                    ('Datasets', '/datasets'), 
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('XAI', '/xai'),
                    ('Video', '/video'),
                    ('Cyber', '/cybersecurity'),
                    ('Robust', '/robustness'),
                    ('Performance', '/performance'),
                ]:
                    active = path == '/performance'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        metrics = load_metrics()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('speed').classes('text-blue-400 text-4xl')
                    ui.label('Model Performance').classes('text-blue-400 font-bold text-4xl')
                ui.label('YOLOv8n training metrics · Model comparison · Performance analysis').classes('text-gray-400 text-sm')
            
            if not metrics:
                with ui.card().classes('w-full p-12').style(
                    'background: rgba(15, 23, 42, 0.4); border: 2px dashed #3B82F6; border-radius: 12px;'
                ):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No metrics found').classes('text-gray-400 text-lg')
                return
            
            # Find best model (highest mAP50)
            best_model = max(metrics.keys(), key=lambda k: metrics[k].get('mAP50', 0))
            best_map = metrics[best_model].get('mAP50', 0)
            
            # Overall stats
            total_models = len(metrics)
            avg_precision = sum(m.get('precision', 0) for m in metrics.values()) / total_models
            avg_recall = sum(m.get('recall', 0) for m in metrics.values()) / total_models
            avg_map50 = sum(m.get('mAP50', 0) for m in metrics.values()) / total_models
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Total Models', str(total_models), '#3B82F6', 'model_training'),
                    ('Best mAP50', f'{best_map:.2f}', '#10B981', 'emoji_events'),
                    ('Avg Precision', f'{avg_precision:.1f}', '#8B5CF6', 'target'),
                    ('Avg Recall', f'{avg_recall:.1f}', '#F59E0B', 'search'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Model cards
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🏆').classes('text-xl')
                    ui.label('Model Comparison').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for model_name, model_metrics in metrics.items():
                        color = '#10B981' if model_name == 'good' else ('#F59E0B' if model_name == 'bad' else '#EF4444')
                        is_best = model_name == best_model
                        
                        with ui.card().classes('metric-card flex-1').style(f'border-color: {color}40; max-width: 400px;'):
                            # Header
                            with ui.row().classes('w-full items-center justify-between mb-4'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('model_training').classes('text-2xl').style(f'color: {color};')
                                    ui.label(model_name.upper()).classes('text-white font-bold text-lg')
                                
                                if is_best:
                                    ui.html('<div class="winner-badge">🏆 BEST</div>')
                            
                            # Metrics
                            for metric_name, value in model_metrics.items():
                                if metric_name == 'epochs':
                                    continue
                                
                                # Determine max for progress bar (based on metric)
                                max_val = 100 if 'precision' in metric_name.lower() or 'recall' in metric_name.lower() else 30
                                
                                with ui.column().classes('w-full gap-1 mb-3'):
                                    with ui.row().classes('w-full justify-between'):
                                        ui.label(metric_name.replace('_', ' ').title()).classes('text-gray-400 text-xs font-medium')
                                        ui.label(f'{value:.2f}').classes('text-white text-sm font-bold')
                                    ui.html(f'<div class="metric-bar"><div class="metric-bar-fill" style="width: {min((value/max_val)*100, 100)}%; background: {color};"></div></div>')
                            
                            # Epochs
                            with ui.row().classes('items-center justify-between mt-3 pt-3').style('border-top: 1px solid rgba(59, 130, 246, 0.15);'):
                                ui.label('Epochs Trained').classes('text-gray-500 text-xs')
                                ui.label(str(model_metrics.get('epochs', 0))).classes('text-white font-bold text-sm')
            
            # Metrics comparison
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Metrics Comparison').classes('text-white font-bold text-lg')
                
                for metric_name in ['precision', 'recall', 'mAP50', 'mAP50_95']:
                    with ui.card().classes('metric-card w-full'):
                        ui.label(metric_name.upper()).classes('text-white font-bold text-base mb-3')
                        
                        for model_name, model_metrics in metrics.items():
                            color = '#10B981' if model_name == 'good' else ('#F59E0B' if model_name == 'bad' else '#EF4444')
                            value = model_metrics.get(metric_name, 0)
                            
                            # For comparison, find max value of this metric
                            all_values = [m.get(metric_name, 0) for m in metrics.values()]
                            max_value = max(all_values) if all_values else 1
                            width = (value / max_value) * 100 if max_value > 0 else 0
                            
                            with ui.row().classes('w-full items-center gap-3 py-2'):
                                ui.label(model_name.upper()).classes('text-gray-400 text-xs').style('width: 80px;')
                                ui.html(f'<div class="metric-bar" style="flex: 1;"><div class="metric-bar-fill" style="width: {width}%; background: {color};"></div></div>')
                                ui.label(f'{value:.2f}').classes('text-white text-xs font-bold').style('width: 60px; text-align: right;')
            
            # Best Model Highlight
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🥇').classes('text-xl')
                    ui.label('Best Performing Model').classes('text-white font-bold text-lg')
                
                best_metrics = metrics[best_model]
                
                with ui.card().classes('w-full p-6').style(
                    'background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); border: 2px solid #10B981; border-radius: 12px;'
                ):
                    with ui.row().classes('w-full items-center justify-between'):
                        with ui.column().classes('gap-1'):
                            ui.label(best_model.upper()).classes('text-green-400 font-bold text-3xl')
                            ui.label(f'Best mAP50: {best_metrics.get("mAP50", 0):.2f}').classes('text-gray-400 text-sm')
                        
                        with ui.row().classes('gap-6'):
                            for metric, value in best_metrics.items():
                                if metric == 'epochs': continue
                                with ui.column().classes('items-center'):
                                    ui.label(f'{value:.2f}').classes('text-green-400 font-bold text-xl')
                                    ui.label(metric).classes('text-gray-500 text-xs')
            
            # Info
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('Metric Explanations').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for name, desc, color, icon in [
                        ('Precision', 'Of all positive predictions, how many were correct', '#8B5CF6', 'target'),
                        ('Recall', 'Of all actual positives, how many did we find', '#F59E0B', 'search'),
                        ('mAP50', 'Mean Average Precision at IoU 0.5', '#3B82F6', 'analytics'),
                        ('mAP50-95', 'Averaged across IoU thresholds 0.5 to 0.95', '#10B981', 'insights'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                                ui.label(name).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/performance')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #3B82F6, #2563EB); color: white;')
                
                ui.button('📊 Analytics', on_click=lambda: ui.navigate.to('/analytics')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                
                ui.button('🧪 Robustness', on_click=lambda: ui.navigate.to('/robustness')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid #F59E0B;')


# Register
create_performance_page()
