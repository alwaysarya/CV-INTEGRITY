"""
CV-INTEGRITY AI - Common Styles
Professional Glass Dynamic Design System

Aesthetic Features:
- Glassmorphism (frosted glass)
- Smooth gradients
- Subtle animations
- Neon glow accents
- Depth & shadows
- Blur effects
"""

# ============================================================
# COLOR PALETTE
# ============================================================
COLORS = {
    'primary': '#38BDF8',
    'primary_dark': '#0EA5E9',
    'secondary': '#8B5CF6',
    'secondary_dark': '#7C3AED',
    'success': '#10B981',
    'success_dark': '#059669',
    'warning': '#F59E0B',
    'warning_dark': '#D97706',
    'danger': '#EF4444',
    'danger_dark': '#DC2626',
    'info': '#3B82F6',
    'dark_bg': '#0A0E1A',
    'card_bg': 'rgba(15, 23, 42, 0.6)',
    'border': 'rgba(56, 189, 248, 0.15)',
}

# ============================================================
# GLASS DYNAMIC CSS
# ============================================================
COMMON_CSS = '''
<style>
    /* ======================================================
       FONTS
       ====================================================== */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    /* ======================================================
       GLOBAL
       ====================================================== */
    html, body {
        scroll-behavior: smooth;
    }
    
    body, .q-page {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        background: #0A0E1A !important;
        background-image: 
            radial-gradient(circle at 15% 10%, rgba(56, 189, 248, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 85% 90%, rgba(139, 92, 246, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 60%) !important;
        background-attachment: fixed !important;
        color: #E2E8F0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    .q-page-container { padding: 0 !important; }
    .nicegui-content { padding: 0 !important; }
    
    /* ======================================================
       GLASS CARDS
       ====================================================== */
    .q-card {
        background: rgba(15, 23, 42, 0.55) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border: 1px solid rgba(56, 189, 248, 0.15) !important;
        border-radius: 16px !important;
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 0 1px rgba(56, 189, 248, 0.05) !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative;
        overflow: hidden;
    }
    
    .q-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.06), transparent);
        transition: left 0.6s ease;
        pointer-events: none;
    }
    
    .q-card:hover {
        border-color: rgba(56, 189, 248, 0.35) !important;
        transform: translateY(-2px);
        box-shadow: 
            0 12px 48px rgba(56, 189, 248, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 0 0 1px rgba(56, 189, 248, 0.15) !important;
    }
    
    .q-card:hover::before {
        left: 100%;
    }
    
    /* ======================================================
       BUTTONS
       ====================================================== */
    .q-btn {
        text-transform: none !important;
        font-weight: 500 !important;
        border-radius: 10px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative;
        overflow: hidden;
    }
    
    .q-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
        pointer-events: none;
    }
    
    .q-btn:hover::before {
        width: 300px;
        height: 300px;
    }
    
    .q-btn:hover {
        transform: translateY(-1px);
    }
    
    /* ======================================================
       SECTION TITLE
       ====================================================== */
    .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 0;
        border-left: 3px solid #38BDF8;
        padding-left: 16px;
        margin-bottom: 20px;
        position: relative;
        transition: all 0.3s ease;
    }
    
    .section-title::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, #38BDF8, transparent);
    }
    
    .section-title:hover {
        border-left-color: #8B5CF6;
        transform: translateX(4px);
    }
    
    /* ======================================================
       PROGRESS BARS
       ====================================================== */
    .progress-bar {
        background: rgba(255, 255, 255, 0.08);
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        margin: 4px 0;
        position: relative;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .progress-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    
    .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    /* ======================================================
       TEXT GLOW
       ====================================================== */
    .text-glow {
        text-shadow: 0 0 20px currentColor;
    }
    
    /* ======================================================
       MONO FONT
       ====================================================== */
    .mono { 
        font-family: 'JetBrains Mono', monospace !important; 
        letter-spacing: -0.02em;
    }
    
    /* ======================================================
       ICONS
       ====================================================== */
    .q-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
    }
    
    /* ======================================================
       SCROLLBAR
       ====================================================== */
    ::-webkit-scrollbar { 
        width: 8px; 
        height: 8px; 
    }
    
    ::-webkit-scrollbar-track { 
        background: rgba(15, 23, 42, 0.4);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb { 
        background: linear-gradient(180deg, rgba(56, 189, 248, 0.4), rgba(139, 92, 246, 0.4));
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    ::-webkit-scrollbar-thumb:hover { 
        background: linear-gradient(180deg, rgba(56, 189, 248, 0.7), rgba(139, 92, 246, 0.7));
    }
    
    /* ======================================================
       BADGES
       ====================================================== */
    .q-badge {
        border-radius: 8px !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px;
        padding: 4px 10px !important;
        backdrop-filter: blur(10px);
    }
    
    /* ======================================================
       INPUT FIELDS
       ====================================================== */
    .q-field--outlined .q-field__control {
        border-radius: 10px !important;
        transition: all 0.3s ease;
    }
    
    .q-field--outlined.q-field--focused .q-field__control {
        box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    
    /* ======================================================
       ANIMATIONS
       ====================================================== */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    
    @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.3); }
        50% { box-shadow: 0 0 40px rgba(56, 189, 248, 0.6); }
    }
    
    .animate-fade-in {
        animation: fadeIn 0.6s ease-out;
    }
    
    .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out;
    }
    
    .animate-pulse {
        animation: pulse 2s ease-in-out infinite;
    }
    
    .animate-float {
        animation: float 3s ease-in-out infinite;
    }
    
    .animate-glow {
        animation: glow 2s ease-in-out infinite;
    }
    
    /* ======================================================
       DIVIDER
       ====================================================== */
    .gradient-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), transparent);
        margin: 20px 0;
    }
    
    /* ======================================================
       RESPONSIVE
       ====================================================== */
    @media (max-width: 768px) {
        .q-card {
            border-radius: 12px !important;
        }
        .section-title {
            padding-left: 12px;
        }
    }
</style>
'''


def get_common_css():
    """Return the common CSS string."""
    return COMMON_CSS


def apply_styles(ui):
    """Apply common styles to a NiceGUI page."""
    ui.dark_mode().enable()
    ui.add_head_html(COMMON_CSS)


# ============================================================
# HELPER FUNCTIONS
# ============================================================
def section_header(ui, icon, title, color='#38BDF8'):
    """Create a consistent section header."""
    with ui.element('div').classes('section-title').style(f'border-left-color: {color};'):
        ui.label(icon).classes('text-xl')
        ui.label(title).classes('text-white font-bold text-lg')


def stat_card(ui, icon, value, label, color='#38BDF8'):
    """Create a consistent stat card with glass effect."""
    with ui.card().classes('p-5').style(f'border: 2px solid {color}60; min-width: 180px; text-align: center;'):
        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color}; text-shadow: 0 0 20px {color}80;')
        ui.label(str(value)).classes('text-white font-bold text-2xl')
        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')

# ============================================================
# PAGE TITLE HELPERS
# ============================================================
def page_title(ui, icon, title, subtitle='', color='#38BDF8', icon_size='text-4xl'):
    """Create a consistent page title header."""
    with ui.column().classes('items-center gap-3 w-full mb-6'):
        with ui.row().classes('items-center gap-3'):
            ui.label(icon).classes(icon_size)
            ui.label(title).classes('font-bold text-4xl').style(f'color: {color}; text-shadow: 0 0 30px {color}40;')
        if subtitle:
            ui.label(subtitle).classes('text-gray-400 text-sm text-center')


def page_title_left(ui, icon, title, subtitle='', color='#38BDF8', icon_size='text-3xl'):
    """Create a left-aligned page title."""
    with ui.column().classes('gap-1 mb-6'):
        with ui.row().classes('items-center gap-3'):
            ui.label(icon).classes(icon_size)
            ui.label(title).classes('font-bold text-3xl').style(f'color: {color};')
        if subtitle:
            ui.label(subtitle).classes('text-gray-400 text-sm ml-12')


def card_title(ui, icon, title, color='#38BDF8'):
    """Create a consistent card title."""
    with ui.row().classes('items-center gap-2 mb-3'):
        ui.icon(icon).classes('text-xl').style(f'color: {color};')
        ui.label(title).classes('text-white font-bold text-base')


def badge(ui, text, color='#38BDF8', size='sm'):
    """Create a consistent badge."""
    sizes = {'sm': '0.65rem', 'md': '0.75rem', 'lg': '0.85rem'}
    return ui.html(f'''
        <div style="
            background: {color}20; 
            color: {color}; 
            border: 1px solid {color}40;
            padding: 4px 12px; 
            border-radius: 10px; 
            font-size: {sizes.get(size, '0.7rem')}; 
            font-weight: 600;
            display: inline-block;
            backdrop-filter: blur(10px);
        ">{text}</div>
    ''')


def glass_divider(ui):
    """Add a gradient divider."""
    ui.html('<div class="gradient-divider"></div>')


# ============================================================
# APPLE LIQUID GLASS SYSTEM
# ============================================================
APPLE_GLASS_CSS = '''
<style>
    /* === APPLE LIQUID GLASS CARDS === */
    .liquid-glass {
        background: rgba(15, 23, 42, 0.5) !important;
        backdrop-filter: blur(40px) saturate(200%) brightness(1.1) !important;
        -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 24px !important;
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.15),
            inset 0 -1px 1px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.05) !important;
        position: relative;
        overflow: hidden;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .liquid-glass::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%);
        pointer-events: none;
        border-radius: 24px 24px 0 0;
    }
    
    .liquid-glass::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
        transition: left 0.8s ease;
        pointer-events: none;
    }
    
    .liquid-glass:hover::after {
        left: 100%;
    }
    
    .liquid-glass:hover {
        transform: translateY(-6px) scale(1.01);
        border-color: rgba(255, 255, 255, 0.25) !important;
        box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 80px rgba(56, 189, 248, 0.15),
            inset 0 1px 1px rgba(255, 255, 255, 0.25),
            inset 0 -1px 1px rgba(0, 0, 0, 0.3) !important;
    }
    
    /* === SPECULAR HIGHLIGHT === */
    .specular::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 5%;
        right: 5%;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
        border-radius: 2px;
        pointer-events: none;
    }
    
    /* === MAGNETIC BUTTONS === */
    .magnetic-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .magnetic-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
        pointer-events: none;
    }
    
    .magnetic-btn:hover::before {
        width: 400px;
        height: 400px;
    }
    
    .magnetic-btn:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 
            0 15px 40px rgba(56, 189, 248, 0.4),
            0 0 60px rgba(56, 189, 248, 0.2) !important;
    }
    
    /* === CURSOR GLOW === */
    .cursor-glow {
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
        pointer-events: none;
        z-index: 1;
        transition: opacity 0.3s ease;
        transform: translate(-50%, -50%);
        filter: blur(40px);
    }
    
    /* === GRADIENT BORDER ANIMATION === */
    @keyframes border-flow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    
    .gradient-border {
        position: relative;
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(139, 92, 246, 0.3));
        padding: 2px;
        border-radius: 24px;
        background-size: 200% 200%;
        animation: border-flow 4s ease infinite;
    }
    
    /* === ANIMATED MESH GRADIENT === */
    @keyframes mesh-move-1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(100px, -50px) scale(1.1); }
        66% { transform: translate(-50px, 50px) scale(0.95); }
    }
    @keyframes mesh-move-2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-80px, 80px) scale(1.15); }
    }
    @keyframes mesh-move-3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(60px, -100px) scale(0.9); }
    }
    @keyframes mesh-move-4 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-100px, 60px) scale(1.05); }
        66% { transform: translate(80px, -40px) scale(1.1); }
    }
    
    .mesh-orb {
        position: fixed;
        border-radius: 50%;
        filter: blur(120px);
        pointer-events: none;
        z-index: 0;
        opacity: 0.5;
    }
    .mesh-orb-1 {
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.4), transparent 70%);
        top: -200px;
        left: -200px;
        animation: mesh-move-1 25s ease-in-out infinite;
    }
    .mesh-orb-2 {
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.35), transparent 70%);
        top: 20%;
        right: -300px;
        animation: mesh-move-2 30s ease-in-out infinite;
    }
    .mesh-orb-3 {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%);
        bottom: -150px;
        left: 25%;
        animation: mesh-move-3 28s ease-in-out infinite;
    }
    .mesh-orb-4 {
        width: 450px;
        height: 450px;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.25), transparent 70%);
        top: 50%;
        left: 10%;
        animation: mesh-move-4 32s ease-in-out infinite;
    }
    
    /* === FLOATING BLOCKCHAIN VISUALIZER === */
    @keyframes block-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(2deg); }
    }
    @keyframes block-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.1); }
        50% { box-shadow: 0 0 40px rgba(56, 189, 248, 0.8), inset 0 0 30px rgba(56, 189, 248, 0.2); }
    }
    @keyframes chain-connect {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 20; }
    }
    
    .blockchain-block {
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(139, 92, 246, 0.15));
        border: 1px solid rgba(56, 189, 248, 0.4);
        border-radius: 12px;
        padding: 12px;
        animation: block-float 4s ease-in-out infinite, block-glow 3s ease-in-out infinite;
        backdrop-filter: blur(20px);
        position: relative;
    }
    
    /* === PREMIUM SCROLLBAR === */
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: rgba(10, 14, 26, 0.5); }
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #38BDF8, #8B5CF6);
        border-radius: 5px;
        border: 2px solid rgba(10, 14, 26, 0.5);
    }
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #0EA5E9, #7C3AED);
    }
    
    /* === SMOOTH TRANSITIONS === */
    * { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
    
    /* === APPLE-STYLE FONT SMOOTHING === */
    body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }
</style>
'''


def apply_apple_glass(ui):
    """Apply Apple Liquid Glass styles + cursor glow + mesh orbs."""
    ui.add_head_html(APPLE_GLASS_CSS)
    ui.add_body_html('''
    <!-- Mesh gradient orbs -->
    <div class="mesh-orb mesh-orb-1"></div>
    <div class="mesh-orb mesh-orb-2"></div>
    <div class="mesh-orb mesh-orb-3"></div>
    <div class="mesh-orb mesh-orb-4"></div>
    
    <!-- Cursor glow -->
    <div class="cursor-glow" id="cursorGlow"></div>
    
    <script>
        // Cursor glow follow
        const cursorGlow = document.getElementById('cursorGlow');
        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function animateGlow() {
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            if (cursorGlow) {
                cursorGlow.style.left = glowX + 'px';
                cursorGlow.style.top = glowY + 'px';
            }
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
        
        // Magnetic buttons
        document.addEventListener('mousemove', (e) => {
            document.querySelectorAll('.magnetic-btn').forEach(btn => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distX = e.clientX - centerX;
                const distY = e.clientY - centerY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                if (dist < 150) {
                    const strength = (150 - dist) / 150 * 8;
                    btn.style.transform = `translate(${distX * 0.08}px, ${distY * 0.08}px) translateY(-3px) scale(1.03)`;
                } else {
                    btn.style.transform = '';
                }
            });
        });
    </script>
    ''')


# ============================================================
# TRUST COMMAND CENTER — ADDITIONAL STYLES
# ============================================================
TRUST_COMMAND_CSS = '''
<style>
    /* === TRUST CORE 3D CRYSTAL === */
    @keyframes core-rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes core-pulse {
        0%, 100% { 
            box-shadow: 0 0 60px rgba(56, 189, 248, 0.4), 
                        0 0 120px rgba(139, 92, 246, 0.3),
                        inset 0 0 60px rgba(56, 189, 248, 0.2);
        }
        50% { 
            box-shadow: 0 0 100px rgba(56, 189, 248, 0.7), 
                        0 0 180px rgba(139, 92, 246, 0.5),
                        inset 0 0 80px rgba(56, 189, 248, 0.4);
        }
    }
    @keyframes orbit-1 {
        0% { transform: rotate(0deg) translateX(180px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
    }
    @keyframes orbit-2 {
        0% { transform: rotate(120deg) translateX(180px) rotate(-120deg); }
        100% { transform: rotate(480deg) translateX(180px) rotate(-480deg); }
    }
    @keyframes orbit-3 {
        0% { transform: rotate(240deg) translateX(180px) rotate(-240deg); }
        100% { transform: rotate(600deg) translateX(180px) rotate(-600deg); }
    }
    @keyframes data-flow {
        0% { transform: translateY(0); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(40px); opacity: 0; }
    }
    
    .trust-core-wrapper {
        position: relative;
        width: 460px;
        height: 460px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .trust-core {
        position: relative;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: 
            radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.3), transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.3), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.9), rgba(5, 9, 20, 0.95));
        backdrop-filter: blur(40px);
        border: 1px solid rgba(56, 189, 248, 0.4);
        animation: core-pulse 4s ease-in-out infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .trust-core:hover {
        transform: scale(1.05);
    }
    
    .trust-core-inner {
        text-align: center;
        z-index: 2;
    }
    
    .trust-core-label {
        color: #6B7280;
        font-size: 0.65rem;
        letter-spacing: 3px;
        text-transform: uppercase;
        margin-bottom: 8px;
    }
    
    .trust-core-value {
        color: #38BDF8;
        font-size: 2.5rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        text-shadow: 0 0 30px rgba(56, 189, 248, 0.8);
        line-height: 1;
    }
    
    .trust-core-sublabel {
        color: #8B5CF6;
        font-size: 0.7rem;
        letter-spacing: 2px;
        margin-top: 6px;
        font-weight: 600;
    }
    
    .orbit-node {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.5);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
        top: 50%;
        left: 50%;
        margin-top: -30px;
        margin-left: -30px;
    }
    
    .orbit-1 { animation: orbit-1 20s linear infinite; }
    .orbit-2 { animation: orbit-2 20s linear infinite; }
    .orbit-3 { animation: orbit-3 20s linear infinite; }
    
    .orbit-node-label {
        color: #94A3B8;
        font-size: 0.5rem;
        letter-spacing: 1px;
        text-transform: uppercase;
    }
    
    .orbit-node-value {
        color: #38BDF8;
        font-size: 0.7rem;
        font-weight: 700;
    }
    
    /* === ATTACK SIMULATOR === */
    .attack-simulator-card {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.9)) !important;
        border: 1px solid rgba(239, 68, 68, 0.3) !important;
        border-radius: 24px !important;
        padding: 32px !important;
        backdrop-filter: blur(40px);
        position: relative;
        overflow: hidden;
    }
    
    .attack-simulator-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #EF4444, transparent);
        animation: scan-line 3s linear infinite;
    }
    
    @keyframes scan-line {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    .inject-btn {
        background: linear-gradient(135deg, #EF4444, #DC2626);
        color: white;
        font-weight: 700;
        padding: 14px 28px;
        border-radius: 12px;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
        border: 1px solid rgba(239, 68, 68, 0.6);
        cursor: pointer;
        text-transform: uppercase;
    }
    
    .inject-btn:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 0 60px rgba(239, 68, 68, 0.8), 0 15px 40px rgba(239, 68, 68, 0.4);
    }
    
    .attack-stage {
        background: rgba(5, 9, 20, 0.7);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 16px;
        padding: 20px;
        margin-top: 16px;
        font-family: 'JetBrains Mono', monospace;
        position: relative;
        overflow: hidden;
    }
    
    .attack-stage-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        opacity: 0;
        animation: fade-in-up 0.5s ease-out forwards;
    }
    
    @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .attack-stage-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .attack-stage-label {
        color: #94A3B8;
        font-size: 0.75rem;
        letter-spacing: 1px;
        text-transform: uppercase;
    }
    
    .attack-stage-value {
        color: #EF4444;
        font-weight: 700;
        font-size: 0.9rem;
    }
    
    .data-blocked {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
        border: 2px solid #EF4444;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        margin-top: 20px;
        animation: blocked-pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes blocked-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 0 60px rgba(239, 68, 68, 0.9), 0 0 100px rgba(239, 68, 68, 0.4); }
    }
    
    /* === INTEGRITY LAYERS === */
    .integrity-card {
        background: rgba(15, 23, 42, 0.6) !important;
        border: 1px solid rgba(56, 189, 248, 0.2) !important;
        border-radius: 20px !important;
        padding: 24px 16px !important;
        text-align: center;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(20px);
    }
    
    .integrity-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--layer-color);
        opacity: 0.6;
        transition: opacity 0.3s ease;
    }
    
    .integrity-card:hover {
        transform: translateY(-8px) scale(1.02);
        border-color: var(--layer-color) !important;
        box-shadow: 0 20px 60px var(--layer-glow);
    }
    
    .integrity-card:hover::before {
        opacity: 1;
    }
    
    .integrity-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: var(--layer-glow);
        border: 1px solid var(--layer-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        transition: all 0.4s ease;
    }
    
    .integrity-card:hover .integrity-icon {
        transform: scale(1.1) rotate(-5deg);
        box-shadow: 0 0 30px var(--layer-color);
    }
</style>
'''


def apply_trust_command_styles(ui):
    """Apply Trust Command Center styles."""
    ui.add_head_html(TRUST_COMMAND_CSS)
