from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.future import select
from fastapi import HTTPException, status
from uuid import UUID

from db.models import models, schemas

class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_products(self):
        result = await self.db.execute(select(models.Product))
        return result.scalars().all()

    async def get_product_by_id(self, product_id: UUID):
        result = await self.db.execute(select(models.Product).filter(models.Product.id == product_id))
        product = result.scalars().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Product with ID {product_id} not found."
            )
        return product

    async def create_product(self, product_data: schemas.ProductCreate):
        result = await self.db.execute(select(models.Product).filter(models.Product.sku == product_data.sku))
        existing_product = result.scalars().first()
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Product with SKU '{product_data.sku}' already exists."
            )

        new_product = models.Product(**product_data.model_dump())
        
        try:
            self.db.add(new_product)
            await self.db.commit()
            await self.db.refresh(new_product)
            return new_product
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Database integrity error. Check your input data."
            )

    async def update_product(self, product_id: UUID, product_data: schemas.ProductUpdate):
        product = await self.get_product_by_id(product_id)
        update_data = product_data.model_dump(exclude_unset=True)
        if "sku" in update_data and update_data["sku"] != product.sku:
            result = await self.db.execute(select(models.Product).filter(models.Product.sku == update_data["sku"]))
            existing_sku = result.scalars().first()
            if existing_sku:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Product with SKU '{update_data['sku']}' already exists."
                )
        for key, value in update_data.items():
            setattr(product, key, value)

        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def delete_product(self, product_id: UUID):
        product = await self.get_product_by_id(product_id)
        
        await self.db.delete(product)
        await self.db.commit()
        return {"detail": "Product successfully deleted."}