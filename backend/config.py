from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API keys
    openai_api_key: str = ""

    # Security
    secret_key: str = "prepwise-dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Database (non-auth entities)
    database_url: str = "sqlite:///./data/prepwise.db"

    # JSON auth storage
    users_json_path: str = "./data/users.json"
    sessions_json_path: str = "./data/sessions.json"

    # LLM
    llm_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    llm_temperature: float = 0.7
    llm_max_retries: int = 3

    # Speech providers (faster-whisper | openai | coqui for STT; piper | coqui | openai for TTS)
    stt_provider: str = "faster-whisper"
    tts_provider: str = "piper"
    tts_voice: str = "en_US-lessac-medium"
    faster_whisper_model: str = "base"
    piper_model_path: str = "./models/piper"
    coqui_model: str = "tts_models/en/ljspeech/tacotron2-DDC"

    # RAG / ChromaDB
    chroma_persist_dir: str = "./vector_store/chroma"
    knowledge_base_dir: str = "../knowledgebase"
    chunk_size: int = 500
    chunk_overlap: int = 50
    retrieval_top_k: int = 6
    retrieval_score_threshold: float = 0.35
    max_context_chars: int = 4000

    # Paths
    upload_dir: str = "./uploads"
    evaluation_log_dir: str = "./data/evaluations"

    # Logging
    log_level: str = "INFO"
    log_json: bool = False

    # Interview
    default_total_questions: int = 5
    min_difficulty: int = 1
    max_difficulty: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
