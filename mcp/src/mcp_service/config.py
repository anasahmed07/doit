from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

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
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)

        # asyncpg doesn't support sslmode/channel_binding query params —
        # strip them and pass ssl=require via connect_args instead
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        params.pop("sslmode", None)
        params.pop("channel_binding", None)
        clean_query = urlencode(params, doseq=True)
        url = urlunparse(parsed._replace(query=clean_query))
        return url

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )


settings = Settings()
