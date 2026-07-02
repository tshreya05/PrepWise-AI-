from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from api.deps import get_current_user
from database.db import get_db
from database.models import User
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
    result = await service.start_interview(current_user.id, data.interview_type)
    return result


@router.post("/answer", response_model=InterviewAnswerResponse)
async def submit_answer(
    interview_id: int = Form(...),
    answer_text: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InterviewService(db)
    audio_data = None
    if audio:
        audio_data = await audio.read()
    result = await service.submit_answer(
        current_user.id, interview_id, answer_text=answer_text, audio_data=audio_data
    )
    return result
