"""
NiceGUI Video Analysis Page
Real detection data from outputs/video_analysis/
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
VIDEO_OUTPUTS = PROJECT_ROOT / 'outputs' / 'video_analysis'
VIDEO_INPUTS = PROJECT_ROOT / 'datasets' / 'videos'


def load_latest_analysis():
    if not VIDEO_OUTPUTS.exists():
        return None
    files = sorted(VIDEO_OUTPUTS.glob('*_analysis.json'), reverse=True)
    if not files:
        return None
    try:
        with open(files[0]) as f:
            return json.load(f), files[0]
    except:
        return None


def create_video_page():
    
    @ui.page('/video')
    def video():
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(16, 185, 129, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🎥</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'), ('Datasets', '/datasets'), ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'), ('XAI', '/xai'), ('Video', '/video'),
                ]:
                    active = path == '/video'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        result = load_latest_analysis()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '🎥', 'Video Analysis', 'AI-powered object detection · Frame-by-frame analysis', '#10B981')
            
            if not result:
                with ui.card().classes('w-full p-12').style('border: 2px dashed #10B981; border-radius: 12px;'):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('video_library').classes('text-gray-500 text-5xl')
                        ui.label('No video analysis found').classes('text-gray-400 text-lg')
                return
            
            data, json_path = result
            
            video_info = data.get('video_info', {})
            analysis_info = data.get('analysis_info', {})
            results = data.get('results', {})
            frame_details = data.get('frame_details', [])
            output_files = data.get('output_files', {})
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                stats = [
                    ('Total Detections', str(results.get('total_detections', 0)), '#10B981', 'track_changes'),
                    ('Frames Analyzed', f"{analysis_info.get('processed_frames', 0)}/{video_info.get('total_frames', 0)}", '#38BDF8', 'movie'),
                    ('Detection Rate', f"{results.get('detection_rate_percent', 0):.1f}%", '#F59E0B', 'percent'),
                    ('Avg/Frame', f"{results.get('avg_detections_per_frame', 0):.2f}", '#8B5CF6', 'analytics'),
                ]
                for label, value, color, icon in stats:
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Video Players
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('🎬').classes('text-xl')
                    ui.label('Video Preview').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-6'):
                    with ui.card().classes('flex-1 p-5').style('border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px;'):
                        ui.label('Original Video').classes('text-white font-bold text-sm mb-3')
                        original_path = VIDEO_INPUTS / 'test_video.mp4'
                        if original_path.exists():
                            rel = original_path.relative_to(PROJECT_ROOT)
                            ui.html(f'<video controls style="width: 100%; border-radius: 12px;"><source src="/{rel}" type="video/mp4">Your browser does not support the video tag.</video>')
                        else:
                            ui.label('Original video not found').classes('text-gray-500 text-sm')
                    
                    with ui.card().classes('flex-1 p-5').style('border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px;'):
                        ui.label('AI Annotated Video').classes('text-white font-bold text-sm mb-3')
                        annotated_direct = VIDEO_OUTPUTS / 'test_video_122047_annotated.mp4'
                        if annotated_direct.exists():
                            rel = annotated_direct.relative_to(PROJECT_ROOT)
                            ui.html(f'<video controls style="width: 100%; border-radius: 12px;"><source src="/{rel}" type="video/mp4">Your browser does not support the video tag.</video>')
                        else:
                            ui.label('Annotated video not found').classes('text-gray-500 text-sm')
            
            # Video Info
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('Video Information').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-5').style('border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px;'):
                    with ui.row().classes('w-full gap-6'):
                        for label, value, icon in [
                            ('File Name', data.get('video_name', 'N/A'), 'description'),
                            ('Resolution', video_info.get('resolution', 'N/A'), 'aspect_ratio'),
                            ('Duration', f"{video_info.get('duration_seconds', 0)}s", 'schedule'),
                            ('FPS', str(video_info.get('fps', 0)), 'speed'),
                            ('Total Frames', str(video_info.get('total_frames', 0)), 'movie'),
                            ('Model', analysis_info.get('model', 'N/A'), 'model_training'),
                            ('Confidence', str(analysis_info.get('confidence_threshold', 0)), 'verified'),
                            ('Frame Skip', str(analysis_info.get('frame_skip', 0)), 'skip_next'),
                        ]:
                            with ui.column().classes('items-center gap-1 flex-1'):
                                ui.icon(icon).classes('text-xl text-green-400')
                                ui.label(str(value)).classes('text-white font-bold text-sm')
                                ui.label(label).classes('text-gray-500 text-xs')
            
            # Class Distribution
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📊').classes('text-xl')
                    ui.label('Detection Classes').classes('text-white font-bold text-lg')
                
                class_dist = results.get('class_distribution', {})
                total = results.get('total_detections', 1)
                
                with ui.card().classes('w-full p-5').style('border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px;'):
                    for cls_name, count in class_dist.items():
                        percent = (count / total) * 100
                        
                        with ui.column().classes('w-full gap-2 mb-3'):
                            with ui.row().classes('w-full justify-between'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.icon('directions_car').classes('text-green-400')
                                    ui.label(cls_name.capitalize()).classes('text-white font-bold text-sm')
                                with ui.row().classes('items-center gap-2'):
                                    ui.label(f'{count}').classes('text-green-400 font-bold text-lg')
                                    ui.label(f'({percent:.1f}%)').classes('text-gray-500 text-xs')
                            
                            with ui.element('div').classes('w-full h-3 rounded-full').style('background: rgba(255,255,255,0.08);'):
                                ui.element('div').classes('h-3 rounded-full').style(f'width: {percent}%; background: linear-gradient(90deg, #10B981, #059669);')
            
            # Frame Details
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🎞️').classes('text-xl')
                    ui.label(f'Frame Details (showing first 10 of {len(frame_details)} frames)').classes('text-white font-bold text-lg')
                
                with ui.card().classes('w-full p-5').style('border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px;'):
                    if not frame_details:
                        ui.label('No frame details available').classes('text-gray-500 text-sm')
                    else:
                        with ui.row().classes('w-full items-center gap-4 py-2 mb-2').style('border-bottom: 2px solid rgba(16, 185, 129, 0.2);'):
                            ui.label('FRAME').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 80px;')
                            ui.label('TIMESTAMP').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 100px;')
                            ui.label('DETECTIONS').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 100px;')
                            ui.label('CLASSES').classes('text-gray-500 text-xs tracking-wider font-bold flex-1')
                            ui.label('CONFIDENCE').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 120px;')
                        
                        for frame in frame_details[:10]:
                            frame_num = frame.get('frame', 0)
                            ts = frame.get('timestamp', 0)
                            count = frame.get('count', 0)
                            detections = frame.get('detections', [])
                            
                            classes = ', '.join(set(d.get('class', '') for d in detections))
                            avg_conf = sum(d.get('confidence', 0) for d in detections) / len(detections) if detections else 0
                            
                            with ui.row().classes('w-full items-center gap-4 py-2').style('background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;'):
                                ui.label(f'#{frame_num}').classes('text-green-400 font-bold text-sm').style('width: 80px;')
                                ui.label(f'{ts:.2f}s').classes('text-gray-400 text-xs').style('width: 100px;')
                                ui.label(f'{count}').classes('text-white text-sm font-bold').style('width: 100px;')
                                ui.label(classes or '—').classes('text-gray-300 text-xs').style('flex: 1;')
                                with ui.row().classes('items-center gap-1').style('width: 120px;'):
                                    ui.label(f'{avg_conf:.2%}').classes('text-xs font-bold').style(f'color: {"#10B981" if avg_conf > 0.5 else "#F59E0B"};')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/video')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #10B981, #059669); color: white;')
                ui.button('📤 Upload New', on_click=lambda: ui.navigate.to('/upload')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')
                ui.button('📊 Analytics', on_click=lambda: ui.navigate.to('/analytics')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')


# Register
create_video_page()