from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import db
from app.routes.auth import router as auth_router
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title="MyMenu API",
    description="Backend API for MyMenu Restaurant Management System with Password Reset Support",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "database": "connected" if db.db else "disconnected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
