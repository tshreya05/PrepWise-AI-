# PrepWise AI Backend — Architectural Decisions

This document explains **why** each major technology and design choice was made.
Read this before changing architecture.

---

## 1. Improvement-First Approach (Not a Rewrite)

**Decision:** Refactor the existing FastAPI backend in place.

**Why:** The MVP already had working API routes, frontend integration, and business flows.
Rewriting would risk breaking the frontend and lose validated behavior.

**What changed:** Internal modules (RAG, auth, speech, evaluation) were upgraded while preserving API paths.

---

## 2. ChromaDB Instead of FAISS

**Decision:** Replace `faiss-cpu` with **ChromaDB** (`chromadb`).

**Why ChromaDB is better for this project:**
| Requirement | FAISS | ChromaDB |
|-------------|-------|----------|
| Persistent storage | Manual save/load files | Built-in persistent client |
| Metadata filtering | Limited / complex | Native `where` filters |
| Production maintenance | Custom serialization (`allow_dangerous_deserialization`) | Standard DB-like API |
| Swappable abstraction | Tightly coupled | Clean interface via `VectorStore` ABC |

**Implementation:** `rag/vector_store.py` defines the interface. `rag/chroma_store.py` is the concrete implementation.
Future swap to Pinecone/Qdrant requires only a new class implementing `VectorStore`.

---

## 3. JSON Authentication Storage

**Decision:** Store users in `data/users.json` via `UserRepository`.

**Why not SQLite/PostgreSQL for auth yet:**
- Application is still small (MVP scale)
- Auth data is simple (email, password hash, name)
- JSON is human-readable for debugging
- Repository pattern allows future DB migration without changing services

**Why not remove SQLite entirely:**
- Interview sessions, resumes, quizzes have relational structure
- SQLite remains appropriate for non-auth entities until scale demands PostgreSQL

**Security:** Passwords are bcrypt-hashed. JWT tokens use configurable `SECRET_KEY`.

---

## 4. OpenAI Embeddings + LLM

**Decision:** Keep OpenAI for embeddings (`text-embedding-3-small`) and LLM (`gpt-4o-mini`).

**Why:**
- High quality semantic search for resume/JD matching
- Reliable JSON generation for evaluation and quiz schemas
- Configurable via environment variables

**Important:** Mock/fake LLM responses were **removed**. The server requires `OPENAI_API_KEY` for AI features.
This prevents silent degradation in production.

---

## 5. faster-whisper (Default STT)

**Decision:** Default speech-to-text is **faster-whisper** (local CPU inference).

**Why faster-whisper over OpenAI Whisper API:**
| Factor | faster-whisper | OpenAI Whisper |
|--------|----------------|----------------|
| Cost | Free (local) | Per-minute API cost |
| Latency | Low for short answers | Network dependent |
| Privacy | Audio stays on server | Sent to OpenAI |
| Offline | Works without internet | Requires API key |

**Fallback:** OpenAI Whisper API if faster-whisper fails to initialize.

**Provider switching:** `STT_PROVIDER=faster-whisper|openai` in `.env`.

---

## 6. Piper (Default TTS)

**Decision:** Default text-to-speech is **Piper** (local neural TTS).

**Why Piper over OpenAI TTS:**
- No per-character API cost during interviews
- Predictable latency for voice-first UX
- Works in air-gapped / local deployments

**Fallback chain:** Piper → Coqui TTS → OpenAI TTS

**Setup:** Download a `.onnx` voice model into `backend/models/piper/`.

---

## 7. Chunk Size: 500 / Overlap: 50

**Decision:** `chunk_size=500`, `chunk_overlap=50`.

**Why:**
- Resume bullets and JD requirements typically fit in 300–600 characters
- 500 chars ≈ 80–120 tokens — good for embedding models
- 10% overlap prevents sentence splitting at boundaries
- Smaller chunks = better retrieval precision; larger = better context

**Tuning guide:** Increase to 800 if retrieval misses context; decrease to 300 for keyword-heavy JDs.

---

## 8. Retrieval Score Threshold: 0.35

**Decision:** Discard chunks with cosine similarity < 0.35.

**Why:**
- Prevents irrelevant context from polluting prompts
- Triggers graceful fallback logging instead of hallucination
- Threshold is configurable via `RETRIEVAL_SCORE_THRESHOLD`

---

## 9. Knowledge Base Ingestion

**Decision:** Ingest `knowledgebase/` markdown into global ChromaDB collection at startup.

**Why:**
- Repo already contains HR questions, system design primers, technical content
- Interview questions should reference real domain knowledge, not only resume/JD
- Metadata maps folder names to interview types for filtering

**Skipped files:** `.git`, `node_modules`, binaries, files > 500KB, non-markdown.

---

## 10. Voice-Only Interview Answers

**Decision:** `POST /interview/answer` requires audio file (text bypass removed).

**Why:** Product requirement — this is a voice interview platform, not text chat.
STT converts audio → text → LLM evaluation → TTS next question.

---

## 11. Evaluation Framework

**Decision:** Dedicated `evaluation/` package with persisted metrics.

**Why:**
- Production systems need observability beyond console logs
- Retrieval quality, prompt completeness, quiz structure must be measurable
- Evaluation history in `data/evaluations/` supports regression testing

**Categories:** knowledge_base, retrieval, prompt, interview, quiz, speech, performance.

---

## 12. Structured Logging

**Decision:** `utils/structured_logging.py` with trace IDs and latency tracking.

**Why:**
- Every interview session should be traceable end-to-end
- JSON log format ready for ELK/Datadog ingestion (`LOG_JSON=true`)
- `LatencyTracker` context manager measures STT/TTS/retrieval/LLM times

---

## 13. Clean Architecture Layers

```
api/           → HTTP routes, input validation, auth dependencies
services/      → Business logic (interview, resume, quiz)
repositories/  → Data access (JSON users, swappable)
rag/           → Retrieval pipeline (ChromaDB, chunking, prompts)
evaluation/    → Quality metrics and regression data
models/        → Domain models (User dataclass)
database/      → SQLAlchemy ORM for interviews/resumes
prompts/       → LLM prompt templates
utils/         → JWT, file parsing, logging
```

**Why separate repositories from services:** Services should not know whether users live in JSON or PostgreSQL.

---

## 14. Why SQLite Remains (Non-Auth Data)

**Decision:** Keep SQLite for interviews, resumes, quizzes.

**Why not PostgreSQL/MongoDB yet (per requirements):**
- Single-server deployment
- No replication needs at current scale
- SQLAlchemy makes future migration straightforward

---

## 15. Testing Strategy

**Decision:** pytest for auth, chunker, prompts, evaluation, API health.

**Why not full integration tests with OpenAI:**
- Cost and flakiness in CI
- Unit tests validate structure; manual/E2E validates AI quality
- Evaluation framework provides automated quality regression

---

## Future Recommendations

1. **PostgreSQL** when concurrent users exceed SQLite limits
2. **Redis** for interview session state and rate limiting
3. **RAGAS/DeepEval** integration when evaluation metrics need LLM-as-judge scoring
4. **WebSocket** for streaming TTS and real-time interruption support
5. **Celery** for async knowledge base re-ingestion on large corpora
