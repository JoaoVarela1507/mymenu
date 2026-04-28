from datetime import timedelta

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.database import db
from app.core.email import send_reset_email
from app.core.files import delete_upload_file, save_upload_file
from app.core.security import (
    create_access_token,
    create_reset_token,
    hash_password,
    verify_password,
    verify_reset_token,
)
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ResetPasswordRequest,
    RestaurantRegisterResponse,
    SuccessResponse,
)
from app.core.config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    users_collection = db.get_db()["users"]

    existing_user = users_collection.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if request.role not in ["consumer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'consumer' or 'admin'",
        )

    hashed_password = hash_password(request.password)
    user = User(
        email=request.email,
        hashed_password=hashed_password,
        name=request.name,
        role=request.role,
    )

    result = users_collection.insert_one(user.to_dict())
    return SuccessResponse(
        message=f"User registered successfully with ID: {result.inserted_id}",
        success=True,
    )


@router.post(
    "/register-restaurant",
    response_model=RestaurantRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_restaurant(
    restaurant_name: str = Form(...),
    cnpj: str = Form(...),
    phone: str = Form(...),
    address: str = Form(...),
    category: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    document_file: UploadFile = File(...),
):
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    users_collection = db.get_db()["users"]
    restaurants_collection = db.get_db()["restaurants"]

    if users_collection.find_one({"email": email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if restaurants_collection.find_one({"cnpj": cnpj}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CNPJ already registered",
        )

    document_url = await save_upload_file(
        document_file,
        "restaurant-documents",
        {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"},
    )

    restaurant_id = None
    try:
        restaurant = Restaurant(
            name=restaurant_name,
            cnpj=cnpj,
            phone=phone,
            address=address,
            category=category,
            document_url=document_url,
        )
        restaurant_result = restaurants_collection.insert_one(restaurant.to_dict())
        restaurant_id = restaurant_result.inserted_id

        user = User(
            email=email,
            hashed_password=hash_password(password),
            name=name,
            role="admin",
            restaurant_id=restaurant_id,
        )
        user_result = users_collection.insert_one(user.to_dict())
    except Exception as exc:
        if restaurant_id is not None:
            restaurants_collection.delete_one({"_id": restaurant_id})
        delete_upload_file(document_url)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering restaurant: {exc}",
        ) from exc

    return RestaurantRegisterResponse(
        message="Restaurant registered successfully",
        success=True,
        restaurant_id=str(restaurant_id),
        user_id=str(user_result.inserted_id),
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    users_collection = db.get_db()["users"]

    user_data = users_collection.find_one({"email": request.email})
    if not user_data or not verify_password(request.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={
            "sub": str(user_data["_id"]),
            "email": user_data["email"],
            "role": user_data["role"],
            "restaurant_id": str(user_data["restaurant_id"]) if user_data.get("restaurant_id") else None,
        },
        expires_delta=access_token_expires,
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user_data["_id"]),
        email=user_data["email"],
        name=user_data["name"],
        role=user_data["role"],
        restaurant_id=str(user_data["restaurant_id"]) if user_data.get("restaurant_id") else None,
    )


@router.post("/forgot-password", response_model=SuccessResponse)
async def forgot_password(request: ForgotPasswordRequest):
    users_collection = db.get_db()["users"]
    user_data = users_collection.find_one({"email": request.email})
    if not user_data:
        return SuccessResponse(
            message="If an account with this email exists, a reset link has been sent",
            success=True,
        )

    reset_token = create_reset_token(request.email)
    email_sent = send_reset_email(request.email, reset_token)
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email. Please try again later.",
        )

    return SuccessResponse(
        message="If an account with this email exists, a reset link has been sent",
        success=True,
    )


@router.post("/reset-password", response_model=SuccessResponse)
async def reset_password(request: ResetPasswordRequest):
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    users_collection = db.get_db()["users"]
    user_data = users_collection.find_one({"email": email})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    users_collection.update_one(
        {"_id": user_data["_id"]},
        {"$set": {"hashed_password": hash_password(request.new_password)}},
    )

    return SuccessResponse(message="Password reset successfully", success=True)
