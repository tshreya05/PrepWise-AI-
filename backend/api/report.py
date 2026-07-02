from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from database.models import User, Interview, InterviewQuestion
from schemas.interview import ReportResponse

router = APIRouter(tags=["report"])


@router.get("/report/{interview_id}", response_model=ReportResponse)
async def get_report(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    if interview.status != "completed":
        raise HTTPException(status_code=400, detail="Interview not yet completed")

    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id
    ).order_by(InterviewQuestion.question_index).all()

    return ReportResponse(
        id=interview.id,
        interview_type=interview.interview_type,
        overall_score=interview.overall_score or 0,
        strengths=interview.strengths or [],
        weaknesses=interview.weaknesses or [],
        topics_to_improve=interview.topics_to_improve or [],
        learning_recommendations=interview.learning_recommendations or [],
        transcript=interview.transcript or [],
        questions_detail=[
            {
                "question": q.question_text,
                "answer": q.answer_text,
                "scores": {
                    "technical_accuracy": q.technical_accuracy,
                    "communication": q.communication,
                    "confidence": q.confidence,
                    "completeness": q.completeness,
                },
                "feedback": q.feedback,
                "ideal_answer": q.ideal_answer,
            }
            for q in questions
        ],
        created_at=interview.created_at,
        completed_at=interview.completed_at,
    )
