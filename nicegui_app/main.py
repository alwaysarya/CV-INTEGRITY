"""
CV-INTEGRITY AI - NiceGUI 3.x App
Design #09 - COMPLETE (Home + Upload + Datasets)
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
        
        .q-uploader {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
        }
        
        .q-uploader__header {
            background: rgba(139, 92, 246, 0.1) !important;
            color: #FFFFFF !important;
            border-radius: 12px !important;
        }
    </style>
    ''')


# ============================================================
# NAVIGATION
# ============================================================
def navigation():
    with ui.row().classes('w-full items-center justify-between px-8 py-4').style(
        'background: rgba(10, 10, 20, 0.95); border-bottom: 1px solid rgba(139, 92, 246, 0.2); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100;'
    ):
        with ui.row().classes('items-center gap-3').style('flex-shrink: 0;'):
            ui.html('''
                <div style="width: 40px; height: 40px; border-radius: 50%; 
                            background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                            display: flex; align-items: center; justify-content: center;
                            font-size: 1.2rem;">🧠</div>
            ''')
            with ui.column().classes('gap-0'):
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-base').style('line-height: 1.2;')
                ui.label('AI TRUST PLATFORM').classes('text-gray-500 text-xs tracking-wider').style('line-height: 1.2;')
        
        with ui.row().classes('items-center gap-6').style('flex-shrink: 0;'):
            ui.link('Home', '/').classes('text-white font-medium no-underline text-sm')
            ui.link('Solutions', '/solutions').classes('text-gray-400 no-underline hover:text-purple-400 text-sm')
            ui.link('Datasets', '/datasets').classes('text-gray-400 no-underline hover:text-purple-400 text-sm')
            ui.link('Research', '/research').classes('text-gray-400 no-underline hover:text-purple-400 text-sm')
            ui.link('Pricing', '/pricing').classes('text-gray-400 no-underline hover:text-purple-400 text-sm')
            ui.link('About', '/about').classes('text-gray-400 no-underline hover:text-purple-400 text-sm')
        
        with ui.row().classes('items-center gap-4').style('flex-shrink: 0;'):
            with ui.row().classes('items-center gap-2 px-3 py-2 rounded-lg').style(
                'background: rgba(21, 21, 42, 0.8); border: 1px solid #252540; width: 220px; height: 40px;'
            ):
                ui.icon('search').classes('text-gray-500').style('font-size: 18px;')
                ui.html('<span style="color: #6B7280; font-size: 0.85rem;">Search...</span>')
            
            ui.html('''
                <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
                            color: #9CA3AF; cursor: pointer; font-size: 1.2rem;">
                    🔔
                </div>
            ''')
            
            with ui.row().classes('items-center gap-2').style('flex-shrink: 0;'):
                ui.html('''
                    <div style="width: 36px; height: 36px; border-radius: 50%; 
                                background: linear-gradient(135deg, #8B5CF6, #7C3AED); 
                                display: flex; align-items: center; justify-content: center;
                                color: white; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;">AT</div>
                ''')
                with ui.column().classes('gap-0').style('line-height: 1.2;'):
                    ui.label('Aryan Thakur').classes('text-white text-xs font-medium').style('line-height: 1.2;')
                    ui.label('Administrator').classes('text-gray-500 text-xs').style('line-height: 1.2;')


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
# HOW IT WORKS + RECENT ACTIVITY
# ============================================================
def how_it_works_and_activity():
    with ui.row().classes('w-full px-16 gap-6 mt-8'):
        
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
                    
                    if i < len(steps) - 1:
                        ui.label('→').classes('text-gray-600 text-xl mt-4')
        
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
# FOOTER
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
# UPLOAD PAGE
# ============================================================
@ui.page('/upload')
def upload():
    setup_page()
    navigation()
    
    with ui.column().classes('w-full px-16 py-12 gap-8'):
        with ui.column().classes('items-center gap-3 w-full'):
            ui.html('<div style="font-size: 3rem;">📤</div>')
            ui.html('''
                <div style="font-size: 2.5rem; font-weight: 900; 
                            background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            letter-spacing: -0.03em;">
                    Upload Your Dataset
                </div>
            ''')
            ui.label(
                'Upload a ZIP file and run the complete integrity analysis'
            ).classes('text-gray-400 text-base text-center')
        
        with ui.row().classes('w-full gap-6 justify-center'):
            with ui.card().classes('p-6 rounded-2xl').style(
                'flex: 1; max-width: 500px; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'
            ):
                with ui.row().classes('items-center gap-3 mb-4'):
                    ui.html('''<div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">📁</div>''')
                    ui.label('Folder Structure').classes('text-white font-bold text-base')
                
                ui.html('''
                    <pre style="color: #9CA3AF; font-family: 'JetBrains Mono', monospace; 
                                font-size: 0.85rem; line-height: 1.8; margin: 0;
                                background: rgba(10, 10, 20, 0.5); padding: 16px; border-radius: 12px;
                                border: 1px solid #252540;">
dataset.zip
├── images/
│   ├── image_001.jpg
│   └── image_002.jpg
└── labels/
    ├── image_001.txt
    └── image_002.txt
                    </pre>
                ''')
            
            with ui.card().classes('p-6 rounded-2xl').style(
                'flex: 1; max-width: 500px; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'
            ):
                with ui.row().classes('items-center gap-3 mb-4'):
                    ui.html('''<div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">🏷️</div>''')
                    ui.label('Supported Classes (YOLO Format)').classes('text-white font-bold text-base')
                
                with ui.column().classes('gap-2'):
                    classes = [
                        ('0', 'car', '#8B5CF6'),
                        ('1', 'bicycle', '#3B82F6'),
                        ('2', 'bus', '#10B981'),
                        ('3', 'truck', '#EC4899'),
                    ]
                    for num, name, color in classes:
                        with ui.row().classes('items-center gap-3'):
                            ui.html(f'''
                                <div style="width: 24px; height: 24px; border-radius: 6px;
                                            background: {color}22; color: {color};
                                            display: flex; align-items: center; justify-content: center;
                                            font-weight: 700; font-size: 0.75rem;
                                            border: 1px solid {color}44;">
                                    {num}
                                </div>
                                <div style="color: #E5E7EB; font-size: 0.9rem; font-weight: 500;">
                                    {name}
                                </div>
                            ''')
        
        with ui.card().classes('p-8 rounded-2xl w-full').style(
            'max-width: 1050px; margin: 0 auto; background: rgba(21, 21, 42, 0.8); border: 2px dashed #3A3A5C;'
        ):
            with ui.column().classes('items-center gap-4 w-full'):
                ui.html('<div style="font-size: 3rem;">📤</div>')
                ui.label('Choose a ZIP file').classes('text-white font-bold text-lg')
                ui.label('200MB per file • ZIP format only').classes('text-gray-500 text-sm')
                
                ui.upload(
                    on_upload=lambda e: handle_upload(e),
                    auto_upload=True,
                    max_file_size=200 * 1024 * 1024
                ).classes('w-full').props('accept=.zip')
        
        with ui.row().classes('w-full justify-center mt-4'):
            ui.button('🚀 Run Full Analysis').classes(
                'px-8 py-4 rounded-xl font-semibold text-base'
            ).style(
                'background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #FFFFFF;'
            )
    
    footer()


# ============================================================
# DATASETS PAGE (NEW)
# ============================================================
@ui.page('/datasets')
def datasets():
    setup_page()
    navigation()
    
    with ui.column().classes('w-full px-16 py-12 gap-8'):
        # Page Header
        with ui.column().classes('items-center gap-3 w-full'):
            ui.html('<div style="font-size: 3rem;">📊</div>')
            ui.html('''
                <div style="font-size: 2.5rem; font-weight: 900; 
                            background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            letter-spacing: -0.03em;">
                    Datasets
                </div>
            ''')
            ui.label(
                'Explore all datasets and their quality insights'
            ).classes('text-gray-400 text-base text-center')
        
        # Stats Row
        with ui.row().classes('w-full items-center justify-between gap-4'):
            stats = [
                ('📊', '3', 'Total Datasets', '#8B5CF6'),
                ('🖼️', '909', 'Total Images', '#10B981'),
                ('⚡', '94%', 'Best Quality', '#FBBF24'),
                ('🛡️', '88%', 'Avg Trust', '#EC4899'),
            ]
            for icon, value, label, color in stats:
                with ui.card().classes('p-5 rounded-2xl flex-1').style(
                    f'background: rgba(21, 21, 42, 0.8); border: 1px solid #252540; border-left: 3px solid {color};'
                ):
                    with ui.row().classes('items-center gap-3'):
                        ui.html(f'<div style="font-size: 1.8rem;">{icon}</div>')
                        with ui.column().classes('gap-0'):
                            ui.label(value).classes('text-white font-bold text-2xl')
                            ui.label(label).classes('text-gray-400 text-xs')
        
        # Dataset Cards
        with ui.column().classes('w-full gap-4'):
            datasets_data = [
                {
                    'name': 'Custom Dataset',
                    'icon': '🖼️',
                    'images': 320,
                    'quality': 94,
                    'trust': 88,
                    'status': 'ACCEPT',
                    'color': '#8B5CF6',
                    'status_color': '#10B981',
                },
                {
                    'name': 'Security Footage',
                    'icon': '🔒',
                    'images': 280,
                    'quality': 87,
                    'trust': 78,
                    'status': 'REVIEW',
                    'color': '#10B981',
                    'status_color': '#FBBF24',
                },
                {
                    'name': 'Industrial Objects',
                    'icon': '🏭',
                    'images': 309,
                    'quality': 76,
                    'trust': 45,
                    'status': 'QUARANTINE',
                    'color': '#EC4899',
                    'status_color': '#EF4444',
                },
            ]
            
            for ds in datasets_data:
                with ui.card().classes('p-6 rounded-2xl w-full').style(
                    'background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'
                ):
                    with ui.row().classes('items-center justify-between w-full gap-4'):
                        # Left: Icon + Name
                        with ui.row().classes('items-center gap-4').style('flex: 1;'):
                            ui.html(f'''
                                <div style="width: 60px; height: 60px; border-radius: 14px; 
                                            background: {ds['color']}22; 
                                            display: flex; align-items: center; justify-content: center;
                                            font-size: 1.8rem; border: 1px solid {ds['color']}44;">
                                    {ds['icon']}
                                </div>
                            ''')
                            with ui.column().classes('gap-1'):
                                ui.label(ds['name']).classes('text-white font-bold text-lg')
                                ui.label(f"{ds['images']} images").classes('text-gray-400 text-sm')
                        
                        # Middle: Quality Bar
                        with ui.column().classes('gap-1').style('flex: 1;'):
                            ui.label('Quality Score').classes('text-gray-400 text-xs')
                            with ui.row().classes('items-center gap-3 w-full'):
                                ui.html(f'''
                                    <div style="flex: 1; background: #252540; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div style="width: {ds['quality']}%; height: 100%; background: {ds['color']}; border-radius: 4px;"></div>
                                    </div>
                                    <span style="color: #FFFFFF; font-weight: 700; font-size: 0.9rem; min-width: 40px;">{ds['quality']}%</span>
                                ''')
                        
                        # Middle 2: Trust Bar
                        with ui.column().classes('gap-1').style('flex: 1;'):
                            ui.label('Trust Score').classes('text-gray-400 text-xs')
                            with ui.row().classes('items-center gap-3 w-full'):
                                ui.html(f'''
                                    <div style="flex: 1; background: #252540; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div style="width: {ds['trust']}%; height: 100%; background: {ds['status_color']}; border-radius: 4px;"></div>
                                    </div>
                                    <span style="color: #FFFFFF; font-weight: 700; font-size: 0.9rem; min-width: 40px;">{ds['trust']}%</span>
                                ''')
                        
                        # Right: Status Badge
                        with ui.column().classes('items-end gap-2'):
                            ui.html(f'''
                                <div style="background: {ds['status_color']}; color: #0A0E1A;
                                            padding: 6px 16px; border-radius: 50px;
                                            font-weight: 800; font-size: 0.75rem;
                                            letter-spacing: 0.1em;">
                                    {ds['status']}
                                </div>
                            ''')
                            ui.button('View Details').classes(
                                'text-xs px-3 py-1 rounded-lg'
                            ).style(
                                'background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid rgba(139, 92, 246, 0.3);'
                            )
    
    footer()


# ============================================================
# UPLOAD HANDLER
# ============================================================
def handle_upload(e):
    import zipfile
    import shutil
    from pathlib import Path
    
    try:
        upload_dir = Path('/Users/aryanthakur/Documents/SIH/SIH26228/CV-INTEGRITY/datasets/uploaded')
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / e.name
        
        with open(file_path, 'wb') as f:
            content = e.content.read()
            f.write(content)
        
        ui.notify(f'✅ Uploaded: {e.name}', type='positive')
        
        extract_dir = upload_dir / 'extracted'
        if extract_dir.exists():
            shutil.rmtree(extract_dir)
        extract_dir.mkdir(parents=True, exist_ok=True)
        
        with zipfile.ZipFile(file_path, 'r') as zf:
            zf.extractall(extract_dir)
        
        images_count = len(list((extract_dir / 'images').glob('*'))) if (extract_dir / 'images').exists() else 0
        labels_count = len(list((extract_dir / 'labels').glob('*'))) if (extract_dir / 'labels').exists() else 0
        
        ui.notify(f'✅ Extracted: {images_count} images, {labels_count} labels', type='positive')
        
    except Exception as ex:
        ui.notify(f'❌ Error: {str(ex)}', type='negative')


# ============================================================
# OTHER PAGES
# ============================================================
@ui.page('/solutions')
def solutions():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('💡 Solutions').classes('text-4xl font-bold text-purple-400')

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

@ui.page('/activity')
def activity():
    setup_page()
    navigation()
    with ui.column().classes('w-full items-center justify-center').style('min-height: 70vh;'):
        ui.label('📋 Activity').classes('text-4xl font-bold text-purple-400')


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