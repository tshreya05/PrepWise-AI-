from rag.chunker import DocumentChunker


def test_chunker_splits_and_skips_short():
    chunker = DocumentChunker()
    text = "A" * 600 + "\n\n" + "B" * 600
    chunks = chunker.chunk_text(text, {"source": "test"})
    assert len(chunks) >= 2
    assert all(len(c["content"]) >= 50 for c in chunks)


def test_chunker_metadata_preserved():
    chunker = DocumentChunker()
    chunks = chunker.chunk_text("X" * 200, {"source": "resume", "topic": "python"})
    assert chunks[0]["metadata"]["source"] == "resume"
    assert chunks[0]["metadata"]["topic"] == "python"
