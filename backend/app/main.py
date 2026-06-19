from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import engine, Base, SessionLocal, get_db
from . import models, schemas, crud

app = FastAPI(title="Ethara AI - Inventory & Order Management System")

# Enable CORS so the React frontend can talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup handler to auto-create schemas and seed the database with sample data
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Products if empty
        if db.query(models.Product).count() == 0:
            products = [
                models.Product(name="Quantum Wireless Headset", sku="HW-HD-001", price=149.99, quantity=25),
                models.Product(name="Apex Mechanical Keyboard", sku="KB-ME-002", price=119.99, quantity=6),
                models.Product(name="Ergonomic Mesh Chair", sku="CH-ER-003", price=299.99, quantity=15),
                models.Product(name="UltraWide curved Monitor 34\"", sku="MN-UW-004", price=450.00, quantity=3),
                models.Product(name="USB-C Multiport Dock", sku="DK-UC-005", price=79.99, quantity=45),
            ]
            db.add_all(products)
            db.commit()

        # 2. Seed Customers if empty
        if db.query(models.Customer).count() == 0:
            customers = [
                models.Customer(name="Sarah Connor", email="sarah.connor@sky.net", phone="+1 (555) 321-4567"),
                models.Customer(name="Miles Dyson", email="miles.dyson@cyberdyne.com", phone="+1 (555) 765-4321"),
                models.Customer(name="John Connor", email="john.connor@resistance.org", phone="+1 (555) 890-1234"),
            ]
            db.add_all(customers)
            db.commit()
            
        # 3. Seed Order if empty
        if db.query(models.Order).count() == 0:
            sarah = db.query(models.Customer).filter_by(email="sarah.connor@sky.net").first()
            headset = db.query(models.Product).filter_by(sku="HW-HD-001").first()
            keyboard = db.query(models.Product).filter_by(sku="KB-ME-002").first()
            
            if sarah and headset and keyboard:
                # Reduce stock
                headset.quantity -= 1
                keyboard.quantity -= 1
                
                db_order = models.Order(
                    customer_id=sarah.id,
                    total_amount=headset.price * 1 + keyboard.price * 1
                )
                db.add(db_order)
                db.flush()
                
                item1 = models.OrderItem(order_id=db_order.id, product_id=headset.id, quantity=1, unit_price=headset.price)
                item2 = models.OrderItem(order_id=db_order.id, product_id=keyboard.id, quantity=1, unit_price=keyboard.price)
                db.add_all([item1, item2])
                db.commit()
    finally:
        db.close()

# --- Product Endpoints ---
@app.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = crud.get_product_by_sku(db, product.sku)
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"SKU '{product.sku}' is already assigned to a product."
        )
    return crud.create_product(db=db, product=product)

@app.get("/products", response_model=List[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.get("/products/{id}", response_model=schemas.ProductResponse)
def read_product(id: int, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return db_product

@app.put("/products/{id}", response_model=schemas.ProductResponse)
def update_product(id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    
    # Check SKU uniqueness if it's changing
    if product_update.sku and product_update.sku != db_product.sku:
        existing_sku = crud.get_product_by_sku(db, product_update.sku)
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SKU '{product_update.sku}' is already assigned to another product."
            )
            
    return crud.update_product(db=db, product_id=id, product_update=product_update)

@app.delete("/products/{id}", response_model=schemas.ProductResponse)
def delete_product(id: int, db: Session = Depends(get_db)):
    # Check if product is in any orders
    in_orders = db.query(models.OrderItem).filter(models.OrderItem.product_id == id).first()
    if in_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product as it is referenced in existing orders. Cancel/delete those orders first."
        )
    db_product = crud.delete_product(db, product_id=id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return db_product

# --- Customer Endpoints ---
@app.post("/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = crud.get_customer_by_email(db, customer.email)
    if db_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{customer.email}' is already registered to a customer."
        )
    return crud.create_customer(db=db, customer=customer)

@app.get("/customers", response_model=List[schemas.CustomerResponse])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_customers(db, skip=skip, limit=limit)

@app.get("/customers/{id}", response_model=schemas.CustomerResponse)
def read_customer(id: int, db: Session = Depends(get_db)):
    db_customer = crud.get_customer(db, customer_id=id)
    if not db_customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    return db_customer

@app.delete("/customers/{id}", response_model=schemas.CustomerResponse)
def delete_customer(id: int, db: Session = Depends(get_db)):
    # Check if customer has any orders
    has_orders = db.query(models.Order).filter(models.Order.customer_id == id).first()
    if has_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete customer who has placed orders. Delete the orders first."
        )
    db_customer = crud.delete_customer(db, customer_id=id)
    if not db_customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    return db_customer

# --- Order Endpoints ---
@app.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_order(db=db, order_in=order)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.get("/orders", response_model=List[schemas.OrderResponse])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_orders(db, skip=skip, limit=limit)

@app.get("/orders/{id}", response_model=schemas.OrderResponse)
def read_order(id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=id)
    if not db_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return db_order

@app.delete("/orders/{id}", response_model=schemas.OrderResponse)
def delete_order(id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=id)
    if not db_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    
    # Eagerly serialize the order details to Pydantic before deleting from the DB
    order_response = schemas.OrderResponse.model_validate(db_order)
    
    # Perform the deletion (restores stock and deletes from DB)
    crud.delete_order(db, order_id=id)
    
    return order_response

# --- Dashboard & Stats Endpoints ---
@app.get("/dashboard/stats")
def read_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    
    # Low stock products are those with quantity < 10
    low_stock_products = db.query(models.Product).filter(models.Product.quantity < 10).all()
    low_stock_products_count = len(low_stock_products)
    
    # Recent orders limit to 5
    recent_orders = db.query(models.Order).order_by(models.Order.id.desc()).limit(5).all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products_count": low_stock_products_count,
        "low_stock_products": [schemas.ProductResponse.model_validate(p) for p in low_stock_products],
        "recent_orders": [
            {
                "id": o.id,
                "order_date": o.order_date,
                "total_amount": o.total_amount,
                "customer_name": o.customer.name,
                "items_count": len(o.items)
            }
            for o in recent_orders
        ]
    }
