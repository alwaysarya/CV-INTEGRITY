"""
NiceGUI Wallet Page
Real wallet data from outputs/reports/wallets.json
"""

from nicegui import ui
from styles import apply_styles
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
WALLETS_FILE = PROJECT_ROOT / 'outputs' / 'reports' / 'wallets.json'


def load_wallets():
    if not WALLETS_FILE.exists():
        return None
    try:
        with open(WALLETS_FILE) as f:
            return json.load(f)
    except:
        return None


def create_donut_svg(value, max_val, color='#F59E0B', size=140):
    """Create donut chart SVG."""
    import math
    percent = min(value / max_val, 1.0) if max_val > 0 else 0
    radius = (size - 20) / 2
    cx = cy = size / 2
    circumference = 2 * math.pi * radius
    dash_array = f'{circumference * percent} {circumference}'
    
    return f'''
    <svg width="{size}" height="{size}" viewBox="0 0 {size} {size}">
        <circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="#1E293B" stroke-width="14"/>
        <circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="{color}" stroke-width="14"
                stroke-dasharray="{dash_array}" transform="rotate(-90 {cx} {cy})" stroke-linecap="round"/>
        <text x="{cx}" y="{cy + 6}" text-anchor="middle" fill="{color}" font-size="22" font-weight="800" font-family="Inter">{value:,}</text>
    </svg>
    '''


def create_wallet_page():
    
    @ui.page('/wallet')
    def wallet():
        apply_styles(ui)
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
            .mono { font-family: 'JetBrains Mono', monospace !important; word-break: break-all; }
            
            .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 0;
                border-left: 3px solid #F59E0B;
                padding-left: 16px;
                margin-bottom: 20px;
            }
            
            .wallet-card {
                background: rgba(15, 23, 42, 0.6) !important;
                border: 1px solid rgba(245, 158, 11, 0.2) !important;
                border-radius: 12px !important;
                padding: 20px !important;
            }
            
            .tx-row {
                background: rgba(15, 23, 42, 0.4);
                border: 1px solid rgba(245, 158, 11, 0.1);
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 8px;
            }
        </style>
        ''')
        
        # Navigation
        with ui.row().classes('w-full items-center justify-between px-6 py-3').style(
            'background: rgba(10, 14, 26, 0.95); border-bottom: 1px solid rgba(245, 158, 11, 0.15); position: sticky; top: 0; z-index: 100;'
        ):
            with ui.row().classes('items-center gap-3'):
                ui.html('<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #F59E0B, #D97706); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🧠</div>')
                ui.label('CV-INTEGRITY AI').classes('text-white font-bold text-sm')
            
            with ui.row().classes('items-center gap-1'):
                for label, path in [
                    ('Home', '/'), 
                    ('Blockchain', '/blockchain'),
                    ('Trust', '/trust'),
                    ('Wallet', '/wallet'),
                ]:
                    active = path == '/wallet'
                    ui.button(label, on_click=lambda p=path: ui.navigate.to(p)).props('flat no-caps').classes(
                        'text-white' if active else 'text-gray-400'
                    )
        
        data = load_wallets()
        
        with ui.column().classes('w-full px-8 py-8 gap-6'):
            
            # Header
            with ui.column().classes('items-center gap-2 w-full'):
                with ui.row().classes('items-center gap-3'):
                    ui.icon('account_balance_wallet').classes('text-amber-400 text-4xl')
                    ui.label('CVIT Wallet System').classes('text-amber-400 font-bold text-4xl')
                ui.label('Blockchain-based token economy · Reward system · Transaction history').classes('text-gray-400 text-sm')
            
            if not data:
                with ui.card().classes('w-full p-12').style(
                    'background: rgba(15, 23, 42, 0.4); border: 2px dashed #F59E0B; border-radius: 12px;'
                ):
                    with ui.column().classes('items-center gap-3'):
                        ui.icon('info').classes('text-gray-500 text-5xl')
                        ui.label('No wallet data found').classes('text-gray-400 text-lg')
                return
            
            token_name = data.get('token_name', 'CVIT')
            total_supply = data.get('total_supply', 0)
            wallets = data.get('wallets', {})
            
            total_circulating = sum(w.get('balance', 0) for w in wallets.values())
            total_wallets = len(wallets)
            
            # Stats
            with ui.row().classes('w-full gap-4 justify-center'):
                for label, value, color, icon in [
                    ('Token', token_name, '#F59E0B', 'toll'),
                    ('Total Supply', f'{total_supply:,}', '#8B5CF6', 'inventory'),
                    ('Circulating', f'{total_circulating:,}', '#10B981', 'sync_alt'),
                    ('Wallets', str(total_wallets), '#38BDF8', 'account_balance_wallet'),
                ]:
                    with ui.card().classes('p-5').style(
                        f'background: rgba(15, 23, 42, 0.6); border: 2px solid {color}; border-radius: 12px; min-width: 180px; text-align: center;'
                    ):
                        ui.icon(icon).classes('text-3xl mb-2').style(f'color: {color};')
                        ui.label(value).classes('text-white font-bold text-2xl')
                        ui.label(label).classes('text-gray-500 text-xs tracking-wider mt-1')
            
            # Top Holders
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('🏆').classes('text-xl')
                    ui.label('Top Holders').classes('text-white font-bold text-lg')
                
                # Sort wallets by balance
                sorted_wallets = sorted(wallets.items(), key=lambda x: x[1].get('balance', 0), reverse=True)
                
                with ui.row().classes('w-full gap-4 justify-center'):
                    for rank, (owner, wallet_data) in enumerate(sorted_wallets, start=1):
                        balance = wallet_data.get('balance', 0)
                        address = wallet_data.get('address', 'N/A')
                        
                        # Rank colors
                        if rank == 1:
                            color = '#FFD700'  # Gold
                            medal = '🥇'
                        elif rank == 2:
                            color = '#C0C0C0'  # Silver
                            medal = '🥈'
                        else:
                            color = '#CD7F32'  # Bronze
                            medal = '🥉'
                        
                        with ui.card().classes('wallet-card flex-1').style(f'border-color: {color}60; max-width: 380px;'):
                            with ui.row().classes('w-full items-center justify-between mb-3'):
                                ui.html(f'<div style="font-size: 2rem;">{medal}</div>')
                                ui.html(f'<div style="background: {color}30; color: {color}; padding: 4px 12px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">RANK #{rank}</div>')
                            
                            ui.label(owner).classes('text-white font-bold text-lg mb-2')
                            
                            # Balance
                            with ui.column().classes('items-center gap-1 mb-4'):
                                ui.html(create_donut_svg(balance, total_supply, color, 140)).classes('mx-auto')
                                ui.label('CVIT BALANCE').classes('text-gray-500 text-xs tracking-wider')
                            
                            # Address
                            with ui.column().classes('gap-0 w-full'):
                                ui.label('ADDRESS').classes('text-gray-500 text-xs tracking-wider mb-1')
                                ui.label(address).classes('text-gray-400 text-xs mono')
            
            # Wallet Details + Transactions
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('📋').classes('text-xl')
                    ui.label('Wallet Details & Transactions').classes('text-white font-bold text-lg')
                
                for owner, wallet_data in wallets.items():
                    balance = wallet_data.get('balance', 0)
                    address = wallet_data.get('address', 'N/A')
                    transactions = wallet_data.get('transactions', [])
                    created_at = wallet_data.get('created_at', 'N/A')
                    
                    with ui.card().classes('wallet-card w-full'):
                        # Header
                        with ui.row().classes('w-full items-center justify-between mb-4'):
                            with ui.column().classes('gap-1'):
                                ui.label(owner).classes('text-white font-bold text-lg')
                                ui.label(address).classes('text-gray-400 text-xs mono')
                            with ui.column().classes('items-end'):
                                ui.label(f'{balance:,} CVIT').classes('text-amber-400 font-bold text-xl')
                                ui.label(f'{len(transactions)} transactions').classes('text-gray-500 text-xs')
                        
                        # Transactions
                        if transactions:
                            ui.label('Recent Transactions').classes('text-gray-400 text-xs tracking-wider mb-3 mt-3')
                            
                            for tx in transactions:
                                tx_type = tx.get('type', 'UNKNOWN')
                                amount = tx.get('amount', 0)
                                reason = tx.get('reason', 'N/A')
                                timestamp = tx.get('timestamp', '')[:19]
                                from_addr = tx.get('from', 'N/A')
                                to_addr = tx.get('to', 'N/A')
                                
                                is_credit = tx_type == 'CREDIT'
                                tx_color = '#10B981' if is_credit else '#EF4444'
                                icon = 'arrow_downward' if is_credit else 'arrow_upward'
                                sign = '+' if is_credit else '-'
                                
                                with ui.row().classes('tx-row w-full items-center gap-3'):
                                    ui.icon(icon).classes('text-xl').style(f'color: {tx_color};')
                                    
                                    with ui.column().classes('gap-0 flex-1'):
                                        ui.label(reason).classes('text-white text-sm')
                                        ui.label(f'{"From" if is_credit else "To"}: {from_addr if is_credit else to_addr}').classes('text-gray-500 text-xs mono')
                                    
                                    with ui.column().classes('items-end'):
                                        ui.label(f'{sign}{amount}').classes('font-bold text-base').style(f'color: {tx_color};')
                                        ui.label(timestamp).classes('text-gray-600 text-xs')
            
            # Info section
            with ui.column().classes('w-full gap-4 mt-6'):
                with ui.element('div').classes('section-title'):
                    ui.label('ℹ️').classes('text-xl')
                    ui.label('How Wallet Works').classes('text-white font-bold text-lg')
                
                with ui.row().classes('w-full gap-4'):
                    for num, title, desc, color, icon in [
                        ('1', 'Welcome Bonus', '100 CVIT on signup', '#38BDF8', 'celebration'),
                        ('2', 'Earn Rewards', 'Upload good datasets', '#10B981', 'emoji_events'),
                        ('3', 'Pay for Services', 'Transfer CVIT tokens', '#F59E0B', 'payments'),
                        ('4', 'Multi-Sig', '2-of-3 signatures', '#8B5CF6', 'verified_user'),
                    ]:
                        with ui.card().classes('flex-1 p-4').style(
                            f'background: rgba(15, 23, 42, 0.6); border: 1px solid {color}40; border-radius: 12px;'
                        ):
                            with ui.row().classes('items-center gap-2 mb-2'):
                                ui.html(f'<div style="width: 28px; height: 28px; border-radius: 50%; background: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">{num}</div>')
                                ui.icon(icon).classes('text-lg').style(f'color: {color};')
                            ui.label(title).classes('text-white font-bold text-sm')
                            ui.label(desc).classes('text-gray-500 text-xs mt-1')
            
            # Actions
            with ui.row().classes('w-full gap-3 justify-center mt-6'):
                ui.button('🔄 Refresh', on_click=lambda: ui.navigate.to('/wallet')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: linear-gradient(135deg, #F59E0B, #D97706); color: white;')
                
                ui.button('⛓️ Blockchain', on_click=lambda: ui.navigate.to('/blockchain')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid #8B5CF6;')
                
                ui.button('📊 Analytics', on_click=lambda: ui.navigate.to('/analytics')).classes(
                    'px-6 py-2 rounded-lg text-sm'
                ).style('background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid #38BDF8;')


create_wallet_page()
