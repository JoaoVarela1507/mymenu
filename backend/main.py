from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.firebase_admin import get_firebase_app
from app.routes.auth import router as auth_router
from app.routes.restaurant import router as restaurant_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_firebase_app()
    print("Firebase Admin inicializado")
    yield
    print("Servidor encerrado")


app = FastAPI(
    title="MyMenu API",
    description="Backend API for MyMenu Restaurant Management System",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(restaurant_router)


@app.get("/")
async def root():
    return {"message": "MyMenu API v2.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
