import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserBase


async def get_user_by_clerk_id(
    db: AsyncSession,
    clerk_user_id: str,
) -> User | None:
    """Fetch a user by their Clerk identity, or None if not found."""
    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    user_data: UserBase,
    clerk_user_id: str,
    role: str = "coach",
) -> User:
    """Persist a new User row and return it."""
    user = User(
        clerk_user_id=clerk_user_id,
        email=user_data.email,
        name=user_data.name,
        role=role,
    )
    db.add(user)
    await db.flush()   # get the PK without ending the transaction
    await db.refresh(user)
    return user
