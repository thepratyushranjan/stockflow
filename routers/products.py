from db.models import schemas
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from db.session import get_db
from services.product_service import ProductService


router = APIRouter(
    prefix="/products",
    tags=["Product Management"]
)

@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: schemas.ProductCreate, db: AsyncSession = Depends(get_db)):
    """Create a new product."""
    service = ProductService(db)
    return await service.create_product(product)


@router.get("/", response_model=List[schemas.ProductResponse], status_code=status.HTTP_200_OK)
async def get_products(db: AsyncSession = Depends(get_db)):
    """Retrieve all products."""
    service = ProductService(db)
    return await service.get_all_products()


@router.get("/{id}", response_model=schemas.ProductResponse, status_code=status.HTTP_200_OK)
async def get_product(id: UUID, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific product by ID."""
    service = ProductService(db)
    return await service.get_product_by_id(id)


@router.put("/{id}", response_model=schemas.ProductResponse, status_code=status.HTTP_200_OK)
async def update_product(id: UUID, product: schemas.ProductUpdate, db: AsyncSession = Depends(get_db)):
    """Update product details."""
    service = ProductService(db)
    return await service.update_product(id, product)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a product."""
    service = ProductService(db)
    await service.delete_product(id)