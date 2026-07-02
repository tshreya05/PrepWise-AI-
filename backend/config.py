from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    openai_api_key: str = ""
    secret_key: str = "prepwise-dev-secret-key-change-in-production"
    database_url: str = "sqlite:///./data/prepwise.db"
    embedding_model: str = "text-embedding-3-small"
    llm_model: str = "gpt-4o-mini"
    stt_provider: str = "openai"
    tts_provider: str = "openai"
    tts_voice: str = "alloy"
    log_level: str = "INFO"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    upload_dir: str = "./uploads"
    vector_store_dir: str = "./vector_store"
    chunk_size: int = 500
    chunk_overlap: int = 50

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
