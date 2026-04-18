import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.student import get_student
from app.models.student import BeltColor, Student

# Ordered belt progression (index matters)
BELT_ORDER: list[str] = [
    BeltColor.white.value,
    BeltColor.yellow.value,
    BeltColor.orange.value,
    BeltColor.green.value,
    BeltColor.blue.value,
    BeltColor.red.value,
    BeltColor.brown.value,
]


async def promote_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    coach_id: uuid.UUID,
) -> Student:
    """
    Advance a student to the next belt in the Silambam progression.

    Raises:
        HTTP 400 – student already holds a brown belt (highest).
        HTTP 404 – student not found / not owned by this coach.
    """
    student = await get_student(db, student_id, coach_id)

    try:
        current_index = BELT_ORDER.index(student.belt)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown belt value '{student.belt}' stored on student",
        )

    if current_index == len(BELT_ORDER) - 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already holds the highest belt (brown). Cannot promote further.",
        )

    student.belt = BELT_ORDER[current_index + 1]
    await db.flush()
    await db.refresh(student)
    return student
