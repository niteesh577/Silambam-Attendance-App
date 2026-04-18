import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.student import BeltColor


class StudentBase(BaseModel):
    name: str
    age: int
    parent_name: str
    phone: str
    belt: BeltColor
    blood_group: str | None = None
    address: str | None = None
    dob: date | None = None
    emis_no: str | None = None
    aadhaar_no: str | None = None
    ident_mark_1: str | None = None
    ident_mark_2: str | None = None
    joined_date: date
    fee_status: str = "unpaid"


class StudentCreate(StudentBase):
    branch_id: uuid.UUID


class StudentUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    parent_name: str | None = None
    phone: str | None = None
    belt: BeltColor | None = None
    blood_group: str | None = None
    address: str | None = None
    dob: date | None = None
    emis_no: str | None = None
    aadhaar_no: str | None = None
    ident_mark_1: str | None = None
    ident_mark_2: str | None = None
    joined_date: date | None = None
    notes: str | None = None
    fee_status: str | None = None
    is_active: bool | None = None
    branch_id: uuid.UUID | None = None


class StudentResponse(StudentBase):
    id: uuid.UUID
    coach_id: uuid.UUID
    branch_id: uuid.UUID
    notes: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
