from fastapi import APIRouter, Depends, HTTPException, status
from app.api.auth import get_current_user
from app.models.base_models import User, UserDashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """
    Fetch the dashboard statistics for the currently logged-in user.
    """
    dashboard = await UserDashboard.find_one(UserDashboard.user_id == str(current_user.id))
    
    if not dashboard:
        # Fallback if somehow not created on registration
        dashboard = UserDashboard(user_id=str(current_user.id))
        await dashboard.insert()
        
    return dashboard
