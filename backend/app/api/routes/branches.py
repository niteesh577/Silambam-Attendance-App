import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_db_user
from app.crud import branch as branch_crud
from app.db.database import get_db
from app.models.user import User
from app.schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from app.services.attendance_service import get_branch_summary

router = APIRouter(prefix="/api/branches", tags=["Branches"])


@router.get("", response_model=dict)
async def list_branches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Return all branches owned by the authenticated coach."""
    branches = await branch_crud.get_branches(db, coach_id=current_user.id)
    return {
        "data": [BranchResponse.model_validate(b).model_dump() for b in branches],
        "message": "Success",
    }


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_branch(
    branch_in: BranchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Create a new branch for the authenticated coach."""
    branch = await branch_crud.create_branch(db, coach_id=current_user.id, branch_in=branch_in)
    return {
        "data": BranchResponse.model_validate(branch).model_dump(),
        "message": "Branch created successfully",
    }


@router.get("/{branch_id}", response_model=dict)
async def get_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Return a single branch by ID."""
    branch = await branch_crud.get_branch(db, branch_id=branch_id, coach_id=current_user.id)
    return {
        "data": BranchResponse.model_validate(branch).model_dump(),
        "message": "Success",
    }


@router.put("/{branch_id}", response_model=dict)
async def update_branch(
    branch_id: uuid.UUID,
    branch_in: BranchUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Update branch fields (all optional)."""
    branch = await branch_crud.update_branch(
        db, branch_id=branch_id, coach_id=current_user.id, branch_in=branch_in
    )
    return {
        "data": BranchResponse.model_validate(branch).model_dump(),
        "message": "Branch updated successfully",
    }


@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> None:
    """Delete a branch and all its students (cascade)."""
    await branch_crud.delete_branch(db, branch_id=branch_id, coach_id=current_user.id)


@router.get("/{branch_id}/summary", response_model=dict)
async def branch_summary(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Return dashboard summary for a branch (student counts, belts, today's attendance)."""
    # Verify the branch belongs to this coach first
    await branch_crud.get_branch(db, branch_id=branch_id, coach_id=current_user.id)
    summary = await get_branch_summary(db, branch_id=branch_id, coach_id=current_user.id)
    return {
        "data": summary,
        "message": "Success",
    }
