from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


# PRODUCT SCHEMAS
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of the product")
    sku: str = Field(..., min_length=2, max_length=100, description="Unique Stock Keeping Unit")
    price: Decimal = Field(..., gt=0, decimal_places=2, description="Price must be strictly positive")
    stock_quantity: int = Field(..., ge=0, description="Stock cannot be negative")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=2, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CUSTOMER SCHEMAS
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr = Field(..., description="Must be a valid email address format")
    phone: Optional[str] = Field(None, max_length=50)

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ORDER ITEM SCHEMAS
class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0, description="Must order at least 1 item")

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal = Field(..., decimal_places=2)
    model_config = ConfigDict(from_attributes=True)

# ORDER SCHEMAS
class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    total_amount: Decimal = Field(..., decimal_places=2)
    created_at: datetime
    items: List[OrderItemResponse]
    model_config = ConfigDict(from_attributes=True)


# DASHBOARD SCHEMA
class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]