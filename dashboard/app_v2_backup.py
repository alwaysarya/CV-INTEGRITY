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
import time
from datetime import datetime

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="CV-INTEGRITY AI",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# ADVANCED CSS
# ============================================================
st.markdown("""
<style>
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
    }
    @keyframes shine {
        to { background-position: 200% center; }
    }
    .sub-title {
        text-align: center;
        color: #888;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
    }
    
    /* Animated metric cards */
    .metric-card {
        background: linear-gradient(145deg, #1e1e1e, #2d2d2d);
        padding: 1.5rem;
        border-radius: 15px;
        border: 1px solid #333;
        text-align: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    .metric-card:hover {
        transform: translateY(-5px);
        border-color: #00ff87;
        box-shadow: 0 8px 25px rgba(0, 255, 135, 0.2);
    }
    .metric-value {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, #00ff87, #60efff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .metric-label {
        color: #aaa;
        font-size: 0.85rem;
        margin-top: 0.5rem;
        letter-spacing: 1px;
    }
    
    /* Badges */
    .badge-accept {
        background: linear-gradient(90deg, #00ff87, #00cc6a);
        color: #000;
        padding: 0.4rem 1.2rem;
        border-radius: 25px;
        font-weight: 700;
        display: inline-block;
        font-size: 0.9rem;
        letter-spacing: 1px;
    }
    .badge-review {
        background: linear-gradient(90deg, #ffd700, #ff9500);
        color: #000;
        padding: 0.4rem 1.2rem;
        border-radius: 25px;
        font-weight: 700;
        display: inline-block;
        font-size: 0.9rem;
        letter-spacing: 1px;
    }
    .badge-quarantine {
        background: linear-gradient(90deg, #ff4757, #ff1744);
        color: #fff;
        padding: 0.4rem 1.2rem;
        border-radius: 25px;
        font-weight: 700;
        display: inline-block;
        font-size: 0.9rem;
        letter-spacing: 1px;
    }
    
    /* Divider */
    .custom-divider {
        border: none;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00ff87, transparent);
        margin: 2rem 0;
    }
    
    /* Section headers */
    .section-header {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin: 1rem 0;
        padding-left: 1rem;
        border-left: 4px solid #00ff87;
    }
    
    /* Stats row */
    .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #2a2a2a;
    }
    .stat-label { color: #888; }
    .stat-value { color: #fff; font-weight: 600; }
    
    /* Hide streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
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
# HELPER FUNCTIONS
# ============================================================
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

def get_dataset_images(dataset, num=6):
    """Get sample images from dataset"""
    img_dir = DATASETS / dataset / "images"
    if img_dir.exists():
        images = list(img_dir.glob("*.jpg"))[:num] + list(img_dir.glob("*.png"))[:num]
        return images[:num]
    return []

def create_gauge_chart(value, title, max_val=100):
    """Create a gauge chart"""
    color = "#00ff87" if value > 70 else "#ffd700" if value > 50 else "#ff4757"
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=value,
        title={'text': title, 'font': {'size': 14, 'color': '#fff'}},
        number={'suffix': "%", 'font': {'size': 30, 'color': color}},
        gauge={
            'axis': {'range': [0, max_val], 'tickcolor': '#666'},
            'bar': {'color': color},
            'bgcolor': '#2a2a2a',
            'borderwidth': 0,
            'steps': [
                {'range': [0, 50], 'color': '#1a1a1a'},
                {'range': [50, 80], 'color': '#222'},
                {'range': [80, 100], 'color': '#1a1a1a'}
            ],
        }
    ))
    fig.update_layout(
        height=200,
        margin=dict(l=20, r=20, t=40, b=20),
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
    <div style="text-align:center; padding: 1rem 0;">
        <div style="font-size: 3.5rem; animation: pulse 2s infinite;">🤖</div>
        <div style="font-size: 1.6rem; font-weight: 800; color: #fff;">CV-INTEGRITY</div>
        <div style="color: #888; font-size: 0.8rem; letter-spacing: 2px;">AI TRUST PLATFORM</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    page = st.radio("**Navigation**", [
        "🏠 Home",
        "📤 Upload Dataset",
        "📊 Dataset Quality",
        "🤖 Model Performance",
        "🧪 Robustness Testing",
        "🧠 Trust Score",
        "📁 Reports"
    ], label_visibility="visible")
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # System status
    st.markdown("**📡 System Status**")
    st.markdown(f"🟢 Reports: {len(list(REPORTS.glob('*.json'))) if REPORTS.exists() else 0}")
    st.markdown(f"🟢 Models: {len(list(MODELS.glob('*'))) if MODELS.exists() else 0}")
    st.markdown(f"🟢 Datasets: {len(list(DATASETS.glob('*'))) if DATASETS.exists() else 0}")
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    st.caption("🎓 SIH 2026 | v2.0")

# ============================================================
# PAGE: HOME
# ============================================================
if page == "🏠 Home":
    st.markdown('<div class="main-title">CV-INTEGRITY AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Intelligent Computer Vision Model Trust & Quality Evaluation Platform</div>', unsafe_allow_html=True)
    
    # Top stats
    trust_data = get_trust_data()
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-value">3</div>
            <div class="metric-label">📊 DATASETS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-value">3</div>
            <div class="metric-label">🤖 YOLO MODELS</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-value">909</div>
            <div class="metric-label">📈 IMAGES</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        if trust_data:
            scores = [d.get('final_score', 0) for d in trust_data.values()]
            avg_score = sum(scores)/len(scores) if scores else 0
            color = '#00ff87' if avg_score > 70 else '#ffd700' if avg_score > 50 else '#ff4757'
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="color:{color};">{avg_score:.0f}%</div>
                <div class="metric-label">🧠 AVG TRUST</div>
            </div>
            """, unsafe_allow_html=True)
    
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
                color = '#00ff87' if score > 70 else '#ffd700' if score > 50 else '#ff4757'
                
                st.markdown(f"""
                <div class="metric-card">
                    <div style="font-size:2rem;">{icon}</div>
                    <div style="font-size:1.3rem; font-weight:700; color:#fff; margin:0.5rem 0;">{ds.upper()}</div>
                    <div style="font-size:2rem; font-weight:800; color:{color}; margin:0.5rem 0;">{score:.1f}%</div>
                    <div><span class="{badge}">{decision}</span></div>
                </div>
                """, unsafe_allow_html=True)
    
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
    
    # How it works
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown('<div class="section-header">🚀 How It Works</div>', unsafe_allow_html=True)
        st.markdown("""
        <div style="background:#1e1e1e; padding:1.5rem; border-radius:15px; border:1px solid #333;">
            <div style="padding:0.5rem 0;">1️⃣ 📤 <b>Upload Dataset</b> – ZIP with images + labels</div>
            <div style="padding:0.5rem 0;">2️⃣ 🔍 <b>Auto Analysis</b> – Blur, Duplicate, Noise check</div>
            <div style="padding:0.5rem 0;">3️⃣ 🤖 <b>Train Model</b> – YOLO trains on your data</div>
            <div style="padding:0.5rem 0;">4️⃣ 🧪 <b>Robustness Test</b> – 7 transformations</div>
            <div style="padding:0.5rem 0;">5️⃣ 🧠 <b>Trust Score</b> – ACCEPT / REVIEW / QUARANTINE</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="section-header">🔥 Key Features</div>', unsafe_allow_html=True)
        st.markdown("""
        <div style="background:#1e1e1e; padding:1.5rem; border-radius:15px; border:1px solid #333;">
            <div style="padding:0.5rem 0;">✅ <b>Data-Centric AI</b> approach</div>
            <div style="padding:0.5rem 0;">✅ <b>Automatic</b> quality assessment</div>
            <div style="padding:0.5rem 0;">✅ <b>Attack simulation</b> testing</div>
            <div style="padding:0.5rem 0;">✅ <b>Single trust score</b> decision</div>
            <div style="padding:0.5rem 0;">✅ <b>Real-time</b> dashboard</div>
        </div>
        """, unsafe_allow_html=True)

# ============================================================
# PAGE: UPLOAD DATASET
# ============================================================
elif page == "📤 Upload Dataset":
    st.markdown('<div class="main-title" style="font-size:2rem;">📤 Upload Your Dataset</div>', unsafe_allow_html=True)
    
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
            
            # Show sample images
            st.markdown('<div class="section-header">🖼️ Sample Images</div>', unsafe_allow_html=True)
            sample_imgs = list(images_path.glob("*.jpg"))[:4] + list(images_path.glob("*.png"))[:4]
            if sample_imgs:
                cols = st.columns(min(4, len(sample_imgs)))
                for i, img in enumerate(sample_imgs[:4]):
                    with cols[i]:
                        st.image(str(img), caption=img.name, width='stretch')
            
            st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
            
            if st.button("🚀 Run Full Analysis (Quality + Training + Trust)", type="primary", width='stretch'):
                with st.spinner("🔄 Running analysis... This may take 15-20 minutes..."):
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
    st.markdown('<div class="main-title" style="font-size:2rem;">📊 Dataset Quality Analysis</div>', unsafe_allow_html=True)
    
    datasets = ['good', 'bad', 'worst']
    labels = {'good': '🟢 GOOD', 'bad': '🟡 BAD', 'worst': '🔴 WORST'}
    
    # Gauge charts row
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
    
    # Detailed metrics
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
                
                # Sample images
                sample_imgs = get_dataset_images(ds, 4)
                if sample_imgs:
                    st.markdown("**Sample Images:**")
                    cols_img = st.columns(4)
                    for i, img in enumerate(sample_imgs[:4]):
                        with cols_img[i]:
                            st.image(str(img), caption=img.name, width='stretch')

# ============================================================
# PAGE: MODEL PERFORMANCE
# ============================================================
elif page == "🤖 Model Performance":
    st.markdown('<div class="main-title" style="font-size:2rem;">🤖 Model Performance</div>', unsafe_allow_html=True)
    
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
        
        # Dataframe
        st.markdown('<div class="section-header">📋 Performance Table</div>', unsafe_allow_html=True)
        st.dataframe(df, width='stretch', hide_index=True)
        
        st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)
        
        # Charts
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown('<div class="section-header">📊 Bar Chart</div>', unsafe_allow_html=True)
            fig = px.bar(df, x='Model', y=['Precision', 'Recall', 'mAP50'],
                         barmode='group', title="",
                         color_discrete_sequence=['#00ff87', '#ffd700', '#60efff'])
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font={'color': '#fff'},
                legend=dict(bgcolor='rgba(0,0,0,0)')
            )
            st.plotly_chart(fig, width='stretch')
        
        with col2:
            st.markdown('<div class="section-header">📈 Trend Chart</div>', unsafe_allow_html=True)
            fig = px.line(df, x='Model', y=['Precision', 'Recall', 'mAP50', 'mAP50-95'],
                          markers=True, title="",
                          color_discrete_sequence=['#00ff87', '#ffd700', '#60efff', '#ff4757'])
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font={'color': '#fff'},
                legend=dict(bgcolor='rgba(0,0,0,0)')
            )
            st.plotly_chart(fig, width='stretch')
        
        st.info("📌 **Observation:** Jaisa dataset quality girti hai, waisa model performance bhi girti hai!")
    else:
        st.warning("No model data found.")

# ============================================================
# PAGE: ROBUSTNESS TESTING
# ============================================================
elif page == "🧪 Robustness Testing":
    st.markdown('<div class="main-title" style="font-size:2rem;">🧪 Robustness Testing</div>', unsafe_allow_html=True)
    
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
                'Samples Tested': info.get('samples_tested', 0)
            })
        
        df = pd.DataFrame(rows)
        st.dataframe(df, width='stretch', hide_index=True)
        
        # Chart
        fig = px.bar(df, x='Model', y=['Avg Robustness', 'Min', 'Max'],
                     barmode='group', title="Robustness Comparison",
                     color_discrete_sequence=['#00ff87', '#ff4757', '#60efff'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font={'color': '#fff'}
        )
        st.plotly_chart(fig, width='stretch')
        
        st.markdown("""
        **🧪 Transformations Tested:**
        - 🌞 Brightness ↑
        - 🌙 Darkness
        - 🌫️ Gaussian Blur
        - 📺 Gaussian Noise
        - 🔄 Rotation (30°)
        - ✂️ Crop
        - 📏 Resize
        """)
    else:
        st.warning("No robustness data found. Run: `python3 model/robustness/robustness_tester.py`")

# ============================================================
# PAGE: TRUST SCORE
# ============================================================
elif page == "🧠 Trust Score":
    st.markdown('<div class="main-title" style="font-size:2rem;">🧠 Final Trust Score</div>', unsafe_allow_html=True)
    
    trust_data = get_trust_data()
    if trust_data:
        # Gauge charts
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
                    <div style="font-size:1.3rem; font-weight:700; color:#fff; margin:0.5rem 0;">{ds.upper()}</div>
                    <div style="font-size:2.5rem; font-weight:800; color:#fff; margin:0.5rem 0;">{score:.1f}%</div>
                    <div style="margin:0.5rem 0;"><span class="{badge}">{decision}</span></div>
                </div>
                """, unsafe_allow_html=True)
                
                # Components
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
                st.markdown(f"""
                <div class="metric-card" style="border-color:#00ff87;">
                    <div style="font-size:2.5rem;">✅</div>
                    <div class="metric-value">{summary.get('accept', 0)}</div>
                    <div class="metric-label">ACCEPT</div>
                </div>
                """, unsafe_allow_html=True)
            with c2:
                st.markdown(f"""
                <div class="metric-card" style="border-color:#ffd700;">
                    <div style="font-size:2.5rem;">⚠️</div>
                    <div class="metric-value" style="color:#ffd700;">{summary.get('review', 0)}</div>
                    <div class="metric-label">REVIEW</div>
                </div>
                """, unsafe_allow_html=True)
            with c3:
                st.markdown(f"""
                <div class="metric-card" style="border-color:#ff4757;">
                    <div style="font-size:2.5rem;">❌</div>
                    <div class="metric-value" style="color:#ff4757;">{summary.get('quarantine', 0)}</div>
                    <div class="metric-label">QUARANTINE</div>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.warning("No trust data found.")

# ============================================================
# PAGE: REPORTS
# ============================================================
else:
    st.markdown('<div class="main-title" style="font-size:2rem;">📁 All Reports</div>', unsafe_allow_html=True)
    
    if REPORTS.exists():
        files = sorted(list(REPORTS.glob("*.json")))
        if files:
            st.markdown(f"**Total Reports: {len(files)}**")
            
            for f in files:
                with st.expander(f"📄 {f.name} ({f.stat().st_size/1024:.1f} KB)"):
                    data = load_json(f)
                    if data:
                        # Download button
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
<div style="text-align:center; color:#666; font-size:0.8rem; padding:1rem 0;">
    🤖 CV-INTEGRITY AI | SIH 2026 | Built with ❤️ using Streamlit
</div>
""", unsafe_allow_html=True)
