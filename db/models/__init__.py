# Import all models here to ensure they are registered with SQLAlchemy
# This is important for Alembic migrations to detect them

from db.models.models import Customer, Product, Order, OrderItem

__all__ = ["Customer", "Product", "Order", "OrderItem"]
