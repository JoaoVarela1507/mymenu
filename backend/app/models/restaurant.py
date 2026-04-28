from datetime import datetime
from typing import Optional

from bson import ObjectId


class Restaurant:
    def __init__(
        self,
        name: str,
        cnpj: str,
        phone: str,
        address: str,
        category: str,
        document_url: str,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        _id: Optional[ObjectId] = None,
    ):
        self._id = _id
        self.name = name
        self.cnpj = cnpj
        self.phone = phone
        self.address = address
        self.category = category
        self.document_url = document_url
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        return {
            "_id": self._id,
            "name": self.name,
            "cnpj": self.cnpj,
            "phone": self.phone,
            "address": self.address,
            "category": self.category,
            "document_url": self.document_url,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
