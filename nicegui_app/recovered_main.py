from nicegui import ui
import plotly.graph_objects as go


# ============================================================
# GLOBAL STYLING
# ============================================================

ui.add_head_html('''
<style>
    body {
        background: #090914 !important;
    }

    .q-page-container {
        background: #090914 !important;
    }
</style>
''')


# ============================================================
# PAGE HEADER
# ============================================================

def page_header(icon, title, subtitle):
    with ui.column().classes('w-full gap-2'):
        with ui.row().classes('items-center gap-4'):
            ui.html(f'''
                <div style="
                    width: 58px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    background: rgba(139, 92, 246, 0.15);
                    border: 1px solid rgba(139, 92, 246, 0.35);
                    border-radius: 16px;
                ">
                    {icon}
                </div>
            ''')

            with ui.column().classes('gap-1'):
                ui.label(title).style(
                    'color: #FFFFFF; font-size: 2rem; '
                    'font-weight: 800; line-height: 1.1;'
                )
                ui.label(subtitle).style(
                    'color: #8B95A9; font-size: 0.95rem;'
                )


# ============================================================
# MODEL PERFORMANCE CONTENT
# ============================================================

def performance_content():

    perf_data = [
        {
            'name': 'GOOD',
            'icon': '🟢',
            'precision': 52.82,
            'recall': 19.26,
            'map50': 19.28,
            'map50_95': 11.52,
            'color': '#10B981'
        },
        {
            'name': 'BAD',
            'icon': '🟡',
            'precision': 53.63,
            'recall': 19.24,
            'map50': 17.49,
            'map50_95': 10.19,
            'color': '#FBBF24'
        },
        {
            'name': 'WORST',
            'icon': '🔴',
            'precision': 56.72,
            'recall': 16.61,
            'map50': 15.27,
            'map50_95': 8.59,
            'color': '#EF4444'
        },
    ]

    with ui.column().classes('w-full px-8 py-8 gap-8'):

        page_header(
            '🤖',
            'Model Performance',
            'YOLOv8 performance comparison across GOOD, BAD & WORST datasets'
        )

        # ============================================================
        # PERFORMANCE SUMMARY CARDS
        # ============================================================

        with ui.row().classes('w-full gap-6'):

            for perf in perf_data:

                with ui.card().classes(
                    'p-6 rounded-2xl flex-1'
                ).style(
                    f'''
                    background: rgba(21, 21, 42, 0.8);
                    border: 2px solid {perf["color"]}44;
                    box-shadow: 0 8px 32px {perf["color"]}22;
                    '''
                ):

                    with ui.column().classes(
                        'items-center gap-4 w-full'
                    ):

                        ui.html(f'''
                            <div style="font-size: 2rem;">
                                {perf["icon"]}
                            </div>

                            <div style="
                                color: {perf["color"]};
                                font-size: 1.5rem;
                                font-weight: 900;
                                letter-spacing: 0.1em;
                            ">
                                {perf["name"]}
                            </div>
                        ''')

                        with ui.row().classes(
                            'w-full justify-between gap-2'
                        ):

                            with ui.column().classes(
                                'items-center flex-1'
                            ):
                                ui.label(
                                    f'{perf["precision"]:.1f}%'
                                ).style(
                                    'color: white; font-size: 1.3rem; '
                                    'font-weight: 900;'
                                )

                                ui.label(
                                    'PRECISION'
                                ).style(
                                    'color: #6B7280; font-size: 0.65rem; '
                                    'letter-spacing: 0.1em;'
                                )

                            with ui.column().classes(
                                'items-center flex-1'
                            ):
                                ui.label(
                                    f'{perf["recall"]:.1f}%'
                                ).style(
                                    'color: white; font-size: 1.3rem; '
                                    'font-weight: 900;'
                                )

                                ui.label(
                                    'RECALL'
                                ).style(
                                    'color: #6B7280; font-size: 0.65rem; '
                                    'letter-spacing: 0.1em;'
                                )

                        with ui.row().classes(
                            'w-full justify-between gap-2'
                        ):

                            with ui.column().classes(
                                'items-center flex-1'
                            ):
                                ui.label(
                                    f'{perf["map50"]:.1f}%'
                                ).style(
                                    f'color: {perf["color"]}; '
                                    'font-size: 1.3rem; font-weight: 900;'
                                )

                                ui.label(
                                    'mAP50'
                                ).style(
                                    'color: #6B7280; font-size: 0.65rem; '
                                    'letter-spacing: 0.1em;'
                                )

                            with ui.column().classes(
                                'items-center flex-1'
                            ):
                                ui.label(
                                    f'{perf["map50_95"]:.1f}%'
                                ).style(
                                    f'color: {perf["color"]}; '
                                    'font-size: 1.3rem; font-weight: 900;'
                                )

                                ui.label(
                                    'mAP50-95'
                                ).style(
                                    'color: #6B7280; font-size: 0.65rem; '
                                    'letter-spacing: 0.1em;'
                                )

        # ============================================================
        # PERFORMANCE TABLE
        # ============================================================

        with ui.card().classes(
            'p-6 rounded-2xl w-full'
        ).style(
            'background: rgba(21,21,42,0.8); '
            'border: 1px solid #252540;'
        ):

            ui.label('Performance Table').style(
                'color: white; font-size: 1.2rem; font-weight: 800;'
            )

            rows_html = ''

            for perf in perf_data:

                rows_html += f'''
                <tr style="border-bottom: 1px solid #252540;">

                    <td style="
                        padding: 14px;
                        color: white;
                        font-weight: 700;
                    ">
                        {perf["icon"]} {perf["name"]}
                    </td>

                    <td style="
                        padding: 14px;
                        color: #E5E7EB;
                        text-align: center;
                    ">
                        {perf["precision"]:.2f}%
                    </td>

                    <td style="
                        padding: 14px;
                        color: #E5E7EB;
                        text-align: center;
                    ">
                        {perf["recall"]:.2f}%
                    </td>

                    <td style="
                        padding: 14px;
                        color: {perf["color"]};
                        font-weight: 700;
                        text-align: center;
                    ">
                        {perf["map50"]:.2f}%
                    </td>

                    <td style="
                        padding: 14px;
                        color: {perf["color"]};
                        font-weight: 700;
                        text-align: center;
                    ">
                        {perf["map50_95"]:.2f}%
                    </td>

                </tr>
                '''

            ui.html(f'''
                <table style="
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                ">

                    <thead>
                        <tr style="
                            background: rgba(139,92,246,0.2);
                        ">
                            <th style="padding: 14px; color: white; text-align:left;">
                                Model
                            </th>

                            <th style="padding: 14px; color: white;">
                                Precision
                            </th>

                            <th style="padding: 14px; color: white;">
                                Recall
                            </th>

                            <th style="padding: 14px; color: white;">
                                mAP50
                            </th>

                            <th style="padding: 14px; color: white;">
                                mAP50-95
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows_html}
                    </tbody>

                </table>
            ''')

        # ============================================================
        # BAR + RADAR CHARTS
        # ============================================================

        with ui.row().classes('w-full gap-6'):

            # BAR CHART
            with ui.card().classes(
                'p-6 rounded-2xl flex-1'
            ).style(
                'background: rgba(21,21,42,0.8); '
                'border: 1px solid #252540;'
            ):

                ui.label('Bar Chart').style(
                    'color: white; font-size: 1.2rem; font-weight: 800;'
                )

                fig_bar = go.Figure()

                fig_bar.add_trace(go.Bar(
                    name='Precision',
                    x=['GOOD', 'BAD', 'WORST'],
                    y=[52.82, 53.63, 56.72]
                ))

                fig_bar.add_trace(go.Bar(
                    name='Recall',
                    x=['GOOD', 'BAD', 'WORST'],
                    y=[19.26, 19.24, 16.61]
                ))

                fig_bar.add_trace(go.Bar(
                    name='mAP50',
                    x=['GOOD', 'BAD', 'WORST'],
                    y=[19.28, 17.49, 15.27]
                ))

                fig_bar.update_layout(
                    barmode='group',
                    plot_bgcolor='#11111F',
                    paper_bgcolor='rgba(0,0,0,0)',
                    font={'color': '#FFFFFF'},
                    height=350
                )

                ui.plotly(fig_bar).classes('w-full')

            # RADAR CHART
            with ui.card().classes(
                'p-6 rounded-2xl flex-1'
            ).style(
                'background: rgba(21,21,42,0.8); '
                'border: 1px solid #252540;'
            ):

                ui.label('Radar Chart').style(
                    'color: white; font-size: 1.2rem; font-weight: 800;'
                )

                categories = [
                    'Precision',
                    'Recall',
                    'mAP50',
                    'mAP50-95'
                ]

                fig_radar = go.Figure()

                fig_radar.add_trace(go.Scatterpolar(
                    r=[52.82, 19.26, 19.28, 11.52],
                    theta=categories,
                    fill='toself',
                    name='GOOD'
                ))

                fig_radar.add_trace(go.Scatterpolar(
                    r=[53.63, 19.24, 17.49, 10.19],
                    theta=categories,
                    fill='toself',
                    name='BAD'
                ))

                fig_radar.add_trace(go.Scatterpolar(
                    r=[56.72, 16.61, 15.27, 8.59],
                    theta=categories,
                    fill='toself',
                    name='WORST'
                ))

                fig_radar.update_layout(
                    polar=dict(
                        bgcolor='#11111F',
                        radialaxis=dict(
                            visible=True,
                            range=[0, 100]
                        )
                    ),
                    paper_bgcolor='rgba(0,0,0,0)',
                    font={'color': '#FFFFFF'},
                    height=350
                )

                ui.plotly(fig_radar).classes('w-full')

        # ============================================================
        # PERFORMANCE TREND
        # ============================================================

        with ui.card().classes(
            'p-6 rounded-2xl w-full'
        ).style(
            'background: rgba(21,21,42,0.8); '
            'border: 1px solid #252540;'
        ):

            ui.label('Performance Trend').style(
                'color: white; font-size: 1.2rem; font-weight: 800;'
            )

            fig_line = go.Figure()

            fig_line.add_trace(go.Scatter(
                x=['GOOD', 'BAD', 'WORST'],
                y=[52.82, 53.63, 56.72],
                mode='lines+markers',
                name='Precision'
            ))

            fig_line.add_trace(go.Scatter(
                x=['GOOD', 'BAD', 'WORST'],
                y=[19.26, 19.24, 16.61],
                mode='lines+markers',
                name='Recall'
            ))

            fig_line.add_trace(go.Scatter(
                x=['GOOD', 'BAD', 'WORST'],
                y=[19.28, 17.49, 15.27],
                mode='lines+markers',
                name='mAP50'
            ))

            fig_line.add_trace(go.Scatter(
                x=['GOOD', 'BAD', 'WORST'],
                y=[11.52, 10.19, 8.59],
                mode='lines+markers',
                name='mAP50-95'
            ))

            fig_line.update_layout(
                plot_bgcolor='#11111F',
                paper_bgcolor='rgba(0,0,0,0)',
                font={'color': '#FFFFFF'},
                height=400
            )

            ui.plotly(fig_line).classes('w-full')

        # ============================================================
        # OBSERVATION BOX
        # ============================================================

        with ui.card().classes(
            'p-8 rounded-2xl w-full'
        ).style(
            '''
            background: linear-gradient(
                135deg,
                rgba(139,92,246,0.15),
                rgba(16,185,129,0.10)
            );
            border: 1px solid rgba(139,92,246,0.3);
            '''
        ):

            with ui.column().classes(
                'items-center gap-3 w-full'
            ):

                ui.label('📌').style('font-size: 2rem;')

                ui.label('Key Observation').style(
                    'color: white; font-size: 1.2rem; '
                    'font-weight: 800;'
                )

                ui.label(
                    'Jaisa dataset quality girti hai, '
                    'waisa model performance bhi girti hai'
                ).style(
                    'color: #B8C0D4; font-size: 1rem;'
                )

                ui.label(
                    'GOOD mAP50: 19.28% → BAD: 17.49% → WORST: 15.27%'
                ).style(
                    'color: #A78BFA; font-family: monospace; '
                    'font-size: 1rem; font-weight: 800;'
                )


# ============================================================
# NAVIGATION
# ============================================================

with ui.header().classes('items-center justify-between px-8').style(
    'background: rgba(12,12,25,0.95); '
    'border-bottom: 1px solid #252540;'
):

    ui.label('CV-INTEGRITY AI').style(
        'color: white; font-size: 1.25rem; font-weight: 900; '
        'letter-spacing: 0.08em;'
    )

    ui.label('MODEL PERFORMANCE').style(
        'color: #8B5CF6; font-size: 0.8rem; font-weight: 700;'
    )


# ============================================================
# LOAD PAGE
# ============================================================

performance_content()


# ============================================================
# RUN SERVER
# ============================================================

ui.run(
    title='CV-INTEGRITY AI',
    port=8080,
    reload=False
)