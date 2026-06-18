from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from db.models.models import Product, Customer, Order

LOW_STOCK_THRESHOLD = 10


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_summary(self):
        total_products = (await self.db.execute(select(func.count(Product.id)))).scalar() or 0
        total_customers = (await self.db.execute(select(func.count(Customer.id)))).scalar() or 0
        total_orders = (await self.db.execute(select(func.count(Order.id)))).scalar() or 0

        result = await self.db.execute(
            select(Product).filter(Product.stock_quantity < LOW_STOCK_THRESHOLD)
        )
        low_stock_products = result.scalars().all()

        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_products": low_stock_products,
        }
