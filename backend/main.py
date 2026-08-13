from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from rag.retriever import RAGRetriever
from utils.structured_logging import setup_logging, get_logger
from api import auth, resume, job_description, interview, report, dashboard, history

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    try:
        retriever = RAGRetriever()
        retriever.ensure_knowledge_base()
        logger.info("startup_complete", extra={"kb_stats": retriever.get_kb_stats()})
    except Exception as exc:
        logger.error("startup_kb_ingest_failed", extra={"error": str(exc)})
    yield


app = FastAPI(
    title="PrepWise AI",
    description="AI-powered Voice Mock Interview Platform",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(job_description.router)
app.include_router(interview.router)
app.include_router(report.router)
app.include_router(dashboard.router)
app.include_router(history.router)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "PrepWise AI", "version": "2.0.0"}
