from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID

from db.models.models import Customer
from db.models.schemas import CustomerCreate


class CustomerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_customers(self):
        result = await self.db.execute(select(Customer))
        return result.scalars().all()

    async def get_customer_by_id(self, customer_id: UUID):
        result = await self.db.execute(
            select(Customer).filter(Customer.id == customer_id)
        )
        customer = result.scalars().first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found.",
            )
        return customer

    async def create_customer(self, customer_data: CustomerCreate):
        result = await self.db.execute(
            select(Customer).filter(Customer.email == customer_data.email)
        )
        existing_customer = result.scalars().first()
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A customer with the email '{customer_data.email}' already exists.",
            )

        new_customer = Customer(**customer_data.model_dump())

        try:
            self.db.add(new_customer)
            await self.db.commit()
            await self.db.refresh(new_customer)
            return new_customer
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database integrity error. Check your input data.",
            )

    async def delete_customer(self, customer_id: UUID):
        customer = await self.get_customer_by_id(customer_id)
        await self.db.delete(customer)
        await self.db.commit()
        return {"detail": "Customer successfully deleted."}
