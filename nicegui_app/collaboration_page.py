"""
NiceGUI Collaboration Hub Page
Real data from outputs/collaboration/
"""

from nicegui import ui
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
COLLAB_DIR = PROJECT_ROOT / 'outputs' / 'collaboration'


def load_json(filename):
    file = COLLAB_DIR / filename
    if not file.exists():
        return []
    try:
        with open(file) as f:
            return json.load(f)
    except:
        return []


def create_collaboration_page():
    
    @ui.page('/collaboration')
    def collaboration():
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
            
            .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 0;
                border-left: 3px solid #8B5CF6;
                padding-left: 16px;
                margin-bottom: 20px;
            }
            
            .card {
                background: rgba(15, 23, 42, 0.6) !important;
                border: 1px solid rgba(139, 92, 246, 0.15) !important;
                border-radius: 12px !important;
                padding: 16px !important;
            }
            
            .user-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border: 1px solid rgba(139, 92, 246, 0.2) !important;
                border-radius: 12px !important;
                padding: 16px !important;
                text-align: center;
            }
            
            .task-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border-radius: 12px !important;
                padding: 16px !important;
                border-left: 4px solid;
                margin-bottom: 12px;
            }
            
            .avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
                margin: 0 auto;
            }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(139, 92, 246, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'), 
                    ('Datasets', '/datasets'),
                    ('Collaboration', '/collaboration'),
                    ('Wallet', '/wallet'),
                ]:
                    active = path == '/collaboration'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        tasks = load_json('tasks.json')
        activities = load_json('activities.json')
        comments = load_json('comments.json')
        notifications = load_json('notifications.json')
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('groups').classes('text-purple-400 text-4xl')
                    ui.label('Collaboration Hub').classes('text-purple-400 font-bold text-4xl')
                ui.label('Team tasks · Comments · Activity feed · Notifications').classes('text-gray-400 text-sm')
            
            # Stats
            total_tasks = len(tasks)
            completed_tasks = sum(1 for t in tasks if t.get('status') == 'completed')
            pending_tasks = sum(1 for t in tasks if t.get('status') == 'pending')
            unread = sum(1 for n in notifications if not n.get('read'))
            
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Total Tasks', str(total_tasks), '#8B5CF6', 'task'),
                    ('Completed', str(completed_tasks), '#10B981', 'check_circle'),
                    ('Pending', str(pending_tasks), '#F59E0B', 'schedule'),
                    ('Unread', str(unread), '#EF4444', 'notifications'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Team Members
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('👥').classes('text-xl')
                    ui.label('Team Members').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    members = [
                        ('arya', 'Creator / Admin', '#8B5CF6'),
                        ('contributor1', 'Contributor', '#10B981'),
                        ('reviewer1', 'Reviewer', '#F59E0B'),
                    ]
                    for username, role, color in members:
                        with ui.card().classes('user-card flex-1').style(f'border-color: {color}60; max-width: 300px;'):
                            ui.html(f'<div class="avatar" style="background: {color};">{username[0].upper()}</div>')
                            ui.label(username).classes('text-white font-bold text-lg mt-3')
                            ui.label(role).classes('text-gray-400 text-xs mt-1')
                            with ui.row().classes('items-center gap-1 justify-center mt-2'):
                                ui.icon('circle').classes('text-green-400 text-xs')
                                ui.label('Active').classes('text-green-400 text-xs')
            
            # Tasks Board
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📋').classes('text-xl')
                    ui.label('Task Board').classes('text-white font-bold text-lg')
                
                for task in tasks:
                    status = task.get('status', 'pending')
                    priority = task.get('priority', 'medium')
                    
                    status_colors = {'completed': '#10B981', 'pending': '#F59E0B', 'in_progress': '#3B82F6'}
                    priority_colors = {'critical': '#EF4444', 'high': '#F59E0B', 'medium': '#3B82F6', 'low': '#10B981'}
                    
                    sc = status_colors.get(status, '#6B7280')
                    pc = priority_colors.get(priority, '#6B7280')
                    
                    with ui.card().classes('task-card w-full').style(f'border-left-color: {pc};'):
                        with ui.row().classes('w-full items-center justify-between'):
                            with ui.column().classes('gap-1 flex-1'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.label(f'#{task.get("id", 0)}').classes('text-gray-500 text-xs')
                                    ui.label(task.get('title', 'N/A')).classes('text-white font-bold text-base')
                                
                                ui.label(task.get('description', '')).classes('text-gray-400 text-xs')
                                
                                with ui.row().classes('items-center gap-3 mt-2'):
                                    with ui.row().classes('items-center gap-1'):
                                        ui.icon('person').classes('text-gray-500 text-xs')
                                        ui.label(task.get('assignee', 'unassigned')).classes('text-gray-400 text-xs')
                                    
                                    with ui.row().classes('items-center gap-1'):
                                        ui.icon('flag').classes('text-xs').style(f'color: {pc};')
                                        ui.label(priority.upper()).classes('text-xs font-bold').style(f'color: {pc};')
                            
                            with ui.column().classes('items-end gap-1'):
                                ui.html(f'<div style="background: {sc}20; color: {sc}; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">{status.replace("_", " ").upper()}</div>')
                                if task.get('completed_at'):
                                    ui.label(f'✅ {task.get("completed_at", "")[:10]}').classes('text-gray-600 text-xs')
            
            # Comments + Activity Feed (side by side)
            with ui.row().classes('w-full gap-6 mt-6'):
                
                # Comments
                with ui.column().classes('flex-1 gap-4'):
                    with ui.element('div').classes('section-title'):
                        ui.label('💬').classes('text-xl')
                        ui.label('Recent Comments').classes('text-white font-bold text-lg')
                    
                    for comment in comments:
                        with ui.card().classes('card w-full'):
                            with ui.row().classes('w-full items-center justify-between mb-2'):
                                with ui.row().classes('items-center gap-2'):
                                    ui.html(f'<div style="width: 24px; height: 24px; border-radius: 50%; background: #8B5CF6; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.7rem;">{comment.get("username", "?")[0].upper()}</div>')
                                    ui.label(comment.get('username', 'unknown')).classes('text-white text-sm font-medium')
                                
                                with ui.row().classes('items-center gap-1'):
                                    ui.icon('favorite').classes('text-xs').style('color: #EF4444;')
                                    ui.label(str(comment.get('likes', 0))).classes('text-gray-500 text-xs')
                            
                            ui.label(comment.get('text', '')).classes('text-gray-300 text-sm')
                            
                            with ui.row().classes('items-center gap-2 mt-2'):
                                ui.label(f'on {comment.get("resource_type", "")}').classes('text-gray-600 text-xs')
                                ui.label(comment.get('created_at', '')[:10]).classes('text-gray-600 text-xs')
                
                # Activity Feed
                with ui.column().classes('flex-1 gap-4'):
                    with ui.element('div').classes('section-title'):
                        ui.label('📡').classes('text-xl')
                        ui.label('Activity Feed').classes('text-white font-bold text-lg')
                    
                    for activity in activities[-6:]:
                        action = activity.get('action', 'unknown')
                        icon_map = {
                            'comment_added': 'chat',
                            'task_created': 'add_task',
                            'task_updated': 'update',
                        }
                        icon_name = icon_map.get(action, 'info')
                        
                        with ui.card().classes('card w-full'):
                            with ui.row().classes('items-center gap-3'):
                                ui.icon(icon_name).classes('text-purple-400 text-xl')
                                with ui.column().classes('gap-0 flex-1'):
                                    ui.label(f'{activity.get("username", "")} — {action.replace("_", " ")}').classes('text-white text-sm')
                                    details = activity.get('details', {})
                                    detail_text = ' · '.join(f'{k}: {v}' for k, v in list(details.items())[:2])
                                    ui.label(detail_text).classes('text-gray-500 text-xs')
                                ui.label(activity.get('timestamp', '')[:10]).classes('text-gray-600 text-xs')
            
            # Notifications
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔔').classes('text-xl')
                    ui.label(f'Notifications ({unread} unread)').classes('text-white font-bold text-lg')
                
                for notif in notifications:
                    is_read = notif.get('read', False)
                    notif_type = notif.get('type', 'info')
                    type_colors = {'task': '#8B5CF6', 'comment': '#3B82F6', 'info': '#10B981'}
                    nc = type_colors.get(notif_type, '#6B7280')
                    
                    with ui.card().classes('card w-full').style(f'border-left: 3px solid {nc};'):
                        with ui.row().classes('items-center gap-3 w-full'):
                            ui.icon('notifications' if not is_read else 'notifications_none').classes('text-xl').style(f'color: {nc};')
                            with ui.column().classes('gap-0 flex-1'):
                                ui.label(notif.get('message', '')).classes('text-white text-sm' if not is_read else 'text-gray-400 text-sm')
                                ui.label(notif.get('created_at', '')[:19]).classes('text-gray-600 text-xs')
                            if not is_read:
                                ui.html('<div style="background: #EF4444; width: 8px; height: 8px; border-radius: 50%;"></div>')
            
            # Role Matrix
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🔐').classes('text-xl')
                    ui.label('Role Permissions').classes('text-white font-bold text-lg')
                
                with ui.card().classes('card w-full'):
                    # Header row
                    with ui.row().classes('w-full items-center gap-3 py-2').style('border-bottom: 2px solid rgba(139, 92, 246, 0.2);'):
                        ui.label('ROLE').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 120px;')
                        ui.label('READ').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 80px;')
                        ui.label('WRITE').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 80px;')
                        ui.label('DELETE').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 80px;')
                        ui.label('ADMIN').classes('text-gray-500 text-xs tracking-wider font-bold').style('width: 80px;')
                    
                    roles = [
                        ('Admin', True, True, True, True, '#8B5CF6'),
                        ('Contributor', True, True, False, False, '#10B981'),
                        ('Reviewer', True, False, False, False, '#F59E0B'),
                        ('Viewer', True, False, False, False, '#6B7280'),
                    ]
                    for name, r, w, d, a, color in roles:
                        with ui.row().classes('w-full items-center gap-3 py-2').style('border-bottom: 1px solid rgba(139, 92, 246, 0.1);'):
                            ui.label(name).classes('text-sm font-bold').style(f'color: {color}; width: 120px;')
                            ui.icon('check_circle' if r else 'cancel').classes('text-sm').style(f'color: {"#10B981" if r else "#4B5563"}; width: 80px;')
                            ui.icon('check_circle' if w else 'cancel').classes('text-sm').style(f'color: {"#10B981" if w else "#4B5563"}; width: 80px;')
                            ui.icon('check_circle' if d else 'cancel').classes('text-sm').style(f'color: {"#10B981" if d else "#4B5563"}; width: 80px;')
                            ui.icon('check_circle' if a else 'cancel').classes('text-sm').style(f'color: {"#10B981" if a else "#4B5563"}; width: 80px;')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/collaboration')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white;')
                
                ui.button('📊 Analytics', on_click=lambda: ui.navigate.to('/analytics')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981;')


create_collaboration_page()
