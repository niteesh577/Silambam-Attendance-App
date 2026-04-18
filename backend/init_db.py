import asyncio
import logging

from app.db.database import engine
from app.db.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    logger.info("Connecting to database to create tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Tables created correctly.")

if __name__ == "__main__":
    asyncio.run(init_db())
