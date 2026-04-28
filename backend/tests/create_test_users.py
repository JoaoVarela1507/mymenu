import os
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from app.core.security import hash_password

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://adm_db_user:VqNlVtPec0YfAbuW@cluster0.ena4zbx.mongodb.net/?appName=Cluster0")
DATABASE_NAME = os.getenv("MONGODB_DB_NAME", "mymenu")

def create_test_users():
    try:
        client = MongoClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        users_collection = db["users"]
        
        print(f"Conectando a {DATABASE_NAME}...")
        
        test_users = [
            {
                "email": "admin@restaurante.com",
                "hashed_password": hash_password("123456"),
                "name": "Admin Restaurante",
                "role": "admin",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            {
                "email": "consumidor@email.com",
                "hashed_password": hash_password("123456"),
                "name": "Consumidor Teste",
                "role": "consumer",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        ]
        
        for user in test_users:
            existing = users_collection.find_one({"email": user["email"]})
            if existing:
                print(f"Removendo usuário existente: {user['email']}")
                users_collection.delete_one({"email": user["email"]})
        
        result = users_collection.insert_many(test_users)
        print(f"✅ Usuários de teste criados com sucesso!")
        print(f"   - admin@restaurante.com / 123456")
        print(f"   - consumidor@email.com / 123456")
        print(f"   IDs inseridos: {result.inserted_ids}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Erro ao criar usuários: {e}")
        raise

if __name__ == "__main__":
    create_test_users()
