# 💎 Ethara.AI - Inventory & Order Management System

A production-ready, full-stack Inventory & Order Management System built with a **Python (FastAPI)** backend, a **React** frontend, and a **PostgreSQL** database. The entire application is containerized with **Docker** and orchestrated using **Docker Compose**.

---

## 🌟 Key Features

- **Dashboard Panel**: Displays real-time summary statistics, including total products, customers, orders, and products with low stock levels (< 10 units).
- **Product Catalog Management**: Supports creating, retrieving, updating, and deleting products.
- **Customer Directory**: Supports registering new customers, retrieving customer details, and deletion.
- **Order Flow & Tracking**: Supports creating orders (multiple items per order), retrieving order details, and deleting (cancelling) orders.
- **Robust Business Logic**:
  - Automatically calculates order totals on the backend.
  - Enforces database constraints: unique product SKUs and unique customer emails.
  - Automatically validates stock availability before placing an order.
  - Automatically reduces stock levels when an order is created.
  - Automatically restores stock levels when an order is deleted (cancelled).
- **Modern Premium UI/UX**: Built with an elegant dark mode, glassmorphism panel elements, status indicators, and micro-animations.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Uvicorn, PostgreSQL (production) / SQLite (local dev fallback)
- **Frontend**: React (Vite), Lucide Icons, Custom Premium Glassmorphic Vanilla CSS styling
- **Database**: PostgreSQL 15 (containerized)
- **Containerization**: Docker, Docker Compose
- **Deployment**: Render / Railway (Backend), Vercel / Netlify (Frontend)

---

## 🚀 Getting Started (Local Run)

### 1. Backend Server Setup
Navigate to the `backend` folder:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI application:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Frontend React Setup
Navigate to the `frontend` folder:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🐳 Docker Compose Orchestration (Recommended)

To run the entire multi-container stack (React Frontend + FastAPI Backend + PostgreSQL Database) with single-command setup, use Docker Compose.

At the root directory of the project, run:
```bash
docker-compose up --build
```

This will launch:
1. **Database**: PostgreSQL database service running on port `5432` with named volumes for data persistence.
2. **Backend**: FastAPI app running on port `8000`.
3. **Frontend**: React application served via Nginx on port `3000`.

---

## ☁️ Deployment Guide

### 1. Backend API Deployment (Render / Railway)
- **Service Type**: Web Service
- **Environment**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: Your hosted PostgreSQL connection string (e.g., from Render PostgreSQL instance or Supabase).

### 2. Frontend React Deployment (Vercel / Netlify)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: The public URL of your deployed Backend API.

---

## 📂 Project Structure

```
ethara.ai/
├── backend/
│   ├── app/
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # Database engine and session lifecycle
│   │   ├── models.py       # SQLAlchemy database schemas
│   │   ├── schemas.py      # Pydantic validation schemas
│   │   ├── crud.py         # Database CRUD actions & business rules
│   │   └── main.py         # FastAPI app routes & CORS configuration
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Views (Dashboard, Products, Customers, Orders)
│   │   ├── utils/
│   │   │   └── api.js      # Frontend API client
│   │   ├── App.jsx         # App shell & navigation layout
│   │   ├── App.css         # Styling system & theme
│   │   └── main.jsx        # Mount point
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf          # Nginx static server rules
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```
