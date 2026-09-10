import streamlit as st
import json
import pandas as pd
import plotly.express as px
from pathlib import Path
import zipfile
import os
import shutil
import subprocess

st.set_page_config(
    page_title="CV-INTEGRITY AI",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .main-title {
        font-size: 2.8rem; font-weight: 700;
        background: linear-gradient(90deg, #00ff87, #60efff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center; padding: 0.5rem 0;
    }
    .sub-title { text-align: center; color: #888; font-size: 1.1rem; margin-bottom: 1.5rem; }
    .metric-card {
        background: #1e1e1e; padding: 1rem; border-radius: 10px;
        border: 1px solid #333; text-align: center;
    }
    .metric-value { font-size: 2rem; font-weight: 700; }
    .badge-accept { background: #00ff87; color: #000; padding: 0.2rem 1rem; border-radius: 20px; }
    .badge-review { background: #ffd700; color: #000; padding: 0.2rem 1rem; border-radius: 20px; }
    .badge-quarantine { background: #ff4757; color: #fff; padding: 0.2rem 1rem; border-radius: 20px; }
</style>
""", unsafe_allow_html=True)

BASE = Path(__file__).parent.parent
REPORTS = BASE / "outputs" / "reports"
MODELS = BASE / "model" / "saved_models"
UPLOAD_DIR = BASE / "datasets" / "uploaded"

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

def extract_zip(zip_path, extract_to):
    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(extract_to)
    return extract_to

def run_command(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    return result.stdout, result.stderr

with st.sidebar:
    st.markdown("""
    <div style="text-align:center; padding: 1rem 0;">
        <div style="font-size: 3rem;">🤖</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #fff;">CV-INTEGRITY</div>
        <div style="color: #888; font-size: 0.8rem;">AI Trust Platform</div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("---")
    page = st.radio("Navigation", [
        "🏠 Home", "📤 Upload Dataset", "📊 Dataset Quality",
        "🤖 Model Performance", "🧠 Trust Score", "📁 Reports"
    ])
    st.markdown("---")
    st.caption("SIH 2026 | v1.0")

# ============================================================
if page == "🏠 Home":
    st.markdown('<div class="main-title">CV-INTEGRITY AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Intelligent Computer Vision Model Trust & Quality Evaluation Platform</div>', unsafe_allow_html=True)
    
    trust_data = get_trust_data()
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown('<div class="metric-card"><div class="metric-value">3</div><div style="color:#888;">📊 Datasets</div></div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="metric-card"><div class="metric-value">3</div><div style="color:#888;">🤖 Models</div></div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="metric-card"><div class="metric-value">909</div><div style="color:#888;">📈 Images</div></div>', unsafe_allow_html=True)
    with col4:
        if trust_data:
            scores = [d.get('final_score', 0) for d in trust_data.values()]
            avg_score = sum(scores)/len(scores) if scores else 0
            color = '#00ff87' if avg_score > 70 else '#ffd700' if avg_score > 50 else '#ff4757'
            st.markdown(f'<div class="metric-card"><div class="metric-value" style="color:{color};">{avg_score:.0f}%</div><div style="color:#888;">🧠 Avg Trust</div></div>', unsafe_allow_html=True)
    
    st.markdown("---")
    st.subheader("🚀 How It Works")
    st.markdown("""
    1. 📤 **Upload Dataset** – Upload ZIP (images/ + labels/)
    2. 🔍 **Auto Analysis** – Blur, duplicates, noise, class balance check
    3. 🤖 **Train Model** – YOLO model trains on your data
    4. 🧪 **Robustness Test** – 7 transformations test
    5. 🧠 **Trust Score** – ACCEPT / REVIEW / QUARANTINE decision
    """)

# ============================================================
elif page == "📤 Upload Dataset":
    st.markdown('<div class="main-title" style="font-size:2rem;">📤 Upload Your Dataset</div>', unsafe_allow_html=True)
    st.info("**Dataset Format:**\n- ZIP file with `images/` folder (.jpg/.png)\n- ZIP file with `labels/` folder (.txt YOLO format)\n- Classes: car(0), bicycle(1), bus(2), truck(3)")
    
    uploaded_file = st.file_uploader("Choose a ZIP file", type=['zip'])
    
    if uploaded_file is not None:
        st.success(f"✅ File uploaded: {uploaded_file.name}")
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        zip_path = UPLOAD_DIR / uploaded_file.name
        with open(zip_path, 'wb') as f:
            f.write(uploaded_file.getbuffer())
        
        extract_dir = UPLOAD_DIR / "extracted"
        shutil.rmtree(extract_dir, ignore_errors=True)
        extract_dir.mkdir(parents=True, exist_ok=True)
        extract_zip(zip_path, extract_dir)
        
        images_path = extract_dir / "images"
        labels_path = extract_dir / "labels"
        
        if images_path.exists() and labels_path.exists():
            st.success(f"✅ Dataset extracted! Found {len(list(images_path.glob('*')))} images")
            
            if st.button("🚀 Run Full Analysis", type="primary"):
                with st.spinner("🔄 Running analysis..."):
                    st.write("📊 Step 1/4: Quality Analysis...")
                    run_command("python3 dataset_analyzer/scorers/dataset_scorer.py", cwd=str(BASE))
                    st.write("🤖 Step 2/4: Training YOLO...")
                    run_command("python3 scripts/train_fast.py", cwd=str(BASE))
                    st.write("🧪 Step 3/4: Robustness Test...")
                    run_command("python3 model/robustness/robustness_tester.py", cwd=str(BASE))
                    st.write("🧠 Step 4/4: Trust Score...")
                    run_command("python3 trust_engine/aggregator/trust_aggregator.py", cwd=str(BASE))
                    run_command("python3 trust_engine/decision/decision_maker.py", cwd=str(BASE))
                    st.success("✅ Analysis Complete!")
        else:
            st.error("❌ Invalid format. Missing 'images/' or 'labels/' folder.")

# ============================================================
elif page == "📊 Dataset Quality":
    st.markdown('<div class="main-title" style="font-size:2rem;">📊 Dataset Quality Analysis</div>', unsafe_allow_html=True)
    
    datasets = ['good', 'bad', 'worst']
    labels = {'good': '🟢 GOOD', 'bad': '🟡 BAD', 'worst': '🔴 WORST'}
    cols = st.columns(3)
    
    for i, ds in enumerate(datasets):
        data = get_quality_data(ds)
        with cols[i]:
            if data:
                scores = data.get('scores', {})
                st.markdown(f"""
                <div style="background:#1e1e1e; padding:1.5rem; border-radius:10px; border:1px solid #333;">
                    <h3 style="text-align:center;">{labels[ds]}</h3>
                    <div style="font-size:2.5rem; font-weight:700; text-align:center; color:{'#00ff87' if scores.get('overall_score',0)>70 else '#ffd700' if scores.get('overall_score',0)>50 else '#ff4757'}">
                        {scores.get('overall_score', 0):.1f}%
                    </div>
                    <div style="text-align:center; color:#888; margin-bottom:1rem;">Overall Quality</div>
                    <hr style="border-color:#333;">
                    <div>🎯 <b>Blur:</b> {scores.get('blur_score', 0):.1f}%</div>
                    <div>📋 <b>Duplicates:</b> {scores.get('duplicate_score', 0):.1f}%</div>
                    <div>🔊 <b>Noise:</b> {scores.get('noise_score', 0):.1f}%</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.warning(f"No data for {ds}")

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
        st.dataframe(df, width='stretch', hide_index=True)
        
        # Charts
        col1, col2 = st.columns(2)
        with col1:
            fig = px.bar(df, x='Model', y=['Precision', 'Recall', 'mAP50'],
                         barmode='group', title="Performance Metrics Comparison",
                         color_discrete_sequence=['#00ff87', '#ffd700', '#60efff'])
            st.plotly_chart(fig, width='stretch')
        
        with col2:
            fig = px.line(df, x='Model', y=['Precision', 'Recall', 'mAP50', 'mAP50-95'],
                          title="Performance Trend", markers=True)
            st.plotly_chart(fig, width='stretch')
        
        st.info("📌 **Observation:** Jaisa dataset quality girti hai, waisa model performance bhi girti hai!")
    else:
        st.warning("No model data found.")

# ============================================================
elif page == "🧠 Trust Score":
    st.markdown('<div class="main-title" style="font-size:2rem;">🧠 Final Trust Score</div>', unsafe_allow_html=True)
    
    trust_data = get_trust_data()
    if trust_data:
        cols = st.columns(3)
        for i, (ds, data) in enumerate(trust_data.items()):
            with cols[i]:
                score = data.get('final_score', 0)
                decision = data.get('decision', 'N/A')
                icon = data.get('icon', '🟢')
                badge = 'badge-accept' if 'ACCEPT' in decision else 'badge-review' if 'REVIEW' in decision else 'badge-quarantine'
                
                st.markdown(f"""
                <div style="background:#1e1e1e; padding:1.5rem; border-radius:10px; border:1px solid #333; text-align:center;">
                    <div style="font-size:2rem;">{icon}</div>
                    <h3>{ds.upper()}</h3>
                    <div style="font-size:2.5rem; font-weight:700; color:{'#00ff87' if score>70 else '#ffd700' if score>50 else '#ff4757'}">
                        {score:.1f}%
                    </div>
                    <div style="margin:0.5rem 0;"><span class="{badge}">{decision}</span></div>
                    <hr style="border-color:#333;">
                    <div style="text-align:left; font-size:0.9rem;">
                """, unsafe_allow_html=True)
                
                comps = data.get('components', {})
                for k, v in comps.items():
                    st.progress(v/100, text=f"{k.replace('_',' ').title()}: {v:.1f}%")
                
                st.markdown("</div></div>", unsafe_allow_html=True)
        
        dec_data = get_decision_data()
        if dec_data:
            summary = dec_data.get('summary', {})
            st.markdown("---")
            st.subheader("📋 Deployment Summary")
            c1, c2, c3 = st.columns(3)
            with c1:
                st.metric("✅ ACCEPT", summary.get('accept', 0))
            with c2:
                st.metric("⚠️ REVIEW", summary.get('review', 0))
            with c3:
                st.metric("❌ QUARANTINE", summary.get('quarantine', 0))
    else:
        st.warning("No trust data found.")

# ============================================================
else:
    st.markdown('<div class="main-title" style="font-size:2rem;">📁 All Reports</div>', unsafe_allow_html=True)
    if REPORTS.exists():
        files = list(REPORTS.glob("*.json"))
        if files:
            for f in sorted(files):
                with st.expander(f"📄 {f.name}"):
                    data = load_json(f)
                    if data:
                        st.json(data)
        else:
            st.info("No reports found")

st.markdown("---")
st.markdown('<div style="text-align:center; color:#666; font-size:0.8rem;">🤖 CV-INTEGRITY AI | SIH 2026 | Built with Streamlit</div>', unsafe_allow_html=True)
