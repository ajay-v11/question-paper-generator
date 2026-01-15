-- Documents (uploaded reference materials)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    unit_number INTEGER NOT NULL CHECK (unit_number BETWEEN 1 AND 5),
    file_name VARCHAR(255),
    file_path VARCHAR(500),           -- Supabase storage path
    file_type VARCHAR(50),            -- pdf, docx, txt
    syllabus_text TEXT,               -- Syllabus content
    reference_text TEXT,              -- Extracted/uploaded text content
    ocr_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated papers
CREATE TABLE papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    units INTEGER[] NOT NULL,         -- Array of unit numbers
    difficulty VARCHAR(20) NOT NULL,  -- easy, medium, hard
    custom_instructions TEXT,
    question_config JSONB NOT NULL,   -- {mcq: 5, fill_blanks: 5, short: 6, long: 4}
    questions JSONB DEFAULT '{}',     -- Generated questions array
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated uploads (adjust as needed for security)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
