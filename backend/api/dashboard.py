from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from database.models import User
from schemas.dashboard import DashboardResponse
from schemas.learn import LearningCardResponse, PracticeQuizRequest, PracticeQuizResponse
from services.app_services import DashboardService, LearnService, PracticeService

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DashboardService(db)
    return service.get_dashboard(current_user.id)


@router.get("/learn", response_model=list[LearningCardResponse])
async def get_learning_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = LearnService(db)
    cards = await service.generate_learning_cards(current_user.id)
    return cards


@router.post("/practice", response_model=PracticeQuizResponse)
async def generate_practice_quiz(
    data: PracticeQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PracticeService(db)
    quiz = await service.generate_quiz(
        current_user.id, data.topic, data.difficulty, data.num_questions
    )
    return quiz
