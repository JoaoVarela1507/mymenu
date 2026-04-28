from pymongo import MongoClient
from typing import Optional
from app.core.config import settings


class Database:
    client: Optional[MongoClient] = None
    db = None

    @staticmethod
    def connect_to_mongo():
        try:
            Database.client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
            Database.client.admin.command('ping')
            Database.db = Database.client[settings.database_name]
            Database.ensure_indexes()
            print("Connected to MongoDB")
        except Exception as e:
            print(f"Warning: Could not connect to MongoDB: {e}")
            print("Running in demo/offline mode - menu routes will not be available")
            Database.db = None
            Database.client = None

    @staticmethod
    def close_mongo_connection():
        if Database.client is not None:
            try:
                Database.client.close()
                print("Closed MongoDB connection")
            except Exception:
                pass

    @staticmethod
    def get_db():
        return Database.db

    @staticmethod
    def ensure_indexes():
        if Database.db is None:
            return

        try:
            Database.db["users"].create_index("email", unique=True)
            Database.db["restaurants"].create_index("cnpj", unique=True)
            Database.db["menu_categories"].create_index(
                [("restaurant_id", 1), ("normalized_name", 1)],
                unique=True,
            )
            Database.db["menu_items"].create_index([("restaurant_id", 1), ("category_id", 1)])
        except Exception as e:
            print(f"Warning: Could not create indexes: {e}")

db = Database()
