from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from database.models import User, Interview
from schemas.interview import InterviewHistoryItem

router = APIRouter(tags=["history"])


@router.get("/history", response_model=list[InterviewHistoryItem])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).order_by(Interview.created_at.desc()).all()
    return interviews
