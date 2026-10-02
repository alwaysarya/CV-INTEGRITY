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
    
    # ============================================================
    # REGISTER ALL ROUTES
    # ============================================================
    
    # 1. Premium routes
    try:
        from api.routes.premium import router as premium_router
        app.include_router(premium_router)
        print("✅ Premium routes registered: 8 new endpoints")
    except Exception as e:
        print(f"⚠️ Failed to register premium routes: {e}")
    
    # 2. Cybersecurity routes
    try:
        from api.routes.cybersecurity import router as cybersecurity_router
        app.include_router(cybersecurity_router)
        print("✅ Cybersecurity routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register cybersecurity routes: {e}")
    
    # 3. Attacks routes
    try:
        from api.routes.attacks import router as attacks_router
        app.include_router(attacks_router)
        print("✅ Attacks routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register attacks routes: {e}")
    
    # 4. XAI routes
    try:
        from api.routes.xai_route import router as xai_router
        app.include_router(xai_router)
        print("✅ XAI routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register XAI routes: {e}")
    
    # 5. Backdoor routes
    try:
        from api.routes.backdoor_route import router as backdoor_router
        app.include_router(backdoor_router)
        print("✅ Backdoor routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register backdoor routes: {e}")
    
    # 6. Assurance routes
    try:
        from api.routes.assurance_route import router as assurance_router
        app.include_router(assurance_router)
        print("✅ Assurance routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register assurance routes: {e}")
    
    # 7. Blockchain live routes
    try:
        from api.routes.blockchain_route import router as blockchain_live_router
        app.include_router(blockchain_live_router)
        print("✅ Blockchain live routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register blockchain live routes: {e}")
    
    # 8. Video routes
    try:
        from api.routes.video_route import router as video_router
        app.include_router(video_router)
        print("✅ Video routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register video routes: {e}")
    
    # 9. Locations routes
    try:
        from api.routes.locations_route import router as locations_router
        app.include_router(locations_router)
        print("✅ Locations routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register locations routes: {e}")
    
    # 10. Analytics routes
    try:
        from api.routes.analytics_route import router as analytics_router
        app.include_router(analytics_router)
        print("✅ Analytics routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register analytics routes: {e}")
    
    # 11. Upload routes
    try:
        from api.routes.upload_route import router as upload_router
        app.include_router(upload_router)
        print("✅ Upload routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register upload routes: {e}")
    
    # 12. Advanced routes (contracts, multisig, audit, cyber)
    try:
        from api.routes.advanced_route import router as advanced_router
        app.include_router(advanced_router)
        print("✅ Advanced routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register advanced routes: {e}")
    
    # 13. Auth routes
    try:
        from api.routes.auth_route import router as auth_router
        app.include_router(auth_router)
        print("✅ Auth routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register auth routes: {e}")
    
    # 14. WebSocket routes
    try:
        from api.routes.websocket_route import router as ws_router
        app.include_router(ws_router)
        print("✅ WebSocket routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register websocket routes: {e}")
    
    # 15. Settings routes
    try:
        from api.routes.settings_route import router as settings_router
        app.include_router(settings_router)
        print("✅ Settings routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register settings routes: {e}")
    
    # 16. Drift routes
    try:
        from api.routes.drift_route import router as drift_router
        app.include_router(drift_router)
        from api.routes.team_route import router as team_router
        app.include_router(team_router)
        print("✅ Drift routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register drift routes: {e}")
    

    # 9. History routes (NEW — SQLite-based)
    try:
        from api.routes.history_route import router as history_router
        app.include_router(history_router)
        print("✅ History routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register history routes: {e}")

    # 10. Model Analysis routes (NEW — Weight-level integrity)
    try:
        from api.routes.model_analysis_route import router as model_analysis_router
        app.include_router(model_analysis_router)
        print("✅ Model Analysis routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register model analysis routes: {e}")

    # 11. Inference Provenance routes (NEW — PS 2.2.3)
    try:
        from api.routes.provenance_route import router as provenance_router
        app.include_router(provenance_router)
        print("✅ Provenance routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register provenance routes: {e}")

    # 13. Smart Contracts routes (NEW)
    try:
        from api.routes.contracts_route import router as contracts_router
        app.include_router(contracts_router)
        print("✅ Contracts routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register contracts routes: {e}")

    # Original block continues below
    try:
        pass
        print("✅ Provenance routes registered")
    except Exception as e:
        print(f"⚠️ Failed to register provenance routes: {e}")
    print("=" * 60)
    print("✅ ALL ROUTES REGISTERED")
    print("=" * 60)
    
    # ============================================================
    # REPORTS LOADER
    # ============================================================
    
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
        
        if REPORTS.exists():
            stats['reports'] = len(list(REPORTS.glob('*.json')))
        
        try:
            chain_file = Path(__file__).parent.parent / 'blockchain' / 'data' / 'chain.json'
            if chain_file.exists():
                with open(chain_file) as f:
                    chain_data = json.load(f)
                    stats['blocks'] = len(chain_data.get('chain', []))
        except Exception as e:
            print(f'⚠️ Blockchain load failed: {e}')
        
        wallets = load_json('wallets.json')
        if wallets:
            stats['wallets'] = len(wallets.get('wallets', {}))
        
        attacks = load_json('cyber_attacks.json')
        if attacks:
            stats['attacks_detected'] = attacks.get('detected', 0)
        
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