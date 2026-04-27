from bson import ObjectId
from typing import Optional
from datetime import datetime

class User:
    def __init__(
        self,
        email: str,
        hashed_password: str,
        name: str,
        role: str,
        created_at: datetime = None,
        updated_at: datetime = None,
        _id: Optional[ObjectId] = None
    ):
        self._id = _id
        self.email = email
        self.hashed_password = hashed_password
        self.name = name
        self.role = role  # "consumer" or "admin"
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        return {
            "_id": self._id,
            "email": self.email,
            "hashed_password": self.hashed_password,
            "name": self.name,
            "role": self.role,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
