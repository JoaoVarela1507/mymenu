from datetime import datetime
from typing import Optional

from bson import ObjectId


class MenuCategory:
    def __init__(
        self,
        restaurant_id: ObjectId,
        name: str,
        order: int,
        normalized_name: str,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        _id: Optional[ObjectId] = None,
    ):
        self._id = _id
        self.restaurant_id = restaurant_id
        self.name = name
        self.order = order
        self.normalized_name = normalized_name
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        return {
            "_id": self._id,
            "restaurant_id": self.restaurant_id,
            "name": self.name,
            "order": self.order,
            "normalized_name": self.normalized_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
