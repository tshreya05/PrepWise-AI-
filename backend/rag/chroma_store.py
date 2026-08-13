import hashlib
from typing import Any

import chromadb
from chromadb.config import Settings as ChromaSettings

from config import get_settings
from rag.embeddings import EmbeddingService
from rag.vector_store import VectorStore
from utils.structured_logging import get_logger

logger = get_logger(__name__)


class ChromaVectorStore(VectorStore):
    """Persistent ChromaDB store with metadata filtering."""

    def __init__(self):
        settings = get_settings()
        self.persist_dir = settings.chroma_persist_dir
        self.embedding_service = EmbeddingService()
        self._client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )

    def _get_or_create(self, collection: str):
        return self._client.get_or_create_collection(
            name=collection,
            metadata={"hnsw:space": "cosine"},
        )

    @staticmethod
    def _doc_id(content: str, metadata: dict) -> str:
        raw = content + str(sorted(metadata.items()))
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    def upsert(self, collection: str, documents: list[dict[str, Any]]) -> int:
        if not documents:
            return 0
        col = self._get_or_create(collection)
        texts = [d["content"] for d in documents]
        metadatas = [d.get("metadata", {}) for d in documents]
        ids = [self._doc_id(t, m) for t, m in zip(texts, metadatas)]

        # Skip duplicates already in collection
        existing = set()
        try:
            if col.count() > 0:
                got = col.get(ids=ids)
                existing = set(got.get("ids") or [])
        except Exception:
            pass

        new_texts, new_metas, new_ids = [], [], []
        for text, meta, doc_id in zip(texts, metadatas, ids):
            if doc_id not in existing:
                new_texts.append(text)
                new_metas.append({k: str(v) for k, v in meta.items()})
                new_ids.append(doc_id)

        if not new_texts:
            logger.info("chroma_upsert_skipped_duplicates", extra={"collection": collection})
            return 0

        embeddings = self.embedding_service.embed_texts(new_texts)
        col.upsert(ids=new_ids, documents=new_texts, metadatas=new_metas, embeddings=embeddings)
        logger.info("chroma_upsert", extra={"collection": collection, "count": len(new_texts)})
        return len(new_texts)

    def query(
        self,
        collection: str,
        query_text: str,
        k: int = 6,
        where: dict[str, Any] | None = None,
        score_threshold: float | None = None,
    ) -> list[dict[str, Any]]:
        settings = get_settings()
        threshold = score_threshold if score_threshold is not None else settings.retrieval_score_threshold
        try:
            col = self._client.get_collection(collection)
        except Exception:
            logger.warning("chroma_collection_missing", extra={"collection": collection})
            return []

        if col.count() == 0:
            return []

        query_embedding = self.embedding_service.embed_query(query_text)
        results = col.query(
            query_embeddings=[query_embedding],
            n_results=min(k, col.count()),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        chunks: list[dict[str, Any]] = []
        docs = (results.get("documents") or [[]])[0]
        metas = (results.get("metadatas") or [[]])[0]
        dists = (results.get("distances") or [[]])[0]

        for doc, meta, dist in zip(docs, metas, dists):
            # Chroma cosine distance: 0 = identical. Convert to similarity score.
            score = 1.0 - float(dist)
            if score < threshold:
                continue
            chunks.append({"content": doc, "metadata": meta or {}, "score": round(score, 4)})

        chunks.sort(key=lambda x: x["score"], reverse=True)
        return self._deduplicate(chunks)

    @staticmethod
    def _deduplicate(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
        seen: set[str] = set()
        unique: list[dict[str, Any]] = []
        for chunk in chunks:
            key = chunk["content"][:200].strip().lower()
            if key in seen:
                continue
            seen.add(key)
            unique.append(chunk)
        return unique

    def delete_collection(self, collection: str) -> None:
        try:
            self._client.delete_collection(collection)
            logger.info("chroma_collection_deleted", extra={"collection": collection})
        except Exception as exc:
            logger.warning("chroma_delete_failed", extra={"collection": collection, "error": str(exc)})

    def collection_stats(self, collection: str) -> dict[str, Any]:
        try:
            col = self._client.get_collection(collection)
            count = col.count()
            sample = col.peek(limit=min(count, 5)) if count else {}
            return {"collection": collection, "chunk_count": count, "sample_metadata": sample.get("metadatas", [])}
        except Exception:
            return {"collection": collection, "chunk_count": 0, "sample_metadata": []}
