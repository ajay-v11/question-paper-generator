from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.services.rag_service import process_document_chunks, search_similar_chunks
from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    subject_id: Optional[str] = None
    limit: int = 5


@router.post("/process/{doc_id}")
async def process_document_rag(
    doc_id: str,
    background_tasks: BackgroundTasks,
    current_user: Any = Depends(get_current_user),
):
    """
    Trigger RAG processing (chunking and embedding) for a document.
    """
    response = (
        supabase.table("documents").select("*").eq("id", doc_id).single().execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = response.data
    content = doc.get("reference_text")
    if not content:
        raise HTTPException(
            status_code=400, detail="Document has no extracted text. Run OCR first."
        )

    metadata = {
        "unit_number": doc.get("unit_number"),
        "subject_id": doc.get("subject_id"),
        "file_name": doc.get("file_name"),
    }

    background_tasks.add_task(process_document_chunks, doc_id, content, metadata)

    return {"message": "RAG processing started in background"}


@router.post("/search")
async def search_documents(
    request: SearchRequest, current_user: Any = Depends(get_current_user)
):
    """
    Semantic search across document chunks.
    """
    results = await search_similar_chunks(
        query=request.query, subject_id=request.subject_id, limit=request.limit
    )
    return {"results": results}


@router.get("/status/{doc_id}")
async def get_rag_status(doc_id: str, current_user: Any = Depends(get_current_user)):
    """
    Check if document has been chunked and embedded.
    """
    response = (
        supabase.table("document_chunks")
        .select("count", count="exact")
        .eq("document_id", doc_id)
        .execute()
    )

    count = response.count
    return {
        "chunk_count": count,
        "status": "completed" if count and count > 0 else "pending",
    }
