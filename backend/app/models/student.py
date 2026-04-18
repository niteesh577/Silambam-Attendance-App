import uuid
from datetime import date, datetime
from enum import Enum

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class BeltColor(str, Enum):
    white = "white"
    yellow = "yellow"
    orange = "orange"
    green = "green"
    blue = "blue"
    red = "red"
    brown = "brown"


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    coach_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    branch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Personal info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    parent_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)

    # Martial arts meta
    belt: Mapped[str] = mapped_column(
        String(20), nullable=False, default=BeltColor.white
    )

    # Optional fields
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    dob: Mapped[date | None] = mapped_column(Date, nullable=True)
    emis_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    aadhaar_no: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ident_mark_1: Mapped[str | None] = mapped_column(Text, nullable=True)
    ident_mark_2: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Admin fields
    joined_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    fee_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="unpaid"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    coach: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="students", foreign_keys=[coach_id]
    )
    branch: Mapped["Branch"] = relationship(  # noqa: F821
        "Branch", back_populates="students"
    )
    attendance_records: Mapped[list["Attendance"]] = relationship(  # noqa: F821
        "Attendance", back_populates="student", cascade="all, delete-orphan"
    )
