import uuid

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import BeltColor, Student
from app.schemas.student import StudentCreate, StudentUpdate


async def get_students(
    db: AsyncSession,
    coach_id: uuid.UUID,
    *,
    branch_id: uuid.UUID | None = None,
    belt: BeltColor | None = None,
    fee_status: str | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Student]:
    """
    Return a paginated, filtered list of active students for a coach.

    Filters:
    - branch_id  – restrict to one branch
    - belt       – filter by exact belt colour
    - fee_status – "paid" | "unpaid"
    - search     – case-insensitive match on name, parent_name, or phone
    """
    stmt = select(Student).where(
        Student.coach_id == coach_id,
        Student.is_active.is_(True),
    )

    if branch_id is not None:
        stmt = stmt.where(Student.branch_id == branch_id)

    if belt is not None:
        stmt = stmt.where(Student.belt == belt.value)

    if fee_status is not None:
        stmt = stmt.where(Student.fee_status == fee_status)

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Student.name.ilike(pattern),
                Student.parent_name.ilike(pattern),
                Student.phone.ilike(pattern),
            )
        )

    stmt = stmt.order_by(Student.name.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> Student:
    """Return one student or raise 404."""
    result = await db.execute(
        select(Student).where(
            Student.id == student_id,
            Student.coach_id == coach_id,
        )
    )
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    return student


async def create_student(
    db: AsyncSession,
    coach_id: uuid.UUID,
    student_in: StudentCreate,
) -> Student:
    """Persist a new student and return it."""
    student = Student(
        coach_id=coach_id,
        branch_id=student_in.branch_id,
        name=student_in.name,
        age=student_in.age,
        parent_name=student_in.parent_name,
        phone=student_in.phone,
        belt=student_in.belt.value,
        blood_group=student_in.blood_group,
        address=student_in.address,
        joined_date=student_in.joined_date,
        fee_status=student_in.fee_status,
    )
    db.add(student)
    await db.flush()
    await db.refresh(student)
    return student


async def update_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
    student_in: StudentUpdate,
) -> Student:
    """Patch a student record; raises 404 if not found / not owned."""
    student = await get_student(db, student_id, coach_id)

    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        # Serialize enum value to string before storing
        if isinstance(value, BeltColor):
            value = value.value
        setattr(student, field, value)

    await db.flush()
    await db.refresh(student)
    return student


async def soft_delete_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> Student:
    """Mark a student as inactive (soft delete)."""
    student = await get_student(db, student_id, coach_id)
    student.is_active = False
    await db.flush()
    await db.refresh(student)
    return student


async def update_fee_status(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
    fee_status: str,
) -> Student:
    """Update only the fee_status field."""
    if fee_status not in ("paid", "unpaid"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="fee_status must be 'paid' or 'unpaid'",
        )
    student = await get_student(db, student_id, coach_id)
    student.fee_status = fee_status
    await db.flush()
    await db.refresh(student)
    return student


async def update_notes(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
    notes: str,
) -> Student:
    """Overwrite the free-text notes field for a student."""
    student = await get_student(db, student_id, coach_id)
    student.notes = notes
    await db.flush()
    await db.refresh(student)
    return student
