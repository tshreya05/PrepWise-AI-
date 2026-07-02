from langchain_openai import OpenAIEmbeddings

from config import get_settings


class EmbeddingService:
    def __init__(self):
        settings = get_settings()
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key or "not-set",
        )

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return self.embeddings.embed_documents(texts)
