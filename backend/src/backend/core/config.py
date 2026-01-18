from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "DoIt API"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Security
    BETTER_AUTH_SECRET: str

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore"
    )

settings = Settings()
