from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobDescriptionResponse(BaseModel):
    id: int
    filename: Optional[str] = None
    raw_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class JobDescriptionText(BaseModel):
    text: str
