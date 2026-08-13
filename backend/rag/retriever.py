from dataclasses import dataclass, field
from typing import Any

from config import get_settings
from rag.chroma_store import ChromaVectorStore
from rag.chunker import DocumentChunker
from rag.knowledge_base import KnowledgeBaseIngester
from utils.structured_logging import LatencyTracker, get_logger

logger = get_logger(__name__)


@dataclass
class RetrievalContext:
    """Structured retrieval output used by prompt construction."""
    chunks: list[dict[str, Any]] = field(default_factory=list)
    query: str = ""
    sources: list[str] = field(default_factory=list)
    fallback_used: bool = False
    fallback_reason: str = ""

    @property
    def text(self) -> str:
        if not self.chunks:
            return ""
        parts = []
        for i, chunk in enumerate(self.chunks, 1):
            meta = chunk.get("metadata", {})
            source = meta.get("source", "unknown")
            parts.append(f"[{i}] ({source}, score={chunk.get('score', 'N/A')}): {chunk['content']}")
        combined = "\n\n".join(parts)
        return combined[: get_settings().max_context_chars]

    def to_log_dict(self) -> dict:
        return {
            "query": self.query,
            "chunk_count": len(self.chunks),
            "sources": self.sources,
            "fallback_used": self.fallback_used,
            "scores": [c.get("score") for c in self.chunks],
        }


class RAGRetriever:
    """
    Production retriever combining user documents (resume/JD) and global knowledge base.
    Never bypasses retrieval — uses graceful fallback when scores are low.
    """

    USER_PREFIX = "user_"
    KB_COLLECTION = KnowledgeBaseIngester.COLLECTION

    def __init__(self):
        self.vector_store = ChromaVectorStore()
        self.chunker = DocumentChunker()
        self.kb_ingester = KnowledgeBaseIngester(self.vector_store)

    def ensure_knowledge_base(self) -> None:
        self.kb_ingester.ingest(force=False)

    def _user_collection(self, user_id: int) -> str:
        return f"{self.USER_PREFIX}{user_id}"

    def index_user_documents(
        self,
        user_id: int,
        resume_text: str,
        jd_text: str,
        role: str = "",
    ) -> int:
        """Re-index resume and JD for a user. Replaces prior user collection."""
        collection = self._user_collection(user_id)
        self.vector_store.delete_collection(collection)

        texts, metadatas = [], []
        if resume_text:
            texts.append(resume_text)
            metadatas.append({"source": "resume", "user_id": str(user_id), "role": role})
        if jd_text:
            texts.append(jd_text)
            metadatas.append({"source": "job_description", "user_id": str(user_id), "role": role})

        if not texts:
            return 0

        chunks = self.chunker.chunk_documents(texts, metadatas)
        return self.vector_store.upsert(collection, chunks)

    def retrieve(
        self,
        user_id: int,
        query: str,
        interview_type: str = "technical",
        role: str = "",
        conversation_history: list[dict] | None = None,
        previous_questions: list[str] | None = None,
        difficulty: int = 2,
        k: int | None = None,
    ) -> RetrievalContext:
        settings = get_settings()
        top_k = k or settings.retrieval_top_k
        self.ensure_knowledge_base()

        enriched_query = self._build_query(
            query, interview_type, role, conversation_history, previous_questions, difficulty
        )

        with LatencyTracker(logger, "retrieval", user_id=user_id, query=enriched_query[:120]):
            user_chunks = self.vector_store.query(
                self._user_collection(user_id),
                enriched_query,
                k=top_k,
            )
            kb_chunks = self.vector_store.query(
                self.KB_COLLECTION,
                enriched_query,
                k=top_k,
                where={"interview_type": interview_type} if interview_type != "general" else None,
            )

        merged = self._merge_and_rank(user_chunks, kb_chunks, top_k)

        ctx = RetrievalContext(chunks=merged, query=enriched_query)
        ctx.sources = list({c.get("metadata", {}).get("source", "?") for c in merged})

        if not merged:
            ctx.fallback_used = True
            ctx.fallback_reason = "No chunks met score threshold"
            logger.warning("retrieval_fallback", extra=ctx.to_log_dict())
        else:
            logger.info("retrieval_success", extra=ctx.to_log_dict())

        return ctx

    @staticmethod
    def _build_query(
        base: str,
        interview_type: str,
        role: str,
        history: list[dict] | None,
        previous_questions: list[str] | None,
        difficulty: int,
    ) -> str:
        parts = [base, f"interview type: {interview_type}", f"difficulty: {difficulty}"]
        if role:
            parts.append(f"role: {role}")
        if previous_questions:
            parts.append("avoid repeating: " + "; ".join(previous_questions[-3:]))
        if history:
            last = history[-2:]
            for item in last:
                parts.append(f"Q: {item.get('question', '')[:200]} A: {item.get('answer', '')[:200]}")
        return " | ".join(parts)

    @staticmethod
    def _merge_and_rank(user_chunks: list, kb_chunks: list, k: int) -> list[dict]:
        # Prefer resume/JD chunks, supplement with knowledge base
        combined = user_chunks + [c for c in kb_chunks if c not in user_chunks]
        combined.sort(key=lambda x: (
            1 if x.get("metadata", {}).get("source") in ("resume", "job_description") else 0,
            x.get("score", 0),
        ), reverse=True)
        return combined[:k]

    def get_user_stats(self, user_id: int) -> dict:
        return self.vector_store.collection_stats(self._user_collection(user_id))

    def get_kb_stats(self) -> dict:
        return self.vector_store.collection_stats(self.KB_COLLECTION)
