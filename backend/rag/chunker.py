from langchain.text_splitter import RecursiveCharacterTextSplitter

from config import get_settings


class DocumentChunker:
    def __init__(self):
        settings = get_settings()
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
        )

    def chunk_documents(self, texts: list[str], metadatas: list[dict] | None = None) -> list[dict]:
        chunks = []
        for i, text in enumerate(texts):
            meta = (metadatas[i] if metadatas else {}) or {}
            for chunk in self.splitter.split_text(text):
                chunks.append({"content": chunk, "metadata": meta.copy()})
        return chunks
