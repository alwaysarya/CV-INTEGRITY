"""
NiceGUI Contributor Risk Analysis Page
Real data from outputs/reports/users.json + outputs/collaboration/
"""

from nicegui import ui, app
from styles import apply_styles, page_title
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
USERS_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'users.json'
COLLAB_DIR = PROJECT_ROOT / 'outputs' / 'collaboration'


def load_users():
    if not USERS_FILE.exists():
        return {}
    try:
        with open(USERS_FILE) as f:
            return json.load(f)
    except:
        return {}


def load_json(filename):
    file = COLLAB_DIR / filename
    if not file.exists():
        return []
    try:
        with open(file) as f:
            return json.load(f)
    except:
        return []


def calculate_contributor_risk(username, user_data, activities, tasks, comments):
    factors = []
    risk_score = 0
    
    if user_data.get('last_login') is None:
        factors.append({'name': 'Never Logged In', 'impact': 15, 'severity': 'MEDIUM', 'color': '#F59E0B'})
        risk_score += 15
    
    user_activities = [a for a in activities if a.get('username') == username]
    if len(user_activities) == 0:
        factors.append({'name': 'No Activity', 'impact': 20, 'severity': 'HIGH', 'color': '#EF4444'})
        risk_score += 20
    elif len(user_activities) > 5:
        factors.append({'name': 'Very Active', 'impact': 5, 'severity': 'LOW', 'color': '#10B981'})
        risk_score += 5
    
    role = user_data.get('role', 'viewer')
    if role == 'admin':
        factors.append({'name': 'High Privilege (Admin)', 'impact': 10, 'severity': 'MEDIUM', 'color': '#F59E0B'})
        risk_score += 10
    elif role == 'viewer':
        factors.append({'name': 'Low Privilege (Viewer)', 'impact': 0, 'severity': 'LOW', 'color': '#10B981'})
    
    user_tasks = [t for t in tasks if t.get('assignee') == username]
    pending_tasks = [t for t in user_tasks if t.get('status') == 'pending']
    if len(pending_tasks) > 0:
        factors.append({'name': f'{len(pending_tasks)} Pending Task(s)', 'impact': 5 * len(pending_tasks), 'severity': 'LOW', 'color': '#3B82F6'})
        risk_score += 5 * len(pending_tasks)
    
    risk_score = min(risk_score, 100)
    
    if risk_score < 20:
        level, color, icon = 'LOW RISK', '#10B981', 'check_circle'
    elif risk_score < 50:
        level, color, icon = 'MEDIUM RISK', '#F59E0B', 'warning'
    else:
        level, color, icon = 'HIGH RISK', '#EF4444', 'error'
    
    return {'score': risk_score, 'level': level, 'color': color, 'icon': icon, 'factors': factors}


def create_contributors_page():
    
    @ui.page('/contributors')
    def contributors():
        apply_styles(ui)
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(245, 158, 11, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #F59E0B, #D97706); display: flex; align-items: center; justify-content: center; font-size: 1rem;">👤</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'),
                    ('Collaboration', '/collaboration'),
                    ('Contributors', '/contributors'),
                    ('Backdoor', '/backdoor'),
                ]:
                    active = path == '/contributors'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        # Load data
        users = load_users()
        activities = load_json('activities.json')
        tasks = load_json('tasks.json')
        comments = load_json('comments.json')
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            page_title(ui, '👤', 'Contributor Risk Assessment', 'Source-level risk · Sample-level evidence aggregation · Multi-contributor trust', '#F59E0B')
            
            if not users:
                with ui.card().classes('w-full p-12').style('border: 2px dashed #F59E0B; border-radius: 12px;'):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No contributor data').classes('text-gray-400 text-lg')
                return
            
            risks = {}
            for username, user_data in users.items():
                risks[username] = calculate_contributor_risk(username, user_data, activities, tasks, comments)
            
            total = len(users)
            high = sum(1 for r in risks.values() if r['score'] >= 50)
            medium = sum(1 for r in risks.values() if 20 <= r['score'] < 50)
            low = sum(1 for r in risks.values() if r['score'] < 20)
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Contributors', str(total), '#F59E0B', 'group'),
                    ('High Risk', str(high), '#EF4444', 'error'),
                    ('Medium Risk', str(medium), '#F59E0B', 'warning'),
                    ('Low Risk', str(low), '#10B981', 'check_circle'),
                ]:
                    with ui.card().classes('p-5').style(f'border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Contributor Cards
            with ui.column().classes('w-full gap-4 mt-4'):
                with ui.element('div').classes('section-title'):
                    ui.label('👤').classes('text-xl')
                    ui.label('Contributor Risk Scores').classes('text-white font-bold text-lg')
                
                for username, user_data in users.items():
                    risk = risks[username]
                    role = user_data.get('role', 'viewer')
                    avatar = user_data.get('avatar', username[0].upper())
                    last_login = user_data.get('last_login', 'Never')
                    if last_login and last_login != 'Never':
                        last_login = last_login[:19]
                    
                    role_colors = {'admin': '#EF4444', 'contributor': '#10B981', 'reviewer': '#F59E0B', 'viewer': '#6B7280'}
                    role_color = role_colors.get(role, '#6B7280')
                    
                    user_activities = [a for a in activities if a.get('username') == username]
                    user_tasks = [t for t in tasks if t.get('assignee') == username]
                    user_comments = [c for c in comments if c.get('username') == username]
                    
                    with ui.card().classes('w-full p-5').style(f'border: 2px solid {risk["color"]}60; border-radius: 12px;'):
                        with ui.row().classes('w-full items-start gap-4'):
                            with ui.column().classes('items-center gap-2').style('min-width: 120px;'):
                                ui.html(f'<div style="width: 50px; height: 50px; border-radius: 50%; background: {risk["color"]}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">{avatar}</div>')
                                ui.label(username).classes('text-white font-bold text-sm')
                                ui.html(f'<div style="background: {role_color}30; color: {role_color}; padding: 2px 10px; border-radius: 10px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">{role}</div>')
                            
                            with ui.column().classes('flex-1 gap-3'):
                                with ui.row().classes('w-full items-center justify-between'):
                                    with ui.column().classes('gap-0'):
                                        ui.label('RISK SCORE').classes('text-gray-500 text-xs tracking-wider')
                                        ui.label(f'{risk["score"]}%').classes('font-bold').style(f'color: {risk["color"]}; font-size: 1.75rem;')
                                    
                                    with ui.row().classes('items-center gap-2 px-4 py-2 rounded-lg').style(f'background: {risk["color"]}20; border: 1px solid {risk["color"]};'):
                                        ui.icon(risk['icon']).style(f'color: {risk["color"]};')
                                        ui.label(risk['level']).classes('font-bold text-sm').style(f'color: {risk["color"]};')
                                
                                ui.html(f'<div class="progress-bar"><div class="progress-fill" style="width: {risk["score"]}%; background: {risk["color"]};"></div></div>')
                                
                                with ui.row().classes('w-full gap-4 mt-2'):
                                    for label, value, color in [
                                        ('Activities', len(user_activities), '#38BDF8'),
                                        ('Tasks', len(user_tasks), '#8B5CF6'),
                                        ('Comments', len(user_comments), '#10B981'),
                                    ]:
                                        with ui.column().classes('items-center flex-1'):
                                            ui.label(str(value)).classes('font-bold text-base').style(f'color: {color};')
                                            ui.label(label).classes('text-gray-500 text-xs')
                                
                                with ui.row().classes('items-center gap-2 mt-1'):
                                    ui.icon('schedule').classes('text-gray-500 text-xs')
                                    ui.label(f'Last login: {last_login}').classes('text-gray-500 text-xs')
                        
                        if risk['factors']:
                            ui.label('RISK FACTORS').classes('text-gray-500 text-xs tracking-wider mt-4 mb-2').style('border-top: 1px solid rgba(245, 158, 11, 0.15); padding-top: 12px;')
                            with ui.row().classes('w-full gap-2 flex-wrap'):
                                for factor in risk['factors']:
                                    ui.html(f'<div style="background: {factor["color"]}20; color: {factor["color"]}; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">{factor["name"]} (+{factor["impact"]})</div>')
            
            # Info section
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('How Risk is Calculated').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for title, desc, color, icon in [
                        ('Login History', 'Never logged in = +15 risk', '#F59E0B', 'login'),
                        ('Activity Level', 'No activity = +20 risk', '#EF4444', 'timeline'),
                        ('Role Privilege', 'Admin role = +10 risk', '#8B5CF6', 'admin_panel_settings'),
                        ('Task Completion', 'Pending tasks = +5 each', '#3B82F6', 'task'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(f'border: 1px solid {color}40; border-radius: 12px;'):
                            ui.icon(icon).classes('text-2xl mb-2').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/contributors')).classes('px-6 py-2 rounded-lg text-sm').style('background: linear-gradient(135deg, #F59E0B, #D97706); color: white;')
                
                ui.button('👥 Collaboration', on_click=lambda: ui.navigate.to('/collaboration')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                
                ui.button('🚨 Backdoor', on_click=lambda: ui.navigate.to('/backdoor')).classes('px-6 py-2 rounded-lg text-sm').style('background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid #EF4444;')


# Register
create_contributors_page()