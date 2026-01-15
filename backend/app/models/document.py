from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class DocumentBase(BaseModel):
    subject_id: UUID
    unit_number: int
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    syllabus_text: Optional[str] = None
    reference_text: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    syllabus_text: Optional[str] = None
    reference_text: Optional[str] = None
    ocr_status: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: UUID
    faculty_id: UUID
    ocr_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
