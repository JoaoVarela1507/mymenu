from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret_key: str = "mymenu1234"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "mylena08@gmail.com"
    smtp_password: str = "jhmbocfbjmwnvlaz"
    frontend_url: str = "http://localhost:5173"
    firebase_service_account: str = "firebase-service-account.json"

    class Config:
        env_file = ".env"


settings = Settings()
