from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from db.models.schemas import OrderCreate, OrderResponse
from db.session import get_db
from services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Order Management"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    return await service.create_order(order)


@router.get("/", response_model=List[OrderResponse], status_code=status.HTTP_200_OK)
async def get_orders(db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    return await service.get_all_orders()


@router.get("/{id}", response_model=OrderResponse, status_code=status.HTTP_200_OK)
async def get_order(id: UUID, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    return await service.get_order_by_id(id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(id: UUID, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    await service.delete_order(id)
