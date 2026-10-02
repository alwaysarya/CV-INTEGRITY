# CV-INTEGRITY

**Trustworthy Computer Vision Integrity Assurance for Data, Models and Inference Outputs in Multi-Contributor Pipelines**

[![SIH 26228](https://img.shields.io/badge/SIH-26228-blue)](https://sih.gov.in)
[![Ministry of Defence](https://img.shields.io/badge/Ministry-Defence%20(Indian%20Army)-darkgreen)](https://indianarmy.nic.in)
[![Offline](https://img.shields.io/badge/Deployment-Offline%20%C2%B7%20Air--gapped-success)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB)](https://reactjs.org)

---

## Overview

CV-INTEGRITY is an **offline, air-gapped assurance layer** for computer vision pipelines. It verifies integrity across the complete data → model → inference lifecycle — before anything gets deployed in a defence-grade environment.

Built for **Smart India Hackathon 2026, Problem Statement 26228** (Ministry of Defence · Indian Army · DGIS).

### The Core Idea

In multi-contributor computer vision pipelines, training data, pretrained models, and inference outputs flow between multiple sources. Each stage introduces distinct integrity risks:

- Data may contain **mislabelled samples**, **duplicate content**, **out-of-distribution material**, or **trigger-based backdoors**
- Models may be **substituted, modified, or contain hidden behaviour** not visible in routine validation
- Inference records may be **replayed, replaced, or altered** after generation

CV-INTEGRITY is a **unified, evidence-based assurance layer** that assesses all these risks — without assuming any contributing source is trusted.

---

## Key Features

### 1. Training-Data Integrity
- Label uniqueness analysis (detects systematic mislabelling)
- Bounding box variance detection (detects zero-variance attacks)
- Class distribution analysis (detects imbalance injection)
- Near-duplicate detection via perceptual hashing
- Out-of-distribution sample detection via Z-score
- Per-sample evidence with affected file names

### 2. Model Integrity
- SHA-256 weight fingerprinting
- Weight distribution analysis (mean, std, min, max)
- Extreme weight detection (>5σ anomaly)
- Baseline comparison (cosine similarity)
- Model substitution detection (deterministic hash)
- White-box vs black-box assessment modes

### 3. Inference Provenance
- Cryptographic binding of input image → model weights → config → output
- SHA-256 hashing at every stage
- Anti-replay controls (sequence counter, timestamp, nonce)
- Tamper detection via binding re-computation

### 4. Distribution-Shift Assessment
- Population Stability Index (PSI)
- Wasserstein distance across feature streams
- Severity classification (STABLE / WARNING / CRITICAL)
- Retraining recommendations

### 5. Analyst-Facing Governance
- Human-readable reasons for every flag
- Supporting evidence with severity levels
- Recommended disposition (Accept / Review / Quarantine)
- Tamper-evident audit trail (SQLite + blockchain)
- Coverage statement (declares supported & unsupported attack classes)

---

## Offline & Air-Gapped Compliance

**PS 2.2.6 Requirement:** *"The complete evaluation workflow must operate offline and in an air-gapped environment with no dependency on cloud services or external APIs."*

CV-INTEGRITY is built **100% offline-first**:

| Component | Status |
|---|---|
| Google Fonts CDN | None |
| Maps (Mapbox, Leaflet) | None |
| Analytics (Google, Sentry) | None |
| CDN scripts | None |
| Model weights | Local (`model/saved_models/`) |
| `torch.hub.load` | None |
| Backend external API calls | None |
| Content-Security-Policy | Configured (`default-src 'self'`) |
| Storage | SQLite (local file) + JSON |
| Authentication | Local (SHA-256 + salt) |

**Verified:** Full application tested with Wi-Fi disabled — all features operational.

---

## Architecture
┌─────────────────────────────────────────────────────────────────┐
│ CV-INTEGRITY │
│ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Frontend (React + TypeScript) │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│ │ │ Datasets │ │ Models │ │ Reports │ │ Video │ │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│ │ │ Provenance│ │Contracts│ │ History │ │Analytics │ │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│ └──────────────────────────┬───────────────────────────────┘ │
│ │ REST API │
│ ┌──────────────────────────▼───────────────────────────────┐ │
│ │ Backend (FastAPI + Python 3.11) │ │
│ │ │ │
│ │ ┌────────────────┐ ┌────────────────┐ ┌───────────┐ │ │
│ │ │ 65 Endpoints │ │ 39 Modules │ │ YOLOv8n │ │ │
│ │ │ 13 Route Files │ │ + Torch/ONNX │ │ Inference │ │ │
│ │ └────────────────┘ └────────────────┘ └───────────┘ │ │
│ │ │ │
│ │ ┌────────────────┐ ┌────────────────┐ ┌───────────┐ │ │
│ │ │ SQLite DB │ │ JSON Ledger │ │ SHA-256 │ │ │
│ │ │ (5 tables) │ │ (chain.json) │ │ Hashing │ │ │
│ │ └────────────────┘ └────────────────┘ └───────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘


---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI 0.104+ |
| Server | Uvicorn (ASGI) |
| ML Runtime | PyTorch 2.x + Ultralytics YOLOv8 |
| Image Processing | OpenCV, Pillow, NumPy |
| Database | SQLite 3 (local file) |
| Hashing | SHA-256 (hashlib) |
| Auth | Custom (SHA-256 + salt, local JSON) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP Client | Axios + Fetch |
| PDF Export | jsPDF + jspdf-autotable |

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- ~2 GB disk space (for models + dependencies)

### Backend Setup

```bash
cd CV-INTEGRITY

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt


Key dependencies:

fastapi
uvicorn[standard]
python-multipart
ultralytics
torch
torchvision
opencv-python
Pillow
numpy


Frontend Setup:

cd frontend

# Install Node modules
npm install


Running the Application
Terminal 1 — Backend
bash
cd /Users/<user>/Documents/SIH/SIH26228/CV-INTEGRITY
lsof -ti:8000 | xargs kill -9 2>/dev/null
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
Expected output:

text
✅ Premium routes registered
✅ Cybersecurity routes registered
✅ Attacks routes registered
✅ XAI routes registered
✅ Backdoor routes registered
✅ Assurance routes registered
✅ Blockchain live routes registered
✅ Video routes registered
✅ Locations routes registered
✅ Analytics routes registered
✅ Upload routes registered
✅ Advanced routes registered
✅ Auth routes registered (local, offline)
✅ Websocket routes registered
✅ Settings routes registered
✅ Drift routes registered
✅ History routes registered
✅ Model Analysis routes registered
✅ Provenance routes registered
✅ Contracts routes registered
Terminal 2 — Frontend
bash
cd /Users/<user>/Documents/SIH/SIH26228/CV-INTEGRITY/frontend
lsof -ti:5173 | xargs kill -9 2>/dev/null
npm run dev
Expected output:

text
VITE v8.3.0  ready in 129 ms
➜  Local:   http://localhost:5173/
Access the Application
Open your browser: http://localhost:5173

Demo credentials:

Username	Password	Role
analyst	demo	Data Analyst
auditor	demo	Security Auditor
admin	demo	System Administrator


API Endpoints (65 Total)
Datasets & Models
Method	Endpoint	Description
GET	/api/datasets	List all datasets
GET	/api/models	List all models
GET	/api/model/list	Model files with metadata
POST	/api/model/analyze	Weight-level integrity analysis
Integrity Scans
Method	Endpoint	Description
POST	/api/backdoor/detect	Dataset integrity scan (5 methods)
GET	/api/premium/model/fingerprints	Model SHA-256 fingerprints
POST	/api/premium/model/fingerprint	Single model fingerprint
Inference Provenance
Method	Endpoint	Description
POST	/api/provenance/infer	Inference with cryptographic binding
POST	/api/provenance/verify	Verify binding (tamper detection)
GET	/api/provenance/health	Provenance service health
Smart Contracts
Method	Endpoint	Description
GET	/api/contracts/list	List 6 governance contracts
POST	/api/contracts/execute	Execute contract on metrics
GET	/api/contracts/stats	Contract execution stats
Drift Detection
Method	Endpoint	Description
GET	/api/drift/status	Overall drift status
GET	/api/drift/model/{name}	Model-specific drift
POST	/api/drift/detect	Detect drift with metrics
History & Audit Trail
Method	Endpoint	Description
GET	/api/history/stats	Asset/finding/decision counts
GET	/api/history/assets	List all assets
GET	/api/history/query	Advanced filtered query
GET	/api/history/assets/{id}/findings	Per-asset findings
GET	/api/history/assets/{id}/decisions	Per-asset decisions
Authentication (Local)
Method	Endpoint	Description
POST	/api/auth/login	Login with username/password
POST	/api/auth/verify	Verify session token
POST	/api/auth/logout	Logout
GET	/api/auth/health	Auth service health
...and 40+ more endpoints across analytics, blockchain, cybersecurity, video analysis, assurance, XAI, and attacks.

Detection Modules
Data Integrity (5 Methods)
Module	What It Detects	Confidence Formula
Label Uniqueness	Systematic mislabelling	Ratio of unique labels to total
Bbox Variance	Zero-variance attacks	Per-coordinate variance
Class Distribution	Imbalance injection	Dominant class ratio
Near-Duplicate	Duplicate flooding	Perceptual hash Hamming distance
OOD Detection	Out-of-distribution samples	Z-score (>3σ) outliers
Model Integrity (6 Methods)
Module	What It Detects	Confidence Formula
Weight Statistics	Extreme weights	abs(w) > 5σ count
Baseline Comparison	Model substitution	Cosine similarity
Sparsity Analysis	Pruning tampering	Near-zero weight ratio
Layer Analysis	Layer-wise anomalies	Per-layer L2 norm
Fingerprint Match	File hash substitution	SHA-256 equality
White-Box Analysis	Activation clustering	Feature-space outliers
Risk Thresholds
Level	Threshold	Verdict
LOW	max_conf < 0.15	ACCEPT
MEDIUM	0.15 ≤ max_conf ≤ 0.45	REVIEW
HIGH	0.45 < max_conf ≤ 0.65	REVIEW
CRITICAL	max_conf > 0.65	QUARANTINE
Performance Metrics
Detection Rates (Research-Based Estimates)
Capability	Detection Rate	False Positive Rate
Trigger injection	92%	3.5%
Label flipping	88%	4.0%
Near-duplicate flooding	96%	2.0%
Model substitution	~100% (deterministic SHA-256)	0%
Inference tampering	~100% (deterministic binding)	0%
Distribution shift (KS)	Clear: > 0.15, Subtle: < 0.05	—
System Metrics
Metric	Value
Total FastAPI endpoints	65
Core assurance modules	39
Route files	13
SQLite tables	5 (assets, findings, decisions, reports, ledger_blocks)
Test set size	1,285 images (GOOD: 300, BAD: 330, WORST: 655)
Full assessment turnaround	~45 seconds (CPU-only)
Inference speed	30 frames in ~2-3 seconds
Project Structure
text
CV-INTEGRITY/
├── api/                          # FastAPI backend
│   ├── main.py                   # Server entry point (all routes)
│   ├── models/
│   │   └── history_db.py         # SQLite setup (5 tables)
│   └── routes/                   # 13 route files
│       ├── auth_route.py         # Local authentication
│       ├── backdoor_route.py     # Dataset integrity scans
│       ├── contracts_route.py    # 6 governance contracts
│       ├── history_route.py      # Audit trail queries
│       ├── model_analysis_route.py # Weight-level analysis
│       ├── provenance_route.py   # Inference provenance
│       └── ... (7 more)
│
├── model/                        # ML models
│   ├── onnx_loader.py            # Model loading + fingerprinting
│   ├── real_dataset_detector.py  # 5 dataset integrity methods
│   ├── backdoor_detector.py      # Backdoor detection
│   ├── fingerprint.py            # Behavioral fingerprinting
│   ├── saved_models/             # Trained YOLO models
│   └── ...
│
├── model_drift/                  # Drift detection
│   ├── drift_detector.py         # PSI + Wasserstein
│   └── risk_calibrator.py        # Risk scoring
│
├── dataset_analyzer/             # Dataset analysis utilities
│
├── datasets/                     # Data
│   └── processed/
│       ├── good/                 # Clean dataset (300 images)
│       ├── bad/                  # Mislabelled dataset (330 images)
│       └── worst/                # Corrupted dataset (655 images)
│
├── data/                         # Local storage
│   ├── cv_integrity.db           # SQLite database
│   ├── users.json                # Local users (hashed passwords)
│   └── sessions.json             # Active sessions
│
├── blockchain/                   # Blockchain notary
│   ├── data/chain.json           # Ledger
│   └── ...
│
├── frontend/                     # React frontend
│   ├── index.html                # HTML (CSP configured)
│   ├── src/
│   │   ├── App.tsx               # Router + routes
│   │   ├── components/
│   │   │   ├── layout/           # Layout, Sidebar, Topbar
│   │   │   ├── dashboard/        # Dashboard widgets
│   │   │   └── assurance/        # CoverageStatement, etc.
│   │   ├── pages/                # 25+ pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Models.tsx
│   │   │   ├── Datasets.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Provenance.tsx
│   │   │   ├── ContractsEngine.tsx
│   │   │   └── ...
│   │   └── lib/                  # API client, hooks
│   └── package.json
│
├── requirements.txt
├── README.md
└── LICENSE
Security & Compliance
Security Features
SHA-256 cryptographic hashing (all file operations)

Salted password hashing (auth)

Session tokens with expiry (8 hours)

Tamper-evident audit trail (SQLite + blockchain)

Anti-replay controls (sequence, timestamp, nonce)

Content-Security-Policy (blocks external requests)

Compliance Alignment
NIST AI Risk Management Framework (AI RMF) — aligned

EU AI Act — aligned

PS 2.2.6 — offline + air-gapped verified

Attack Class Coverage Statement — included in every report

Coverage Statement
Every assessment includes:

Supported attack classes (7): Trigger injection, label flipping, near-duplicate flooding, OOD insertion, model substitution, weight tampering, inference replay

Partially supported (2): Systematic mislabelling (80%), clean-label poisoning (60%)

Not supported (3): Physical adversarial patches, hardware-level backdoors, supply chain attacks beyond model hash

Demo Credentials
Username	Password	Role	Access
analyst	demo	Data Analyst	Upload + scan + view
auditor	demo	Security Auditor	View + approve
admin	demo	System Administrator	Full access
Auth mode: Local, offline, SHA-256 hashed. No cloud dependency.

Offline Verification
Tested with Wi-Fi physically disabled. All features operational:

✅ Frontend UI renders (no CDN dependencies)

✅ Backend API responds (localhost:8000)

✅ Model inference runs (YOLOv8n local weights)

✅ Dataset scans complete

✅ Blockchain notary records

✅ SQLite persistence works

✅ Login/authentication functions

✅ PDF export generates

Zero network calls detected in browser DevTools Network tab.

Known Limitations
Dataset size — Test sets are 300-655 images each (research prototypes; production deployments require 10k+ images)

Detection rates — Reported rates are research-based estimates, not yet validated on adversarial benchmarks

Weight analysis — Detects structural anomalies, not semantic backdoors

OOD detection — Uses image statistics (mean, std, dimensions); not semantic

Drift detection — Requires declared reference distribution

Adversarial testing — Currently limited to FGSM/PGD attacks

These are documented in every assessment's Limitations section.

Contributing
This project was built for Smart India Hackathon 2026 (Problem Statement 26228). For questions or collaboration:

Fork the repository

Create a feature branch

Commit changes

Push to branch

Open a Pull Request

License
See LICENSE file for details.

Acknowledgments
Ministry of Defence, Government of India

Indian Army — Directorate General of Information Systems (DGIS)

Smart India Hackathon 2026

Ultralytics — YOLOv8 framework

FastAPI — Modern Python web framework

React — Frontend library
