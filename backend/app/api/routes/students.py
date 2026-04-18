import uuid

from fastapi import APIRouter, Body, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_db_user
from app.crud import student as student_crud
from app.db.database import get_db
from app.models.student import BeltColor
from app.models.user import User
from app.schemas.student import StudentCreate, StudentResponse, StudentUpdate
from app.services.attendance_service import get_student_summary
from app.services.student_service import promote_student

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=dict)
async def list_students(
    branch_id: uuid.UUID | None = Query(default=None),
    belt: BeltColor | None = Query(default=None),
    fee_status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """
    List active students for the authenticated coach.
    Supports filtering by branch, belt, fee_status, and a free-text search
    across name, parent name, and phone. Paginated.
    """
    offset = (page - 1) * limit
    students = await student_crud.get_students(
        db,
        coach_id=current_user.id,
        branch_id=branch_id,
        belt=belt,
        fee_status=fee_status,
        search=search,
        limit=limit,
        offset=offset,
    )
    return {
        "data": [StudentResponse.model_validate(s).model_dump() for s in students],
        "page": page,
        "limit": limit,
        "message": "Success",
    }


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_in: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Enroll a new student under the authenticated coach."""
    student = await student_crud.create_student(
        db, coach_id=current_user.id, student_in=student_in
    )
    return {
        "data": StudentResponse.model_validate(student).model_dump(),
        "message": "Student created successfully",
    }


@router.get("/{student_id}", response_model=dict)
async def get_student(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Return a single student's full profile."""
    student = await student_crud.get_student(
        db, student_id=student_id, coach_id=current_user.id
    )
    return {
        "data": StudentResponse.model_validate(student).model_dump(),
        "message": "Success",
    }


@router.put("/{student_id}", response_model=dict)
async def update_student(
    student_id: uuid.UUID,
    student_in: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Update a student record (all fields optional)."""
    student = await student_crud.update_student(
        db,
        student_id=student_id,
        coach_id=current_user.id,
        student_in=student_in,
    )
    return {
        "data": StudentResponse.model_validate(student).model_dump(),
        "message": "Student updated successfully",
    }


@router.delete("/{student_id}", response_model=dict)
async def soft_delete_student(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Soft-delete a student (sets is_active=False). Attendance history is preserved."""
    student = await student_crud.soft_delete_student(
        db, student_id=student_id, coach_id=current_user.id
    )
    return {
        "data": StudentResponse.model_validate(student).model_dump(),
        "message": "Student deactivated successfully",
    }


# ── Advanced endpoints ──────────────────────────────────────────────────────

@router.patch("/{student_id}/promote", response_model=dict)
async def promote_student_belt(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """
    Advance the student's belt to the next level in the Silambam progression.
    Returns HTTP 400 if the student already holds a black belt.
    """
    student = await promote_student(
        db, student_id=student_id, coach_id=current_user.id
    )
    return {
        "data": StudentResponse.model_validate(student).model_dump(),
        "message": f"Belt promoted to {student.belt}",
    }


@router.patch("/{student_id}/fee", response_model=dict)
async def update_fee_status(
    student_id: uuid.UUID,
    fee_status: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """
    Update a student's fee status.
    Body: { "fee_status": "paid" | "unpaid" }
    """
    student = await student_crud.update_fee_status(
        db,
        student_id=student_id,
        coach_id=current_user.id,
        fee_status=fee_status,
    )
    return {
        "data": StudentResponse.model_validate(student).model_dump(),
        "message": f"Fee status updated to '{fee_status}'",
    }


@router.patch("/{student_id}/notes", response_model=dict)
async def update_notes(
    student_id: uuid.UUID,
    notes: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """
    Overwrite the free-text notes field for a student.
    Body: { "notes": "..." }
    """
    student = await student_crud.update_notes(
        db,
        student_id=student_id,
        coach_id=current_user.id,
        notes=notes,
    )
    return {
        "data": StudentResponse.model_validate(student).model_dump(),
        "message": "Notes updated successfully",
    }


@router.get("/{student_id}/summary", response_model=dict)
async def student_attendance_summary(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Return attendance summary (total / present / absent / percentage) for a student."""
    # Verify student ownership before querying attendance
    await student_crud.get_student(db, student_id=student_id, coach_id=current_user.id)
    summary = await get_student_summary(
        db, student_id=student_id, coach_id=current_user.id
    )
    return {
        "data": summary,
        "message": "Success",
    }
