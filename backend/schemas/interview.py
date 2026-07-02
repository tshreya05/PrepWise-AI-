from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class InterviewStartRequest(BaseModel):
    interview_type: str = "technical"


class InterviewStartResponse(BaseModel):
    interview_id: int
    question: str
    question_index: int
    total_questions: int
    audio_base64: Optional[str] = None
    audio_format: str = "mp3"


class InterviewAnswerRequest(BaseModel):
    interview_id: int
    answer_text: Optional[str] = None


class EvaluationScores(BaseModel):
    technical_accuracy: float
    communication: float
    confidence: float
    completeness: float


class InterviewAnswerResponse(BaseModel):
    interview_id: int
    evaluation: EvaluationScores
    feedback: str
    ideal_answer: str
    transcribed_answer: Optional[str] = None
    is_complete: bool
    next_question: Optional[str] = None
    next_audio_base64: Optional[str] = None
    question_index: Optional[int] = None
    total_questions: int


class InterviewHistoryItem(BaseModel):
    id: int
    interview_type: str
    status: str
    overall_score: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    id: int
    interview_type: str
    overall_score: float
    strengths: list[str]
    weaknesses: list[str]
    topics_to_improve: list[str]
    learning_recommendations: list[str]
    transcript: list[dict[str, Any]]
    questions_detail: list[dict[str, Any]]
    created_at: datetime
    completed_at: Optional[datetime] = None
