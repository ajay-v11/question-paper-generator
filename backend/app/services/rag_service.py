import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.supabase import supabase

# Necessary configuration: all-MiniLM-L6-v2 produces 384-dimensional vectors.
# If this model is changed, the database schema (embedding column) must be updated.
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Lazy initialization prevents heavy model loading on app startup
_embeddings_model = None


def get_embeddings_model():
    global _embeddings_model
    if _embeddings_model is None:
        _embeddings_model = HuggingFaceEmbeddings(model_name=MODEL_NAME)
    return _embeddings_model


async def process_document_chunks(
    doc_id: str, content: str, metadata: Dict[str, Any] = None
) -> int:
    """
    Chunk document content, generate embeddings, and store in Supabase.
    Returns the number of chunks created.
    """
    if not content:
        return 0

    embeddings = get_embeddings_model()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = text_splitter.create_documents([content], metadatas=[metadata or {}])

    texts = [chunk.page_content for chunk in chunks]

    # Run embedding generation in a separate thread to avoid blocking the event loop
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor() as pool:
        vectors = await loop.run_in_executor(pool, embeddings.embed_documents, texts)

    chunk_data = []
    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        chunk_data.append(
            {
                "document_id": doc_id,
                "chunk_index": i,
                "content": chunk.page_content,
                "metadata": chunk.metadata,
                "embedding": vector,
            }
        )

    if chunk_data:
        supabase.table("document_chunks").insert(chunk_data).execute()

    return len(chunk_data)


async def search_similar_chunks(
    query: str, subject_id: Optional[str] = None, limit: int = 5, threshold: float = 0.5
) -> List[Dict[str, Any]]:
    """
    Search for similar chunks using vector similarity via Supabase RPC.
    """
    embeddings = get_embeddings_model()

    # Run query embedding in a separate thread
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor() as pool:
        query_vector = await loop.run_in_executor(pool, embeddings.embed_query, query)

    params = {
        "query_embedding": query_vector,
        "match_threshold": threshold,
        "match_count": limit,
        "filter_subject_id": subject_id,
    }

    response = supabase.rpc("match_document_chunks", params).execute()
    return response.data
