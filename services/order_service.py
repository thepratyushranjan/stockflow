from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from decimal import Decimal

from db.models.models import Order, OrderItem, Product, Customer
from db.models.schemas import OrderCreate


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_orders(self):
        result = await self.db.execute(
            select(Order).options(selectinload(Order.items))
        )
        return result.scalars().all()

    async def get_order_by_id(self, order_id: UUID):
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .filter(Order.id == order_id)
        )
        order = result.scalars().first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found.",
            )
        return order

    async def create_order(self, order_data: OrderCreate):
        # Validate customer exists
        result = await self.db.execute(
            select(Customer).filter(Customer.id == order_data.customer_id)
        )
        if not result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {order_data.customer_id} not found.",
            )

        total_amount = Decimal("0.00")
        order_items = []

        for item in order_data.items:
            # Fetch product
            result = await self.db.execute(
                select(Product).filter(Product.id == item.product_id)
            )
            product = result.scalars().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found.",
                )

            # Check stock availability
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock_quantity}, Requested: {item.quantity}.",
                )

            # Reduce stock
            product.stock_quantity -= item.quantity

            # Calculate line total
            line_total = product.price * item.quantity
            total_amount += line_total

            order_items.append(
                OrderItem(
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=product.price,
                )
            )

        new_order = Order(
            customer_id=order_data.customer_id,
            total_amount=total_amount,
            items=order_items,
        )

        self.db.add(new_order)
        await self.db.commit()

        # Re-fetch with eager-loaded items for the response
        return await self.get_order_by_id(new_order.id)

    async def delete_order(self, order_id: UUID):
        order = await self.get_order_by_id(order_id)

        # Restore stock for each item
        for item in order.items:
            result = await self.db.execute(
                select(Product).filter(Product.id == item.product_id)
            )
            product = result.scalars().first()
            if product:
                product.stock_quantity += item.quantity

        await self.db.delete(order)
        await self.db.commit()
        return {"detail": "Order successfully deleted."}
