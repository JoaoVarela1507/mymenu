from pydantic import BaseModel, EmailStr, Field

class RegisterRestaurantRequest(BaseModel):
    # Admin
    name: str
    email: EmailStr
    password: str = Field(default="", min_length=0)
    phone: str
    # Restaurante
    restaurant_name: str
    cnpj: str
    restaurant_phone: str
    category: str
    address: str
    city: str
    state: str
    cep: str
    description: str = ""

class RegisterRestaurantResponse(BaseModel):
    success: bool
    message: str
    uid: str = ""
