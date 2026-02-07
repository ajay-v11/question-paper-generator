from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, Any
from app.core.supabase import supabase
from app.api.deps import get_current_user
from app.models.user import UserResponse
from app.models.question import GenerationRequest, GenerationResponse
from app.services.ai_service import generate_questions
from app.models.paper import PaperResponse
from uuid import UUID
import asyncio

router = APIRouter()

# Store generation status in memory (in production, use Redis or database)
generation_status: Dict[str, Dict[str, Any]] = {}


async def run_generation(paper_id: str, request: GenerationRequest):
    """Background task to run question generation."""
    try:
        # Update status to processing
        generation_status[paper_id] = {"status": "processing", "error": None}

        # Generate questions
        questions = await generate_questions(
            subject_id=str(request.subject_id),
            subject_name=request.subject_name,
            units=request.units,
            difficulty=request.difficulty,
            question_config=request.question_config,
            custom_instructions=request.custom_instructions
        )

        # Convert to dict for storage
        questions_dict = questions.model_dump()

        # Update paper with generated questions
        supabase.table("papers").update({
            "questions": questions_dict,
            "status": "generated"
        }).eq("id", paper_id).execute()

        # Update generation status
        generation_status[paper_id] = {
            "status": "completed",
            "questions": questions_dict
        }

        print(f"Generation completed for paper {paper_id}")

    except Exception as e:
        error_msg = str(e)
        print(f"Generation failed for paper {paper_id}: {error_msg}")

        # Update paper status to failed
        supabase.table("papers").update({
            "status": "failed"
        }).eq("id", paper_id).execute()

        # Update generation status
        generation_status[paper_id] = {
            "status": "failed",
            "error": error_msg
        }


@router.post("/generate", response_model=GenerationResponse)
async def start_generation(
    request: GenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Start question generation for a paper.

    This endpoint starts an asynchronous background task to generate questions.
    Use GET /api/generation/status/{paper_id} to check progress.
    """
    paper_id = str(request.paper_id)

    # Verify paper exists and belongs to user
    paper_response = (
        supabase.table("papers")
        .select("*")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .execute()
    )

    if not paper_response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Get subject name
    subject_response = (
        supabase.table("subjects")
        .select("name")
        .eq("id", str(request.subject_id))
        .execute()
    )

    if not subject_response.data:
        raise HTTPException(status_code=404, detail="Subject not found")

    request.subject_name = subject_response.data[0]["name"]

    # Update paper status to pending
    supabase.table("papers").update({
        "status": "pending"
    }).eq("id", paper_id).execute()

    # Start background generation task
    background_tasks.add_task(run_generation, paper_id, request)

    return GenerationResponse(
        paper_id=request.paper_id,
        status="pending"
    )


@router.get("/status/{paper_id}", response_model=GenerationResponse)
async def get_generation_status(
    paper_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Check the status of question generation for a paper.

    Returns:
    - status: "pending", "processing", "completed", or "failed"
    - questions: Generated questions (only if status is "completed")
    - error: Error message (only if status is "failed")
    """
    # Verify paper exists and belongs to user
    paper_response = (
        supabase.table("papers")
        .select("*")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .execute()
    )

    if not paper_response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    paper = paper_response.data[0]

    # Check memory status first for real-time updates
    if paper_id in generation_status:
        status_data = generation_status[paper_id]
        return GenerationResponse(
            paper_id=paper_id,
            status=status_data["status"],
            questions=status_data.get("questions"),
            error=status_data.get("error")
        )

    # Fall back to database status
    return GenerationResponse(
        paper_id=paper_id,
        status=paper.get("status", "pending"),
        questions=paper.get("questions") if paper.get("status") == "generated" else None,
        error=None
    )


@router.get("/paper/{paper_id}", response_model=PaperResponse)
async def get_paper_with_questions(
    paper_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get a paper with all its generated questions.
    """
    response = (
        supabase.table("papers")
        .select("*")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    return response.data[0]
