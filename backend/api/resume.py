from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from models.user import User
from schemas.resume import ResumeResponse, ResumeAnalysisResponse
from services.app_services import ResumeService

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    resume = await service.upload_resume(current_user.id, file)
    return resume


@router.get("", response_model=ResumeResponse)
async def get_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from database.models import Resume
    from fastapi import HTTPException
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    return resume


@router.get("/analysis", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    analysis = await service.analyze_resume(current_user.id)
    return analysis
