import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.branch import Branch
from app.schemas.branch import BranchCreate, BranchUpdate


async def get_branches(
    db: AsyncSession,
    coach_id: uuid.UUID,
) -> list[Branch]:
    """Return all branches owned by this coach."""
    result = await db.execute(
        select(Branch)
        .where(Branch.coach_id == coach_id)
        .order_by(Branch.created_at.desc())
    )
    return list(result.scalars().all())


async def get_branch(
    db: AsyncSession,
    branch_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> Branch:
    """Return a single branch or raise 404."""
    result = await db.execute(
        select(Branch).where(
            Branch.id == branch_id,
            Branch.coach_id == coach_id,
        )
    )
    branch = result.scalar_one_or_none()
    if branch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found",
        )
    return branch


async def create_branch(
    db: AsyncSession,
    coach_id: uuid.UUID,
    branch_in: BranchCreate,
) -> Branch:
    """Create a new branch for the given coach."""
    branch = Branch(
        coach_id=coach_id,
        name=branch_in.name,
        location=branch_in.location,
        city=branch_in.city,
    )
    db.add(branch)
    await db.flush()
    await db.refresh(branch)
    return branch


async def update_branch(
    db: AsyncSession,
    branch_id: uuid.UUID,
    coach_id: uuid.UUID,
    branch_in: BranchUpdate,
) -> Branch:
    """Patch a branch; raises 404 if not found / not owned."""
    branch = await get_branch(db, branch_id, coach_id)

    update_data = branch_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(branch, field, value)

    await db.flush()
    await db.refresh(branch)
    return branch


async def delete_branch(
    db: AsyncSession,
    branch_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> None:
    """Delete a branch; raises 404 if not found / not owned."""
    branch = await get_branch(db, branch_id, coach_id)
    await db.delete(branch)
    await db.flush()
