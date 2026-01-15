from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from uuid import UUID
from app.core.supabase import supabase
from app.api.deps import get_current_user
from app.models.document import DocumentCreate, DocumentResponse
from app.models.user import UserResponse
import time

router = APIRouter()


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
