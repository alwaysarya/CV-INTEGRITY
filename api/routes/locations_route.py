"""
Locations API — Real GPS coordinates for datasets and models
"""

from fastapi import APIRouter
from pathlib import Path
import json
import sys

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.get("/all")
async def get_all_locations():
    """Get all locations with GPS coordinates."""
    metadata_file = PROJECT_ROOT / "datasets" / "metadata" / "locations.json"
    
    if not metadata_file.exists():
        return {"status": "no_data", "locations": []}
    
    try:
        with open(metadata_file) as f:
            data = json.load(f)
        
        # Convert to list
        locations = [
            {"id": key, **value}
            for key, value in data.items()
        ]
        
        return {
            "status": "success",
            "locations": locations,
            "count": len(locations),
            "center": {
                "lat": 20.5937,
                "lng": 78.9629,
                "zoom": 5,
            },
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}
