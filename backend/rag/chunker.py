from typing import Any

from langchain.text_splitter import RecursiveCharacterTextSplitter

from config import get_settings


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
