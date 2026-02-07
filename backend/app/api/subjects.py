from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from app.models.subject import (
    SubjectCreate,
    SubjectResponse,
    AllocationCreate,
    FacultySubjectResponse,
    FacultyStats,
)
from app.models.user import UserResponse
from app.core.supabase import supabase
from app.api import deps

router = APIRouter()


@router.get("/subjects", response_model=List[SubjectResponse])
async def get_subjects(current_user: UserResponse = Depends(deps.get_current_user)):
    response = supabase.table("subjects").select("*").execute()
    return response.data


@router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    subject: SubjectCreate,
    current_admin: UserResponse = Depends(deps.get_current_admin_user),
):
    # Check for duplicate code
    existing = (
        supabase.table("subjects").select("id").eq("code", subject.code).execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Subject code already exists")

    response = supabase.table("subjects").insert(subject.dict()).execute()
    return response.data[0]


@router.get("/faculty/subjects", response_model=List[SubjectResponse])
async def get_faculty_subjects(
    current_user: UserResponse = Depends(deps.get_current_user),
):
    # Join subjects via faculty_subjects
    # Supabase syntax for joining: faculty_subjects(subject_id, subjects(*))
    # However, supabase-py client join syntax can be tricky.
    # We'll do it in two steps for reliability or use exact join syntax if known.
    # Approach: Get subject_ids from faculty_subjects, then get subjects.

    allocations = (
        supabase.table("faculty_subjects")
        .select("subject_id")
        .eq("faculty_id", str(current_user.id))
        .execute()
    )

    if not allocations.data:
        return []

    subject_ids = [a["subject_id"] for a in allocations.data]

    # "in" filter requires a tuple/list syntax like (id1,id2)
    # Using 'in' filter with list
    subjects = supabase.table("subjects").select("*").in_("id", subject_ids).execute()
    return subjects.data


@router.post("/admin/allocate-subject")
async def allocate_subject(
    allocation: AllocationCreate,
    current_admin: UserResponse = Depends(deps.get_current_admin_user),
):
    # Check if already allocated
    existing = (
        supabase.table("faculty_subjects")
        .select("id")
        .eq("faculty_id", str(allocation.faculty_id))
        .eq("subject_id", str(allocation.subject_id))
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=400, detail="Subject already allocated to this faculty"
        )

    data = {
        "faculty_id": str(allocation.faculty_id),
        "subject_id": str(allocation.subject_id),
    }

    response = supabase.table("faculty_subjects").insert(data).execute()
    return {"message": "Allocation successful", "data": response.data}


@router.delete("/admin/deallocate-subject")
async def deallocate_subject(
    allocation: AllocationCreate,
    current_admin: UserResponse = Depends(deps.get_current_admin_user),
):
    response = (
        supabase.table("faculty_subjects")
        .delete()
        .eq("faculty_id", str(allocation.faculty_id))
        .eq("subject_id", str(allocation.subject_id))
        .execute()
    )
    return {"message": "Deallocation successful"}


@router.get("/faculty/stats", response_model=FacultyStats)
async def get_faculty_stats(
    current_user: UserResponse = Depends(deps.get_current_user),
):
    allocations = (
        supabase.table("faculty_subjects")
        .select("id", count="exact")
        .eq("faculty_id", str(current_user.id))
        .execute()
    )
    total_subjects = (
        allocations.count if allocations.count is not None else len(allocations.data)
    )

    papers_query = (
        supabase.table("papers")
        .select("id, title, subjects(name), created_at", count="exact")
        .eq("faculty_id", str(current_user.id))
        .order("created_at", desc=True)
        .execute()
    )

    papers_generated = (
        papers_query.count if papers_query.count is not None else len(papers_query.data)
    )

    recent_papers = []

    for p in papers_query.data[:5]:
        subj = p.get("subjects")
        subj_name = subj.get("name") if isinstance(subj, dict) else "Unknown"

        recent_papers.append(
            {
                "id": p.get("id"),
                "title": p.get("title"),
                "subject_name": subj_name,
                "date": p.get("created_at"),
            }
        )

    return FacultyStats(
        total_subjects=total_subjects,
        papers_generated=papers_generated,
        recent_papers=recent_papers,
    )


# Helper to get all faculty (for admin allocation dropdown)
@router.get("/admin/faculty-list", response_model=List[UserResponse])
async def get_all_faculty(
    current_admin: UserResponse = Depends(deps.get_current_admin_user),
):
    response = supabase.table("users").select("*").eq("role", "faculty").execute()

    # Manually map response to Pydantic models to handle potential None values gracefully
    # Pydantic's parse_obj_as or just a list comprehension
    users = []
    for u in response.data:
        users.append(
            UserResponse(
                id=u.get("id"),
                email=u.get("email"),
                name=u.get("name"),
                role=u.get("role"),
                created_at=u.get("created_at"),
            )
        )
    return users
