from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_clerk_token
from app.crud.user import create_user, get_user_by_clerk_id
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserBase

http_bearer = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> dict[str, Any]:
    """Verify Clerk JWT and return the token payload as a lightweight dict."""
    token = credentials.credentials
    try:
        payload = verify_clerk_token(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Authentication service unavailable: {exc}",
        ) from exc

    clerk_user_id: str | None = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing 'sub' claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str | None = payload.get("email")
    return {"clerk_user_id": clerk_user_id, "email": email}


async def get_current_db_user(
    token_data: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Resolve the Clerk identity to a database User row.
    If this is the first login, auto-provisions the user record.
    All routes that need the DB user (i.e., coach_id) should depend on this.
    """
    clerk_user_id: str = token_data["clerk_user_id"]
    email: str = token_data.get("email") or ""

    user = await get_user_by_clerk_id(db, clerk_user_id)

    if user is None:
        # First login — create the user record automatically
        user = await create_user(
            db,
            UserBase(email=email, name=email.split("@")[0]),
            clerk_user_id=clerk_user_id,
        )

    return user
