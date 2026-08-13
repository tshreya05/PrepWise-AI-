from langchain_openai import OpenAIEmbeddings

from config import get_settings
from utils.structured_logging import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """OpenAI embeddings wrapper used by ChromaDB."""

    def __init__(self):
        settings = get_settings()
        if not settings.openai_api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is required for embeddings. "
                "Set it in backend/.env before starting the server."
            )
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key,
        )

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return self.embeddings.embed_documents(texts)

    def embed_query(self, text: str) -> list[float]:
        return self.embeddings.embed_query(text)
