import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_db_user
from app.crud import attendance as attendance_crud
from app.db.database import get_db
from app.models.user import User
from app.schemas.attendance import (
    AttendanceBulkCreate,
    AttendanceResponse,
)
from app.services.attendance_service import get_student_summary

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/bulk", response_model=dict, status_code=status.HTTP_201_CREATED)
async def bulk_mark_attendance(
    bulk_data: AttendanceBulkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """
    Mark attendance for multiple students on a single date.
    Re-submitting the same date performs an upsert (idempotent).
    """
    records = await attendance_crud.bulk_upsert_attendance(
        db,
        coach_id=current_user.id,
        marked_by=current_user.id,
        bulk_data=bulk_data,
    )
    return {
        "data": [AttendanceResponse.model_validate(r).model_dump() for r in records],
        "message": f"{len(records)} attendance record(s) saved",
    }


@router.get("", response_model=dict)
async def list_attendance(
    branch_id: uuid.UUID | None = Query(default=None),
    session_date: date | None = Query(default=None, alias="date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """
    Fetch attendance records.
    Filter by branch_id and/or date (query param: ?date=YYYY-MM-DD).
    """
    records = await attendance_crud.get_attendance(
        db,
        coach_id=current_user.id,
        branch_id=branch_id,
        session_date=session_date,
    )
    return {
        "data": [AttendanceResponse.model_validate(r).model_dump() for r in records],
        "message": "Success",
    }


@router.get("/report", response_model=dict)
async def branch_attendance_report(
    branch_id: uuid.UUID = Query(...),
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """
    Return full attendance records for a branch between two dates.
    Query params: branch_id, from_date (YYYY-MM-DD), to_date (YYYY-MM-DD).
    """
    records = await attendance_crud.get_branch_report(
        db,
        branch_id=branch_id,
        coach_id=current_user.id,
        from_date=from_date,
        to_date=to_date,
    )
    return {
        "data": [AttendanceResponse.model_validate(r).model_dump() for r in records],
        "message": "Success",
    }


@router.get("/{student_id}/summary", response_model=dict)
async def student_attendance_summary(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
) -> dict:
    """Return total / present / absent counts + percentage for one student."""
    summary = await get_student_summary(
        db,
        student_id=student_id,
        coach_id=current_user.id,
    )
    return {
        "data": summary,
        "message": "Success",
    }
