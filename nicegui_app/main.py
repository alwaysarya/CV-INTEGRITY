"""
CV-INTEGRITY AI - NiceGUI 3.x App
Design #09 - COMPLETE (Phase 4)
"""

from nicegui import ui

# ============================================================
# SHARED SETUP
# ============================================================
def setup_page():
    ui.dark_mode().enable()
    ui.add_head_html('''
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        
        body {
            background: linear-gradient(180deg, #0A0A14 0%, #0F0F1F 100%) !important;
            margin: 0;
            padding: 0;
        }
        
        .q-page-container { padding: 0 !important; }
        .nicegui-content { padding: 0 !important; }
    </style>
    ''')


def navigation():
    with ui.row().classes('w-full items-center justify-between px-8 py-4').style(
        'background: rgba(10, 10, 20, 0.95); border-bottom: 1px solid rgba(139, 92, 246, 0.2); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100;'
    ):
        with ui.row().classes('items-center gap-3'):
            ui.html('''
                <div style="width: 40px; height: 40px; border-radius: 50%; 
                            background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                            display: flex; align-items: center; justify-content: center;
                            font-size: 1.2rem;">🧠</div>
            ''')
            with ui.column().classes('gap-0'):
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-base')
                ui.label('AI TRUST PLATFORM').classes('text-gray-500 text-xs tracking-wider')
        
        with ui.row().classes('items-center gap-8'):
            ui.link('Home', '/').classes('text-white font-medium no-underline')
            ui.link('Solutions', '/solutions').classes('text-gray-400 no-underline hover:text-purple-400')
            ui.link('Datasets', '/datasets').classes('text-gray-400 no-underline hover:text-purple-400')
            ui.link('Research', '/research').classes('text-gray-400 no-underline hover:text-purple-400')
            ui.link('Pricing', '/pricing').classes('text-gray-400 no-underline hover:text-purple-400')
            ui.link('About', '/about').classes('text-gray-400 no-underline hover:text-purple-400')
        
        with ui.row().classes('items-center gap-4'):
            with ui.row().classes('items-center gap-2 px-4 py-2 rounded-lg').style(
                'background: rgba(21, 21, 42, 0.8); border: 1px solid #252540; width: 260px;'
            ):
                ui.icon('search').classes('text-gray-500')
                ui.label('Search...').classes('text-gray-500 text-sm')
            
            ui.icon('notifications_none').classes('text-gray-400 text-xl')
            
            with ui.row().classes('items-center gap-2'):
                ui.html('''
                    <div style="width: 36px; height: 36px; border-radius: 50%; 
                                background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                                display: flex; align-items: center; justify-content: center;
                                color: white; font-weight: 700; font-size: 0.85rem;">AT</div>
                ''')
                with ui.column().classes('gap-0'):
                    ui.label('Aryan Thakur').classes('text-white text-sm font-medium')
                    ui.label('Administrator').classes('text-gray-500 text-xs')


# ============================================================
# HERO SECTION
# ============================================================
def hero_section():
    with ui.row().classes('w-full items-center justify-between px-16 py-12 gap-12').style(
        'min-height: 520px;'
    ):
        with ui.column().classes('gap-6').style('flex: 1; max-width: 600px;'):
            ui.label('VISION FOR A MORE TRUSTWORTHY TOMORROW').classes(
                'text-purple-400 text-xs font-bold tracking-widest'
            )
            
            ui.html('''
                <div style="font-size: 3.5rem; font-weight: 900; line-height: 1.1; 
                            color: #FFFFFF; letter-spacing: -0.03em;">
                    Evaluate Today.
                </div>
                <div style="font-size: 3.5rem; font-weight: 900; line-height: 1.1; 
                            background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            letter-spacing: -0.03em; margin-top: 8px;">
                    A Fairer Tomorrow.
                </div>
            ''')
            
            ui.label(
                'An intelligent platform to evaluate, verify and ensure the integrity of computer vision models.'
            ).classes('text-gray-400 text-base leading-relaxed')
            
            with ui.row().classes('gap-3 mt-4'):
                ui.button('Upload Dataset →', on_click=lambda: ui.navigate.to('/upload')).classes(
                    'px-6 py-3 rounded-xl font-semibold'
                ).style(
                    'background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #FFFFFF;'
                )
                
                ui.button('▶ Watch Demo').classes(
                    'px-6 py-3 rounded-xl font-semibold'
                ).style(
                    'background: transparent; color: #FFFFFF; border: 1px solid #252540;'
                )
        
        with ui.column().classes('gap-4 items-center justify-center').style('flex: 1; max-width: 500px;'):
            with ui.column().classes('gap-3'):
                with ui.card().classes('p-4 rounded-xl').style(
                    'background: rgba(21, 21, 42, 0.9); border: 1px solid rgba(139, 92, 246, 0.3); width: 320px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2);'
                ):
                    with ui.row().classes('items-center gap-3'):
                        ui.html('''<div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">🖼️</div>''')
                        with ui.column().classes('gap-0'):
                            ui.label('INPUT IMAGE').classes('text-purple-400 text-xs font-bold tracking-wider')
                            ui.label('Raw data received').classes('text-gray-400 text-xs')
                
                with ui.card().classes('p-4 rounded-xl').style(
                    'background: rgba(21, 21, 42, 0.9); border: 1px solid rgba(139, 92, 246, 0.3); width: 320px; margin-left: 30px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2);'
                ):
                    with ui.row().classes('items-center gap-3'):
                        ui.html('''<div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">🧠</div>''')
                        with ui.column().classes('gap-0'):
                            ui.label('AI ANALYSIS').classes('text-purple-400 text-xs font-bold tracking-wider')
                            ui.label('Model processing...').classes('text-gray-400 text-xs')
                
                with ui.card().classes('p-4 rounded-xl').style(
                    'background: rgba(21, 21, 42, 0.9); border: 1px solid rgba(139, 92, 246, 0.3); width: 320px; margin-left: 60px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2);'
                ):
                    with ui.row().classes('items-center gap-3'):
                        ui.html('''<div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">⚖️</div>''')
                        with ui.column().classes('gap-0'):
                            ui.label('FAIRNESS CHECK').classes('text-green-400 text-xs font-bold tracking-wider')
                            ui.label('Bias validation').classes('text-gray-400 text-xs')
                
                with ui.card().classes('p-4 rounded-xl').style(
                    'background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1)); border: 1px solid rgba(139, 92, 246, 0.5); width: 320px; margin-left: 90px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);'
                ):
                    with ui.row().classes('items-center gap-3'):
                        ui.html('''<div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">✅</div>''')
                        with ui.column().classes('gap-0'):
                            ui.label('TRUSTED OUTPUT').classes('text-white text-xs font-bold tracking-wider')
                            ui.label('VERIFIED').classes('text-green-400 text-xs font-bold')
            
            ui.label('SAME IMAGES. DEEPER ANSWERS.').classes(
                'text-gray-500 text-xs tracking-widest mt-4'
            )
        
        with ui.column().classes('gap-1').style('max-width: 150px; text-align: right;'):
            ui.label('TRANSPARENCY').classes('text-gray-400 text-xs tracking-wider')
            ui.label('INTEGRITY').classes('text-gray-400 text-xs tracking-wider')
            ui.label('FAIRNESS').classes('text-gray-400 text-xs tracking-wider')
            ui.label('REAL IMPACT').classes('text-gray-400 text-xs tracking-wider')
            ui.html('<hr style="border-color: #252540; margin: 12px 0;">')
            ui.label('COMPUTER VISION FOR A MORE EQUITABLE WORLD.').classes(
                'text-gray-500 text-xs tracking-wider leading-relaxed'
            )


# ============================================================
# STATS ROW
# ============================================================
def stats_row():
    with ui.row().classes('w-full items-center justify-between px-16 py-8 gap-6'):
        stats = [
            ('📊', '3', 'Datasets'),
            ('📦', '3', 'YOLO Models'),
            ('🖼️', '909', 'Images'),
            ('🛡️', '67%', 'Avg Trust')
        ]
        
        for icon, value, label in stats:
            with ui.row().classes('items-center gap-3'):
                ui.label(icon).classes('text-3xl')
                with ui.column().classes('gap-0'):
                    ui.label(value).classes('text-white font-bold text-2xl')
                    ui.label(label).classes('text-gray-400 text-xs')


# ============================================================
# TRUST SCORE + DATASET INSIGHTS + RESPONSIBLE AI
# ============================================================
def trust_and_insights():
    with ui.row().classes('w-full px-16 gap-6'):
        
        # ---------- TRUST SCORE OVERVIEW ----------
        with ui.card().classes('p-6 rounded-2xl').style(
            'flex: 2; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'
        ):
            with ui.row().classes('w-full items-center justify-between mb-6'):
                with ui.row().classes('items-center gap-2'):
                    ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                    ui.label('Trust Score Overview').classes('text-white font-bold text-lg')
                ui.html('<span style="color: #6B7280; font-size: 1.2rem;">ⓘ</span>')
            
            with ui.row().classes('w-full gap-8 items-center'):
                with ui.column().classes('items-center justify-center'):
                    ui.html('''
                        <div style="position: relative; width: 180px; height: 180px;">
                            <svg viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#252540" stroke-width="8"/>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient1)" stroke-width="8" 
                                        stroke-dasharray="264" stroke-dashoffset="32" stroke-linecap="round"/>
                                <defs>
                                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#8B5CF6"/>
                                        <stop offset="100%" style="stop-color:#10B981"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <div style="font-size: 2.2rem; font-weight: 900; color: #FFFFFF;">88.0%</div>
                                <div style="font-size: 0.65rem; color: #6B7280; letter-spacing: 0.15em;">OVERALL TRUST</div>
                            </div>
                        </div>
                    ''')
                
                with ui.column().classes('gap-4 flex-1'):
                    with ui.row().classes('items-start gap-3'):
                        ui.html('<div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; margin-top: 6px;"></div>')
                        with ui.column().classes('gap-0'):
                            ui.label('Good (88.0%)').classes('text-white font-semibold text-sm')
                            ui.label('High confidence, reliable results').classes('text-gray-400 text-xs')
                    
                    with ui.row().classes('items-start gap-3'):
                        ui.html('<div style="width: 12px; height: 12px; border-radius: 50%; background: #FBBF24; margin-top: 6px;"></div>')
                        with ui.column().classes('gap-0'):
                            ui.label('Needs Review (68.0%)').classes('text-white font-semibold text-sm')
                            ui.label('Potential issues detected').classes('text-gray-400 text-xs')
                    
                    with ui.row().classes('items-start gap-3'):
                        ui.html('<div style="width: 12px; height: 12px; border-radius: 50%; background: #EC4899; margin-top: 6px;"></div>')
                        with ui.column().classes('gap-0'):
                            ui.label('Critical (45.0%)').classes('text-white font-semibold text-sm')
                            ui.label('Significant risks found').classes('text-gray-400 text-xs')
            
            ui.html('<hr style="border-color: #252540; margin: 20px 0;">')
            ui.label('"Trust in AI is not a feature, it\'s a responsibility."').classes(
                'text-gray-400 italic text-sm'
            )
        
        # ---------- DATASET INSIGHTS ----------
        with ui.card().classes('p-6 rounded-2xl').style(
            'flex: 2; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'
        ):
            with ui.row().classes('w-full items-center justify-between mb-6'):
                with ui.row().classes('items-center gap-2'):
                    ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                    ui.label('Dataset Insights').classes('text-white font-bold text-lg')
                ui.link('View All →', '/datasets').classes('text-purple-400 text-sm no-underline')
            
            datasets = [
                ('🖼️', 'Custom Dataset', '320 images', 94, '#8B5CF6'),
                ('🔒', 'Security Footage', '280 images', 87, '#10B981'),
                ('🏭', 'Industrial Objects', '309 images', 76, '#EC4899'),
            ]
            
            for icon, name, count, score, color in datasets:
                with ui.row().classes('items-center gap-4 mb-4'):
                    ui.html(f'''<div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">{icon}</div>''')
                    with ui.column().classes('gap-0').style('flex: 1;'):
                        ui.label(name).classes('text-white text-sm font-semibold')
                        ui.label(count).classes('text-gray-400 text-xs')
                    ui.html(f'''
                        <div style="width: 120px;">
                            <div style="background: #252540; height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style="width: {score}%; height: 100%; background: {color}; border-radius: 3px;"></div>
                            </div>
                        </div>
                        <span style="color: #FFFFFF; font-weight: 600; font-size: 0.85rem; margin-left: 12px;">{score}%</span>
                    ''')
        
        # ---------- RESPONSIBLE AI ----------
        with ui.card().classes('p-6 rounded-2xl').style(
            'flex: 1; background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3);'
        ):
            ui.html('''
                <div style="font-size: 2rem; margin-bottom: 12px;">🌍</div>
                <div style="color: #FFFFFF; font-size: 1.1rem; font-weight: 800; line-height: 1.3; margin-bottom: 16px;">
                    Responsible AI<br>for a more<br>equitable world.
                </div>
                <div style="color: #6B7280; font-size: 0.75rem; letter-spacing: 0.1em;">
                    ───
                </div>
                <div style="color: #9CA3AF; font-size: 0.85rem; margin-top: 12px; line-height: 1.6;">
                    Built on trust.<br>Driven by people.
                </div>
            ''')


# ============================================================
# HOW IT WORKS + RECENT ACTIVITY (Phase 4)
# ============================================================
def how_it_works_and_activity():
    with ui.row().classes('w-full px-16 gap-6 mt-8'):
        
        # ---------- HOW IT WORKS ----------
        with ui.card().classes('p-6 rounded-2xl').style(
            'flex: 3; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'
        ):
            with ui.row().classes('items-center gap-2 mb-6'):
                ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                ui.label('How It Works').classes('text-white font-bold text-lg')
            
            steps = [
                ('📤', '1', 'Upload Dataset', 'ZIP with images + labels'),
                ('🔍', '2', 'Auto Analysis', 'Blur, duplicate, noise check'),
                ('🧠', '3', 'Train Model', 'YOLO training on your data'),
                ('🛡️', '4', 'Robustness Test', '7 transformations'),
                ('📊', '5', 'Trust Score', 'Accept / Review / Quarantine'),
            ]
            
            with ui.row().classes('w-full items-start justify-between gap-2'):
                for i, (icon, num, title, desc) in enumerate(steps):
                    with ui.column().classes('items-center gap-2').style('flex: 1;'):
                        # Number + Icon
                        with ui.row().classes('items-center gap-2'):
                            ui.html(f'''
                                <div style="width: 36px; height: 36px; border-radius: 10px; 
                                            background: rgba(139, 92, 246, 0.15); 
                                            display: flex; align-items: center; justify-content: center;
                                            font-size: 1.2rem; border: 1px solid rgba(139, 92, 246, 0.3);">
                                    {icon}
                                </div>
                                <div style="color: #6B7280; font-size: 0.75rem; font-weight: 700;">{num}</div>
                            ''')
                        
                        ui.label(title).classes('text-white font-semibold text-sm text-center')
                        ui.label(desc).classes('text-gray-500 text-xs text-center leading-snug')
                    
                    # Arrow
                    if i < len(steps) - 1:
                        ui.label('→').classes('text-gray-600 text-xl mt-4')
        
        # ---------- RECENT ACTIVITY ----------
        with ui.card().classes('p-6 rounded-2xl').style(
            'flex: 2; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'
        ):
            with ui.row().classes('w-full items-center justify-between mb-6'):
                with ui.row().classes('items-center gap-2'):
                    ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                    ui.label('Recent Activity').classes('text-white font-bold text-lg')
                ui.link('View All →', '/activity').classes('text-purple-400 text-sm no-underline')
            
            activities = [
                ('#10B981', 'Dataset "Custom Dataset" uploaded', '2 min ago'),
                ('#3B82F6', 'Model training completed (YOLOv8)', '12 min ago'),
                ('#EC4899', 'Robustness testing finished', '25 min ago'),
                ('#10B981', 'Trust score calculated: 88.0%', '28 min ago'),
                ('#FBBF24', 'Report generated', '35 min ago'),
            ]
            
            for color, text, time in activities:
                with ui.row().classes('items-center justify-between w-full py-2'):
                    with ui.row().classes('items-center gap-3'):
                        ui.html(f'<div style="width: 8px; height: 8px; border-radius: 50%; background: {color};"></div>')
                        ui.label(text).classes('text-gray-300 text-sm')
                    ui.label(time).classes('text-gray-500 text-xs')


# ============================================================
# FOOTER (Phase 4)
# ============================================================
def footer():
    ui.html('<hr style="border-color: #252540; margin: 40px 0 0 0;">')
    with ui.row().classes('w-full items-center justify-between px-16 py-6'):
        ui.label('CV-INTEGRITY AI').classes('text-gray-500 text-xs tracking-wider')
        ui.label('VISION  ·  INTEGRITY  ·  A SAFER TOMORROW').classes(
            'text-gray-500 text-xs tracking-widest'
        )
        with ui.row().classes('items-center gap-1'):
            ui.label('Built with').classes('text-gray-500 text-xs')
            ui.html('<span style="color: #EF4444;">❤</span>')
            ui.label('using NiceGUI').classes('text-gray-500 text-xs')


# ============================================================
# HOME PAGE
# ============================================================
@ui.page('/')
def home():
    setup_page()
    navigation()
    hero_section()
    stats_row()
    trust_and_insights()
    how_it_works_and_activity()
    footer()


# ============================================================
# OTHER PAGES
# ============================================================
@ui.page('/solutions')
def solutions():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('💡 Solutions').classes('text-4xl font-bold text-purple-400')

@ui.page('/datasets')
def datasets():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('📊 Datasets').classes('text-4xl font-bold text-purple-400')

@ui.page('/research')
def research():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('🔬 Research').classes('text-4xl font-bold text-purple-400')

@ui.page('/pricing')
def pricing():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('💰 Pricing').classes('text-4xl font-bold text-purple-400')

@ui.page('/about')
def about():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('ℹ️ About').classes('text-4xl font-bold text-purple-400')

@ui.page('/upload')
def upload():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('📤 Upload Dataset').classes('text-4xl font-bold text-purple-400')


# ============================================================
# RUN
# ============================================================
ui.run(
    title='CV-INTEGRITY AI',
    host='0.0.0.0',
    port=8520,
    reload=False,
    show=False,
    dark=True
)