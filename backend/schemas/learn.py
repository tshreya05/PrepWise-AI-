from pydantic import BaseModel
from typing import Any


class LearningCardResponse(BaseModel):
    id: int
    topic: str
    reason: str
    estimated_time: str
    resources: list[dict[str, str]]
    quiz: list[dict[str, Any]]

    class Config:
        from_attributes = True


class PracticeQuizRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    num_questions: int = 5


class PracticeQuizResponse(BaseModel):
    id: int
    topic: str
    difficulty: str
    questions: list[dict[str, Any]]

    class Config:
        from_attributes = True
