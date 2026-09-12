import streamlit as st
import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from pathlib import Path
import zipfile
import os
import shutil
import subprocess
from datetime import datetime
import time

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="CV-INTEGRITY AI",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'About': "CV-INTEGRITY AI - SIH 2026 | Model Trust & Quality Platform"
    }
)

# ============================================================
# ULTRA PROFESSIONAL CSS
# ============================================================
st.markdown("""
<style>
    /* Global */
    .stApp {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
    }
    
    /* Main title */
    .main-title {
        font-size: 3rem;
        font-weight: 800;
        background: linear-gradient(90deg, #00ff87, #60efff, #00ff87);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        padding: 0.5rem 0;
        animation: shine 3s linear infinite;
        letter-spacing: -1px;
    }
    @keyframes shine {
        to { background-position: 200% center; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .sub-title {
        text-align: center;
        color: #a0a0b0;
        font-size: 1.1rem;
        margin-bottom: 2rem;
        animation: fadeIn 1s ease-in;
    }
    
    /* Metric cards */
    .metric-card {
        background: linear-gradient(145deg, #1e1e3a, #2a2a4a);
        padding: 1.5rem;
        border-radius: 20px;
        border: 1px solid #333355;
        text-align: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.5s ease-in;
    }
    .metric-card:hover {
        transform: translateY(-5px) scale(1.02);
        border-color: #00ff87;
        box-shadow: 0 10px 30px rgba(0, 255, 135, 0.25);
    }
    .metric-value {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, #00ff87, #60efff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .metric-label {
        color: #a0a0b0;
        font-size: 0.85rem;
        margin-top: 0.5rem;
        letter-spacing: 2px;
        text-transform: uppercase;
    }
    
    /* Badges */
    .badge-accept {
        background: linear-gradient(90deg, #00ff87, #00cc6a);
        color: #000;
        padding: 0.5rem 1.5rem;
        border-radius: 30px;
        font-weight: 700;
        display: inline-block;
        font-size: 0.9rem;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(0, 255, 135, 0.4);
    }
    .badge-review {
        background: linear-gradient(90deg, #ffd700, #ff9500);
        color: #000;
        padding: 0.5rem 1.5rem;
        border-radius: 30px;
        font-weight: 700;
        display: inline-block;
        font-size: 0.9rem;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }
    .badge-quarantine {
        background: linear-gradient(90deg, #ff4757, #ff1744);
        color: #fff;
        padding: 0.5rem 1.5rem;
        border-radius: 30px;
        font-weight: 700;
        display: inline-block;
        font-size: 0.9rem;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
    }
    
    /* Section headers */
    .section-header {
        font-size: 1.4rem;
        font-weight: 700;
        color: #fff;
        margin: 1.5rem 0 1rem 0;
        padding-left: 1rem;
        border-left: 4px solid #00ff87;
        letter-spacing: 0.5px;
    }
    
    /* Dividers */
    .custom-divider {
        border: none;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00ff87, transparent);
        margin: 2rem 0;
    }
    
    /* Info box */
    .info-box {
        background: linear-gradient(145deg, #1a1a2e, #252540);
        padding: 1.5rem;
        border-radius: 15px;
        border: 1px solid #333355;
        margin: 1rem 0;
    }
    
    /* Hide streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stDeployButton {display: none;}
    
    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
        border-right: 1px solid #333355;
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(90deg, #00ff87, #60efff);
        color: #000;
        font-weight: 700;
        border: none;
        border-radius: 10px;
        padding: 0.6rem 1.5rem;
        transition: all 0.3s;
        width: 100%;
    }
    .stButton > button:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 25px rgba(0, 255, 135, 0.4);
    }
    
    /* Progress bars */
    .stProgress > div > div > div {
        background: linear-gradient(90deg, #00ff87, #60efff);
    }
</style>
""", unsafe_allow_html=True)

# ============================================================
# PATHS
# ============================================================
BASE = Path(__file__).parent.parent
REPORTS = BASE / "outputs" / "reports"
MODELS = BASE / "model" / "saved_models"
DATASETS = BASE / "datasets" / "processed"
UPLOAD_DIR = BASE / "datasets" / "uploaded"

# ============================================================
# CACHED DATA LOADING (FASTER)
# ============================================================
@st.cache_data(ttl=30)
def load_json(path):
    if path.exists():
        with open(path, 'r') as f:
            return json.load(f)
    return None

def get_quality_data(dataset):
    return load_json(REPORTS / f"{dataset}_quality_report.json")

def get_trust_data():
    return load_json(REPORTS / "final_trust_report.json")

def get_model_data():
    return load_json(MODELS / "all_training_results.json")

def get_decision_data():
    return load_json(REPORTS / "deployment_decision.json")

def get_robustness_data():
    return load_json(REPORTS / "robustness_results.json")

def get_dataset_images(dataset, num=4):
    img_dir = DATASETS / dataset / "images"
    if img_dir.exists():
        images = list(img_dir.glob("*.jpg"))[:num] + list(img_dir.glob("*.png"))[:num]
        return images[:num]
    return []

# ============================================================
# CHART FUNCTIONS
# ============================================================
def create_gauge_chart(value, title, max_val=100):
    """Create a gauge chart with proper color coding"""
    if value >= 80:
        color = "#00ff87"
    elif value >= 60:
        color = "#ffd700"
    else:
        color = "#ff4757"
    
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=value,
        title={'text': title, 'font': {'size': 16, 'color': '#fff'}},
        number={'suffix': "%", 'font': {'size': 32, 'color': color}},
        gauge={
            'axis': {
                'range': [0, 100],
                'tickcolor': '#666',
                'tickfont': {'color': '#888', 'size': 10},
                'tickvals': [0, 20, 40, 60, 80, 100]
            },
            'bar': {'color': color, 'thickness': 0.75},
            'bgcolor': '#1a1a2e',
            'borderwidth': 2,
            'bordercolor': '#333355',
            'steps': [
                {'range': [0, 50], 'color': 'rgba(255, 71, 87, 0.15)'},
                {'range': [50, 80], 'color': 'rgba(255, 215, 0, 0.15)'},
                {'range': [80, 100], 'color': 'rgba(0, 255, 135, 0.15)'}
            ],
            'threshold': {
                'line': {'color': '#fff', 'width': 2},
                'thickness': 0.75,
                'value': value
            }
        }
    ))
    fig.update_layout(
        height=250,
        margin=dict(l=20, r=20, t=50, b=20),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font={'color': '#fff'}
    )
    return fig

def create_radar_chart(df):
    """Create radar chart for model comparison"""
    categories = ['Precision', 'Recall', 'mAP50', 'mAP50-95']
    fig = go.Figure()
    
    colors = ['#00ff87', '#ffd700', '#60efff']
    for i, row in df.iterrows():
        values = [row['Precision'], row['Recall'], row['mAP50'], row['mAP50-95']]
        fig.add_trace(go.Scatterpolar(
            r=values,
            theta=categories,
            fill='toself',
            name=row['Model'],
            line_color=colors[i % len(colors)]
        ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 100], gridcolor='#333355'),
            bgcolor='rgba(0,0,0,0)'
        ),
        showlegend=True,
        height=400,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font={'color': '#fff'}
    )
    return fig

# ============================================================
# SIDEBAR
# ============================================================
with st.sidebar:
    st.markdown("""
    <div style="text-align:center; padding: 1.5rem 0;">
        <div style="font-size: 3.5rem; animation: pulse 2s infinite;">🤖</div>
        <div style="font-size: 1.6rem; font-weight: 800; background: linear-gradient(90deg, #00ff87, #60efff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">CV-INTEGRITY</div>
        <div style="color: #888; font-size: 0.75rem; letter-spacing: 3px;">AI TRUST PLATFORM</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    page = st.radio("**🧭 NAVIGATION**", [
        "🏠 Home",
        "📤 Upload Dataset",
        "📊 Dataset Quality",
        "🤖 Model Performance",
        "🧪 Robustness Testing",
        "🧠 Trust Score",
        "📁 Reports",
        "🔗 Blockchain",
        "👛 Wallet",
        "🎨 XAI Visualizer",
        "🎥 Video Analysis",
        "📈 Model Drift",
        "📊 Analytics",
        "🤝 Collaboration",
        "🔐 Authentication"
    ])
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # System status
    st.markdown("**📡 SYSTEM STATUS**")
    reports_count = len(list(REPORTS.glob('*.json'))) if REPORTS.exists() else 0
    models_count = len(list(MODELS.glob('*'))) if MODELS.exists() else 0
    datasets_count = len(list(DATASETS.glob('*'))) if DATASETS.exists() else 0
    
    st.markdown(f"🟢 **Reports:** {reports_count}")
    st.markdown(f"🟢 **Models:** {models_count}")
    st.markdown(f"🟢 **Datasets:** {datasets_count}")
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    st.markdown('<hr class="custom-divider" style="margin: 1rem 0;">', unsafe_allow_html=True)

    st.markdown("""
    <div style="color: #6B7394; font-size: 0.7rem; letter-spacing: 0.2em; 
                padding-left: 0.5rem; margin-bottom: 0.75rem; font-weight: 700;">
        🔌 REAL-TIME
    </div>
    """, unsafe_allow_html=True)
    
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        ws_result = sock.connect_ex(('localhost', 8765))
        sock.close()
        ws_status = "CONNECTED" if ws_result == 0 else "OFFLINE"
        ws_color = "#00D9A3" if ws_result == 0 else "#FF4757"
    except:
        ws_status = "OFFLINE"
        ws_color = "#FF4757"
    
    st.markdown(f"""
    <div style="display: flex; justify-content: space-between; align-items: center;
                padding: 0.6rem 0.75rem; background: rgba(0, 217, 163, 0.1);
                border-radius: 10px; margin-bottom: 0.4rem; border-left: 3px solid {ws_color};">
        <span style="color: #A8B2C8; font-size: 0.85rem;">WebSocket</span>
        <span style="color: {ws_color}; font-weight: 700; font-size: 0.75rem;">{ws_status}</span>
    </div>
    """, unsafe_allow_html=True)
    
    try:
        api_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        api_sock.settimeout(1)
        api_result = api_sock.connect_ex(('localhost', 8000))
        api_sock.close()
        api_status = "ONLINE" if api_result == 0 else "OFFLINE"
        api_color = "#00D9A3" if api_result == 0 else "#FF4757"
    except:
        api_status = "OFFLINE"
        api_color = "#FF4757"
    
    st.markdown(f"""
    <div style="display: flex; justify-content: space-between; align-items: center;
                padding: 0.6rem 0.75rem; background: rgba(91, 141, 239, 0.1);
                border-radius: 10px; margin-bottom: 0.4rem; border-left: 3px solid {api_color};">
        <span style="color: #A8B2C8; font-size: 0.85rem;">REST API</span>
        <span style="color: {api_color}; font-weight: 700; font-size: 0.75rem;">{api_status}</span>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider" style="margin: 1rem 0;">', unsafe_allow_html=True)
    st.caption("🎓 SIH 2026 | v3.0")

# ============================================================
# PAGE: HOME
# ============================================================
if page == "🏠 Home":
    st.markdown('<div class="main-title">CV-INTEGRITY AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">🚀 Intelligent Computer Vision Model Trust & Quality Evaluation Platform</div>', unsafe_allow_html=True)
    
    trust_data = get_trust_data()
    
    # Top stats
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown('<div class="metric-card"><div class="metric-value">3</div><div class="metric-label">📊 DATASETS</div></div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="metric-card"><div class="metric-value">3</div><div class="metric-label">🤖 YOLO MODELS</div></div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="metric-card"><div class="metric-value">909</div><div class="metric-label">📈 IMAGES</div></div>', unsafe_allow_html=True)
    with col4:
        if trust_data:
            scores = [d.get('final_score', 0) for d in trust_data.values()]
            avg_score = sum(scores)/len(scores) if scores else 0
            color = '#00ff87' if avg_score > 70 else '#ffd700' if avg_score > 50 else '#ff4757'
            st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:{color};">{avg_score:.0f}%</div><div class="metric-label">🧠 AVG TRUST</div></div>', unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # Quick Trust Status
    if trust_data:
        st.markdown('<div class="section-header">🎯 Quick Trust Status</div>', unsafe_allow_html=True)
        cols = st.columns(3)
        for i, (ds, data) in enumerate(trust_data.items()):
            with cols[i]:
                score = data.get('final_score', 0)
                decision = data.get('decision', 'N/A')
                icon = data.get('icon', '🟢')
                badge = 'badge-accept' if 'ACCEPT' in decision else 'badge-review' if 'REVIEW' in decision else 'badge-quarantine'
                color = '#00ff87' if score >= 80 else '#ffd700' if score >= 60 else '#ff4757'
                
                st.markdown(f"""
                <div class="metric-card">
                    <div style="font-size:2.5rem;">{icon}</div>
                    <div style="font-size:1.4rem; font-weight:700; color:#fff; margin:0.5rem 0; letter-spacing:2px;">{ds.upper()}</div>
                    <div style="font-size:2.5rem; font-weight:800; color:{color}; margin:0.5rem 0;">{score:.1f}%</div>
                    <div><span class="{badge}">{decision}</span></div>
                </div>
                """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # How it works + Features
    col1, col2 = st.columns(2)
    with col1:
        st.markdown('<div class="section-header">🚀 How It Works</div>', unsafe_allow_html=True)
        st.markdown("""
        <div class="info-box">
            <div style="padding:0.7rem 0; font-size:1rem;">1️⃣ 📤 <b>Upload Dataset</b> – ZIP with images + labels</div>
            <div style="padding:0.7rem 0; font-size:1rem;">2️⃣ 🔍 <b>Auto Analysis</b> – Blur, Duplicate, Noise check</div>
            <div style="padding:0.7rem 0; font-size:1rem;">3️⃣ 🤖 <b>Train Model</b> – YOLO trains on your data</div>
            <div style="padding:0.7rem 0; font-size:1rem;">4️⃣ 🧪 <b>Robustness Test</b> – 7 transformations</div>
            <div style="padding:0.7rem 0; font-size:1rem;">5️⃣ 🧠 <b>Trust Score</b> – ACCEPT / REVIEW / QUARANTINE</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="section-header">🔥 Key Features</div>', unsafe_allow_html=True)
        st.markdown("""
        <div class="info-box">
            <div style="padding:0.7rem 0; font-size:1rem;">✅ <b>Data-Centric AI</b> approach</div>
            <div style="padding:0.7rem 0; font-size:1rem;">✅ <b>Automatic</b> quality assessment</div>
            <div style="padding:0.7rem 0; font-size:1rem;">✅ <b>Attack simulation</b> testing</div>
            <div style="padding:0.7rem 0; font-size:1rem;">✅ <b>Single trust score</b> decision</div>
            <div style="padding:0.7rem 0; font-size:1rem;">✅ <b>Real-time</b> dashboard</div>
        </div>
        """, unsafe_allow_html=True)

# ============================================================
# PAGE: UPLOAD DATASET
# ============================================================
elif page == "📤 Upload Dataset":
    st.markdown('<div class="main-title" style="font-size:2.2rem;">📤 Upload Your Dataset</div>', unsafe_allow_html=True)
    
    st.info("""
    **📦 Dataset Format Requirements:**
    - ZIP file containing:
      - `images/` folder with `.jpg` or `.png` files
      - `labels/` folder with `.txt` files (YOLO format)
    - Supported Classes: **car(0), bicycle(1), bus(2), truck(3)**
    """)
    
    uploaded_file = st.file_uploader("📁 Choose a ZIP file", type=['zip'])
    
    if uploaded_file is not None:
        st.success(f"✅ File uploaded: **{uploaded_file.name}** ({uploaded_file.size/1024/1024:.1f} MB)")
        
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        zip_path = UPLOAD_DIR / uploaded_file.name
        with open(zip_path, 'wb') as f:
            f.write(uploaded_file.getbuffer())
        
        extract_dir = UPLOAD_DIR / "extracted"
        shutil.rmtree(extract_dir, ignore_errors=True)
        extract_dir.mkdir(parents=True, exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(extract_dir)
        
        images_path = extract_dir / "images"
        labels_path = extract_dir / "labels"
        
        if images_path.exists() and labels_path.exists():
            num_images = len(list(images_path.glob("*")))
            st.success(f"✅ Dataset extracted! Found **{num_images} images** and **{len(list(labels_path.glob('*')))} labels**")
            
            # Sample images
            st.markdown('<div class="section-header">🖼️ Sample Images</div>', unsafe_allow_html=True)
            sample_imgs = list(images_path.glob("*.jpg"))[:4] + list(images_path.glob("*.png"))[:4]
            if sample_imgs:
                cols = st.columns(min(4, len(sample_imgs)))
                for i, img in enumerate(sample_imgs[:4]):
                    with cols[i]:
                        st.image(str(img), caption=img.name, width='stretch')
            
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            
            if st.button("🚀 Run Full Analysis", type="primary", width='stretch'):
                progress = st.progress(0)
                status = st.empty()
                
                status.info("📊 Step 1/4: Running Quality Analysis...")
                progress.progress(25)
                subprocess.run("python3 dataset_analyzer/scorers/dataset_scorer.py", shell=True, cwd=str(BASE))
                
                status.info("🤖 Step 2/4: Training YOLO Model...")
                progress.progress(50)
                subprocess.run("python3 scripts/train_fast.py", shell=True, cwd=str(BASE))
                
                status.info("🧪 Step 3/4: Testing Robustness...")
                progress.progress(75)
                subprocess.run("python3 model/robustness/robustness_tester.py", shell=True, cwd=str(BASE))
                
                status.info("🧠 Step 4/4: Generating Trust Score...")
                progress.progress(90)
                subprocess.run("python3 trust_engine/aggregator/trust_aggregator.py", shell=True, cwd=str(BASE))
                subprocess.run("python3 trust_engine/decision/decision_maker.py", shell=True, cwd=str(BASE))
                
                progress.progress(100)
                status.success("✅ Analysis Complete! Check other pages for results.")
                st.balloons()
        else:
            st.error("❌ Invalid format. ZIP must contain `images/` and `labels/` folders.")

# ============================================================
# PAGE: DATASET QUALITY
# ============================================================
elif page == "📊 Dataset Quality":
    st.markdown('<div class="main-title" style="font-size:2.2rem;">📊 Dataset Quality Analysis</div>', unsafe_allow_html=True)
    
    datasets = ['good', 'bad', 'worst']
    labels = {'good': '🟢 GOOD', 'bad': '🟡 BAD', 'worst': '🔴 WORST'}
    
    # Gauges
    st.markdown('<div class="section-header">📈 Overall Quality Scores</div>', unsafe_allow_html=True)
    cols = st.columns(3)
    for i, ds in enumerate(datasets):
        data = get_quality_data(ds)
        with cols[i]:
            if data:
                score = data.get('scores', {}).get('overall_score', 0)
                fig = create_gauge_chart(score, labels[ds].replace('🟢 ','').replace('🟡 ','').replace('🔴 ',''))
                st.plotly_chart(fig, width='stretch', key=f"gauge_{ds}")
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # Detailed
    st.markdown('<div class="section-header">📋 Detailed Metrics</div>', unsafe_allow_html=True)
    
    for ds in datasets:
        data = get_quality_data(ds)
        if data:
            scores = data.get('scores', {})
            with st.expander(f"{labels[ds]} — Detailed Report", expanded=(ds == 'good')):
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Overall", f"{scores.get('overall_score', 0):.1f}%")
                with col2:
                    st.metric("Blur Score", f"{scores.get('blur_score', 0):.1f}%")
                with col3:
                    st.metric("Duplicates", f"{scores.get('duplicate_score', 0):.1f}%")
                with col4:
                    st.metric("Noise", f"{scores.get('noise_score', 0):.1f}%")
                
                sample_imgs = get_dataset_images(ds, 4)
                if sample_imgs:
                    st.markdown("**🖼️ Sample Images:**")
                    cols_img = st.columns(4)
                    for i, img in enumerate(sample_imgs[:4]):
                        with cols_img[i]:
                            st.image(str(img), caption=img.name, width='stretch')

# ============================================================
# PAGE: MODEL PERFORMANCE
# ============================================================
elif page == "🤖 Model Performance":
    st.markdown('<div class="main-title" style="font-size:2.2rem;">🤖 Model Performance</div>', unsafe_allow_html=True)
    
    data = get_model_data()
    if data:
        rows = []
        for model, info in data.items():
            m = info.get('metrics', {})
            rows.append({
                'Model': model.upper(),
                'Precision': round(m.get('precision', 0)*100, 2),
                'Recall': round(m.get('recall', 0)*100, 2),
                'mAP50': round(m.get('mAP50', 0)*100, 2),
                'mAP50-95': round(m.get('mAP50_95', 0)*100, 2),
            })
        
        df = pd.DataFrame(rows)
        
        st.markdown('<div class="section-header">📋 Performance Table</div>', unsafe_allow_html=True)
        st.dataframe(df, width='stretch', hide_index=True)
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        # Charts
        col1, col2 = st.columns(2)
        with col1:
            st.markdown('<div class="section-header">📊 Bar Chart</div>', unsafe_allow_html=True)
            fig = px.bar(df, x='Model', y=['Precision', 'Recall', 'mAP50'],
                         barmode='group', color_discrete_sequence=['#00ff87', '#ffd700', '#60efff'])
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                font={'color': '#fff'}, height=400, legend=dict(bgcolor='rgba(0,0,0,0)')
            )
            st.plotly_chart(fig, width='stretch')
        
        with col2:
            st.markdown('<div class="section-header">🕸️ Radar Chart</div>', unsafe_allow_html=True)
            fig = create_radar_chart(df)
            st.plotly_chart(fig, width='stretch')
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        # Trend
        st.markdown('<div class="section-header">📈 Performance Trend</div>', unsafe_allow_html=True)
        fig = px.line(df, x='Model', y=['Precision', 'Recall', 'mAP50', 'mAP50-95'],
                      markers=True, color_discrete_sequence=['#00ff87', '#ffd700', '#60efff', '#ff4757'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
            font={'color': '#fff'}, height=400, legend=dict(bgcolor='rgba(0,0,0,0)')
        )
        st.plotly_chart(fig, width='stretch')
        
        st.info("📌 **Observation:** Jaisa dataset quality girti hai, waisa model performance bhi girti hai!")
    else:
        st.warning("No model data found.")

# ============================================================
# PAGE: ROBUSTNESS TESTING
# ============================================================
elif page == "🧪 Robustness Testing":
    st.markdown('<div class="main-title" style="font-size:2.2rem;">🧪 Robustness Testing</div>', unsafe_allow_html=True)
    
    robustness_data = get_robustness_data()
    
    if robustness_data:
        st.markdown('<div class="section-header">🛡️ Model Stability Under Transformations</div>', unsafe_allow_html=True)
        
        rows = []
        for model, info in robustness_data.items():
            rows.append({
                'Model': model.upper(),
                'Avg Robustness': round(info.get('average_robustness', 0), 2),
                'Min': round(info.get('min_robustness', 0), 2),
                'Max': round(info.get('max_robustness', 0), 2),
                'Samples': info.get('samples_tested', 0)
            })
        
        df = pd.DataFrame(rows)
        st.dataframe(df, width='stretch', hide_index=True)
        
        fig = px.bar(df, x='Model', y=['Avg Robustness', 'Min', 'Max'],
                     barmode='group', color_discrete_sequence=['#00ff87', '#ff4757', '#60efff'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
            font={'color': '#fff'}, height=400
        )
        st.plotly_chart(fig, width='stretch')
        
        st.markdown("""
        <div class="info-box">
            <h4>🧪 Transformations Tested:</h4>
            🌞 Brightness ↑ &nbsp;&nbsp;&nbsp; 🌙 Darkness &nbsp;&nbsp;&nbsp; 🌫️ Gaussian Blur<br>
            📺 Gaussian Noise &nbsp;&nbsp;&nbsp; 🔄 Rotation (30°) &nbsp;&nbsp;&nbsp; ✂️ Crop &nbsp;&nbsp;&nbsp; 📏 Resize
        </div>
        """, unsafe_allow_html=True)
    else:
        st.warning("No robustness data found. Run: `python3 model/robustness/robustness_tester.py`")

# ============================================================
# PAGE: TRUST SCORE
# ============================================================
elif page == "🧠 Trust Score":
    st.markdown('<div class="main-title" style="font-size:2.2rem;">🧠 Final Trust Score</div>', unsafe_allow_html=True)
    
    trust_data = get_trust_data()
    if trust_data:
        # Gauges
        st.markdown('<div class="section-header">🎯 Trust Score Gauges</div>', unsafe_allow_html=True)
        cols = st.columns(3)
        for i, (ds, data) in enumerate(trust_data.items()):
            with cols[i]:
                score = data.get('final_score', 0)
                fig = create_gauge_chart(score, ds.upper())
                st.plotly_chart(fig, width='stretch', key=f"trust_gauge_{ds}")
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        # Decision cards
        st.markdown('<div class="section-header">📋 Decision Summary</div>', unsafe_allow_html=True)
        cols = st.columns(3)
        for i, (ds, data) in enumerate(trust_data.items()):
            with cols[i]:
                score = data.get('final_score', 0)
                decision = data.get('decision', 'N/A')
                icon = data.get('icon', '🟢')
                badge = 'badge-accept' if 'ACCEPT' in decision else 'badge-review' if 'REVIEW' in decision else 'badge-quarantine'
                
                st.markdown(f"""
                <div class="metric-card">
                    <div style="font-size:2.5rem;">{icon}</div>
                    <div style="font-size:1.4rem; font-weight:700; color:#fff; margin:0.5rem 0; letter-spacing:2px;">{ds.upper()}</div>
                    <div style="font-size:2.5rem; font-weight:800; color:#fff; margin:0.5rem 0;">{score:.1f}%</div>
                    <div style="margin:0.5rem 0;"><span class="{badge}">{decision}</span></div>
                </div>
                """, unsafe_allow_html=True)
                
                comps = data.get('components', {})
                for k, v in comps.items():
                    st.progress(v/100, text=f"{k.replace('_',' ').title()}: {v:.1f}%")
        
        # Deployment Summary
        dec_data = get_decision_data()
        if dec_data:
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            st.markdown('<div class="section-header">📊 Deployment Summary</div>', unsafe_allow_html=True)
            
            summary = dec_data.get('summary', {})
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown(f'<div class="metric-card" style="border-color:#00ff87;"><div style="font-size:2.5rem;">✅</div><div class="metric-value">{summary.get("accept", 0)}</div><div class="metric-label">ACCEPT</div></div>', unsafe_allow_html=True)
            with c2:
                st.markdown(f'<div class="metric-card" style="border-color:#ffd700;"><div style="font-size:2.5rem;">⚠️</div><div class="metric-value" style="color:#ffd700;">{summary.get("review", 0)}</div><div class="metric-label">REVIEW</div></div>', unsafe_allow_html=True)
            with c3:
                st.markdown(f'<div class="metric-card" style="border-color:#ff4757;"><div style="font-size:2.5rem;">❌</div><div class="metric-value" style="color:#ff4757;">{summary.get("quarantine", 0)}</div><div class="metric-label">QUARANTINE</div></div>', unsafe_allow_html=True)
    else:
        st.warning("No trust data found.")


# ============================================================
# PAGE: BLOCKCHAIN
# ============================================================
elif page == "🔗 Blockchain":
    st.markdown('<div class="main-title" style="font-size:2.2rem;">🔗 Blockchain Integrity</div>', unsafe_allow_html=True)
    
    blockchain_path = BASE / "outputs" / "reports" / "blockchain.json"
    tamper_path = BASE / "outputs" / "reports" / "tamper_detection.json"
    attack_path = BASE / "outputs" / "reports" / "cyber_attacks.json"
    
    if blockchain_path.exists():
        with open(blockchain_path, 'r') as f:
            blockchain_data = json.load(f)
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f'<div class="metric-card"><div class="metric-value">{blockchain_data.get("length", 0)}</div><div class="metric-label">📦 TOTAL BLOCKS</div></div>', unsafe_allow_html=True)
        with col2:
            is_valid = blockchain_data.get("is_valid", False)
            color = "#00ff87" if is_valid else "#ff4757"
            st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:{color};">{"OK" if is_valid else "FAIL"}</div><div class="metric-label">CHAIN VALID</div></div>', unsafe_allow_html=True)
        with col3:
            st.markdown(f'<div class="metric-card"><div class="metric-value">{blockchain_data.get("difficulty", 2)}</div><div class="metric-label">⚙️ DIFFICULTY</div></div>', unsafe_allow_html=True)
        with col4:
            st.markdown('<div class="metric-card"><div class="metric-value">SHA-256</div><div class="metric-label">🔐 HASH</div></div>', unsafe_allow_html=True)
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        st.markdown('<div class="section-header">🔗 Chain Visualization</div>', unsafe_allow_html=True)
        
        chain = blockchain_data.get('chain', [])
        
        for block in chain:
            block_data = block.get('data', {})
            block_type = block_data.get('type', block_data.get('action', 'unknown'))
            icons = {'dataset': '📊', 'model': '🤖', 'inference': '🧠',
                     'DATASET_UPLOAD': '📤', 'MODEL_TRAINING': '🤖',
                     'INFERENCE': '🧠', 'TAMPER_DETECTED': '⚠️'}
            icon = icons.get(block_type, '📦')
            
            with st.expander(f"{icon} Block #{block['index']} - {block_type} - {block.get('datetime', 'N/A')}", expanded=(block['index'] <= 1)):
                col1, col2 = st.columns(2)
                with col1:
                    st.markdown(f"**Index:** `{block['index']}`")
                    st.markdown(f"**Time:** `{block.get('datetime', 'N/A')}`")
                    st.markdown(f"**Hash:**")
                    st.code(block['hash'][:50] + "...", language="text")
                with col2:
                    st.markdown(f"**Prev Hash:**")
                    prev = block['previous_hash']
                    st.code(prev[:50] + "..." if prev != "0" else "GENESIS", language="text")
                    st.markdown(f"**Nonce:** `{block.get('nonce', 0)}`")
                st.markdown("**Data:**")
                st.json(block_data)
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        if tamper_path.exists():
            with open(tamper_path, 'r') as f:
                tamper_data = json.load(f)
            
            st.markdown('<div class="section-header">🔍 Tamper Detection</div>', unsafe_allow_html=True)
            
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:#00ff87;">{tamper_data.get("total_clean", 0)}</div><div class="metric-label">CLEAN</div></div>', unsafe_allow_html=True)
            with c2:
                st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:#ff4757;">{tamper_data.get("total_tampered", 0)}</div><div class="metric-label">TAMPERED</div></div>', unsafe_allow_html=True)
            with c3:
                st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:#60efff;font-size:1.2rem;">{tamper_data.get("verified_at", "N/A")[:16]}</div><div class="metric-label">VERIFIED AT</div></div>', unsafe_allow_html=True)
        
        if attack_path.exists():
            with open(attack_path, 'r') as f:
                attack_data = json.load(f)
            
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            st.markdown('<div class="section-header">🛡️ Cybersecurity Attack Simulation</div>', unsafe_allow_html=True)
            
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown(f'<div class="metric-card"><div class="metric-value">{attack_data.get("total_attacks", 0)}</div><div class="metric-label">TOTAL ATTACKS</div></div>', unsafe_allow_html=True)
            with c2:
                detected = attack_data.get("detected", 0)
                color = "#00ff87" if detected >= 4 else "#ffd700" if detected >= 2 else "#ff4757"
                st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:{color};">{detected}</div><div class="metric-label">DETECTED</div></div>', unsafe_allow_html=True)
            with c3:
                rate = attack_data.get("detection_rate", 0)
                color = "#00ff87" if rate >= 80 else "#ffd700" if rate >= 50 else "#ff4757"
                st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:{color};">{rate:.0f}%</div><div class="metric-label">DETECTION RATE</div></div>', unsafe_allow_html=True)
            
            for attack in attack_data.get('attacks', []):
                icon = 'WARN' if attack.get('detected') else 'FAIL'
                with st.expander(f"{icon} {attack.get('name', 'Attack')} - {attack.get('severity', 'N/A')}"):
                    st.markdown(f"**ID:** `{attack.get('id', 'N/A')}`")
                    st.markdown(f"**Description:** {attack.get('description', 'N/A')}")
                    st.markdown(f"**Result:** {attack.get('result', 'N/A')}")
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        if st.button("🔍 Verify Blockchain Integrity", type="primary", width='stretch'):
            if is_valid:
                st.success("Blockchain is VALID - All blocks verified!")
                st.balloons()
            else:
                st.error("Blockchain is INVALID - Tampering detected!")
        
        st.info("""
        **Blockchain Security Features:**
        - SHA-256 Hashing - Tamper-proof data integrity
        - Proof of Work - Mining difficulty prevents attacks
        - Chain Linking - Each block linked to previous
        - RSA Digital Signatures - Cryptographic verification
        - Immutable Audit Trail
        """)
    else:
        st.warning("No blockchain data found!")
        st.code("python3 blockchain/audit_trail.py", language="bash")


# ============================================================
# PAGE: WALLET
# ============================================================
elif page == "👛 Wallet":
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0 2rem 0;">
        <h1 style="font-size: 3rem; font-weight: 900; 
                   background: linear-gradient(135deg, #00D9A3 0%, #5B8DEF 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; margin: 0;">
            👛 CVIT Wallet System
        </h1>
        <p style="color: #A8B2C8; font-size: 1.1rem; margin-top: 0.5rem;">
            Blockchain-based token rewards for contributors
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    wallets_path = BASE / "outputs" / "reports" / "wallets.json"
    
    if wallets_path.exists():
        with open(wallets_path, 'r') as f:
            wallet_data = json.load(f)
        
        # Top stats
        col1, col2, col3, col4 = st.columns(4)
        
        total_wallets = len(wallet_data.get('wallets', {}))
        circulating = sum(w.get('balance', 0) for w in wallet_data.get('wallets', {}).values())
        
        with col1:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                        text-align: center; box-shadow: 0 0 30px rgba(0, 217, 163, 0.2);">
                <div style="font-size: 2.5rem;">🪙</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                    {wallet_data.get('token_name', 'CVIT')}
                </div>
                <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">TOKEN</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #5B8DEF;
                        text-align: center; box-shadow: 0 0 30px rgba(91, 141, 239, 0.2);">
                <div style="font-size: 2.5rem;">👥</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #5B8DEF; margin: 0.5rem 0;">
                    {total_wallets}
                </div>
                <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">WALLETS</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #FFB84D;
                        text-align: center; box-shadow: 0 0 30px rgba(255, 184, 77, 0.2);">
                <div style="font-size: 2.5rem;">💰</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #FFB84D; margin: 0.5rem 0;">
                    {circulating:,}
                </div>
                <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">CIRCULATING</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #FF4757;
                        text-align: center; box-shadow: 0 0 30px rgba(255, 71, 87, 0.2);">
                <div style="font-size: 2.5rem;">📊</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #FF4757; margin: 0.5rem 0;">
                    {wallet_data.get('total_supply', 1000000):,}
                </div>
                <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">TOTAL SUPPLY</div>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        # Wallets List
        st.markdown('<div class="section-header">👛 All Wallets</div>', unsafe_allow_html=True)
        
        wallets = wallet_data.get('wallets', {})
        
        for i, (name, wallet) in enumerate(wallets.items()):
            balance = wallet.get('balance', 0)
            address = wallet.get('address', 'N/A')
            tx_count = len(wallet.get('transactions', []))
            
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 1px solid #2A3050;
                        margin-bottom: 1rem; transition: all 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; border-radius: 50%;
                                    background: linear-gradient(135deg, #00D9A3, #5B8DEF);
                                    display: flex; align-items: center; justify-content: center;
                                    color: #0A0E1A; font-weight: 900; font-size: 1.2rem;">
                            {name[0].upper()}
                        </div>
                        <div>
                            <div style="color: #FFFFFF; font-weight: 800; font-size: 1.1rem;">{name}</div>
                            <div style="color: #6B7394; font-size: 0.8rem; font-family: monospace;">
                                {address[:40]}...
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #00D9A3; font-weight: 900; font-size: 1.5rem;">
                            {balance:,} CVIT
                        </div>
                        <div style="color: #6B7394; font-size: 0.8rem;">
                            {tx_count} transactions
                        </div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        # Recent Transactions
        st.markdown('<div class="section-header">📊 Recent Transactions</div>', unsafe_allow_html=True)
        
        all_txs = []
        for name, wallet in wallets.items():
            for tx in wallet.get('transactions', []):
                tx['owner'] = name
                all_txs.append(tx)
        
        all_txs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        for tx in all_txs[:10]:
            tx_type = tx.get('type', 'N/A')
            amount = tx.get('amount', 0)
            reason = tx.get('reason', 'N/A')
            owner = tx.get('owner', 'N/A')
            
            color = "#00D9A3" if tx_type == "CREDIT" else "#FF4757"
            icon = "⬆️" if tx_type == "CREDIT" else "⬇️"
            
            st.markdown(f"""
            <div style="background: rgba(21, 26, 46, 0.6); padding: 0.75rem 1rem;
                        border-radius: 12px; border-left: 4px solid {color};
                        margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                <div>
                    <span style="color: {color}; font-weight: 700;">{icon} {tx_type}</span>
                    <span style="color: #A8B2C8; margin-left: 1rem;">{owner}</span>
                    <div style="color: #6B7394; font-size: 0.8rem; margin-top: 0.25rem;">{reason}</div>
                </div>
                <div style="color: {color}; font-weight: 900; font-size: 1.1rem;">
                    {'+' if tx_type == 'CREDIT' else '-'}{amount} CVIT
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    else:
        st.warning("⚠️ No wallet data found!")
        st.code("python3 blockchain/wallet.py", language="bash")
        st.info("Run the above command to create wallets and tokens.")



# ============================================================
# PAGE: XAI VISUALIZER
# ============================================================
elif page == "🎨 XAI Visualizer":
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0 2rem 0;">
        <h1 style="font-size: 3rem; font-weight: 900; 
                   background: linear-gradient(135deg, #00D9A3 0%, #5B8DEF 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; margin: 0;">
            🎨 Explainable AI Visualizer
        </h1>
        <p style="color: #A8B2C8; font-size: 1.1rem; margin-top: 0.5rem;">
            See exactly what the model looks at when making predictions
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    xai_dir = BASE / "outputs" / "xai_heatmaps"
    
    if xai_dir.exists():
        heatmaps = sorted(list(xai_dir.glob("*.jpg")), key=lambda x: x.stat().st_mtime, reverse=True)
        
        if heatmaps:
            # Stats
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown(f"""
                <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                            padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                            text-align: center; box-shadow: 0 0 30px rgba(0, 217, 163, 0.2);">
                    <div style="font-size: 2.5rem;">🔥</div>
                    <div style="font-size: 2rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                        {len(heatmaps)}
                    </div>
                    <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">HEATMAPS</div>
                </div>
                """, unsafe_allow_html=True)
            
            with col2:
                st.markdown("""
                <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                            padding: 1.5rem; border-radius: 20px; border: 2px solid #5B8DEF;
                            text-align: center; box-shadow: 0 0 30px rgba(91, 141, 239, 0.2);">
                    <div style="font-size: 2.5rem;">🎯</div>
                    <div style="font-size: 2rem; font-weight: 900; color: #5B8DEF; margin: 0.5rem 0;">
                        Grad-CAM
                    </div>
                    <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">METHOD</div>
                </div>
                """, unsafe_allow_html=True)
            
            with col3:
                st.markdown("""
                <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                            padding: 1.5rem; border-radius: 20px; border: 2px solid #FFB84D;
                            text-align: center; box-shadow: 0 0 30px rgba(255, 184, 77, 0.2);">
                    <div style="font-size: 2.5rem;">🧠</div>
                    <div style="font-size: 2rem; font-weight: 900; color: #FFB84D; margin: 0.5rem 0;">
                        Real-time
                    </div>
                    <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">VISUALIZE</div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            
            # Info box
            st.markdown("""
            <div class="info-box">
                <h3 style="color: #00D9A3; margin-bottom: 1rem;">🔥 How to Read Heatmaps</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="background: rgba(255, 71, 87, 0.2); padding: 0.75rem; border-radius: 8px; border-left: 4px solid #FF4757;">
                        <div style="color: #FFFFFF; font-weight: 700;">🔴 Red Areas</div>
                        <div style="color: #A8B2C8; font-size: 0.9rem;">High attention — Model focuses here</div>
                    </div>
                    <div style="background: rgba(255, 184, 77, 0.2); padding: 0.75rem; border-radius: 8px; border-left: 4px solid #FFB84D;">
                        <div style="color: #FFFFFF; font-weight: 700;">🟡 Yellow Areas</div>
                        <div style="color: #A8B2C8; font-size: 0.9rem;">Medium attention — Partial focus</div>
                    </div>
                    <div style="background: rgba(91, 141, 239, 0.2); padding: 0.75rem; border-radius: 8px; border-left: 4px solid #5B8DEF;">
                        <div style="color: #FFFFFF; font-weight: 700;">🔵 Blue Areas</div>
                        <div style="color: #A8B2C8; font-size: 0.9rem;">Low attention — Ignored</div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            
            # Heatmap Gallery
            st.markdown('<div class="section-header">🖼️ Heatmap Gallery</div>', unsafe_allow_html=True)
            
            for i in range(0, min(len(heatmaps), 8), 2):
                cols = st.columns(2)
                for j, col in enumerate(cols):
                    if i + j < len(heatmaps):
                        heatmap_path = heatmaps[i + j]
                        with col:
                            st.image(str(heatmap_path), 
                                    caption=f"🎨 {heatmap_path.name}", 
                                    width='stretch')
            
            # Generate new heatmap section
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            st.markdown('<div class="section-header">🔄 Generate New Heatmaps</div>', unsafe_allow_html=True)
            
            if st.button("🎨 Generate Heatmaps from GOOD Dataset", type="primary", width='stretch'):
                with st.spinner("🔄 Generating heatmaps..."):
                    import subprocess
                    result = subprocess.run(
                        "python3 xai/gradcam.py",
                        shell=True, cwd=str(BASE),
                        capture_output=True, text=True
                    )
                    if "Grad-CAM ready" in result.stdout:
                        st.success("✅ Heatmaps generated!")
                        st.balloons()
                        st.rerun()
                    else:
                        st.error("❌ Failed to generate heatmaps")
                        st.code(result.stdout + result.stderr)
            
            # Stats
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            st.markdown('<div class="section-header">📊 XAI Statistics</div>', unsafe_allow_html=True)
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total Heatmaps", len(heatmaps))
            with col2:
                st.metric("Method", "Grad-CAM")
            with col3:
                st.metric("Model", "YOLOv8n")
            with col4:
                st.metric("Classes", "4")
        
        else:
            st.info("🎨 No heatmaps generated yet!")
            if st.button("🎨 Generate First Heatmaps", type="primary"):
                with st.spinner("Generating..."):
                    import subprocess
                    subprocess.run("python3 xai/gradcam.py", shell=True, cwd=str(BASE))
                    st.rerun()
    else:
        st.warning("⚠️ XAI folder not found!")
        st.code("python3 xai/gradcam.py", language="bash")



# ============================================================
# PAGE: VIDEO ANALYSIS
# ============================================================
elif page == "🎥 Video Analysis":
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0 2rem 0;">
        <h1 style="font-size: 3rem; font-weight: 900; 
                   background: linear-gradient(135deg, #00D9A3 0%, #5B8DEF 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; margin: 0;">
            🎥 Video Analysis
        </h1>
        <p style="color: #A8B2C8; font-size: 1.1rem; margin-top: 0.5rem;">
            Frame-by-frame object detection and tracking with YOLOv8
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    video_dir = BASE / "datasets" / "videos"
    output_dir = BASE / "outputs" / "video_analysis"
    
    # Top Stats
    col1, col2, col3 = st.columns(3)
    
    video_count = len(list(video_dir.glob("*.mp4"))) + len(list(video_dir.glob("*.avi"))) if video_dir.exists() else 0
    analyzed_count = len(list(output_dir.glob("*_analysis.json"))) if output_dir.exists() else 0
    
    with col1:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #5B8DEF;
                    text-align: center; box-shadow: 0 0 30px rgba(91, 141, 239, 0.2);">
            <div style="font-size: 2.5rem;">📹</div>
            <div style="font-size: 2rem; font-weight: 900; color: #5B8DEF; margin: 0.5rem 0;">
                {video_count}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">VIDEOS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                    text-align: center; box-shadow: 0 0 30px rgba(0, 217, 163, 0.2);">
            <div style="font-size: 2.5rem;">✅</div>
            <div style="font-size: 2rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                {analyzed_count}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">ANALYZED</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #FFB84D;
                    text-align: center; box-shadow: 0 0 30px rgba(255, 184, 77, 0.2);">
            <div style="font-size: 2.5rem;">🎯</div>
            <div style="font-size: 2rem; font-weight: 900; color: #FFB84D; margin: 0.5rem 0;">
                YOLOv8
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">DETECTOR</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # Upload Section
    st.markdown('<div class="section-header">📤 Upload Video</div>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="info-box">
        <h4 style="color: #00D9A3;">📹 Supported Formats</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div style="background: rgba(0, 217, 163, 0.1); padding: 0.75rem; border-radius: 8px; border-left: 4px solid #00D9A3;">
                <div style="color: #FFFFFF; font-weight: 700;">MP4</div>
                <div style="color: #A8B2C8; font-size: 0.85rem;">Best support</div>
            </div>
            <div style="background: rgba(91, 141, 239, 0.1); padding: 0.75rem; border-radius: 8px; border-left: 4px solid #5B8DEF;">
                <div style="color: #FFFFFF; font-weight: 700;">AVI</div>
                <div style="color: #A8B2C8; font-size: 0.85rem;">Good support</div>
            </div>
            <div style="background: rgba(255, 184, 77, 0.1); padding: 0.75rem; border-radius: 8px; border-left: 4px solid #FFB84D;">
                <div style="color: #FFFFFF; font-weight: 700;">MOV</div>
                <div style="color: #A8B2C8; font-size: 0.85rem;">Basic support</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # File uploader
    uploaded_video = st.file_uploader("Choose a video file", type=['mp4', 'avi', 'mov'], key="video_upload")
    
    if uploaded_video is not None:
        # Save video
        video_dir.mkdir(parents=True, exist_ok=True)
        video_path = video_dir / uploaded_video.name
        
        with open(video_path, 'wb') as f:
            f.write(uploaded_video.getbuffer())
        
        st.success(f"✅ Video uploaded: {uploaded_video.name}")
        
        # Show video info
        col1, col2 = st.columns(2)
        with col1:
            st.markdown(f"""
            <div style="background: rgba(91, 141, 239, 0.1); padding: 1rem; 
                        border-radius: 12px; border-left: 4px solid #5B8DEF;">
                <div style="color: #6B7394; font-size: 0.8rem;">FILE NAME</div>
                <div style="color: #FFFFFF; font-weight: 700;">{uploaded_video.name}</div>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            size_mb = uploaded_video.size / 1024 / 1024
            st.markdown(f"""
            <div style="background: rgba(0, 217, 163, 0.1); padding: 1rem; 
                        border-radius: 12px; border-left: 4px solid #00D9A3;">
                <div style="color: #6B7394; font-size: 0.8rem;">FILE SIZE</div>
                <div style="color: #FFFFFF; font-weight: 700;">{size_mb:.2f} MB</div>
            </div>
            """, unsafe_allow_html=True)
        
        # Preview
        st.markdown("**🎬 Video Preview:**")
        st.video(str(video_path))
        
        # Analyze button
        if st.button("🚀 Analyze Video", type="primary", width='stretch'):
            with st.spinner("🔄 Analyzing video... This may take a few minutes..."):
                import subprocess
                
                # Run analyzer with the uploaded video
                import subprocess
                result = subprocess.run(
                    f"python3 video_analysis/analyzer.py",
                    shell=True,
                    cwd=str(BASE),
                    capture_output=True,
                    text=True
                )
                
                if "Analysis complete" in result.stdout or "Video analysis complete" in result.stdout:
                    st.success("✅ Video analysis complete!")
                    st.balloons()
                else:
                    st.warning("⚠️ Analysis completed with issues")
                    with st.expander("View Output"):
                        st.code(result.stdout + result.stderr)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # Previous Analyses
    st.markdown('<div class="section-header">📊 Previous Analyses</div>', unsafe_allow_html=True)
    
    if output_dir.exists():
        analysis_files = sorted(list(output_dir.glob("*_analysis.json")), key=lambda x: x.stat().st_mtime, reverse=True)
        
        if analysis_files:
            for analysis_file in analysis_files[:5]:
                with open(analysis_file, 'r') as f:
                    data = json.load(f)
                
                video_name = data.get('video_name', 'Unknown')
                results = data.get('results', {})
                video_info = data.get('video_info', {})
                
                with st.expander(f"📹 {video_name} — {results.get('total_detections', 0)} detections"):
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.metric("Total Detections", results.get('total_detections', 0))
                    with col2:
                        st.metric("Detection Rate", f"{results.get('detection_rate_percent', 0):.1f}%")
                    with col3:
                        st.metric("Duration", f"{video_info.get('duration_seconds', 0):.1f}s")
                    
                    # Class distribution
                    class_dist = results.get('class_distribution', {})
                    if class_dist:
                        st.markdown("**📊 Class Distribution:**")
                        for cls, count in class_dist.items():
                            st.markdown(f"- **{cls.upper()}**: {count} detections")
                    
                    # Show annotated video if exists
                    annotated_path = data.get('output_files', {}).get('annotated_video')
                    if annotated_path and Path(annotated_path).exists():
                        st.markdown("**🎬 Annotated Video:**")
                        st.video(annotated_path)
                    
                    # Download JSON
                    st.download_button(
                        label="⬇️ Download Analysis JSON",
                        data=json.dumps(data, indent=2),
                        file_name=analysis_file.name,
                        mime="application/json",
                        key=f"dl_{analysis_file.name}"
                    )
        else:
            st.info("🎥 No videos analyzed yet. Upload a video above to get started!")
            
            st.markdown("""
            <div class="info-box">
                <h4 style="color: #FFB84D;">💡 Quick Start</h4>
                <div style="color: #A8B2C8;">
                    1. Download a sample video:<br>
                    <code style="background: rgba(0,0,0,0.3); padding: 0.25rem 0.5rem; border-radius: 4px;">
                    curl -L -k -o test_video.mp4 "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
                    </code>
                    <br><br>
                    2. Upload the video above<br>
                    3. Click "Analyze Video"<br>
                    4. See results here!
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("🎥 Video analysis folder not found. Upload a video to get started!")



# ============================================================
# PAGE: MODEL DRIFT
# ============================================================
elif page == "📈 Model Drift":
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0 2rem 0;">
        <h1 style="font-size: 3rem; font-weight: 900; 
                   background: linear-gradient(135deg, #00D9A3 0%, #5B8DEF 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; margin: 0;">
            📈 Model Drift Detection
        </h1>
        <p style="color: #A8B2C8; font-size: 1.1rem; margin-top: 0.5rem;">
            Monitor model performance over time and detect degradation
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    history_dir = BASE / "outputs" / "model_history"
    reports_dir = BASE / "outputs" / "reports"
    
    # Load drift reports
    drift_reports = []
    if reports_dir.exists():
        for report_file in sorted(reports_dir.glob("drift_*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
            with open(report_file, 'r') as f:
                drift_reports.append(json.load(f))
    
    # Get baseline snapshots
    baselines = []
    if history_dir.exists():
        for baseline_file in history_dir.glob("*_baseline.json"):
            with open(baseline_file, 'r') as f:
                baselines.append(json.load(f))
    
    # Top Stats
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #5B8DEF;
                    text-align: center; box-shadow: 0 0 30px rgba(91, 141, 239, 0.2);">
            <div style="font-size: 2.5rem;">📊</div>
            <div style="font-size: 2rem; font-weight: 900; color: #5B8DEF; margin: 0.5rem 0;">
                {len(baselines)}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">BASELINES</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                    text-align: center; box-shadow: 0 0 30px rgba(0, 217, 163, 0.2);">
            <div style="font-size: 2.5rem;">✅</div>
            <div style="font-size: 2rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                {len(drift_reports)}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">REPORTS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        stable_count = sum(1 for r in drift_reports if r.get('severity') == 'STABLE')
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                    text-align: center; box-shadow: 0 0 30px rgba(0, 217, 163, 0.2);">
            <div style="font-size: 2.5rem;">🎯</div>
            <div style="font-size: 2rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                {stable_count}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">STABLE</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        drifted_count = sum(1 for r in drift_reports if r.get('drift_detected'))
        color = '#FF4757' if drifted_count > 0 else '#00D9A3'
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid {color};
                    text-align: center; box-shadow: 0 0 30px {color}33;">
            <div style="font-size: 2.5rem;">⚠️</div>
            <div style="font-size: 2rem; font-weight: 900; color: {color}; margin: 0.5rem 0;">
                {drifted_count}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">DRIFTED</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # Run Drift Analysis
    st.markdown('<div class="section-header">🔍 Run Drift Analysis</div>', unsafe_allow_html=True)
    
    if st.button("📈 Analyze Model Drift", type="primary", width='stretch'):
        with st.spinner("🔄 Analyzing drift..."):
            import subprocess
            result = subprocess.run(
                "python3 model_drift/drift_detector.py",
                shell=True, cwd=str(BASE),
                capture_output=True, text=True
            )
            if "Drift detection complete" in result.stdout:
                st.success("✅ Drift analysis complete!")
                st.balloons()
                st.rerun()
            else:
                st.error("❌ Analysis failed")
                st.code(result.stdout + result.stderr)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # Drift Reports
    st.markdown('<div class="section-header">📋 Drift Reports</div>', unsafe_allow_html=True)
    
    if drift_reports:
        for report in drift_reports[:10]:
            model = report.get('model', 'unknown').upper()
            severity = report.get('severity', 'N/A')
            drift_percent = report.get('max_drift_percent', 0)
            action = report.get('action', 'N/A')
            color = report.get('color', '#5B8DEF')
            
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid {color};
                        margin-bottom: 1rem; box-shadow: 0 0 30px {color}22;">
                <div style="display: flex; justify-content: space-between; align-items: center;
                            flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <div style="color: #FFFFFF; font-weight: 800; font-size: 1.2rem;">
                            {model} Model
                        </div>
                        <div style="color: #6B7394; font-size: 0.85rem; margin-top: 0.25rem;">
                            {report.get('analysis_timestamp', 'N/A')[:19]}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: {color}; color: #0A0E1A;
                                    padding: 0.4rem 1rem; border-radius: 50px;
                                    font-weight: 800; font-size: 0.85rem;
                                    display: inline-block;">
                            {severity}
                        </div>
                        <div style="color: {color}; font-weight: 900; font-size: 1.5rem; margin-top: 0.5rem;">
                            {drift_percent:+.1f}%
                        </div>
                    </div>
                </div>
                <div style="color: #A8B2C8; margin-top: 1rem; padding-top: 1rem;
                            border-top: 1px solid #2A3050;">
                    <strong>Action:</strong> {action}
                </div>
                
                <div style="margin-top: 1rem;">
                    <strong style="color: #FFFFFF;">Metric Drifts:</strong>
            """, unsafe_allow_html=True)
            
            metric_drifts = report.get('metric_drifts', {})
            for metric, values in metric_drifts.items():
                baseline = values.get('baseline', 0)
                current = values.get('current', 0)
                change = values.get('change_percent', 0)
                change_color = '#00D9A3' if change >= 0 else '#FF4757'
                
                st.markdown(f"""
                    <div style="display: flex; justify-content: space-between;
                                padding: 0.5rem 0; border-bottom: 1px solid #2A3050;">
                        <span style="color: #A8B2C8;">{metric}</span>
                        <span style="color: #FFFFFF; font-family: monospace;">
                            {baseline:.1f}% → {current:.1f}% 
                            <span style="color: {change_color}; font-weight: 700;">
                                ({change:+.1f}%)
                            </span>
                        </span>
                    </div>
                """, unsafe_allow_html=True)
            
            st.markdown("</div></div>", unsafe_allow_html=True)
    else:
        st.info("📈 No drift reports yet. Click 'Analyze Model Drift' to get started!")
    
    # Info box
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    st.markdown("""
    <div class="info-box">
        <h3 style="color: #00D9A3; margin-bottom: 1rem;">📊 Drift Severity Levels</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: rgba(0, 217, 163, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #00D9A3;">
                <div style="color: #FFFFFF; font-weight: 700;">🟢 STABLE</div>
                <div style="color: #A8B2C8; font-size: 0.9rem;">Change > -2.5%</div>
            </div>
            <div style="background: rgba(91, 141, 239, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #5B8DEF;">
                <div style="color: #FFFFFF; font-weight: 700;">🔵 MINOR</div>
                <div style="color: #A8B2C8; font-size: 0.9rem;">Change -2.5% to -7.5%</div>
            </div>
            <div style="background: rgba(255, 184, 77, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #FFB84D;">
                <div style="color: #FFFFFF; font-weight: 700;">🟡 WARNING</div>
                <div style="color: #A8B2C8; font-size: 0.9rem;">Change -7.5% to -15%</div>
            </div>
            <div style="background: rgba(255, 71, 87, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #FF4757;">
                <div style="color: #FFFFFF; font-weight: 700;">🔴 CRITICAL</div>
                <div style="color: #A8B2C8; font-size: 0.9rem;">Change < -15%</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)



# ============================================================
# PAGE: ANALYTICS
# ============================================================
elif page == "📊 Analytics":
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0 2rem 0;">
        <h1 style="font-size: 3rem; font-weight: 900; 
                   background: linear-gradient(135deg, #00D9A3 0%, #5B8DEF 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; margin: 0;">
            📊 Advanced Analytics
        </h1>
        <p style="color: #A8B2C8; font-size: 1.1rem; margin-top: 0.5rem;">
            Comprehensive insights across all system components
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    analytics_path = BASE / "outputs" / "reports" / "analytics_summary.json"
    
    # Auto-generate if not exists
    if not analytics_path.exists():
        with st.spinner("📊 Collecting analytics data..."):
            import subprocess
            subprocess.run("python3 analytics/collector.py", shell=True, cwd=str(BASE))
    
    if analytics_path.exists():
        with open(analytics_path, 'r') as f:
            analytics = json.load(f)
        
        # ============================================================
        # KEY METRICS
        # ============================================================
        st.markdown('<div class="section-header">🎯 Key Metrics</div>', unsafe_allow_html=True)
        
        training = analytics.get('training_metrics', {})
        quality = analytics.get('dataset_quality', {})
        trust = analytics.get('trust_scores', {})
        blockchain = analytics.get('blockchain_stats', {})
        attacks = analytics.get('attack_stats', {})
        wallets = analytics.get('wallet_stats', {})
        
        # Calculate averages
        avg_map50 = sum(m.get('mAP50', 0) for m in training.values()) / len(training) if training else 0
        avg_quality = sum(q.get('overall', 0) for q in quality.values()) / len(quality) if quality else 0
        avg_trust = sum(t.get('score', 0) for t in trust.values()) / len(trust) if trust else 0
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                        text-align: center;">
                <div style="font-size: 2rem;">🎯</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                    {avg_map50:.1f}%
                </div>
                <div style="color: #6B7394; font-size: 0.75rem;">AVG mAP50</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #5B8DEF;
                        text-align: center;">
                <div style="font-size: 2rem;">📊</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #5B8DEF; margin: 0.5rem 0;">
                    {avg_quality:.1f}%
                </div>
                <div style="color: #6B7394; font-size: 0.75rem;">AVG QUALITY</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #FFB84D;
                        text-align: center;">
                <div style="font-size: 2rem;">🧠</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #FFB84D; margin: 0.5rem 0;">
                    {avg_trust:.1f}%
                </div>
                <div style="color: #6B7394; font-size: 0.75rem;">AVG TRUST</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 2px solid #FF4757;
                        text-align: center;">
                <div style="font-size: 2rem;">🛡️</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #FF4757; margin: 0.5rem 0;">
                    {attacks.get('detection_rate', 0):.0f}%
                </div>
                <div style="color: #6B7394; font-size: 0.75rem;">DETECTION</div>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        # ============================================================
        # TRAINING METRICS CHART
        # ============================================================
        if training:
            st.markdown('<div class="section-header">📈 Training Metrics</div>', unsafe_allow_html=True)
            
            import pandas as pd
            import plotly.express as px
            
            df_train = pd.DataFrame([
                {
                    'Model': name.upper(),
                    'Precision': data.get('precision', 0),
                    'Recall': data.get('recall', 0),
                    'mAP50': data.get('mAP50', 0),
                    'mAP50-95': data.get('mAP50_95', 0)
                }
                for name, data in training.items()
            ])
            
            fig = px.bar(df_train, x='Model', y=['Precision', 'Recall', 'mAP50'],
                         barmode='group', text_auto='.1f',
                         color_discrete_sequence=['#00D9A3', '#FFB84D', '#5B8DEF'])
            fig.update_layout(
                plot_bgcolor='rgba(21, 26, 46, 0.3)', paper_bgcolor='rgba(0,0,0,0)',
                font={'color': '#FFFFFF'}, height=400,
                legend=dict(bgcolor='rgba(21, 26, 46, 0.8)', bordercolor='#2A3050', borderwidth=1),
                xaxis=dict(gridcolor='#2A3050'), yaxis=dict(gridcolor='#2A3050')
            )
            st.plotly_chart(fig, width='stretch')
        
        # ============================================================
        # TWO COLUMNS - DATASET + TRUST
        # ============================================================
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown('<div class="section-header">📊 Dataset Quality</div>', unsafe_allow_html=True)
            
            if quality:
                import pandas as pd
                import plotly.graph_objects as go
                
                fig = go.Figure()
                
                for ds, data in quality.items():
                    fig.add_trace(go.Bar(
                        name=ds.upper(),
                        x=['Overall', 'Blur', 'Duplicate', 'Noise'],
                        y=[data.get('overall', 0), data.get('blur', 0),
                           data.get('duplicate', 0), data.get('noise', 0)],
                        marker_color={'good': '#00D9A3', 'bad': '#FFB84D', 'worst': '#FF4757'}.get(ds, '#5B8DEF')
                    ))
                
                fig.update_layout(
                    barmode='group',
                    plot_bgcolor='rgba(21, 26, 46, 0.3)', paper_bgcolor='rgba(0,0,0,0)',
                    font={'color': '#FFFFFF'}, height=350,
                    legend=dict(bgcolor='rgba(21, 26, 46, 0.8)'),
                    xaxis=dict(gridcolor='#2A3050'), yaxis=dict(gridcolor='#2A3050')
                )
                st.plotly_chart(fig, width='stretch')
        
        with col2:
            st.markdown('<div class="section-header">🧠 Trust Scores</div>', unsafe_allow_html=True)
            
            if trust:
                import plotly.graph_objects as go
                
                labels = [ds.upper() for ds in trust.keys()]
                values = [t.get('score', 0) for t in trust.values()]
                colors = ['#00D9A3' if v >= 80 else '#FFB84D' if v >= 50 else '#FF4757' for v in values]
                
                fig = go.Figure(go.Pie(
                    labels=labels,
                    values=values,
                    hole=0.5,
                    marker=dict(colors=colors, line=dict(color='#0A0E1A', width=2)),
                    textinfo='label+value',
                    textfont=dict(color='#FFFFFF', size=14)
                ))
                
                fig.update_layout(
                    plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                    font={'color': '#FFFFFF'}, height=350,
                    showlegend=False
                )
                st.plotly_chart(fig, width='stretch')
        
        # ============================================================
        # BLOCKCHAIN + ATTACKS
        # ============================================================
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown('<div class="section-header">🔗 Blockchain Stats</div>', unsafe_allow_html=True)
            
            col_a, col_b = st.columns(2)
            with col_a:
                st.metric("Total Blocks", blockchain.get('total_blocks', 0))
                st.metric("Difficulty", blockchain.get('difficulty', 2))
            with col_b:
                st.metric("Chain Status", "VALID" if blockchain.get('is_valid') else "INVALID")
                st.metric("Block Types", len(blockchain.get('block_types', {})))
            
            if blockchain.get('block_types'):
                st.markdown("**Block Distribution:**")
                for btype, count in blockchain['block_types'].items():
                    st.markdown(f"- **{btype}**: {count}")
        
        with col2:
            st.markdown('<div class="section-header">🛡️ Attack Detection</div>', unsafe_allow_html=True)
            
            col_a, col_b = st.columns(2)
            with col_a:
                st.metric("Total Attacks", attacks.get('total_attacks', 0))
            with col_b:
                st.metric("Detected", attacks.get('detected', 0))
            
            st.markdown("**By Severity:**")
            for severity, count in attacks.get('by_severity', {}).items():
                color = {'CRITICAL': '#FF4757', 'HIGH': '#FFB84D', 'MEDIUM': '#5B8DEF'}.get(severity, '#A8B2C8')
                st.markdown(f"""
                <div style="display: flex; justify-content: space-between; padding: 0.5rem;
                            background: rgba(21, 26, 46, 0.5); border-radius: 8px;
                            margin-bottom: 0.25rem; border-left: 3px solid {color};">
                    <span style="color: #FFFFFF;">{severity}</span>
                    <span style="color: {color}; font-weight: 700;">{count}</span>
                </div>
                """, unsafe_allow_html=True)
        
        # ============================================================
        # WALLET STATS
        # ============================================================
        if wallets:
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            st.markdown('<div class="section-header">💰 Token Economy</div>', unsafe_allow_html=True)
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Token", wallets.get('token_name', 'CVIT'))
            with col2:
                st.metric("Total Wallets", wallets.get('total_wallets', 0))
            with col3:
                st.metric("Circulating", f"{wallets.get('circulating', 0):,}")
            
            if wallets.get('top_holders'):
                st.markdown("**Top Holders:**")
                for i, (name, balance) in enumerate(wallets['top_holders'], 1):
                    st.markdown(f"{i}. **{name}** — {balance:,} CVIT")
        
        # ============================================================
        # ROBUSTNESS
        # ============================================================
        robustness = analytics.get('robustness_data', {})
        if robustness:
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            st.markdown('<div class="section-header">🧪 Robustness Scores</div>', unsafe_allow_html=True)
            
            import plotly.graph_objects as go
            
            fig = go.Figure()
            
            for model, data in robustness.items():
                fig.add_trace(go.Bar(
                    name=model.upper(),
                    x=['Average', 'Min', 'Max'],
                    y=[data.get('average', 0), data.get('min', 0), data.get('max', 0)],
                    marker_color={'good': '#00D9A3', 'bad': '#FFB84D', 'worst': '#FF4757'}.get(model, '#5B8DEF')
                ))
            
            fig.update_layout(
                barmode='group',
                plot_bgcolor='rgba(21, 26, 46, 0.3)', paper_bgcolor='rgba(0,0,0,0)',
                font={'color': '#FFFFFF'}, height=350,
                legend=dict(bgcolor='rgba(21, 26, 46, 0.8)'),
                xaxis=dict(gridcolor='#2A3050'), yaxis=dict(gridcolor='#2A3050')
            )
            st.plotly_chart(fig, width='stretch')
        
        # ============================================================
        # REFRESH BUTTON
        # ============================================================
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        if st.button("🔄 Refresh Analytics", type="primary", width='stretch'):
            with st.spinner("Refreshing..."):
                import subprocess
                subprocess.run("python3 analytics/collector.py", shell=True, cwd=str(BASE))
                st.success("✅ Analytics refreshed!")
                st.rerun()
    
    else:
        st.warning("⚠️ Analytics data not found!")
        if st.button("📊 Generate Analytics", type="primary"):
            import subprocess
            subprocess.run("python3 analytics/collector.py", shell=True, cwd=str(BASE))
            st.rerun()



# ============================================================
# PAGE: COLLABORATION
# ============================================================
elif page == "🤝 Collaboration":
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0 2rem 0;">
        <h1 style="font-size: 3rem; font-weight: 900; 
                   background: linear-gradient(135deg, #00D9A3 0%, #5B8DEF 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; margin: 0;">
            🤝 Team Collaboration
        </h1>
        <p style="color: #A8B2C8; font-size: 1.1rem; margin-top: 0.5rem;">
            Multi-user workspace with tasks, comments & activity feed
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Load collaboration data
    collab_dir = BASE / "outputs" / "collaboration"
    users_file = BASE / "outputs" / "reports" / "users.json"
    
    # Load users
    users = {}
    if users_file.exists():
        with open(users_file, 'r') as f:
            users = json.load(f)
    
    # Load collaboration data
    comments = []
    tasks = []
    activities = []
    notifications = []
    
    if collab_dir.exists():
        if (collab_dir / "comments.json").exists():
            with open(collab_dir / "comments.json", 'r') as f:
                comments = json.load(f)
        if (collab_dir / "tasks.json").exists():
            with open(collab_dir / "tasks.json", 'r') as f:
                tasks = json.load(f)
        if (collab_dir / "activities.json").exists():
            with open(collab_dir / "activities.json", 'r') as f:
                activities = json.load(f)
        if (collab_dir / "notifications.json").exists():
            with open(collab_dir / "notifications.json", 'r') as f:
                notifications = json.load(f)
    
    # ============================================================
    # TOP STATS
    # ============================================================
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #5B8DEF;
                    text-align: center; box-shadow: 0 0 30px rgba(91, 141, 239, 0.2);">
            <div style="font-size: 2.5rem;">👥</div>
            <div style="font-size: 2rem; font-weight: 900; color: #5B8DEF; margin: 0.5rem 0;">
                {len(users)}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">TEAM MEMBERS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        pending = len([t for t in tasks if t.get('status') == 'pending'])
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #FFB84D;
                    text-align: center; box-shadow: 0 0 30px rgba(255, 184, 77, 0.2);">
            <div style="font-size: 2.5rem;">📋</div>
            <div style="font-size: 2rem; font-weight: 900; color: #FFB84D; margin: 0.5rem 0;">
                {pending}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">PENDING TASKS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                    text-align: center; box-shadow: 0 0 30px rgba(0, 217, 163, 0.2);">
            <div style="font-size: 2.5rem;">💬</div>
            <div style="font-size: 2rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                {len(comments)}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">COMMENTS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        unread = len([n for n in notifications if not n.get('read')])
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #FF4757;
                    text-align: center; box-shadow: 0 0 30px rgba(255, 71, 87, 0.2);">
            <div style="font-size: 2.5rem;">🔔</div>
            <div style="font-size: 2rem; font-weight: 900; color: #FF4757; margin: 0.5rem 0;">
                {unread}
            </div>
            <div style="color: #6B7394; font-size: 0.8rem; letter-spacing: 0.15em;">NOTIFICATIONS</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # ============================================================
    # TABS
    # ============================================================
    tab1, tab2, tab3, tab4 = st.tabs(["👥 Team", "📋 Tasks", "💬 Comments", "📊 Activity"])
    
    # ============================================================
    # TAB 1: TEAM MEMBERS
    # ============================================================
    with tab1:
        st.markdown('<div class="section-header">👥 Team Members</div>', unsafe_allow_html=True)
        
        if users:
            for username, user in users.items():
                role = user.get('role', 'viewer')
                active = user.get('active', True)
                avatar = user.get('avatar', username[0].upper())
                
                role_colors = {
                    'admin': '#FF4757',
                    'contributor': '#00D9A3',
                    'reviewer': '#FFB84D',
                    'viewer': '#5B8DEF'
                }
                role_color = role_colors.get(role, '#5B8DEF')
                status_icon = "🟢" if active else "🔴"
                
                st.markdown(f"""
                <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                            padding: 1.5rem; border-radius: 20px; 
                            border: 1px solid #2A3050; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;
                                flex-wrap: wrap; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; border-radius: 50%;
                                        background: linear-gradient(135deg, {role_color}, #5B8DEF);
                                        display: flex; align-items: center; justify-content: center;
                                        color: #0A0E1A; font-weight: 900; font-size: 1.3rem;">
                                {avatar}
                            </div>
                            <div>
                                <div style="color: #FFFFFF; font-weight: 800; font-size: 1.1rem;">
                                    {username} {status_icon}
                                </div>
                                <div style="color: #6B7394; font-size: 0.85rem;">
                                    {user.get('email', 'N/A')}
                                </div>
                            </div>
                        </div>
                        <div>
                            <span style="background: {role_color}; color: #0A0E1A;
                                        padding: 0.4rem 1rem; border-radius: 50px;
                                        font-weight: 800; font-size: 0.8rem;
                                        letter-spacing: 0.1em;">
                                {role.upper()}
                            </span>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("👥 No team members yet!")
    
    # ============================================================
    # TAB 2: TASKS
    # ============================================================
    with tab2:
        st.markdown('<div class="section-header">📋 Task Board</div>', unsafe_allow_html=True)
        
        if tasks:
            # Group by status
            pending = [t for t in tasks if t.get('status') == 'pending']
            in_progress = [t for t in tasks if t.get('status') == 'in_progress']
            completed = [t for t in tasks if t.get('status') == 'completed']
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown(f"""
                <div style="background: rgba(255, 184, 77, 0.1); padding: 1rem; 
                            border-radius: 12px; border-left: 4px solid #FFB84D;
                            margin-bottom: 1rem;">
                    <div style="color: #FFB84D; font-weight: 800; font-size: 1.2rem;">
                        📋 PENDING ({len(pending)})
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                for task in pending:
                    priority_color = {'low': '#5B8DEF', 'medium': '#FFB84D', 'high': '#FF4757', 'critical': '#FF1744'}.get(task.get('priority', 'medium'), '#5B8DEF')
                    st.markdown(f"""
                    <div style="background: #151A2E; padding: 1rem; border-radius: 12px;
                                border-left: 4px solid {priority_color}; margin-bottom: 0.5rem;">
                        <div style="color: #FFFFFF; font-weight: 700;">{task.get('title', 'Untitled')}</div>
                        <div style="color: #6B7394; font-size: 0.85rem; margin-top: 0.25rem;">
                            Assigned to: {task.get('assignee', 'N/A')}
                        </div>
                        <div style="color: {priority_color}; font-size: 0.75rem; margin-top: 0.5rem;
                                    text-transform: uppercase; font-weight: 700;">
                            {task.get('priority', 'medium')}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
            
            with col2:
                st.markdown(f"""
                <div style="background: rgba(91, 141, 239, 0.1); padding: 1rem; 
                            border-radius: 12px; border-left: 4px solid #5B8DEF;
                            margin-bottom: 1rem;">
                    <div style="color: #5B8DEF; font-weight: 800; font-size: 1.2rem;">
                        🔄 IN PROGRESS ({len(in_progress)})
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                for task in in_progress:
                    st.markdown(f"""
                    <div style="background: #151A2E; padding: 1rem; border-radius: 12px;
                                border-left: 4px solid #5B8DEF; margin-bottom: 0.5rem;">
                        <div style="color: #FFFFFF; font-weight: 700;">{task.get('title', 'Untitled')}</div>
                        <div style="color: #6B7394; font-size: 0.85rem; margin-top: 0.25rem;">
                            Assigned to: {task.get('assignee', 'N/A')}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
            
            with col3:
                st.markdown(f"""
                <div style="background: rgba(0, 217, 163, 0.1); padding: 1rem; 
                            border-radius: 12px; border-left: 4px solid #00D9A3;
                            margin-bottom: 1rem;">
                    <div style="color: #00D9A3; font-weight: 800; font-size: 1.2rem;">
                        ✅ COMPLETED ({len(completed)})
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                for task in completed:
                    st.markdown(f"""
                    <div style="background: #151A2E; padding: 1rem; border-radius: 12px;
                                border-left: 4px solid #00D9A3; margin-bottom: 0.5rem;
                                opacity: 0.7;">
                        <div style="color: #FFFFFF; font-weight: 700;
                                    text-decoration: line-through;">
                            {task.get('title', 'Untitled')}
                        </div>
                        <div style="color: #6B7394; font-size: 0.85rem; margin-top: 0.25rem;">
                            By: {task.get('assignee', 'N/A')}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
        else:
            st.info("📋 No tasks yet!")
    
    # ============================================================
    # TAB 3: COMMENTS
    # ============================================================
    with tab3:
        st.markdown('<div class="section-header">💬 Recent Comments</div>', unsafe_allow_html=True)
        
        if comments:
            for comment in sorted(comments, key=lambda x: x.get('created_at', ''), reverse=True)[:10]:
                st.markdown(f"""
                <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                            padding: 1.25rem; border-radius: 16px; 
                            border: 1px solid #2A3050; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; 
                                align-items: start; margin-bottom: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 35px; height: 35px; border-radius: 50%;
                                        background: linear-gradient(135deg, #00D9A3, #5B8DEF);
                                        display: flex; align-items: center; justify-content: center;
                                        color: #0A0E1A; font-weight: 900;">
                                {comment.get('username', 'U')[0].upper()}
                            </div>
                            <div>
                                <div style="color: #FFFFFF; font-weight: 700;">
                                    {comment.get('username', 'Unknown')}
                                </div>
                                <div style="color: #6B7394; font-size: 0.75rem;">
                                    on {comment.get('resource_type', 'N/A')}: {comment.get('resource_id', 'N/A')}
                                </div>
                            </div>
                        </div>
                        <div style="color: #00D9A3; font-size: 0.85rem;">
                            👍 {comment.get('likes', 0)}
                        </div>
                    </div>
                    <div style="color: #A8B2C8;">
                        {comment.get('text', '')}
                    </div>
                    <div style="color: #6B7394; font-size: 0.75rem; margin-top: 0.75rem;">
                        {comment.get('created_at', '')[:19]}
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("💬 No comments yet!")
    
    # ============================================================
    # TAB 4: ACTIVITY FEED
    # ============================================================
    with tab4:
        st.markdown('<div class="section-header">📊 Activity Feed</div>', unsafe_allow_html=True)
        
        if activities:
            activity_icons = {
                'comment_added': '💬',
                'task_created': '📋',
                'task_updated': '🔄',
                'dataset_uploaded': '📤',
                'model_trained': '🤖'
            }
            
            for activity in sorted(activities, key=lambda x: x.get('timestamp', ''), reverse=True)[:20]:
                action = activity.get('action', 'unknown')
                icon = activity_icons.get(action, '📌')
                username = activity.get('username', 'Unknown')
                timestamp = activity.get('timestamp', '')[:19]
                
                st.markdown(f"""
                <div style="background: rgba(21, 26, 46, 0.6); padding: 0.75rem 1rem;
                            border-radius: 12px; border-left: 3px solid #5B8DEF;
                            margin-bottom: 0.5rem; display: flex; 
                            justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="font-size: 1.3rem;">{icon}</div>
                        <div>
                            <div style="color: #FFFFFF;">
                                <strong>{username}</strong> → {action.replace('_', ' ')}
                            </div>
                            <div style="color: #6B7394; font-size: 0.75rem;">{timestamp}</div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("📊 No activities yet!")
    
    # ============================================================
    # REFRESH BUTTON
    # ============================================================
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    if st.button("🔄 Refresh Collaboration Data", type="primary", width='stretch'):
        st.success("✅ Data refreshed!")
        st.rerun()


# ============================================================
# PAGE: AUTHENTICATION
# ============================================================
elif page == "🔐 Authentication":
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0 2rem 0;">
        <h1 style="font-size: 3rem; font-weight: 900; 
                   background: linear-gradient(135deg, #00D9A3 0%, #5B8DEF 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; margin: 0;">
            🔐 Authentication Center
        </h1>
        <p style="color: #A8B2C8; font-size: 1.1rem; margin-top: 0.5rem;">
            User authentication, sessions & API tokens
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    auth_dir = BASE / "outputs" / "auth"
    
    # Load auth data
    auth_users = {}
    sessions = {}
    tokens = {}
    
    if (auth_dir / "auth_users.json").exists():
        with open(auth_dir / "auth_users.json", 'r') as f:
            auth_users = json.load(f)
    
    if (auth_dir / "sessions.json").exists():
        with open(auth_dir / "sessions.json", 'r') as f:
            sessions = json.load(f)
    
    if (auth_dir / "tokens.json").exists():
        with open(auth_dir / "tokens.json", 'r') as f:
            tokens = json.load(f)
    
    # ============================================================
    # TOP STATS
    # ============================================================
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #5B8DEF;
                    text-align: center; box-shadow: 0 0 30px rgba(91, 141, 239, 0.2);">
            <div style="font-size: 2.5rem;">👥</div>
            <div style="font-size: 2rem; font-weight: 900; color: #5B8DEF; margin: 0.5rem 0;">
                {len(auth_users)}
            </div>
            <div style="color: #6B7394; font-size: 0.75rem;">TOTAL USERS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #00D9A3;
                    text-align: center; box-shadow: 0 0 30px rgba(0, 217, 163, 0.2);">
            <div style="font-size: 2.5rem;">🟢</div>
            <div style="font-size: 2rem; font-weight: 900; color: #00D9A3; margin: 0.5rem 0;">
                {len(sessions)}
            </div>
            <div style="color: #6B7394; font-size: 0.75rem;">ACTIVE SESSIONS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #FFB84D;
                    text-align: center; box-shadow: 0 0 30px rgba(255, 184, 77, 0.2);">
            <div style="font-size: 2.5rem;">🔑</div>
            <div style="font-size: 2rem; font-weight: 900; color: #FFB84D; margin: 0.5rem 0;">
                {len(tokens)}
            </div>
            <div style="color: #6B7394; font-size: 0.75rem;">API TOKENS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        providers = set(u.get('provider', 'local') for u in auth_users.values())
        st.markdown(f"""
        <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                    padding: 1.5rem; border-radius: 20px; border: 2px solid #FF4757;
                    text-align: center; box-shadow: 0 0 30px rgba(255, 71, 87, 0.2);">
            <div style="font-size: 2.5rem;">🌐</div>
            <div style="font-size: 2rem; font-weight: 900; color: #FF4757; margin: 0.5rem 0;">
                {len(providers)}
            </div>
            <div style="color: #6B7394; font-size: 0.75rem;">PROVIDERS</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # ============================================================
    # TABS
    # ============================================================
    tab1, tab2, tab3, tab4 = st.tabs(["🔐 Login", "📝 Register", "🟢 Sessions", "🔑 Tokens"])
    
    # ============================================================
    # TAB 1: LOGIN
    # ============================================================
    with tab1:
        st.markdown('<div class="section-header">🔐 Login</div>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 1px solid #2A3050;">
                <h4 style="color: #00D9A3;">📧 Email Login</h4>
                <p style="color: #A8B2C8; font-size: 0.9rem;">
                    Login with your email and password
                </p>
            </div>
            """, unsafe_allow_html=True)
            
            with st.form("login_form"):
                username = st.text_input("Username", key="login_user")
                password = st.text_input("Password", type="password", key="login_pass")
                
                if st.form_submit_button("🔐 Login", type="primary", use_container_width=True):
                    if username and password:
                        # Run auth manager
                        import subprocess
                        test_code = f"""
import sys
sys.path.insert(0, '{BASE}')
from auth.auth_manager import AuthManager
auth = AuthManager('{BASE}/outputs/auth')
result = auth.login('{username}', '{password}')
print(result)
"""
                        with open('/tmp/test_login.py', 'w') as f:
                            f.write(test_code)
                        
                        result = subprocess.run("python3 /tmp/test_login.py", shell=True, capture_output=True, text=True)
                        
                        if "'status': 'success'" in result.stdout or '"status": "success"' in result.stdout:
                            st.success(f"✅ Login successful for {username}!")
                            st.balloons()
                        else:
                            st.error("❌ Invalid credentials")
                    else:
                        st.warning("⚠️ Please fill all fields")
        
        with col2:
            st.markdown("""
            <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                        padding: 1.5rem; border-radius: 20px; border: 1px solid #2A3050;">
                <h4 style="color: #5B8DEF;">🌐 OAuth Login</h4>
                <p style="color: #A8B2C8; font-size: 0.9rem;">
                    Login with Google or GitHub (Simulated)
                </p>
            </div>
            """, unsafe_allow_html=True)
            
            col_a, col_b = st.columns(2)
            with col_a:
                if st.button("🔵 Google", use_container_width=True, key="google_login"):
                    st.success("✅ Google OAuth would redirect here")
                    st.info("💡 In production: redirects to Google login")
            
            with col_b:
                if st.button("⚫ GitHub", use_container_width=True, key="github_login"):
                    st.success("✅ GitHub OAuth would redirect here")
                    st.info("💡 In production: redirects to GitHub login")
    
    # ============================================================
    # TAB 2: REGISTER
    # ============================================================
    with tab2:
        st.markdown('<div class="section-header">📝 Register New User</div>', unsafe_allow_html=True)
        
        with st.form("register_form"):
            col1, col2 = st.columns(2)
            with col1:
                reg_username = st.text_input("Username", key="reg_user")
                reg_email = st.text_input("Email", key="reg_email")
            with col2:
                reg_password = st.text_input("Password", type="password", key="reg_pass")
                reg_confirm = st.text_input("Confirm Password", type="password", key="reg_confirm")
            
            if st.form_submit_button("📝 Register", type="primary", use_container_width=True):
                if reg_username and reg_password and reg_email:
                    if reg_password == reg_confirm:
                        if len(reg_password) >= 6:
                            st.success(f"✅ User {reg_username} would be registered!")
                            st.info("💡 In production: user gets added to database")
                        else:
                            st.error("❌ Password must be at least 6 characters")
                    else:
                        st.error("❌ Passwords don't match")
                else:
                    st.warning("⚠️ Please fill all fields")
    
    # ============================================================
    # TAB 3: ACTIVE SESSIONS
    # ============================================================
    with tab3:
        st.markdown('<div class="section-header">🟢 Active Sessions</div>', unsafe_allow_html=True)
        
        if sessions:
            for token, session in list(sessions.items())[:10]:
                username = session.get('username', 'unknown')
                created = session.get('created_at', '')[:19]
                expires = session.get('expires_at', '')[:19]
                
                st.markdown(f"""
                <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                            padding: 1.25rem; border-radius: 16px; 
                            border: 1px solid #2A3050; margin-bottom: 1rem;
                            border-left: 4px solid #00D9A3;">
                    <div style="display: flex; justify-content: space-between; 
                                align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <div style="color: #FFFFFF; font-weight: 700; font-size: 1.1rem;">
                                👤 {username}
                            </div>
                            <div style="color: #6B7394; font-size: 0.8rem; margin-top: 0.25rem;">
                                Token: {token[:30]}...
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #00D9A3; font-size: 0.8rem;">
                                Created: {created}
                            </div>
                            <div style="color: #FFB84D; font-size: 0.8rem;">
                                Expires: {expires}
                            </div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("🟢 No active sessions")
    
    # ============================================================
    # TAB 4: API TOKENS
    # ============================================================
    with tab4:
        st.markdown('<div class="section-header">🔑 API Tokens</div>', unsafe_allow_html=True)
        
        if tokens:
            for token, token_data in list(tokens.items())[:10]:
                username = token_data.get('username', 'unknown')
                name = token_data.get('name', 'API Token')
                active = token_data.get('active', True)
                created = token_data.get('created_at', '')[:19]
                
                status_color = '#00D9A3' if active else '#FF4757'
                status_text = 'ACTIVE' if active else 'INACTIVE'
                
                st.markdown(f"""
                <div style="background: linear-gradient(145deg, #151A2E, #1A2038);
                            padding: 1.25rem; border-radius: 16px; 
                            border: 1px solid #2A3050; margin-bottom: 1rem;
                            border-left: 4px solid {status_color};">
                    <div style="display: flex; justify-content: space-between; 
                                align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <div style="color: #FFFFFF; font-weight: 700; font-size: 1.1rem;">
                                🔑 {name}
                            </div>
                            <div style="color: #6B7394; font-size: 0.8rem; margin-top: 0.25rem;">
                                Owner: {username}
                            </div>
                            <div style="color: #6B7394; font-size: 0.75rem; font-family: monospace; 
                                        margin-top: 0.25rem;">
                                {token[:35]}...
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: {status_color}; color: #0A0E1A;
                                        padding: 0.3rem 0.8rem; border-radius: 50px;
                                        font-weight: 700; font-size: 0.75rem; 
                                        display: inline-block;">
                                {status_text}
                            </div>
                            <div style="color: #6B7394; font-size: 0.75rem; margin-top: 0.5rem;">
                                {created}
                            </div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("🔑 No API tokens yet")
            
            if st.button("🔑 Generate New API Token", type="primary"):
                st.success("✅ API token generated!")
                st.code("cv_integrity_" + "x" * 32, language="text")
    
    # ============================================================
    # USER LIST
    # ============================================================
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    st.markdown('<div class="section-header">👥 Registered Users</div>', unsafe_allow_html=True)
    
    if auth_users:
        for username, user in auth_users.items():
            provider = user.get('provider', 'local')
            provider_icon = {'local': '📧', 'google': '🔵', 'github': '⚫'}.get(provider, '📧')
            active = user.get('active', True)
            
            status_color = '#00D9A3' if active else '#FF4757'
            
            st.markdown(f"""
            <div style="background: rgba(21, 26, 46, 0.6); padding: 1rem 1.25rem;
                        border-radius: 12px; border-left: 3px solid {status_color};
                        margin-bottom: 0.5rem; display: flex; 
                        justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 1.5rem;">{provider_icon}</div>
                    <div>
                        <div style="color: #FFFFFF; font-weight: 700;">
                            {username}
                        </div>
                        <div style="color: #6B7394; font-size: 0.8rem;">
                            {user.get('email', 'N/A')}
                        </div>
                    </div>
                </div>
                <div>
                    <span style="background: {status_color}; color: #0A0E1A;
                                padding: 0.3rem 0.8rem; border-radius: 50px;
                                font-weight: 700; font-size: 0.75rem;">
                        {provider.upper()}
                    </span>
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("👥 No users registered yet")
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # Info box
    st.markdown("""
    <div class="info-box">
        <h4 style="color: #00D9A3;">🔐 Authentication Features</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: rgba(0, 217, 163, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #00D9A3;">
                <div style="color: #FFFFFF; font-weight: 700;">🔐 Secure Login</div>
                <div style="color: #A8B2C8; font-size: 0.85rem;">PBKDF2 password hashing</div>
            </div>
            <div style="background: rgba(91, 141, 239, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #5B8DEF;">
                <div style="color: #FFFFFF; font-weight: 700;">🌐 OAuth2</div>
                <div style="color: #A8B2C8; font-size: 0.85rem;">Google/GitHub integration</div>
            </div>
            <div style="background: rgba(255, 184, 77, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #FFB84D;">
                <div style="color: #FFFFFF; font-weight: 700;">🟢 Sessions</div>
                <div style="color: #A8B2C8; font-size: 0.85rem;">24-hour session tokens</div>
            </div>
            <div style="background: rgba(255, 71, 87, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #FF4757;">
                <div style="color: #FFFFFF; font-weight: 700;">🔑 API Tokens</div>
                <div style="color: #A8B2C8; font-size: 0.85rem;">Programmatic access</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ============================================================
# PAGE: REPORTS
# ============================================================
else:
    st.markdown('<div class="main-title" style="font-size:2.2rem;">📁 All Reports</div>', unsafe_allow_html=True)
    
    if REPORTS.exists():
        files = sorted(list(REPORTS.glob("*.json")))
        if files:
            st.markdown(f"**Total Reports: {len(files)}**")
            for f in files:
                with st.expander(f"📄 {f.name} ({f.stat().st_size/1024:.1f} KB)"):
                    data = load_json(f)
                    if data:
                        st.download_button(
                            label="⬇️ Download JSON",
                            data=json.dumps(data, indent=2),
                            file_name=f.name,
                            mime="application/json"
                        )
                        st.json(data)
        else:
            st.info("No reports found")
    else:
        st.warning("Reports folder not found")

# ============================================================
# FOOTER
# ============================================================
st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
st.markdown("""
<div style="text-align:center; color:#666; font-size:0.85rem; padding:1rem 0;">
    🤖 <b>CV-INTEGRITY AI</b> | SIH 2026 | Built with ❤️ using Streamlit
</div>
""", unsafe_allow_html=True)
