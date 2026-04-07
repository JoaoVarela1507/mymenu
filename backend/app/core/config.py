from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    mongodb_url: str = "mongodb+srv://adm_db_user:VqNlVtPec0YfAbuW@cluster0.ena4zbx.mongodb.net/?appName=Cluster0"
    database_name: str = "mymenu"
    jwt_secret_key: str = "mymenu1234"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "mylena08@gmail.com"
    smtp_password: str = "jhmbocfbjmwnvlaz"
    admin_email: str = "admin@mymenu.com"
    frontend_url: str = "http://localhost:3000"
    gmail_address: str = "mylena08@gmail.com"
    gmail_app_password: str = "jhmbocfbjmwnvlaz"

    class Config:
        env_file = ".env"

settings = Settings()
