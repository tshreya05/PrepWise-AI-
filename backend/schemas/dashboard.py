from pydantic import BaseModel
from typing import Optional, Any


class DashboardResponse(BaseModel):
    has_resume: bool
    has_job_description: bool
    resume: Optional[dict[str, Any]] = None
    job_description: Optional[dict[str, Any]] = None
    interview_history: list[dict[str, Any]]
    resume_analysis: Optional[dict[str, Any]] = None
    total_interviews: int
    average_score: Optional[float] = None
