import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import Integer, cast, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceBulkCreate


async def get_attendance(
    db: AsyncSession,
    coach_id: uuid.UUID,
    branch_id: uuid.UUID | None = None,
    session_date: date | None = None,
) -> list[Attendance]:
    """
    Fetch attendance records for a coach.
    Optionally filter by branch (via student JOIN) and/or session date.
    """
    stmt = (
        select(Attendance)
        .where(Attendance.coach_id == coach_id)
    )

    if branch_id is not None:
        # Join to students to filter by branch without loading the whole relation
        stmt = stmt.join(Student, Student.id == Attendance.student_id).where(
            Student.branch_id == branch_id
        )

    if session_date is not None:
        stmt = stmt.where(Attendance.session_date == session_date)

    stmt = stmt.order_by(Attendance.session_date.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def bulk_upsert_attendance(
    db: AsyncSession,
    coach_id: uuid.UUID,
    marked_by: uuid.UUID,
    bulk_data: AttendanceBulkCreate,
) -> list[Attendance]:
    """
    Insert or update attendance records for a list of students on a single date.
    Uses PostgreSQL INSERT ... ON CONFLICT DO UPDATE to avoid duplicates.
    """
    if not bulk_data.records:
        return []

    rows = [
        {
            "id": uuid.uuid4(),
            "coach_id": coach_id,
            "student_id": record.student_id,
            "session_date": bulk_data.session_date,
            "status": record.status,
            "marked_by": marked_by,
        }
        for record in bulk_data.records
    ]

    stmt = pg_insert(Attendance).values(rows)
    stmt = stmt.on_conflict_do_update(
        constraint="uq_student_session",
        set_={
            "status": stmt.excluded.status,
            "marked_by": stmt.excluded.marked_by,
        },
    )
    await db.execute(stmt)
    await db.flush()

    # Return the freshly upserted rows
    student_ids = [r.student_id for r in bulk_data.records]
    result = await db.execute(
        select(Attendance).where(
            Attendance.student_id.in_(student_ids),
            Attendance.session_date == bulk_data.session_date,
        )
    )
    return list(result.scalars().all())


async def get_student_attendance_summary(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> dict:
    """
    Return aggregate counts for a student's attendance history.
    Uses a single SQL query with conditional aggregation.
    """
    result = await db.execute(
        select(
            func.count().label("total"),
            func.sum(
                cast(Attendance.status == "present", Integer)
            ).label("present_count"),
        ).where(
            Attendance.student_id == student_id,
            Attendance.coach_id == coach_id,
        )
    )
    row = result.one()
    total: int = row.total or 0
    present: int = int(row.present_count or 0)
    absent: int = total - present
    return {
        "total_sessions": total,
        "present_count": present,
        "absent_count": absent,
    }


async def get_branch_report(
    db: AsyncSession,
    branch_id: uuid.UUID,
    coach_id: uuid.UUID,
    from_date: date,
    to_date: date,
) -> list[Attendance]:
    """
    Return all attendance records for every student in a branch
    between from_date and to_date (inclusive).
    Eager-loads student via join to avoid N+1.
    """
    result = await db.execute(
        select(Attendance)
        .join(Student, Student.id == Attendance.student_id)
        .where(
            Student.branch_id == branch_id,
            Attendance.coach_id == coach_id,
            Attendance.session_date >= from_date,
            Attendance.session_date <= to_date,
        )
        .order_by(Attendance.session_date.asc(), Student.name.asc())
    )
    return list(result.scalars().all())
