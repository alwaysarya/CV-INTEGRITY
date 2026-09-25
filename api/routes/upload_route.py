"""
File Upload API — Real file upload with validation and blockchain recording
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from typing import Optional
import hashlib
import shutil
import sys
import json
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = PROJECT_ROOT / "datasets" / "uploaded"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.zip', '.tar', '.gz', '.jpg', '.jpeg', '.png', '.mp4', '.avi'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB


@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file with real SHA-256 hashing and blockchain record."""
    try:
        # Validate file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}"
            )
        
        # Save file
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        safe_name = f"{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / safe_name
        
        # Stream to disk with size check
        size = 0
        sha256 = hashlib.sha256()
        
        with open(file_path, 'wb') as f:
            while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    f.close()
                    file_path.unlink()
                    raise HTTPException(status_code=413, detail="File too large (max 500 MB)")
                sha256.update(chunk)
                f.write(chunk)
        
        file_hash = sha256.hexdigest()
        
        # Record in blockchain
        try:
            from api.routes.blockchain_route import add_block, NewBlockRequest
            
            block_req = NewBlockRequest(
                action="DATASET_UPLOAD",
                data={
                    "file_name": file.filename,
                    "file_hash": file_hash,
                    "size_bytes": size,
                    "uploaded_by": "user",
                },
                user="user",
            )
            block_result = await add_block(block_req)
            block_index = block_result.get("block", {}).get("index")
        except Exception as e:
            block_index = None
            print(f"Blockchain record failed: {e}")
        
        return {
            "status": "success",
            "file_name": file.filename,
            "saved_as": safe_name,
            "file_hash": file_hash,
            "size_bytes": size,
            "size_mb": round(size / 1024 / 1024, 2),
            "block_index": block_index,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@router.get("/files")
async def list_uploaded_files():
    """List all uploaded files."""
    files = []
    if UPLOAD_DIR.exists():
        for f in sorted(UPLOAD_DIR.glob("*"), key=lambda x: x.stat().st_mtime, reverse=True):
            if f.is_file() and f.suffix.lower() in ALLOWED_EXTENSIONS:
                # Compute hash
                sha256 = hashlib.sha256()
                with open(f, 'rb') as fh:
                    for chunk in iter(lambda: fh.read(8192), b''):
                        sha256.update(chunk)
                
                files.append({
                    "name": f.name,
                    "size_mb": round(f.stat().st_size / 1024 / 1024, 2),
                    "hash": sha256.hexdigest()[:16],
                    "uploaded": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                })
    
    return {"files": files, "count": len(files)}
