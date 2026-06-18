from fastapi import FastAPI

from core.config import settings
from core.lifespan import lifespan
from core.middleware import setup_middleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# Setup middleware
setup_middleware(app)


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }