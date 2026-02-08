from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    BETTER_AUTH_SECRET: str
    GEMINI_API_KEY: str
    MCP_HOST: str = "0.0.0.0"
    MCP_PORT: int = 8080

    # Derived async URL for asyncpg
    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )


settings = Settings()
