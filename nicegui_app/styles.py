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