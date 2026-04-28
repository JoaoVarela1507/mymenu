from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import db
from app.routes.auth import router as auth_router
from app.routes.menu import router as menu_router
from app.core.config import settings
from app.core.files import UPLOADS_DIR

# Create FastAPI app
app = FastAPI(
    title="MyMenu API",
    description="Backend API for MyMenu Restaurant Management System with Password Reset Support",
    version="1.0.0"
)

# Configure CORS - Must be added FIRST before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB on startup"""
    db.connect_to_mongo()

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    db.close_mongo_connection()

# Include routers
app.include_router(auth_router)
app.include_router(menu_router)

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to MyMenu API",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "Authentication (register, login)",
            "Password Reset (forgot-password, reset-password)",
            "Restaurant Management",
            "Order Management"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected" if db.db is not None else "disconnected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=3000)
