from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import timedelta
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SuccessResponse
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_reset_token,
    verify_reset_token
)
from app.core.email import send_reset_email
from app.core.database import db
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """
    Register a new user (consumer or admin)
    """
    try:
        users_collection = db.get_db()["users"]
        
        # Check if user already exists
        existing_user = users_collection.find_one({"email": request.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate role
        if request.role not in ["consumer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'consumer' or 'admin'"
            )
        
        # Hash password
        hashed_password = hash_password(request.password)
        
        # Create user
        user = User(
            email=request.email,
            hashed_password=hashed_password,
            name=request.name,
            role=request.role
        )
        
        # Insert into database
        result = users_collection.insert_one(user.to_dict())
        
        return SuccessResponse(
            message=f"User registered successfully with ID: {result.inserted_id}",
            success=True
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering user: {str(e)}"
        )

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login with email and password
    Returns access token and user information
    """
    try:
        users_collection = db.get_db()["users"]
        
        # Find user by email
        user_data = users_collection.find_one({"email": request.email})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(request.password, user_data["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user_data["_id"]), "email": user_data["email"], "role": user_data["role"]},
            expires_delta=access_token_expires
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=str(user_data["_id"]),
            email=user_data["email"],
            name=user_data["name"],
            role=user_data["role"]
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during login: {str(e)}"
        )

@router.post("/forgot-password", response_model=SuccessResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Request password reset - sends reset email
    """
    try:
        users_collection = db.get_db()["users"]
        
        # Find user by email
        user_data = users_collection.find_one({"email": request.email})
        if not user_data:
            # Don't reveal if email exists or not (security best practice)
            return SuccessResponse(
                message="If an account with this email exists, a reset link has been sent",
                success=True
            )
        
        # Create reset token
        reset_token = create_reset_token(request.email)
        
        # Send reset email
        email_sent = send_reset_email(request.email, reset_token)
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send reset email. Please try again later."
            )
        
        return SuccessResponse(
            message="If an account with this email exists, a reset link has been sent",
            success=True
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing forgot password: {str(e)}"
        )

@router.post("/reset-password", response_model=SuccessResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password using reset token.
    Requires a valid reset token and a new password with at least 8 characters.
    """
    try:
        # Validate password length
        if len(request.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long"
            )
        
        # Verify reset token
        email = verify_reset_token(request.token)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        users_collection = db.get_db()["users"]
        
        # Find user by email
        user_data = users_collection.find_one({"email": email})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash new password
        hashed_password = hash_password(request.new_password)
        
        # Update password in database
        users_collection.update_one(
            {"_id": user_data["_id"]},
            {"$set": {"hashed_password": hashed_password}}
        )
        
        return SuccessResponse(
            message="Password reset successfully",
            success=True
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting password: {str(e)}"
        )
