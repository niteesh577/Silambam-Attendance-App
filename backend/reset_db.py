import asyncio
import logging
from sqlalchemy import text
from app.db.database import engine
from app.db.base import Base
# ensure models are loaded
from app.models.user import User
from app.models.branch import Branch
from app.models.student import Student
from app.models.attendance import Attendance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_reset():
    logger.info("Dropping all tables...")
    async with engine.begin() as conn:
        # Drop all existing tables natively to avoid dependency issues
        await conn.run_sync(Base.metadata.drop_all)
        
        # In Postgres, custom enum types are left behind by drop_all. Let's drop them manually if they exist.
        await conn.execute(text("DROP TYPE IF EXISTS belt_color CASCADE;"))
        await conn.execute(text("DROP TYPE IF EXISTS fee_status CASCADE;"))
        await conn.execute(text("DROP TYPE IF EXISTS attendance_status CASCADE;"))
        
        logger.info("Recreating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database reset complete.")

if __name__ == "__main__":
    asyncio.run(run_reset())
