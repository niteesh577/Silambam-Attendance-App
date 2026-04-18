import uuid
from datetime import datetime

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    clerk_user_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="coach")
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )

    # Relationships (populated in later phases)
    branches: Mapped[list["Branch"]] = relationship(  # noqa: F821
        "Branch", back_populates="coach", cascade="all, delete-orphan"
    )
    students: Mapped[list["Student"]] = relationship(  # noqa: F821
        "Student", back_populates="coach", foreign_keys="Student.coach_id"
    )
    attendance_records: Mapped[list["Attendance"]] = relationship(  # noqa: F821
        "Attendance", back_populates="marker", foreign_keys="Attendance.marked_by"
    )
