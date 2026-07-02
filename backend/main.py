from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from utils.logging_config import setup_logging
from api import auth, resume, job_description, interview, report, dashboard, history

setup_logging()

app = FastAPI(
    title="PrepWise AI",
    description="AI-powered Voice Mock Interview Platform",
    version="1.0.0",
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


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "PrepWise AI"}
