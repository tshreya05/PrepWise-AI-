from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ResumeResponse(BaseModel):
    id: int
    filename: str
    skills: list[str]
    education: list[str]
    projects: list[str]
    experience: list[str]
    analysis: Optional[dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeAnalysisResponse(BaseModel):
    missing_keywords: list[str]
    weak_bullet_points: list[str]
    grammar_suggestions: list[str]
    missing_measurable_impact: list[str]
    missing_links: list[str]
    overall_score: float
    summary: str
