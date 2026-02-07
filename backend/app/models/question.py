from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from uuid import UUID


class MCQuestion(BaseModel):
    """Multiple Choice Question model"""
    id: Optional[str] = None
    question: str = Field(..., description="The question text")
    options: List[str] = Field(..., min_length=4, max_length=4, description="4 options for the MCQ")
    correct_answer: str = Field(..., description="The correct option text")
    explanation: Optional[str] = Field(None, description="Optional explanation for the answer")
    marks: int = Field(default=1, ge=1, description="Marks for this question")
    unit: Optional[int] = Field(None, ge=1, le=5, description="Source unit number")


class FillBlankQuestion(BaseModel):
    """Fill in the Blanks Question model"""
    id: Optional[str] = None
    question: str = Field(..., description="The question with ___ for blanks")
    answer: str = Field(..., description="The answer for the blank")
    marks: int = Field(default=1, ge=1, description="Marks for this question")
    unit: Optional[int] = Field(None, ge=1, le=5, description="Source unit number")


class ShortQuestion(BaseModel):
    """Short Answer Question model"""
    id: Optional[str] = None
    question: str = Field(..., description="The question text")
    expected_points: List[str] = Field(..., description="Key points expected in answer")
    marks: int = Field(default=5, ge=2, le=5, description="Marks for this question (2-5)")
    unit: Optional[int] = Field(None, ge=1, le=5, description="Source unit number")


class LongQuestion(BaseModel):
    """Long Answer Question model"""
    id: Optional[str] = None
    question: str = Field(..., description="The question text")
    expected_points: List[str] = Field(..., description="Key points expected in answer")
    marks: int = Field(default=10, ge=10, description="Marks for this question (10+)")
    unit: Optional[int] = Field(None, ge=1, le=5, description="Source unit number")


class GeneratedQuestions(BaseModel):
    """Complete set of generated questions"""
    mcqs: List[MCQuestion] = Field(default_factory=list, description="Multiple choice questions")
    fill_blanks: List[FillBlankQuestion] = Field(default_factory=list, description="Fill in the blanks questions")
    short: List[ShortQuestion] = Field(default_factory=list, description="Short answer questions")
    long: List[LongQuestion] = Field(default_factory=list, description="Long answer questions")


class GenerationRequest(BaseModel):
    """Request model for question generation"""
    paper_id: UUID
    subject_id: UUID
    subject_name: Optional[str] = None
    units: List[int]
    difficulty: Literal["easy", "medium", "hard"]
    custom_instructions: Optional[str] = None
    question_config: Dict[str, int]


class GenerationResponse(BaseModel):
    """Response model for generation status"""
    paper_id: UUID
    status: Literal["pending", "processing", "completed", "failed", "generated"]
    questions: Optional[GeneratedQuestions] = None
    error: Optional[str] = None
