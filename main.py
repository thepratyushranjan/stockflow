from fastapi import FastAPI

from core.config import settings
from core.lifespan import lifespan
from core.middleware import setup_middleware
from routers.products import router as products_router
from routers.customers import router as customers_router
from routers.orders import router as orders_router
from routers.dashboard import router as dashboard_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }
