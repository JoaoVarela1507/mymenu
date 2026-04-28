from typing import Literal, Optional

from pydantic import BaseModel, Field


class MenuCategoryRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    order: int = Field(..., ge=1)


class MenuCategoryResponse(BaseModel):
    id: str
    restaurant_id: str
    name: str
    order: int


class MenuPricesResponse(BaseModel):
    mymenu: float
    ifood: float = 0
    ubereats: float = 0
    rappi: float = 0


class MenuItemResponse(BaseModel):
    id: str
    restaurant_id: str
    category_id: str
    name: str
    description: Optional[str] = None
    ingredients: Optional[str] = None
    image_url: Optional[str] = None
    prices: MenuPricesResponse
    available: bool
    exclusive: Optional[Literal["delivery", "presencial"]] = None
    allergens: list[str] = []
    is_offer: bool = False
    offer_price: Optional[float] = None
