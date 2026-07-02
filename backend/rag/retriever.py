from rag.chunker import DocumentChunker
from rag.vector_store import VectorStoreManager


class RAGRetriever:
    def __init__(self):
        self.vector_manager = VectorStoreManager()

    def retrieve(self, user_id: int, query: str, k: int = 4) -> list[str]:
        vectorstore = self.vector_manager.load_index(user_id)
        if vectorstore is None:
            return []
        docs = vectorstore.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]

    def index_user_documents(self, user_id: int, resume_text: str, jd_text: str) -> None:
        chunker = DocumentChunker()
        texts = []
        metadatas = []
        if resume_text:
            texts.append(resume_text)
            metadatas.append({"source": "resume"})
        if jd_text:
            texts.append(jd_text)
            metadatas.append({"source": "job_description"})
        if not texts:
            return
        chunks = chunker.chunk_documents(texts, metadatas)
        self.vector_manager.build_index(user_id, chunks)
