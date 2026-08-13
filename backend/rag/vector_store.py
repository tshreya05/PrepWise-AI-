from abc import ABC, abstractmethod
from typing import Any


class VectorStore(ABC):
    """Abstract vector store — ChromaDB today, swappable later."""

    @abstractmethod
    def upsert(self, collection: str, documents: list[dict[str, Any]]) -> int:
        """Insert or replace documents. Returns chunk count."""

    @abstractmethod
    def query(
        self,
        collection: str,
        query_text: str,
        k: int = 6,
        where: dict[str, Any] | None = None,
        score_threshold: float | None = None,
    ) -> list[dict[str, Any]]:
        """Return ranked chunks with content, metadata, score."""

    @abstractmethod
    def delete_collection(self, collection: str) -> None:
        pass

    @abstractmethod
    def collection_stats(self, collection: str) -> dict[str, Any]:
        pass
