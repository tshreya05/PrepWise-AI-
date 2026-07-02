from langchain_community.vectorstores import FAISS

from config import get_settings
from rag.embeddings import EmbeddingService
from utils.logging_config import get_logger

logger = get_logger(__name__)


class VectorStoreManager:
    def __init__(self):
        settings = get_settings()
        self.store_dir = settings.vector_store_dir
        self.embedding_service = EmbeddingService()

    def _get_store_path(self, user_id: int) -> str:
        return f"{self.store_dir}/user_{user_id}"

    def build_index(self, user_id: int, documents: list[dict]) -> FAISS | None:
        if not documents:
            return None
        settings = get_settings()
        if not settings.openai_api_key:
            logger.warning("No OpenAI API key - RAG index not built")
            return None

        texts = [d["content"] for d in documents]
        metadatas = [d.get("metadata", {}) for d in documents]
        vectorstore = FAISS.from_texts(
            texts,
            self.embedding_service.embeddings,
            metadatas=metadatas,
        )
        path = self._get_store_path(user_id)
        vectorstore.save_local(path)
        logger.info("Built FAISS index for user %d with %d chunks", user_id, len(texts))
        return vectorstore

    def load_index(self, user_id: int) -> FAISS | None:
        settings = get_settings()
        if not settings.openai_api_key:
            return None
        path = self._get_store_path(user_id)
        try:
            return FAISS.load_local(
                path,
                self.embedding_service.embeddings,
                allow_dangerous_deserialization=True,
            )
        except Exception:
            logger.warning("No existing FAISS index for user %d", user_id)
            return None
