import uuid
from datetime import date

from sqlalchemy import Integer, case, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.attendance import get_student_attendance_summary
from app.models.attendance import Attendance
from app.models.student import Student


def calculate_attendance_percentage(present: int, total: int) -> float:
    """Return the attendance percentage rounded to 2 decimal places."""
    if total == 0:
        return 0.0
    return round((present / total) * 100, 2)


async def get_student_summary(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> dict:
    """
    Return a complete attendance summary for one student.

    Uses a single aggregation query:
    - total_sessions
    - present_count
    - absent_count
    - percentage
    """
    # Single query: count total and count presents using conditional sum
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
        "percentage": calculate_attendance_percentage(present, total),
    }


async def get_branch_summary(
    db: AsyncSession,
    branch_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> dict:
    """
    Return an overview dashboard for a branch:
    - total_students
    - active_students
    - belt_distribution: {belt_color: count}
    - attendance_today: number of students marked present today
    """
    today = date.today()

    # ── Student counts (single query) ─────────────────────────────────────
    student_stats = await db.execute(
        select(
            func.count().label("total_students"),
            func.sum(cast(Student.is_active.is_(True), Integer)).label("active_students"),
        ).where(
            Student.branch_id == branch_id,
            Student.coach_id == coach_id,
        )
    )
    s_row = student_stats.one()
    total_students: int = s_row.total_students or 0
    active_students: int = int(s_row.active_students or 0)

    # ── Belt distribution (group_by, no N+1) ──────────────────────────────
    belt_rows = await db.execute(
        select(Student.belt, func.count().label("cnt"))
        .where(
            Student.branch_id == branch_id,
            Student.coach_id == coach_id,
            Student.is_active.is_(True),
        )
        .group_by(Student.belt)
        .order_by(Student.belt)
    )
    belt_distribution: dict[str, int] = {
        row.belt: row.cnt for row in belt_rows
    }

    # ── Attendance today ───────────────────────────────────────────────────
    today_result = await db.execute(
        select(func.count())
        .select_from(Attendance)
        .join(Student, Student.id == Attendance.student_id)
        .where(
            Student.branch_id == branch_id,
            Attendance.coach_id == coach_id,
            Attendance.session_date == today,
            Attendance.status == "present",
        )
    )
    attendance_today: int = today_result.scalar() or 0

    return {
        "total_students": total_students,
        "active_students": active_students,
        "belt_distribution": belt_distribution,
        "attendance_today": attendance_today,
    }
