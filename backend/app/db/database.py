from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


import urllib.parse

def _build_async_url(url: str) -> str:
    """
    NeonDB provides a postgresql:// URL.
    SQLAlchemy asyncpg driver needs postgresql+asyncpg://.
    Also strip sslmode since asyncpg doesn't accept it natively.
    """
    parsed = urllib.parse.urlparse(url)
    
    # Handle scheme
    scheme = parsed.scheme
    if scheme == "postgresql" or scheme == "postgres":
        scheme = "postgresql+asyncpg"
        
    # Handle query params (strip unsupported params)
    query_params = urllib.parse.parse_qs(parsed.query)
    for key in ["sslmode", "channel_binding"]:
        if key in query_params:
            del query_params[key]
    
    new_query = urllib.parse.urlencode(query_params, doseq=True)
    
    # Rebuild URL
    return urllib.parse.urlunparse((scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
engine: AsyncEngine = create_async_engine(
    _build_async_url(settings.DATABASE_URL),
    echo=settings.APP_ENV == "development",  # SQL logging in dev only
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # keeps connections healthy
    connect_args={"ssl": "require"}, # Explicit SSL for Neon
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ---------------------------------------------------------------------------
# Declarative Base (single source of truth)
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yields an AsyncSession and guarantees it is closed after the request,
    rolling back on unhandled exceptions.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
