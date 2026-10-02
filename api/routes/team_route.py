"""
Team RBAC API — real permission modules
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/team", tags=["team"])


@router.get("/rbac-modules")
async def get_rbac_modules():
    """Return RBAC modules + role permissions"""
    return {
        "status": "success",
        "modules": [
            "Models", "Datasets", "Blockchain", "Smart Contracts",
            "Multisig Wallets", "Cyber Attack", "Audit Trail", "Reports", "Settings"
        ],
        "role_permissions": {
            "Admin":       ["*"],
            "Contributor": ["Models", "Datasets", "Reports"],
            "Reviewer":    ["Blockchain", "Cyber Attack", "Audit Trail", "Reports"],
        }
    }
