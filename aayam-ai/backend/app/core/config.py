import os
class Settings:
    app_name = "Aayam AI"
    api_prefix = "/api/v1"
    database_url = os.getenv("DATABASE_URL", "sqlite:///./aayam.db")
    jwt_secret = os.getenv("JWT_SECRET", "change-me-in-production")
    access_token_minutes = int(os.getenv("ACCESS_TOKEN_MINUTES", "720"))
settings = Settings()
