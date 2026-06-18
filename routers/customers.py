from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from db.models.schemas import CustomerCreate, CustomerResponse
from db.session import get_db
from services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customer Management"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(customer: CustomerCreate, db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    return await service.create_customer(customer)


@router.get("/", response_model=List[CustomerResponse], status_code=status.HTTP_200_OK)
async def get_customers(db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    return await service.get_all_customers()


@router.get("/{id}", response_model=CustomerResponse, status_code=status.HTTP_200_OK)
async def get_customer(id: UUID, db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    return await service.get_customer_by_id(id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(id: UUID, db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    await service.delete_customer(id)
