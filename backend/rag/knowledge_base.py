import re
from pathlib import Path
from typing import Any

from langchain.text_splitter import RecursiveCharacterTextSplitter

from config import get_settings
from utils.structured_logging import get_logger

logger = get_logger(__name__)

# Map knowledgebase folder names to interview types for metadata filtering
FOLDER_TYPE_MAP = {
    "hr": "hr",
    "behavioral": "behavioral",
    "technical": "technical",
    "projects": "projects",
    "system design": "system_design",
    "system_design": "system_design",
    "coding": "technical",
    "dsa": "technical",
    "ml": "technical",
    "ai": "technical",
}

SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv",
    "dist", "build", ".github", "solutions", "images", "assets",
}

SUPPORTED_EXTENSIONS = {".md", ".txt", ".markdown"}


class DocumentChunker:
    def __init__(self):
        settings = get_settings()
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def chunk_text(self, text: str, metadata: dict[str, Any]) -> list[dict[str, Any]]:
        chunks = []
        for piece in self.splitter.split_text(text):
            piece = piece.strip()
            if len(piece) < 50:
                continue
            chunks.append({"content": piece, "metadata": {**metadata}})
        return chunks

    def chunk_documents(self, texts: list[str], metadatas: list[dict] | None = None) -> list[dict]:
        all_chunks: list[dict] = []
        for i, text in enumerate(texts):
            meta = (metadatas[i] if metadatas else {}) or {}
            all_chunks.extend(self.chunk_text(text, meta))
        return all_chunks


class KnowledgeBaseIngester:
    """Ingest markdown/text from knowledgebase/ into ChromaDB global collection."""

    COLLECTION = "knowledge_base"

    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.chunker = DocumentChunker()
        settings = get_settings()
        self.kb_dir = Path(settings.knowledge_base_dir).resolve()

    def _infer_metadata(self, file_path: Path) -> dict[str, str]:
        rel = file_path.relative_to(self.kb_dir)
        parts = [p.lower() for p in rel.parts[:-1]]
        interview_type = "general"
        topic = parts[0] if parts else "general"
        for part in parts:
            if part in FOLDER_TYPE_MAP:
                interview_type = FOLDER_TYPE_MAP[part]
                topic = part
                break
        return {
            "source": "knowledge_base",
            "file_path": str(rel),
            "interview_type": interview_type,
            "topic": topic,
            "filename": file_path.name,
        }

    def _is_supported(self, path: Path) -> bool:
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            return False
        if any(skip in path.parts for skip in SKIP_DIRS):
            return False
        if path.stat().st_size > 500_000:  # skip very large files
            return False
        return True

    def _clean_markdown(self, text: str) -> str:
        text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
        text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
        text = re.sub(r"#{1,6}\s*", "", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def ingest(self, force: bool = False) -> int:
        if not self.kb_dir.exists():
            logger.warning("knowledge_base_dir_missing", extra={"path": str(self.kb_dir)})
            return 0

        stats = self.vector_store.collection_stats(self.COLLECTION)
        if stats["chunk_count"] > 0 and not force:
            logger.info("knowledge_base_already_indexed", extra={"chunks": stats["chunk_count"]})
            return stats["chunk_count"]

        if force:
            self.vector_store.delete_collection(self.COLLECTION)

        total = 0
        batch: list[dict] = []
        for file_path in self.kb_dir.rglob("*"):
            if not file_path.is_file() or not self._is_supported(file_path):
                continue
            try:
                text = file_path.read_text(encoding="utf-8", errors="ignore")
                text = self._clean_markdown(text)
                if len(text) < 100:
                    continue
                meta = self._infer_metadata(file_path)
                batch.extend(self.chunker.chunk_text(text, meta))
                if len(batch) >= 200:
                    total += self.vector_store.upsert(self.COLLECTION, batch)
                    batch = []
            except OSError as exc:
                logger.warning("kb_file_skip", extra={"file": str(file_path), "error": str(exc)})

        if batch:
            total += self.vector_store.upsert(self.COLLECTION, batch)

        logger.info("knowledge_base_ingested", extra={"chunks": total})
        return total
