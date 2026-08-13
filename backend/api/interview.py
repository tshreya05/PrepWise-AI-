from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from models.user import User
from schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewAnswerResponse,
)
from services.app_services import InterviewService

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(
    data: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InterviewService(db)
    return await service.start_interview(current_user.id, data.interview_type)


@router.post("/answer", response_model=InterviewAnswerResponse)
async def submit_answer(
    interview_id: int = Form(...),
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InterviewService(db)
    audio_data = await audio.read()
    return await service.submit_answer(current_user.id, interview_id, audio_data)
