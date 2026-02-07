-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document chunks (for RAG)
-- Note: embedding dimension is 384 for sentence-transformers/all-MiniLM-L6-v2
-- If using OpenAI (text-embedding-3-small), change to 1536
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,                   -- unit, section, page info
    embedding vector(384),           
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for similarity search
-- lists = 100 is a good starting point for < 1M rows
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to match document chunks
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_subject_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  FROM document_chunks
  JOIN documents ON document_chunks.document_id = documents.id
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  AND (filter_subject_id IS NULL OR documents.subject_id = filter_subject_id)
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
