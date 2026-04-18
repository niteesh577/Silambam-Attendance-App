# Central import point for SQLAlchemy Base and ALL models.
# Alembic's env.py imports this file so every table is included in migrations.
from app.db.database import Base  # noqa: F401

# Models — import order matters for FK resolution: User → Branch → Student → Attendance
from app.models.user import User  # noqa: F401
from app.models.branch import Branch  # noqa: F401
from app.models.student import Student  # noqa: F401
from app.models.attendance import Attendance  # noqa: F401
