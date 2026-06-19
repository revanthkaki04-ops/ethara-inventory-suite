from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Default to SQLite for easy local setup, overridden by docker-compose/production env to PostgreSQL
    DATABASE_URL: str = "sqlite:///./inventory.db"
    PROJECT_NAME: str = "Inventory & Order Management API"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
