-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Faculty-Subject allocation (many-to-many)
CREATE TABLE IF NOT EXISTS faculty_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(faculty_id, subject_id)
);

-- Seed Subjects (Use ON CONFLICT to avoid errors if re-run)
INSERT INTO subjects (name, code, description) VALUES
('Computer Networks', 'CS101', 'Fundamentals of computer networking and protocols'),
('Database Management Systems', 'CS102', 'Relational database design and SQL'),
('Operating Systems', 'CS103', 'Process management, memory management, and file systems'),
('Artificial Intelligence', 'CS104', 'Introduction to AI, ML, and Neural Networks')
ON CONFLICT (code) DO NOTHING;
