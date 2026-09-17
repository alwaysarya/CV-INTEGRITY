"""
NiceGUI Authentication Page
Login / Signup / Session management
"""

from nicegui import ui, app
import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from auth.auth_manager import AuthManager
    AUTH_OK = True
except Exception as e:
    print(f"Auth import error: {e}")
    AUTH_OK = False

# Global auth manager
auth_manager = AuthManager(storage_dir=str(PROJECT_ROOT / 'outputs' / 'auth')) if AUTH_OK else None


def get_current_user():
    """Get logged-in user from session."""
    # NiceGUI stores session in app.storage.user
    return app.storage.user.get('username')


def is_logged_in():
    return get_current_user() is not None


def create_auth_page():
    
    @ui.page('/login')
    def login_page():
        ui.dark_mode().enable()
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body, .q-page { 
                font-family: 'Inter', sans-serif !important;
                background: #0A0E1A !important; 
            }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            
            .auth-card {
                background: rgba(15, 23, 42, 0.8) !important;
                border: 1px solid rgba(139, 92, 246, 0.3) !important;
                border-radius: 16px !important;
                padding: 40px !important;
                width: 100%;
                max-width: 420px;
                backdrop-filter: blur(20px);
            }
            
            .auth-input .q-field__control {
                background: rgba(15, 23, 42, 0.6) !important;
                border-radius: 8px !important;
            }
            
            .auth-btn {
                background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
                color: white !important;
                padding: 12px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
                text-transform: none !important;
            }
            
            .auth-btn:hover {
                opacity: 0.9 !important;
            }
            
            .gradient-bg {
                background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%);
            }
        </style>
        ''')
        
        # Center content
        with ui.column().classes('w-full h-screen items-center justify-center gradient-bg'):
            with ui.card().classes('auth-card'):
                # Logo
                with ui.column().classes('items-center gap-3 mb-6'):
                    ui.html('''
                        <div style="width: 64px; height: 64px; border-radius: 50%; 
                                    background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                                    display: flex; align-items: center; justify-content: center;
                                    font-size: 2rem;">🧠</div>
                    ''')
                    ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-2xl')
                    ui.label('Sign in to your account').classes('text-gray-400 text-sm')
                
                # Form
                username_input = ui.input('Username', placeholder='Enter username').classes('w-full auth-input mb-3')
                password_input = ui.input('Password', password=True, placeholder='Enter password').classes('w-full auth-input mb-4')
                
                # Error message container
                error_container = ui.column().classes('w-full')
                
                def do_login():
                    error_container.clear()
                    
                    username = username_input.value.strip()
                    password = password_input.value
                    
                    if not username or not password:
                        with error_container:
                            ui.label('❌ Username and password required').classes('text-red-400 text-sm mb-2')
                        return
                    
                    if not AUTH_OK:
                        with error_container:
                            ui.label('❌ Auth backend not available').classes('text-red-400 text-sm mb-2')
                        return
                    
                    try:
                        result = auth_manager.login(username, password)
                        
                        if result.get('success'):
                            # Store user in session
                            app.storage.user['username'] = username
                            app.storage.user['session_token'] = result.get('session_token', '')
                            app.storage.user['login_time'] = datetime.utcnow().isoformat()
                            
                            ui.notify(f'✅ Welcome, {username}!', type='positive', position='top')
                            ui.timer(0.5, lambda: ui.navigate.to('/'), once=True)
                        else:
                            with error_container:
                                ui.label(f'❌ {result.get("error", "Login failed")}').classes('text-red-400 text-sm mb-2')
                    except Exception as e:
                        with error_container:
                            ui.label(f'❌ Error: {e}').classes('text-red-400 text-sm mb-2')
                
                # Login button
                ui.button('Sign In', on_click=do_login).classes('auth-btn')
                
                # Enter key submit
                username_input.on('keydown.enter', do_login)
                password_input.on('keydown.enter', do_login)
                
                # Divider
                with ui.row().classes('w-full items-center gap-2 my-5'):
                    ui.element('div').classes('flex-1 h-px').style('background: rgba(139, 92, 246, 0.3);')
                    ui.label('OR').classes('text-gray-500 text-xs')
                    ui.element('div').classes('flex-1 h-px').style('background: rgba(139, 92, 246, 0.3);')
                
                # Signup link
                with ui.row().classes('w-full justify-center items-center gap-2'):
                    ui.label("Don't have an account?").classes('text-gray-400 text-sm')
                    ui.link('Sign up', '/signup').classes('text-purple-400 font-medium no-underline text-sm')
                
                # Demo credentials hint
                with ui.card().classes('w-full p-3 mt-4').style(
                    'background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px;'
                ):
                    ui.label('💡 Demo credentials').classes('text-purple-300 text-xs font-medium mb-1')
                    ui.label('Username: demo').classes('text-gray-400 text-xs mono')
                    ui.label('Password: demo123').classes('text-gray-400 text-xs mono')
                    
                    def register_demo():
                        try:
                            result = auth_manager.register('demo', 'demo123', 'demo@cv-integrity.ai')
                            if result.get('success'):
                                ui.notify('✅ Demo user created! Now click Sign In', type='positive')
                            else:
                                ui.notify(f'ℹ️ {result.get("error", "User exists")}', type='info')
                        except Exception as e:
                            ui.notify(f'❌ {e}', type='negative')
                    
                    ui.button('Create Demo User', on_click=register_demo).classes(
                        'mt-2 text-xs'
                    ).props('flat dense no-caps').style('color: #A78BFA;')
    
    
    @ui.page('/signup')
    def signup_page():
        ui.dark_mode().enable()
        ui.add_head_html('''
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body, .q-page { 
                font-family: 'Inter', sans-serif !important;
                background: #0A0E1A !important; 
            }
            .q-page-container { padding: 0 !important; }
            .nicegui-content { padding: 0 !important; }
            .auth-card {
                background: rgba(15, 23, 42, 0.8) !important;
                border: 1px solid rgba(139, 92, 246, 0.3) !important;
                border-radius: 16px !important;
                padding: 40px !important;
                width: 100%;
                max-width: 420px;
                backdrop-filter: blur(20px);
            }
            .auth-input .q-field__control {
                background: rgba(15, 23, 42, 0.6) !important;
                border-radius: 8px !important;
            }
            .auth-btn {
                background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
                color: white !important;
                padding: 12px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                width: 100% !important;
                text-transform: none !important;
            }
            .gradient-bg {
                background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%);
            }
        </style>
        ''')
        
        with ui.column().classes('w-full h-screen items-center justify-center gradient-bg'):
            with ui.card().classes('auth-card'):
                with ui.column().classes('items-center gap-3 mb-6'):
                    ui.html('''
                        <div style="width: 64px; height: 64px; border-radius: 50%; 
                                    background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                                    display: flex; align-items: center; justify-content: center;
                                    font-size: 2rem;">🧠</div>
                    ''')
                    ui.label('Create Account').classes('text-white font-bold text-2xl')
                    ui.label('Join CV-INTEGRITY AI platform').classes('text-gray-400 text-sm')
                
                username_input = ui.input('Username', placeholder='Choose username').classes('w-full auth-input mb-3')
                email_input = ui.input('Email', placeholder='your@email.com').classes('w-full auth-input mb-3')
                password_input = ui.input('Password', password=True, placeholder='Min 6 characters').classes('w-full auth-input mb-3')
                confirm_input = ui.input('Confirm Password', password=True, placeholder='Repeat password').classes('w-full auth-input mb-4')
                
                error_container = ui.column().classes('w-full')
                
                def do_signup():
                    error_container.clear()
                    
                    username = username_input.value.strip()
                    email = email_input.value.strip()
                    password = password_input.value
                    confirm = confirm_input.value
                    
                    # Validations
                    if not username or not password:
                        with error_container:
                            ui.label('❌ Username and password required').classes('text-red-400 text-sm mb-2')
                        return
                    
                    if len(password) < 6:
                        with error_container:
                            ui.label('❌ Password must be at least 6 characters').classes('text-red-400 text-sm mb-2')
                        return
                    
                    if password != confirm:
                        with error_container:
                            ui.label('❌ Passwords do not match').classes('text-red-400 text-sm mb-2')
                        return
                    
                    if not AUTH_OK:
                        with error_container:
                            ui.label('❌ Auth backend not available').classes('text-red-400 text-sm mb-2')
                        return
                    
                    try:
                        result = auth_manager.register(username, password, email or None)
                        
                        if result.get('success'):
                            ui.notify(f'✅ Account created! Please sign in.', type='positive', position='top')
                            ui.timer(0.5, lambda: ui.navigate.to('/login'), once=True)
                        else:
                            with error_container:
                                ui.label(f'❌ {result.get("error", "Registration failed")}').classes('text-red-400 text-sm mb-2')
                    except Exception as e:
                        with error_container:
                            ui.label(f'❌ Error: {e}').classes('text-red-400 text-sm mb-2')
                
                ui.button('Create Account', on_click=do_signup).classes('auth-btn')
                
                with ui.row().classes('w-full justify-center items-center gap-2 mt-5'):
                    ui.label('Already have an account?').classes('text-gray-400 text-sm')
                    ui.link('Sign in', '/login').classes('text-purple-400 font-medium no-underline text-sm')
    
    
    @ui.page('/logout')
    def logout_page():
        username = get_current_user()
        
        if username and AUTH_OK:
            try:
                session_token = app.storage.user.get('session_token')
                if session_token:
                    auth_manager.logout(session_token)
            except:
                pass
        
        # Clear session
        app.storage.user.clear()
        
        ui.notify('👋 Logged out successfully', type='info')
        ui.timer(0.5, lambda: ui.navigate.to('/login'), once=True)
    
    
    @ui.page('/profile')
    def profile_page():
        if not is_logged_in():
            ui.navigate.to('/login')
            return
        
        ui.dark_mode().enable()
        username = get_current_user()
        login_time = app.storage.user.get('login_time', 'N/A')
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            with ui.row().classes('items-center gap-3'):
                ui.icon('account_circle').classes('text-purple-400 text-4xl')
                ui.label('My Profile').classes('text-white font-bold text-4xl')
            
            with ui.card().classes('w-full p-6').style(
                'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;'
            ):
                ui.label(f'Username: {username}').classes('text-white font-bold text-xl mb-3')
                ui.label(f'Login time: {login_time}').classes('text-gray-400 text-sm')
                ui.label(f'Session active: ✅').classes('text-green-400 text-sm')
            
            ui.button('Logout', on_click=lambda: ui.navigate.to('/logout')).classes(
                'px-6 py-2 rounded-lg'
            ).style('background: linear-gradient(135deg, #EF4444, #DC2626); color: white;')


create_auth_page()
