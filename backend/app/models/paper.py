from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from uuid import UUID


class QuestionConfig(BaseModel):
    mcq: int = 0
    fill_blanks: int = 0
    short: int = 0
    long: int = 0


class PaperBase(BaseModel):
    subject_id: UUID
    title: str
    units: List[int]
    difficulty: Literal["easy", "medium", "hard"]
    custom_instructions: Optional[str] = None
    question_config: QuestionConfig


class PaperCreate(PaperBase):
    pass


class PaperResponse(PaperBase):
    id: UUID
    faculty_id: UUID
    status: str
    questions: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
