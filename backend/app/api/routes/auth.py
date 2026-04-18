from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_current_db_user, get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.get("/me", response_model=dict)
async def get_me(
    token_data: dict[str, Any] = Depends(get_current_user),
    db_user: User = Depends(get_current_db_user),
) -> dict:
    """
    Return the authenticated user's Clerk identity + DB profile.
    Auto-provisions a DB record on first call.
    """
    return {
        "data": UserResponse.model_validate(db_user).model_dump(),
        "message": "Success",
    }
