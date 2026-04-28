from datetime import datetime
from typing import Optional

from bson import ObjectId


class MenuItem:
    def __init__(
        self,
        restaurant_id: ObjectId,
        category_id: ObjectId,
        name: str,
        prices: dict,
        description: str | None = None,
        ingredients: str | None = None,
        image_url: str | None = None,
        available: bool = True,
        exclusive: str | None = None,
        allergens: list[str] | None = None,
        is_offer: bool = False,
        offer_price: float | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        _id: Optional[ObjectId] = None,
    ):
        self._id = _id
        self.restaurant_id = restaurant_id
        self.category_id = category_id
        self.name = name
        self.description = description
        self.ingredients = ingredients
        self.image_url = image_url
        self.prices = prices
        self.available = available
        self.exclusive = exclusive
        self.allergens = allergens or []
        self.is_offer = is_offer
        self.offer_price = offer_price
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        return {
            "_id": self._id,
            "restaurant_id": self.restaurant_id,
            "category_id": self.category_id,
            "name": self.name,
            "description": self.description,
            "ingredients": self.ingredients,
            "image_url": self.image_url,
            "prices": self.prices,
            "available": self.available,
            "exclusive": self.exclusive,
            "allergens": self.allergens,
            "is_offer": self.is_offer,
            "offer_price": self.offer_price,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
