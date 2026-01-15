from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class SubjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectResponse(SubjectBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class AllocationCreate(BaseModel):
    faculty_id: UUID
    subject_id: UUID


class FacultySubjectResponse(SubjectResponse):
    pass


class FacultyStats(BaseModel):
    total_subjects: int
    papers_generated: int
    recent_papers: List[str] = []
