from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from typing import List
from uuid import UUID
from app.core.supabase import supabase
from app.api.deps import get_current_user
from app.models.document import DocumentCreate, DocumentResponse
from app.models.user import UserResponse
from app.services.ocr_service import OCRService
import time

router = APIRouter()


async def process_document_ocr(doc_id: str, file_path: str, file_type: str):
    try:
        supabase.table("documents").update({"ocr_status": "processing"}).eq(
            "id", doc_id
        ).execute()

        res = supabase.storage.from_("documents").download(file_path)

        text = OCRService.extract_text(res, file_type)

        supabase.table("documents").update(
            {"ocr_status": "completed", "reference_text": text}
        ).eq("id", doc_id).execute()

    except Exception as e:
        print(f"OCR Error for {doc_id}: {e}")
        supabase.table("documents").update({"ocr_status": "failed"}).eq(
            "id", doc_id
        ).execute()


@router.post("/process/{doc_id}")
async def process_document(
    doc_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: UserResponse = Depends(get_current_user),
):
    res = supabase.table("documents").select("*").eq("id", str(doc_id)).execute()
    if not res.data:
        raise HTTPException(404, "Document not found")

    doc = res.data[0]
    if doc.get("ocr_status") in ["processing", "completed"]:
        return {
            "message": "Document already processed or processing",
            "status": doc["ocr_status"],
        }

    background_tasks.add_task(
        process_document_ocr, str(doc_id), doc["file_path"], doc["file_type"]
    )
    return {"message": "Processing started", "status": "processing"}


@router.get("/status/{doc_id}")
def get_processing_status(
    doc_id: UUID, current_user: UserResponse = Depends(get_current_user)
):
    res = (
        supabase.table("documents").select("ocr_status").eq("id", str(doc_id)).execute()
    )
    if not res.data:
        raise HTTPException(404, "Document not found")
    return {"status": res.data[0]["ocr_status"]}


@router.get("/content/{doc_id}")
def get_document_content(
    doc_id: UUID, current_user: UserResponse = Depends(get_current_user)
):
    res = (
        supabase.table("documents")
        .select("reference_text")
        .eq("id", str(doc_id))
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Document not found")
    return {"content": res.data[0]["reference_text"]}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...), current_user: UserResponse = Depends(get_current_user)
):
    try:
        file_content = await file.read()
        # Use a timestamp to prevent overwrites or simple unique handling
        timestamp = int(time.time())
        filename = file.filename or "uploaded_file"
        safe_filename = filename.replace(" ", "_")
        file_path = f"{current_user.id}/{timestamp}_{safe_filename}"

        # Upload to 'documents' bucket
        res = supabase.storage.from_("documents").upload(file_path, file_content)

        return {"file_path": file_path, "file_name": file.filename}
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/save-content", response_model=DocumentResponse)
def save_document_content(
    doc: DocumentCreate, current_user: UserResponse = Depends(get_current_user)
):
    try:
        document_data = doc.model_dump()
        document_data["faculty_id"] = str(current_user.id)
        document_data["subject_id"] = str(document_data["subject_id"])

        response = supabase.table("documents").insert(document_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Could not create document")

        return response.data[0]
    except Exception as e:
        print(f"Save content error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{subject_id}", response_model=List[DocumentResponse])
def get_documents(
    subject_id: UUID, current_user: UserResponse = Depends(get_current_user)
):
    response = (
        supabase.table("documents")
        .select("*")
        .eq("subject_id", str(subject_id))
        .eq("faculty_id", str(current_user.id))
        .execute()
    )
    return response.data
