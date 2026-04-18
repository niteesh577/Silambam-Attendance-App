import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AttendanceCreate(BaseModel):
    student_id: uuid.UUID
    session_date: date
    status: str  # "present" | "absent"


class AttendanceRecord(BaseModel):
    """A single student's status within a bulk mark request."""
    student_id: uuid.UUID
    status: str  # "present" | "absent"


class AttendanceBulkCreate(BaseModel):
    branch_id: uuid.UUID
    session_date: date
    records: list[AttendanceRecord]


class AttendanceResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    coach_id: uuid.UUID
    session_date: date
    status: str
    marked_by: uuid.UUID | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
