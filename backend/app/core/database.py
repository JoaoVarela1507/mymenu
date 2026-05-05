from pymongo import MongoClient
from typing import Optional
from app.core.config import settings
import certifi

class Database:
    client: Optional[MongoClient] = None
    db = None

    @staticmethod
    def connect_to_mongo():
        Database.client = MongoClient(
            settings.mongodb_url,
            tlsCAFile=certifi.where(),
        )
        Database.db = Database.client[settings.database_name]
        print("Connected to MongoDB")

    @staticmethod
    def close_mongo_connection():
        if Database.client is not None:
            Database.client.close()
            print("Closed MongoDB connection")

    @staticmethod
    def get_db():
        return Database.db

db = Database()
