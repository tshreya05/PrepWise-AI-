from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from api.deps import get_current_user
from database.db import get_db
from database.models import User
from schemas.job_description import JobDescriptionResponse, JobDescriptionText
from services.app_services import JobDescriptionService

router = APIRouter(prefix="/job-description", tags=["job-description"])


@router.post("", response_model=JobDescriptionResponse)
async def upload_job_description(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JobDescriptionService(db)
    jd = await service.upload_jd(current_user.id, file=file, text=text)
    return jd


@router.post("/text", response_model=JobDescriptionResponse)
async def paste_job_description(
    data: JobDescriptionText,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JobDescriptionService(db)
    jd = await service.upload_jd(current_user.id, text=data.text)
    return jd
