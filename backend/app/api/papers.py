from fastapi import APIRouter, Depends, HTTPException, Query, Response
from typing import List, Optional, Any, Dict
from app.core.supabase import supabase
from app.api.deps import get_current_user
from app.models.paper import PaperCreate, PaperResponse
from app.models.user import UserResponse
from app.services.export_service import ExportService

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
        paper_data["questions"] = {}

        response = supabase.table("papers").insert(paper_data).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Could not create paper draft")

        return response.data[0]
    except Exception as e:
        print(f"Create paper error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[PaperResponse])
def get_papers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
):
    start = (page - 1) * limit
    end = start + limit - 1

    response = (
        supabase.table("papers")
        .select("*")
        .eq("faculty_id", str(current_user.id))
        .order("created_at", desc=True)
        .range(start, end)
        .execute()
    )
    return response.data


@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(paper_id: str, current_user: UserResponse = Depends(get_current_user)):
    response = (
        supabase.table("papers")
        .select("*")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    paper_data: Dict[str, Any] = response.data
    return PaperResponse(**paper_data)


@router.delete("/{paper_id}")
def delete_paper(paper_id: str, current_user: UserResponse = Depends(get_current_user)):
    check = (
        supabase.table("papers")
        .select("id")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .execute()
    )

    if not check.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    supabase.table("papers").delete().eq("id", paper_id).execute()

    return {"message": "Paper deleted successfully"}


@router.get("/{paper_id}/download")
def download_paper(
    paper_id: str,
    format: str = Query(..., regex="^(pdf|docx)$"),
    current_user: UserResponse = Depends(get_current_user),
):
    response = (
        supabase.table("papers")
        .select("*, subjects(name)")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    paper_data: Any = response.data
    subject_data = paper_data.get("subjects")
    subject_name = "Unknown Subject"

    if isinstance(subject_data, dict):
        subject_name = str(subject_data.get("name", "Unknown Subject"))

    paper = PaperResponse(**paper_data)

    if format == "pdf":
        content = ExportService.generate_pdf(paper, subject_name)
        media_type = "application/pdf"
        filename = f"{paper.title.replace(' ', '_')}.pdf"
    else:
        content = ExportService.generate_docx(paper, subject_name)
        media_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        filename = f"{paper.title.replace(' ', '_')}.docx"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    return response.data


@router.delete("/{paper_id}")
def delete_paper(paper_id: str, current_user: UserResponse = Depends(get_current_user)):
    check = (
        supabase.table("papers")
        .select("id")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .execute()
    )

    if not check.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    supabase.table("papers").delete().eq("id", paper_id).execute()

    return {"message": "Paper deleted successfully"}


@router.get("/{paper_id}/download")
def download_paper(
    paper_id: str,
    format: str = Query(..., regex="^(pdf|docx)$"),
    current_user: UserResponse = Depends(get_current_user),
):
    response = (
        supabase.table("papers")
        .select("*, subjects(name)")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    paper_data = response.data
    subject_data = paper_data.get("subjects")
    subject_name = "Unknown Subject"

    if isinstance(subject_data, dict):
        subject_name = str(subject_data.get("name", "Unknown Subject"))

    paper = PaperResponse(**paper_data)

    if format == "pdf":
        content = ExportService.generate_pdf(paper, subject_name)
        media_type = "application/pdf"
        filename = f"{paper.title.replace(' ', '_')}.pdf"
    else:
        content = ExportService.generate_docx(paper, subject_name)
        media_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        filename = f"{paper.title.replace(' ', '_')}.docx"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

    if not check.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    response = supabase.table("papers").delete().eq("id", paper_id).execute()

    return {"message": "Paper deleted successfully"}


@router.get("/{paper_id}/download")
def download_paper(
    paper_id: str,
    format: str = Query(..., regex="^(pdf|docx)$"),
    current_user: UserResponse = Depends(get_current_user),
):
    # Fetch paper with subject name
    response = (
        supabase.table("papers")
        .select("*, subjects(name)")
        .eq("id", paper_id)
        .eq("faculty_id", str(current_user.id))
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Paper not found")

    paper_data = response.data
    subject_name = paper_data.get("subjects", {}).get("name", "Unknown Subject")

    # Convert dict to PaperResponse model
    paper = PaperResponse(**paper_data)

    if format == "pdf":
        content = ExportService.generate_pdf(paper, subject_name)
        media_type = "application/pdf"
        filename = f"{paper.title.replace(' ', '_')}.pdf"
    else:
        content = ExportService.generate_docx(paper, subject_name)
        media_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        filename = f"{paper.title.replace(' ', '_')}.docx"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
