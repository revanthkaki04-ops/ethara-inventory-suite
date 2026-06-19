from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# Product Schemas
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, description="Name of the product")
    sku: str = Field(..., min_length=1, description="Stock Keeping Unit (SKU)")
    price: float = Field(..., ge=0.0, description="Unit price of the product")
    quantity: int = Field(..., ge=0, description="Available stock quantity")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    sku: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, ge=0.0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, description="Full name of the customer")
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", description="Email address")
    phone: str = Field(..., min_length=1, description="Phone number")

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity ordered (must be positive)")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductResponse

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of items in the order")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    order_date: datetime
    total_amount: float
    customer: CustomerResponse
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
