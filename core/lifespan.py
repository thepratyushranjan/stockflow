import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from db.session import engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up application...")
    logger.info("Database engine created and ready")
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda _: None)
        logger.info("Database connection test successful")
        import subprocess
        logger.info("Running database migrations...")
        try:
            subprocess.run(["alembic", "upgrade", "head"], check=True)
            subprocess.run(["alembic", "revision", "--autogenerate", "-m", "auto_migration"], check=True)
            subprocess.run(["alembic", "upgrade", "head"], check=True)
            logger.info("Database migrations completed successfully")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error running migrations: {e}")
            raise

    except Exception as e:
        logger.error(f"Database connection test or migration failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await engine.dispose()
    logger.info("Database connections closed")
