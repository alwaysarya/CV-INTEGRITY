"""
CV-INTEGRITY REST API
FastAPI-based REST API for blockchain and analysis
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from pathlib import Path
from datetime import datetime

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from typing import Optional
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("⚠️ fastapi/uvicorn not installed!")

if FASTAPI_AVAILABLE:
    app = FastAPI(
        title="CV-INTEGRITY API",
        description="Blockchain-based Computer Vision Integrity API",
        version="1.0.0"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    REPORTS = Path(__file__).parent.parent / "outputs" / "reports"
    
    def load_json(filename):
        """Load JSON file"""
        path = REPORTS / filename
        if path.exists():
            with open(path, 'r') as f:
                return json.load(f)
        return None
    
    # ============================================================
    # ROOT ENDPOINTS
    # ============================================================
    
    @app.get("/")
    async def root():
        """API root"""
        return {
            "name": "CV-INTEGRITY API",
            "version": "1.0.0",
            "status": "running",
            "endpoints": {
                "health": "/health",
                "datasets": "/api/datasets",
                "models": "/api/models",
                "trust_scores": "/api/trust-scores",
                "blockchain": "/api/blockchain",
                "wallets": "/api/wallets",
                "attacks": "/api/attacks",
                "verify": "/api/verify",
                "docs": "/docs"
            },
            "timestamp": datetime.now().isoformat()
        }
    
    @app.get("/health")
    async def health():
        """Health check"""
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat()
        }
    
    # ============================================================
    # DATASETS ENDPOINTS
    # ============================================================
    
    @app.get("/api/datasets")
    async def get_datasets():
        """Get all dataset quality reports"""
        datasets = {}
        for ds in ['good', 'bad', 'worst']:
            data = load_json(f'{ds}_quality_report.json')
            if data:
                datasets[ds] = {
                    'name': ds.upper(),
                    'overall_score': data.get('scores', {}).get('overall_score', 0),
                    'blur_score': data.get('scores', {}).get('blur_score', 0),
                    'duplicate_score': data.get('scores', {}).get('duplicate_score', 0),
                    'noise_score': data.get('scores', {}).get('noise_score', 0),
                    'total_images': data.get('total_images', 0),
                    'category': data.get('quality_category', 'N/A')
                }
        return {"datasets": datasets, "count": len(datasets)}
    
    @app.get("/api/datasets/{dataset_name}")
    async def get_dataset(dataset_name: str):
        """Get specific dataset details"""
        if dataset_name.lower() not in ['good', 'bad', 'worst']:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        data = load_json(f'{dataset_name.lower()}_quality_report.json')
        if not data:
            raise HTTPException(status_code=404, detail="Dataset report not found")
        
        return data
    
    # ============================================================
    # MODELS ENDPOINTS
    # ============================================================
    
    @app.get("/api/models")
    async def get_models():
        """Get all model performance data"""
        models_path = Path(__file__).parent.parent / "model" / "saved_models" / "all_training_results.json"
        
        if models_path.exists():
            with open(models_path, 'r') as f:
                data = json.load(f)
            
            models = {}
            for model, info in data.items():
                metrics = info.get('metrics', {})
                models[model] = {
                    'name': model.upper(),
                    'precision': round(metrics.get('precision', 0) * 100, 2),
                    'recall': round(metrics.get('recall', 0) * 100, 2),
                    'mAP50': round(metrics.get('mAP50', 0) * 100, 2),
                    'mAP50_95': round(metrics.get('mAP50_95', 0) * 100, 2)
                }
            return {"models": models, "count": len(models)}
        
        return {"models": {}, "count": 0}
    
    # ============================================================
    # TRUST SCORES ENDPOINTS
    # ============================================================
    
    @app.get("/api/trust-scores")
    async def get_trust_scores():
        """Get trust scores for all datasets"""
        data = load_json('final_trust_report.json')
        if data:
            return {"trust_scores": data, "count": len(data)}
        return {"trust_scores": {}, "count": 0}
    
    @app.get("/api/trust-scores/{dataset_name}")
    async def get_trust_score(dataset_name: str):
        """Get trust score for specific dataset"""
        data = load_json('final_trust_report.json')
        if data and dataset_name.lower() in data:
            return data[dataset_name.lower()]
        raise HTTPException(status_code=404, detail="Trust score not found")
    
    # ============================================================
    # BLOCKCHAIN ENDPOINTS
    # ============================================================
    
    @app.get("/api/blockchain")
    async def get_blockchain():
        """Get blockchain data"""
        data = load_json('blockchain.json')
        if data:
            return {
                "length": data.get('length', 0),
                "is_valid": data.get('is_valid', False),
                "difficulty": data.get('difficulty', 2),
                "chain": data.get('chain', [])
            }
        return {"length": 0, "is_valid": False, "chain": []}
    
    @app.get("/api/blockchain/blocks")
    async def get_blocks():
        """Get all blocks"""
        data = load_json('blockchain.json')
        if data:
            return {"blocks": data.get('chain', []), "count": data.get('length', 0)}
        return {"blocks": [], "count": 0}
    
    @app.get("/api/blockchain/block/{block_index}")
    async def get_block(block_index: int):
        """Get specific block"""
        data = load_json('blockchain.json')
        if data:
            chain = data.get('chain', [])
            for block in chain:
                if block.get('index') == block_index:
                    return block
        raise HTTPException(status_code=404, detail="Block not found")
    
    # ============================================================
    # WALLET ENDPOINTS
    # ============================================================
    
    @app.get("/api/wallets")
    async def get_wallets():
        """Get all wallets"""
        data = load_json('wallets.json')
        if data:
            return data
        return {"wallets": {}, "token_name": "CVIT"}
    
    @app.get("/api/wallets/{owner_name}")
    async def get_wallet(owner_name: str):
        """Get specific wallet"""
        data = load_json('wallets.json')
        if data and owner_name in data.get('wallets', {}):
            return data['wallets'][owner_name]
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # ============================================================
    # ATTACKS ENDPOINTS
    # ============================================================
    
    @app.get("/api/attacks")
    async def get_attacks():
        """Get cyber attack simulation results"""
        data = load_json('cyber_attacks.json')
        if data:
            return data
        return {"attacks": [], "total_attacks": 0, "detected": 0}
    
    # ============================================================
    # TAMPER DETECTION ENDPOINTS
    # ============================================================
    
    @app.get("/api/tamper-detection")
    async def get_tamper_detection():
        """Get tamper detection results"""
        data = load_json('tamper_detection.json')
        if data:
            return data
        return {"total_clean": 0, "total_tampered": 0}
    
    # ============================================================
    # SMART CONTRACT ENDPOINTS
    # ============================================================
    
    @app.get("/api/contracts")
    async def get_contracts():
        """Get smart contracts info"""
        return {
            "contracts": [
                {
                    "address": "0xTRUST_CONTRACT_v1",
                    "name": "Trust Decision Contract",
                    "rules": {
                        "ACCEPT": "score >= 80",
                        "REVIEW": "score 50-79",
                        "QUARANTINE": "score < 50"
                    }
                },
                {
                    "address": "0xACCESS_CONTRACT_v1",
                    "name": "Access Control Contract",
                    "roles": ["admin", "contributor", "reviewer", "viewer"]
                }
            ]
        }
    
    # ============================================================
    # VERIFICATION ENDPOINTS
    # ============================================================
    
    class VerifyRequest(BaseModel):
        dataset_name: Optional[str] = None
        verify_type: str = "all"
    
    @app.post("/api/verify")
    async def verify_integrity(request: VerifyRequest):
        """Verify blockchain integrity"""
        blockchain = load_json('blockchain.json')
        
        if not blockchain:
            raise HTTPException(status_code=404, detail="Blockchain not found")
        
        is_valid = blockchain.get('is_valid', False)
        
        return {
            'status': 'verified',
            'is_valid': is_valid,
            'chain_length': blockchain.get('length', 0),
            'verify_type': request.verify_type,
            'timestamp': datetime.now().isoformat(),
            'message': '✅ Blockchain is valid' if is_valid else '❌ Blockchain is invalid'
        }
    
    # ============================================================
    # STATS ENDPOINTS
    # ============================================================
    
    @app.get("/api/stats")
    async def get_stats():
        """Get overall system statistics"""
        stats = {
            'datasets': 0,
            'models': 0,
            'blocks': 0,
            'wallets': 0,
            'attacks_detected': 0,
            'reports': 0
        }
        
        # Count reports
        if REPORTS.exists():
            stats['reports'] = len(list(REPORTS.glob('*.json')))
        
        # Blockchain blocks
        blockchain = load_json('blockchain.json')
        if blockchain:
            stats['blocks'] = blockchain.get('length', 0)
        
        # Wallets
        wallets = load_json('wallets.json')
        if wallets:
            stats['wallets'] = len(wallets.get('wallets', {}))
        
        # Attacks
        attacks = load_json('cyber_attacks.json')
        if attacks:
            stats['attacks_detected'] = attacks.get('detected', 0)
        
        # Models
        for ds in ['good', 'bad', 'worst']:
            if load_json(f'{ds}_quality_report.json'):
                stats['datasets'] += 1
        
        return {'stats': stats, 'timestamp': datetime.now().isoformat()}


def run_api(host="0.0.0.0", port=8000):
    """Run API server"""
    if not FASTAPI_AVAILABLE:
        print("❌ Install FastAPI first:")
        print("   pip install fastapi uvicorn")
        return
    
    print("\n" + "="*60)
    print("🌐 CV-INTEGRITY API SERVER")
    print("="*60)
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   API URL: http://{host}:{port}")
    print(f"   Docs: http://{host}:{port}/docs")
    print(f"   ReDoc: http://{host}:{port}/redoc")
    print("="*60 + "\n")
    
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    run_api()