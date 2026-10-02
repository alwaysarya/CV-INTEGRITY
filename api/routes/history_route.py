"""
CV-INTEGRITY History API
Endpoints for querying assets, findings, decisions, reports, ledger.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from api.models import history_db as db

router = APIRouter(prefix="/api/history", tags=["history"])


# ============================================================
# STATS
# ============================================================
@router.get("/stats")
async def get_stats():
    """Get overall stats."""
    try:
        return {"status": "success", "stats": db.get_stats()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ASSETS
# ============================================================
@router.get("/assets")
async def list_assets(
    type: Optional[str] = Query(None, description="'dataset' or 'model'"),
    limit: int = Query(100, ge=1, le=1000)
):
    """List all assets."""
    try:
        assets = db.get_all_assets(type_filter=type, limit=limit)
        return {"status": "success", "count": len(assets), "assets": assets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assets/{asset_id}")
async def get_asset(asset_id: str):
    """Get single asset details."""
    asset = db.get_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"status": "success", "asset": asset}


# ============================================================
# FINDINGS
# ============================================================
@router.get("/assets/{asset_id}/findings")
async def get_findings(asset_id: str):
    """Get all findings for an asset."""
    findings = db.get_asset_findings(asset_id)
    return {"status": "success", "count": len(findings), "findings": findings}


# ============================================================
# DECISIONS
# ============================================================
@router.get("/assets/{asset_id}/decisions")
async def get_decisions(asset_id: str):
    """Get all decisions for an asset."""
    decisions = db.get_asset_decisions(asset_id)
    return {"status": "success", "count": len(decisions), "decisions": decisions}


# ============================================================
# REPORTS
# ============================================================
@router.get("/assets/{asset_id}/report")
async def get_report(asset_id: str):
    """Get latest report for an asset."""
    report = db.get_asset_report(asset_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"status": "success", "report": report}


# ============================================================
# HISTORY QUERY (advanced)
# ============================================================
@router.get("/query")
async def query_history(
    type: Optional[str] = Query(None, description="'dataset' or 'model'"),
    verdict: Optional[str] = Query(None, description="'accept', 'review', 'quarantine'"),
    contributor: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500)
):
    """Advanced history query with filters."""
    try:
        results = db.query_history(
            asset_type=type, verdict=verdict,
            contributor=contributor, search=search, limit=limit
        )
        return {"status": "success", "count": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# WRITE ENDPOINTS (for internal use / testing)
# ============================================================
from pydantic import BaseModel

class AssetCreate(BaseModel):
    id: str
    name: str
    type: str
    hash: Optional[str] = None
    format: Optional[str] = None
    contributor: Optional[str] = None
    size_mb: Optional[float] = None
    access_level: str = 'black-box'
    metadata: Optional[dict] = None


@router.post("/assets")
async def create_asset(asset: AssetCreate):
    """Create a new asset."""
    ok = db.add_asset(
        asset_id=asset.id, name=asset.name, type_=asset.type,
        hash_=asset.hash, format_=asset.format,
        contributor=asset.contributor, size_mb=asset.size_mb,
        access_level=asset.access_level, metadata=asset.metadata
    )
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to create asset")
    return {"status": "success", "asset_id": asset.id}


class FindingCreate(BaseModel):
    asset_id: str
    module: str
    reason: str
    evidence: Optional[str] = None
    severity: str = 'medium'
    confidence: float = 0.0


@router.post("/findings")
async def create_finding(f: FindingCreate):
    """Create a new finding."""
    ok = db.add_finding(
        asset_id=f.asset_id, module=f.module, reason=f.reason,
        evidence=f.evidence, severity=f.severity, confidence=f.confidence
    )
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to create finding")
    return {"status": "success"}


class DecisionCreate(BaseModel):
    asset_id: str
    decision: str
    note: Optional[str] = None
    analyst: str = 'system'


@router.post("/decisions")
async def create_decision(d: DecisionCreate):
    """Create a decision."""
    ok = db.add_decision(
        asset_id=d.asset_id, decision=d.decision,
        note=d.note, analyst=d.analyst
    )
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to create decision")
    return {"status": "success"}
