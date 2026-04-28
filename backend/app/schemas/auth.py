from typing import Optional

from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    name: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    name: str
    role: str
    restaurant_id: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="New password must be at least 8 characters")

class SuccessResponse(BaseModel):
    message: str
    success: bool


class RestaurantRegisterResponse(SuccessResponse):
    restaurant_id: str
    user_id: str
