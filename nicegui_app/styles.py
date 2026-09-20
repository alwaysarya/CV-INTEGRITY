"""
CV-INTEGRITY AI - Common Styles
Consistent color scheme and typography across all pages.
"""

# ============================================================
# COLOR PALETTE
# ============================================================
COLORS = {
    'primary': '#38BDF8',
    'secondary': '#8B5CF6',
    'success': '#10B981',
    'warning': '#F59E0B',
    'danger': '#EF4444',
    'info': '#3B82F6',
    'dark_bg': '#0A0E1A',
    'card_bg': 'rgba(15, 23, 42, 0.6)',
    'border': 'rgba(56, 189, 248, 0.15)',
}

# ============================================================
# COMMON CSS
# ============================================================
COMMON_CSS = '''
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    body, .q-page {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        background: #0A0E1A !important;
        color: #E2E8F0;
    }
    
    .q-page-container { padding: 0 !important; }
    .nicegui-content { padding: 0 !important; }
    .mono { font-family: 'JetBrains Mono', monospace !important; }
    
    .q-card {
        background: rgba(15, 23, 42, 0.6) !important;
        border: 1px solid rgba(56, 189, 248, 0.15) !important;
        border-radius: 12px !important;
        box-shadow: none !important;
    }
    
    .q-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
    }
    
    .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 0;
        border-left: 3px solid #38BDF8;
        padding-left: 16px;
        margin-bottom: 20px;
    }
    
    .progress-bar {
        background: rgba(255, 255, 255, 0.08);
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        margin: 4px 0;
    }
    
    .progress-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
    }
    
    .q-btn {
        text-transform: none !important;
        font-weight: 500 !important;
    }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); }
    ::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.5); }
</style>
'''


def get_common_css():
    """Return the common CSS string."""
    return COMMON_CSS


def apply_styles(ui):
    """Apply common styles to a NiceGUI page."""
    ui.dark_mode().enable()
    ui.add_head_html(COMMON_CSS)