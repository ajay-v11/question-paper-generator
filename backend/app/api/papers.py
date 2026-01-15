from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.supabase import supabase
from app.api.deps import get_current_user
from app.models.paper import PaperCreate, PaperResponse
from app.models.user import UserResponse

router = APIRouter()


@router.post("/create-draft", response_model=PaperResponse)
def create_paper_draft(
    paper: PaperCreate, current_user: UserResponse = Depends(get_current_user)
):
    try:
        paper_data = paper.model_dump()
        paper_data["faculty_id"] = str(current_user.id)
        paper_data["subject_id"] = str(paper_data["subject_id"])
        paper_data["status"] = "draft"

        response = supabase.table("papers").insert(paper_data).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Could not create paper draft")

        return response.data[0]
    except Exception as e:
        print(f"Create paper error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[PaperResponse])
def get_papers(current_user: UserResponse = Depends(get_current_user)):
    response = (
        supabase.table("papers")
        .select("*")
        .eq("faculty_id", str(current_user.id))
        .order("created_at", desc=True)
        .execute()
    )
    return response.data
