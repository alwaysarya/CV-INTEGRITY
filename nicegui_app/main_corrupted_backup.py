def performance_content():
    """Model Performance page with charts"""
    import plotly.graph_objects as go
    import plotly.express as px
    import pandas as pd
    
    with ui.column().classes('w-full px-8 py-8 gap-8'):
        page_header('🤖', 'Model Performance', 'YOLOv8 performance comparison across GOOD, BAD & WORST datasets')
        
        # ============================================================
        # PERFORMANCE SUMMARY CARDS (3 cards)
        # ============================================================
        with ui.row().classes('w-full gap-6'):
            perf_data = [
                {'name': 'GOOD', 'icon': '🟢', 'precision': 52.82, 'recall': 19.26, 'map50': 19.28, 'map50_95': 11.52, 'color': '#10B981'},
                {'name': 'BAD', 'icon': '🟡', 'precision': 53.63, 'recall': 19.24, 'map50': 17.49, 'map50_95': 10.19, 'color': '#FBBF24'},
                {'name': 'WORST', 'icon': '🔴', 'precision': 56.72, 'recall': 16.61, 'map50': 15.27, 'map50_95': 8.59, 'color': '#EF4444'},
            ]
            
            for perf in perf_data:
                with ui.card().classes('p-6 rounded-2xl flex-1').style(
                    f'background: rgba(21, 21, 42, 0.8); border: 2px solid {perf["color"]}44; box-shadow: 0 8px 32px {perf["color"]}22;'
                ):
                    # Card Header
                    with ui.column().classes('items-center gap-4 w-full'):
                        ui.html(f'''
                            <div style="font-size: 2rem;">{perf["icon"]}</div>
                            <div style="color: {perf["color"]}; font-size: 1.5rem; font-weight: 900; 
                                        letter-spacing: 0.1em;">{perf["name"]}</div>
                        ''')
                        
                        # 4 Metrics Grid
                        with ui.row().classes('w-full justify-between gap-2'):
                            # Precision
                            with ui.column().classes('items-center flex-1'):
                                ui.html(f'''
                                    <div style="color: #FFFFFF; font-size: 1.3rem; font-weight: 900;">
                                        {perf["precision"]:.1f}%
                                    </div>
                                    <div style="color: #6B7280; font-size: 0.65rem; 
                                                letter-spacing: 0.1em; margin-top: 4px;">
                                        PRECISION
                                    </div>
                                ''')
                            # Recall
                            with ui.column().classes('items-center flex-1'):
                                ui.html(f'''
                                    <div style="color: #FFFFFF; font-size: 1.3rem; font-weight: 900;">
                                        {perf["recall"]:.1f}%
                                    </div>
                                    <div style="color: #6B7280; font-size: 0.65rem; 
                                                letter-spacing: 0.1em; margin-top: 4px;">
                                        RECALL
                                    </div>
                                ''')
                        
                        with ui.row().classes('w-full justify-between gap-2'):
                            # mAP50
                            with ui.column().classes('items-center flex-1'):
                                ui.html(f'''
                                    <div style="color: {perf["color"]}; font-size: 1.3rem; font-weight: 900;">
                                        {perf["map50"]:.1f}%
                                    </div>
                                    <div style="color: #6B7280; font-size: 0.65rem; 
                                                letter-spacing: 0.1em; margin-top: 4px;">
                                        mAP50
                                    </div>
                                ''')
                            # mAP50-95
                            with ui.column().classes('items-center flex-1'):
                                ui.html(f'''
                                    <div style="color: {perf["color"]}; font-size: 1.3rem; font-weight: 900;">
                                        {perf["map50_95"]:.1f}%
                                    </div>
                                    <div style="color: #6B7280; font-size: 0.65rem; 
                                                letter-spacing: 0.1em; margin-top: 4px;">
                                        mAP50-95
                                    </div>
                                ''')
        
        # ============================================================
        # PERFORMANCE TABLE
        # ============================================================
        with ui.card().classes('p-6 rounded-2xl w-full').style('background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'):
            with ui.row().classes('items-center gap-2 mb-6'):
                ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                ui.label('Performance Table').classes('text-white font-bold text-lg')
            
            # Build table HTML
            rows_html = ''
            for perf in perf_data:
                rows_html += f'''
                    <tr style="border-bottom: 1px solid #252540;">
                        <td style="padding: 12px 16px; color: #FFFFFF; font-weight: 600;">
                            {perf["icon"]} {perf["name"]}
                        </td>
                        <td style="padding: 12px 16px; color: #E5E7EB; text-align: center;">
                            {perf["precision"]:.2f}%
                        </td>
                        <td style="padding: 12px 16px; color: #E5E7EB; text-align: center;">
                            {perf["recall"]:.2f}%
                        </td>
                        <td style="padding: 12px 16px; color: {perf["color"]}; font-weight: 700; text-align: center;">
                            {perf["map50"]:.2f}%
                        </td>
                        <td style="padding: 12px 16px; color: {perf["color"]}; font-weight: 700; text-align: center;">
                            {perf["map50_95"]:.2f}%
                        </td>
                    </tr>
                '''
            
            ui.html(f'''
                <table style="width: 100%; border-collapse: collapse; 
                              background: rgba(10, 10, 20, 0.5); border-radius: 12px; overflow: hidden;">
                    <thead>
                        <tr style="background: rgba(139, 92, 246, 0.2); border-bottom: 2px solid #8B5CF6;">
                            <th style="padding: 14px 16px; color: #FFFFFF; text-align: left; font-weight: 700;">Model</th>
                            <th style="padding: 14px 16px; color: #FFFFFF; text-align: center; font-weight: 700;">Precision</th>
                            <th style="padding: 14px 16px; color: #FFFFFF; text-align: center; font-weight: 700;">Recall</th>
                            <th style="padding: 14px 16px; color: #FFFFFF; text-align: center; font-weight: 700;">mAP50</th>
                            <th style="padding: 14px 16px; color: #FFFFFF; text-align: center; font-weight: 700;">mAP50-95</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows_html}
                    </tbody>
                </table>
            ''')
        
        # ============================================================
        # CHARTS ROW (Bar Chart + Radar Chart)
        # ============================================================
        with ui.row().classes('w-full gap-6'):
            # Bar Chart
            with ui.card().classes('p-6 rounded-2xl').style('flex: 1; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'):
                with ui.row().classes('items-center gap-2 mb-4'):
                    ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                    ui.label('Bar Chart').classes('text-white font-bold text-lg')
                
                # Plotly Bar Chart
                fig_bar = go.Figure(data=[
                    go.Bar(name='Precision', x=['GOOD', 'BAD', 'WORST'], y=[52.82, 53.63, 56.72], marker_color='#8B5CF6'),
                    go.Bar(name='Recall', x=['GOOD', 'BAD', 'WORST'], y=[19.26, 19.24, 16.61], marker_color='#FBBF24'),
                    go.Bar(name='mAP50', x=['GOOD', 'BAD', 'WORST'], y=[19.28, 17.49, 15.27], marker_color='#3B82F6'),
                ])
                fig_bar.update_layout(
                    barmode='group',
                    plot_bgcolor='rgba(10, 10, 20, 0.5)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    font={'color': '#FFFFFF'},
                    height=350,
                    margin=dict(l=20, r=20, t=20, b=20),
                    legend=dict(bgcolor='rgba(21, 21, 42, 0.8)'),
                    xaxis=dict(gridcolor='#252540'),
                    yaxis=dict(gridcolor='#252540'),
                )
                ui.plotly(fig_bar).classes('w-full')
            
            # Radar Chart
            with ui.card().classes('p-6 rounded-2xl').style('flex: 1; background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'):
                with ui.row().classes('items-center gap-2 mb-4'):
                    ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                    ui.label('Radar Chart').classes('text-white font-bold text-lg')
                
                # Plotly Radar Chart
                categories = ['Precision', 'Recall', 'mAP50', 'mAP50-95']
                fig_radar = go.Figure()
                fig_radar.add_trace(go.Scatterpolar(
                    r=[52.82, 19.26, 19.28, 11.52],
                    theta=categories,
                    fill='toself',
                    name='GOOD',
                    line_color='#10B981'
                ))
                fig_radar.add_trace(go.Scatterpolar(
                    r=[53.63, 19.24, 17.49, 10.19],
                    theta=categories,
                    fill='toself',
                    name='BAD',
                    line_color='#FBBF24'
                ))
                fig_radar.add_trace(go.Scatterpolar(
                    r=[56.72, 16.61, 15.27, 8.59],
                    theta=categories,
                    fill='toself',
                    name='WORST',
                    line_color='#EF4444'
                ))
                fig_radar.update_layout(
                    polar=dict(
                        bgcolor='rgba(10, 10, 20, 0.5)',
                        radialaxis=dict(visible=True, range=[0, 100], gridcolor='#252540', tickfont={'color': '#6B7280'}),
                        angularaxis=dict(gridcolor='#252540', tickfont={'color': '#FFFFFF'}),
                    ),
                    showlegend=True,
                    height=350,
                    paper_bgcolor='rgba(0,0,0,0)',
                    font={'color': '#FFFFFF'},
                    margin=dict(l=40, r=40, t=20, b=20),
                    legend=dict(bgcolor='rgba(21, 21, 42, 0.8)'),
                )
                ui.plotly(fig_radar).classes('w-full')
        
        # ============================================================
        # TREND CHART (Line Chart)
        # ============================================================
        with ui.card().classes('p-6 rounded-2xl w-full').style('background: rgba(21, 21, 42, 0.8); border: 1px solid #252540;'):
            with ui.row().classes('items-center gap-2 mb-4'):
                ui.html('<div style="width: 3px; height: 20px; background: #8B5CF6; border-radius: 2px;"></div>')
                ui.label('Performance Trend').classes('text-white font-bold text-lg')
            
            fig_line = go.Figure()
            fig_line.add_trace(go.Scatter(x=['GOOD', 'BAD', 'WORST'], y=[52.82, 53.63, 56.72], 
                                          mode='lines+markers', name='Precision', line=dict(color='#8B5CF6', width=3), marker=dict(size=12)))
            fig_line.add_trace(go.Scatter(x=['GOOD', 'BAD', 'WORST'], y=[19.26, 19.24, 16.61], 
                                          mode='lines+markers', name='Recall', line=dict(color='#FBBF24', width=3), marker=dict(size=12)))
            fig_line.add_trace(go.Scatter(x=['GOOD', 'BAD', 'WORST'], y=[19.28, 17.49, 15.27], 
                                          mode='lines+markers', name='mAP50', line=dict(color='#3B82F6', width=3), marker=dict(size=12)))
            fig_line.add_trace(go.Scatter(x=['GOOD', 'BAD', 'WORST'], y=[11.52, 10.19, 8.59], 
                                          mode='lines+markers', name='mAP50-95', line=dict(color='#EF4444', width=3), marker=dict(size=12)))
            fig_line.update_layout(
                plot_bgcolor='rgba(10, 10, 20, 0.5)',
                paper_bgcolor='rgba(0,0,0,0)',
                font={'color': '#FFFFFF'},
                height=350,
                margin=dict(l=20, r=20, t=20, b=20),
                legend=dict(bgcolor='rgba(21, 21, 42, 0.8)'),
                xaxis=dict(gridcolor='#252540'),
                yaxis=dict(gridcolor='#252540'),
            )
            ui.plotly(fig_line).classes('w-full')
        
        # ============================================================
        # OBSERVATION BOX
        # ============================================================
        with ui.card().classes('p-6 rounded-2xl w-full').style(
            'background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(16, 185, 129, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3);'
        ):
            with ui.column().classes('items-center gap-2 w-full'):
                ui.html('''
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📌</div>
                    <div style="color: #FFFFFF; font-size: 1.1rem; font-weight: 700; text-align: center;">
                        Key Observation
                    </div>
                    <div style="color: #B8C0D4; font-size: 0.95rem; text-align: center; margin-top: 8px; line-height: 1.6;">
                        Jaisa dataset quality girti hai, waisa model performance bhi girti hai
                    </div>
                    <div style="color: #A78BFA; font-family: monospace; font-size: 1rem; margin-top: 12px; font-weight: 700;">
                        GOOD mAP50: 19.28% → BAD: 17.49% → WORST: 15.27%
                    </div>
                ''')