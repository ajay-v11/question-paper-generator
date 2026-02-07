# Technical Implementation Plan

## AI-Powered Question Paper Generator

**Stack**: React (Vite) + FastAPI + Supabase (Postgres + pgvector) + Mistral OCR + Groq (llama-3.3-70b-versatile) + LangChain

**Package Managers**: 
- **Frontend**: `pnpm` (fast, disk-efficient)
- **Backend**: `uv` (ultra-fast Python package manager)

**Approach**: Phase-wise incremental development. Each phase produces a **runnable, testable application**.

---

## Project Structure

```
jenisha/
├── frontend/                 # React application (Vite + pnpm)
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API calls
│   │   ├── context/          # Auth context
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Helper functions
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── vite.config.js
│
├── backend/                  # FastAPI application (uv)
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   │   ├── auth.py
│   │   │   ├── subjects.py
│   │   │   ├── documents.py
│   │   │   ├── papers.py
│   │   │   └── generation.py
│   │   ├── core/             # Config, security
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── supabase.py
│   │   ├── models/           # Pydantic models
│   │   ├── services/         # Business logic
│   │   │   ├── ocr_service.py
│   │   │   ├── rag_service.py
│   │   │   └── ai_service.py
│   │   └── main.py
│   ├── pyproject.toml        # uv project config
│   ├── uv.lock               # uv lock file
│   └── .env
│
├── PRD.md
├── IMPLEMENTATION_PLAN.md
└── .gitignore
```

---

## Database Schema (Supabase)

```sql
-- Users table (admin, faculty, student)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Degree programs (BCA, MCA, B.Tech, etc.)
CREATE TABLE degrees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,          -- "Bachelor of Computer Application"
    code VARCHAR(50) UNIQUE NOT NULL,    -- "BCA"
    description TEXT,
    total_semesters INTEGER NOT NULL DEFAULT 6,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table (now linked to degree + semester)
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    degree_id UUID REFERENCES degrees(id) ON DELETE CASCADE,
    semester_number INTEGER NOT NULL CHECK (semester_number >= 1),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Faculty-Subject allocation (many-to-many, cross-functional)
CREATE TABLE faculty_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(faculty_id, subject_id)
);

-- Student enrollments (degree + current semester)
CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    degree_id UUID REFERENCES degrees(id) ON DELETE CASCADE,
    current_semester INTEGER NOT NULL DEFAULT 1,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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

-- Document chunks (for RAG)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,                   -- unit, section, page info
    embedding vector(1536),           -- pgvector embedding
    created_at TIMESTAMP DEFAULT NOW()
);

-- Faculty-generated exam papers
CREATE TABLE papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    units INTEGER[] NOT NULL,         -- Array of unit numbers
    difficulty VARCHAR(20) NOT NULL,  -- easy, medium, hard
    custom_instructions TEXT,
    question_config JSONB NOT NULL,   -- {mcq: 5, fill_blanks: 5, short: 6, long: 4}
    questions JSONB NOT NULL,         -- Generated questions array
    status VARCHAR(20) DEFAULT 'generated',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Student practice papers (separate from faculty exam papers)
CREATE TABLE practice_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    units INTEGER[] NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    question_config JSONB NOT NULL,
    questions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz attempts (student quiz history)
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    quiz_type VARCHAR(20) NOT NULL,   -- 'mcq' or 'fill_blanks'
    units INTEGER[] NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    questions JSONB NOT NULL,         -- Questions with student answers
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for similarity search
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create indexes for common queries
CREATE INDEX idx_subjects_degree ON subjects(degree_id, semester_number);
CREATE INDEX idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_practice_papers_student ON practice_papers(student_id);
CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);
```

---

## Phase 1: Foundation & Authentication

### Phase 1 Checklist

| # | Task | Status |
|---|------|--------|
| 1.1 | Initialize FastAPI project with uv | ✅ |
| 1.2 | Configure environment variables (.env) | ✅ |
| 1.3 | Set up Supabase client connection | ✅ |
| 1.4 | Configure CORS for React frontend | ✅ |
| 1.5 | Create `users` table in Supabase | ✅ |
| 1.6 | Seed admin account manually | ✅ |
| 1.7 | Implement JWT token generation/validation | ✅ |
| 1.8 | Implement password hashing (bcrypt) | ✅ |
| 1.9 | Create POST /api/auth/login endpoint | ✅ |
| 1.10 | Create POST /api/auth/logout endpoint | ✅ |
| 1.11 | Create GET /api/auth/me endpoint | ✅ |
| 1.12 | Create POST /api/admin/register endpoint | ✅ |
| 1.13 | Initialize React project with Vite + pnpm | ✅ |
| 1.14 | Configure routing (react-router-dom) | ✅ |
| 1.15 | Set up API service layer (axios/fetch) | ✅ |
| 1.16 | Create Auth context for global state | ✅ |
| 1.17 | Create Login page | ✅ |
| 1.18 | Create Admin dashboard page | ✅ |
| 1.19 | Create Faculty dashboard page (placeholder) | ✅ |
| 1.20 | Create RegisterFaculty component | ✅ |
| 1.21 | Create ProtectedRoute wrapper | ✅ |
| 1.22 | Test: Admin login → register faculty → faculty login | ✅ |

**Goal**: Working login system with admin registration capability

**Duration**: 3-4 days

### Backend Tasks

1. **Project Setup**
   - Initialize FastAPI project with uv: `uv init backend && cd backend && uv add fastapi uvicorn`
   - Configure environment variables (.env)
   - Set up Supabase client connection
   - Configure CORS for React frontend

2. **Database Setup**
   - Create `users` table in Supabase
   - Seed admin account(s) manually

3. **Auth Endpoints**
   ```
   POST /api/auth/login          - Faculty/Admin login
   POST /api/auth/logout         - Logout (invalidate session)
   GET  /api/auth/me             - Get current user info
   POST /api/admin/register      - Admin registers new faculty (admin only)
   ```

4. **Security**
   - JWT token generation and validation
   - Password hashing (bcrypt)
   - Role-based access control (admin vs faculty)

### Frontend Tasks

1. **Project Setup**
   - Initialize React with Vite using pnpm: `pnpm create vite frontend --template react`
   - Configure routing (react-router-dom)
   - Set up API service layer (axios/fetch)
   - Create Auth context for global state

2. **Pages**
   - Login page (email + password form)
   - Admin dashboard (with "Register Faculty" section)
   - Faculty dashboard (placeholder)

3. **Components**
   - Login form
   - Registration form (admin only)
   - Navigation header
   - Protected route wrapper

### Testable Outcome

```
1. Start backend: cd backend && uv run uvicorn app.main:app --reload
2. Start frontend: cd frontend && pnpm dev
3. Login as pre-seeded admin → See admin dashboard
4. Register a new faculty member
5. Logout → Login as new faculty → See faculty dashboard
```

### Files to Create

**Backend:**
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/core/security.py`
- `backend/app/core/supabase.py`
- `backend/app/api/auth.py`
- `backend/app/models/user.py`
- `backend/pyproject.toml`
- `backend/.env`

**Frontend:**
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/services/api.js`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/AdminDashboard.jsx`
- `frontend/src/pages/FacultyDashboard.jsx`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/components/RegisterFaculty.jsx`

---

## Phase 2: Subject Management & Dashboard

### Phase 2 Checklist

| # | Task | Status |
|---|------|--------|
| 2.1 | Create `subjects` table in Supabase | ✅ |
| 2.2 | Create `faculty_subjects` table in Supabase | ✅ |
| 2.3 | Seed sample subjects | ✅ |
| 2.4 | Create GET /api/subjects endpoint (admin) | ✅ |
| 2.5 | Create POST /api/subjects endpoint (admin) | ✅ |
| 2.6 | Create GET /api/faculty/subjects endpoint | ✅ |
| 2.7 | Create POST /api/admin/allocate-subject endpoint | ✅ |
| 2.8 | Create DELETE /api/admin/deallocate-subject endpoint | ✅ |
| 2.9 | Create GET /api/faculty/stats endpoint | ✅ |
| 2.10 | Enhance Admin dashboard - subject management section | ✅ |
| 2.11 | Enhance Admin dashboard - faculty allocation UI | ✅ |
| 2.12 | Create SubjectCard component | ✅ |
| 2.13 | Create StatsCard component | ✅ |
| 2.14 | Enhance Faculty dashboard - stats cards | ✅ |
| 2.15 | Enhance Faculty dashboard - subject cards grid | ✅ |
| 2.16 | Test: Admin creates subjects → allocates to faculty → faculty sees cards | ✅ |

**Goal**: Faculty sees allocated subjects, admin can manage subject allocations

**Duration**: 2-3 days

### Backend Tasks

1. **Database**
   - Create `subjects` and `faculty_subjects` tables
   - Seed sample subjects

2. **Endpoints**
   ```
   GET  /api/subjects                    - List all subjects (admin)
   POST /api/subjects                    - Create subject (admin)
   GET  /api/faculty/subjects            - Get faculty's allocated subjects
   POST /api/admin/allocate-subject      - Allocate subject to faculty (admin)
   DELETE /api/admin/deallocate-subject  - Remove allocation (admin)
   GET  /api/faculty/stats               - Get faculty statistics
   ```

### Frontend Tasks

1. **Admin Dashboard Enhancement**
   - Subject management section (CRUD)
   - Faculty list with subject allocation UI
   - Allocate/deallocate subjects to faculty

2. **Faculty Dashboard**
   - Statistics cards (Total Subjects, Papers Generated, View Papers)
   - Subject cards grid with "Create Paper" button
   - Each card shows subject name and code

3. **Components**
   - SubjectCard component
   - StatsCard component
   - SubjectAllocationModal

### Testable Outcome

```
1. Login as admin → Create new subjects
2. Allocate subjects to faculty members
3. Login as faculty → See allocated subjects as cards
4. See statistics (0 papers initially)
5. Click "Create Paper" → Navigate to paper creation (placeholder)
```

### Files to Create/Modify

**Backend:**
- `backend/app/api/subjects.py`
- `backend/app/models/subject.py`

**Frontend:**
- `frontend/src/pages/AdminDashboard.jsx` (enhance)
- `frontend/src/pages/FacultyDashboard.jsx` (enhance)
- `frontend/src/components/SubjectCard.jsx`
- `frontend/src/components/StatsCard.jsx`
- `frontend/src/components/SubjectManagement.jsx`
- `frontend/src/components/FacultyAllocation.jsx`

---

## Phase 3: Paper Creation Workflow (UI Only)

### Phase 3 Checklist

| # | Task | Status |
|---|------|--------|
| 3.1 | Create `documents` table in Supabase | ✅ |
| 3.2 | Create `papers` table in Supabase | ✅ |
| 3.3 | Create POST /api/documents/upload endpoint | ✅ |
| 3.4 | Create POST /api/documents/save-content endpoint | ✅ |
| 3.5 | Create GET /api/documents/{subject_id} endpoint | ✅ |
| 3.6 | Create POST /api/papers/create-draft endpoint | ✅ |
| 3.7 | Create GET /api/papers endpoint | ✅ |
| 3.8 | Create CreatePaper page with wizard layout | ✅ |
| 3.9 | Create StepIndicator component | ✅ |
| 3.10 | Create Step 1: UnitSelector component | ✅ |
| 3.11 | Create Step 2: ContentUploader component | ✅ |
| 3.12 | Create FileUpload component (drag & drop) | ✅ |
| 3.13 | Create Step 3: QuestionConfig component | ✅ |
| 3.14 | Create Step 4: CustomInstructions component | ✅ |
| 3.15 | Create Step 5: PreviewSummary component | ✅ |
| 3.16 | Wire up wizard navigation (next/back) | ✅ |
| 3.17 | Implement form state management across steps | ✅ |
| 3.18 | Test: Complete full wizard → paper draft saved | ✅ |

**Goal**: Complete paper creation wizard UI, data stored but no AI generation

**Duration**: 4-5 days

### Backend Tasks

1. **Database**
   - Create `documents` table
   - Create `papers` table (without questions initially)

2. **Endpoints**
   ```
   POST /api/documents/upload           - Upload file to Supabase Storage
   POST /api/documents/save-content     - Save syllabus + text content
   GET  /api/documents/{subject_id}     - Get documents for subject
   POST /api/papers/create-draft        - Save paper configuration (no generation)
   GET  /api/papers                     - List faculty's papers
   ```

### Frontend Tasks

1. **Paper Creation Wizard** (multi-step form)
   
   **Step 1: Unit Selection**
   - Checkboxes for Units 1-5
   - Visual feedback for selected units
   - "Next" button (disabled until at least 1 unit selected)

   **Step 2: Content Upload** (per selected unit)
   - Accordion/tabs for each unit
   - Syllabus input (textarea or file upload)
   - Reference material (file upload OR textarea)
   - Progress indicator for multi-unit completion
   - File type validation (PDF, DOCX, PPTX, TXT)

   **Step 3: Question Configuration**
   - Number inputs for each question type:
     - MCQ (0-50)
     - Fill in the Blanks (0-50)
     - Short Answer (0-50)
     - Long Answer (0-50)
   - Difficulty selector (Easy/Medium/Hard radio buttons)
   - Total questions counter

   **Step 4: Custom Instructions**
   - Optional textarea for priority topics
   - Example placeholders/hints
   - Character counter

   **Step 5: Preview & Confirmation**
   - Summary of all selections
   - Paper title input (editable)
   - Edit buttons to go back to specific steps
   - "Generate Paper" button (stores draft, shows "Coming Soon")

2. **Components**
   - StepIndicator (shows current step)
   - UnitSelector
   - ContentUploader
   - QuestionConfig
   - CustomInstructions
   - PreviewSummary
   - FileUpload (drag & drop)

### Testable Outcome

```
1. Login as faculty → Click "Create Paper" on a subject
2. Select units (e.g., Unit 1, 3, 5)
3. Upload/enter content for each selected unit
4. Configure question types and quantities
5. Add optional custom instructions
6. Preview all selections
7. Click "Generate" → See "Paper saved, generation coming soon"
8. Paper appears in "View Papers" (without questions)
```

### Files to Create

**Backend:**
- `backend/app/api/documents.py`
- `backend/app/api/papers.py`
- `backend/app/models/document.py`
- `backend/app/models/paper.py`

**Frontend:**
- `frontend/src/pages/CreatePaper.jsx`
- `frontend/src/components/wizard/StepIndicator.jsx`
- `frontend/src/components/wizard/UnitSelector.jsx`
- `frontend/src/components/wizard/ContentUploader.jsx`
- `frontend/src/components/wizard/QuestionConfig.jsx`
- `frontend/src/components/wizard/CustomInstructions.jsx`
- `frontend/src/components/wizard/PreviewSummary.jsx`
- `frontend/src/components/FileUpload.jsx`

---

## Phase 4: File Processing & OCR

### Phase 4 Checklist

| # | Task | Status |
|---|------|--------|
| 4.1 | Install mistralai SDK | ✅ |
| 4.2 | Configure Mistral OCR in ocr_service.py | ✅ |
| 4.3 | Implement PDF extraction via Mistral OCR API | ✅ |
| 4.4 | Handle DOCX/PPTX via Mistral OCR (smart extraction) | ✅ |
| 4.5 | Create POST /api/documents/process/{doc_id} endpoint | ✅ |
| 4.6 | Create GET /api/documents/status/{doc_id} endpoint | ✅ |
| 4.7 | Create GET /api/documents/content/{doc_id} endpoint | ✅ |
| 4.8 | Implement background processing with FastAPI BackgroundTasks | ✅ |
| 4.9 | Update document status flow (pending → processing → completed) | ✅ |
| 4.10 | Create ProcessingStatus component | ✅ |
| 4.11 | Create ExtractedTextPreview component | ✅ |
| 4.12 | Enhance ContentUploader with processing status | ✅ |
| 4.13 | Test: Upload PDF → see AI-extracted rich text | ✅ |
| 4.14 | Test: Upload DOCX/PPTX → see AI-extracted rich text | ✅ |
| 4.15 | Test: Upload TXT → see content | ✅ |

**Goal**: Upload files, extract text using Mistral OCR

**Duration**: 3-4 days

### Backend Tasks

1. **OCR Service (Mistral OCR)**
   - Install `mistralai` SDK
   - Use `mistral-ocr-latest` model for document understanding
   - Supports PDF, DOCX, PPTX with images, tables, equations, complex layouts
   - Upload file to Mistral → Get signed URL → Process with OCR → Return Markdown
   - Outputs structured Markdown with page boundaries
   - Store rich text in `documents.reference_text`

2. **File Processing Pipeline**
   ```
   Upload → Store in Supabase → Upload to Mistral → OCR Process → Update document status → Store text
   ```

3. **Endpoints**
   ```
   POST /api/documents/process/{doc_id}  - Trigger OCR processing
   GET  /api/documents/status/{doc_id}   - Check processing status
   GET  /api/documents/content/{doc_id}  - Get extracted content
   ```

4. **Background Processing**
   - Use FastAPI BackgroundTasks for OCR
   - Update status: pending → processing → completed/failed

### Frontend Tasks

1. **Upload Enhancement**
   - Show upload progress
   - Display processing status (spinner while OCR runs)
   - Show extracted text preview after completion
   - Error handling for failed OCR

2. **Components**
   - ProcessingStatus indicator
   - ExtractedTextPreview

### Testable Outcome

```
1. Upload a PDF file for a unit
2. See "Processing..." status
3. After OCR completes, see extracted text preview (Markdown format)
4. Verify text is stored in database
5. Test with DOCX, PPTX, and TXT files
```

### Files to Create

**Backend:**
- `backend/app/services/ocr_service.py`
- `backend/app/api/documents.py` (enhance)

**Frontend:**
- `frontend/src/components/ProcessingStatus.jsx`
- `frontend/src/components/ExtractedTextPreview.jsx`

### Dependencies to Add

```bash
# Using uv
uv add mistralai
```

---

## Phase 5: RAG Pipeline

### Phase 5 Checklist

| # | Task | Status |
|---|------|--------|
| 5.1 | Install LangChain and embedding libraries | ✅ |
| 5.2 | Create `document_chunks` table in Supabase | ✅ |
| 5.3 | Enable pgvector extension in Supabase | ✅ |
| 5.4 | Create rag_service.py with chunking logic | ✅ |
| 5.5 | Implement semantic chunking (500-1000 tokens) | ✅ |
| 5.6 | Configure embedding model (OpenAI or sentence-transformers) | ✅ |
| 5.7 | Implement embedding generation function | ✅ |
| 5.8 | Implement chunk storage in pgvector | ✅ |
| 5.9 | Create POST /api/rag/process/{doc_id} endpoint | ✅ |
| 5.10 | Create POST /api/rag/search endpoint | ✅ |
| 5.11 | Create GET /api/rag/status/{doc_id} endpoint | ✅ |
| 5.12 | Implement retrieval function (top-k chunks) | ✅ |
| 5.13 | Add unit filtering to retrieval | ✅ |
| 5.14 | Update UI with "Ready for Generation" status | ✅ |
| 5.15 | Test: Upload → OCR → chunking → embedding | ✅ |
| 5.16 | Test: Search query returns relevant chunks | ✅ |

**Goal**: Chunk documents, generate embeddings, enable semantic search

**Duration**: 4-5 days

### Backend Tasks

1. **RAG Service Setup**
   - Initialize LangChain
   - Configure embedding model (OpenAI text-embedding-3-small or sentence-transformers)
   - Set up pgvector connection

2. **Document Processing Pipeline**
   ```
   Extracted Text → Chunking → Embeddings → Store in pgvector
   ```

3. **Chunking Strategy**
   - Semantic chunking (by paragraphs/sections)
   - Chunk size: ~500-1000 tokens
   - Overlap: 100 tokens
   - Preserve metadata (unit number, section)

4. **Endpoints**
   ```
   POST /api/rag/process/{doc_id}     - Chunk and embed document
   POST /api/rag/search               - Semantic search across documents
   GET  /api/rag/status/{doc_id}      - Check embedding status
   ```

5. **Retrieval Function**
   - Input: query text, subject_id, unit_numbers
   - Output: top-k relevant chunks with scores
   - Filter by unit if specified

### Frontend Tasks

1. **Processing UI**
   - Show embedding progress after OCR
   - "Ready for Generation" status indicator

2. **Debug/Test UI** (optional, for development)
   - Search box to test retrieval
   - Display retrieved chunks

### Testable Outcome

```
1. Upload document → OCR → Automatic chunking & embedding
2. Use test endpoint to search: "What is OSI model?"
3. Get relevant chunks from uploaded networking document
4. Verify chunks stored in document_chunks table
5. Test multi-unit retrieval
```

### Files to Create

**Backend:**
- `backend/app/services/rag_service.py`
- `backend/app/api/rag.py`

### Dependencies to Add

```bash
# Using uv
uv add langchain langchain-community sentence-transformers
# OR for OpenAI embeddings:
uv add openai
```

---

## Phase 6: AI Question Generation

### Phase 6 Checklist

| # | Task | Status |
|---|------|--------|
| 6.1 | Install groq library | ✅ |
| 6.2 | Create ai_service.py with Groq client setup (llama-3.3-70b-versatile) | ✅ |
| 6.3 | Create MCQ prompt template | ✅ |
| 6.4 | Create Fill-in-blanks prompt template | ✅ |
| 6.5 | Create Short answer prompt template | ✅ |
| 6.6 | Create Long answer prompt template | ✅ |
| 6.7 | Implement system prompt builder with custom instructions | ✅ |
| 6.8 | Create Pydantic models for question types | ✅ |
| 6.9 | Implement structured output parsing | ✅ |
| 6.10 | Implement RAG-enhanced context building | ✅ |
| 6.11 | Create POST /api/generate/questions endpoint | ✅ |
| 6.12 | Create GET /api/generate/status/{id} endpoint | ✅ |
| 6.13 | Implement generation flow (config → retrieve → prompt → parse → store) | ✅ |
| 6.14 | Update wizard "Generate Paper" to trigger actual generation | ✅ |
| 6.15 | Add loading state with progress indicator | ✅ |
| 6.16 | Create generated paper view (questions by section) | ✅ |
| 6.17 | Add toggle for answer visibility | ✅ |
| 6.18 | Test: Generate MCQs from uploaded content | ✅ |
| 6.19 | Test: Generate all question types | ✅ |
| 6.20 | Test: Custom instructions respected | ✅ |
| 6.21 | Test: Different difficulty levels | ✅ |

**Goal**: Generate questions using Groq (llama-3.3-70b-versatile) with RAG-enhanced context

**Duration**: 5-6 days

### Backend Tasks

1. **AI Service Setup**
   - Configure Groq API client (model: llama-3.3-70b-versatile)
   - Create prompt templates for each question type
   - Implement structured output parsing

2. **Prompt Engineering**
   
   **System Prompt Structure:**
   ```
   You are an expert question paper generator for educational institutions.
   
   Subject: {subject_name}
   Units: {unit_numbers}
   Difficulty: {difficulty}
   Custom Instructions: {custom_instructions}
   
   Reference Content:
   {retrieved_chunks}
   
   Syllabus:
   {syllabus_text}
   
   Generate the following questions:
   - {mcq_count} MCQs (with 4 options each, mark correct answer)
   - {fill_blanks_count} Fill in the Blanks
   - {short_count} Short Answer Questions (2-5 marks)
   - {long_count} Long Answer Questions (10+ marks)
   
   Output in JSON format...
   ```

3. **Question Type Handlers**
   - MCQ generator (includes match-the-following, true/false, assertion)
   - Fill-in-blanks generator
   - Short answer generator
   - Long answer generator

4. **Output Parsing**
   ```python
   class MCQuestion(BaseModel):
       question: str
       options: List[str]  # 4 options
       correct_answer: str
       explanation: Optional[str]
   
   class FillBlankQuestion(BaseModel):
       question: str  # with ___ for blank
       answer: str
   
   class ShortQuestion(BaseModel):
       question: str
       expected_points: List[str]
       marks: int
   
   class LongQuestion(BaseModel):
       question: str
       expected_points: List[str]
       marks: int
   ```

5. **Endpoints**
   ```
   POST /api/generate/questions      - Generate questions for paper
   GET  /api/generate/status/{id}    - Check generation status
   ```

6. **Generation Flow**
   ```
   Paper Config → Retrieve Relevant Chunks → Build Prompt → Groq API → Parse Response → Store Questions
   ```

### Frontend Tasks

1. **Generation UI**
   - "Generate Paper" triggers actual generation
   - Loading state with progress indicator
   - Error handling with retry option

2. **Generated Paper View**
   - Display questions by type (sections)
   - Show correct answers (toggle visibility)
   - Paper metadata header

### Testable Outcome

```
1. Complete paper creation wizard
2. Click "Generate Paper"
3. See generation progress
4. View generated questions organized by type
5. Verify questions are relevant to uploaded content
6. Test with different difficulty levels
7. Test custom instructions (e.g., "Include OSI model question")
```

### Files to Create

**Backend:**
- `backend/app/services/ai_service.py`
- `backend/app/api/generation.py`
- `backend/app/models/question.py`

### Dependencies to Add

```bash
# Using uv
uv add groq
```

### Groq Rate Limits (Free Tier)

| Model | RPM | RPD | TPM | TPD |
|-------|-----|-----|-----|-----|
| llama-3.3-70b-versatile | 30 | 1,000 | 12,000 | 100,000 |

**Note**: 1K requests/day is sufficient for ~10-20 paper generations. For higher volume, consider upgrading to Groq's Developer Plan or using fallback models like `meta-llama-4-scout-17b`.

---

## Phase 7: Paper Management & Export

### Phase 7 Checklist

| # | Task | Status |
|---|------|--------|
| 7.1 | Install reportlab and python-docx | ✅ |
| 7.2 | Enhance GET /api/papers with pagination | ✅ |
| 7.3 | Create GET /api/papers/{id} endpoint | ✅ |
| 7.4 | Create DELETE /api/papers/{id} endpoint | ✅ |
| 7.5 | Create export_service.py | ✅ |
| 7.6 | Implement PDF generation with formatting | ✅ |
| 7.7 | Implement DOCX generation with formatting | ✅ |
| 7.8 | Create GET /api/papers/{id}/download endpoint | ✅ |
| 7.9 | Update faculty stats calculation | ✅ |
| 7.10 | Create PapersList page with table/grid | ✅ |
| 7.11 | Create PaperCard component | ✅ |
| 7.12 | Create PaperDetail page | ✅ |
| 7.13 | Add download button (PDF/DOCX options) | ✅ |
| 7.14 | Create DeleteConfirmModal component | ✅ |
| 7.15 | Update dashboard stats with real data | ✅ |
| 7.16 | Add "View Papers" navigation | ✅ |
| 7.17 | Test: View papers list | ✅ |
| 7.18 | Test: Download PDF with correct formatting | ✅ |
| 7.19 | Test: Download DOCX with correct formatting | ✅ |
| 7.20 | Test: Delete paper and verify removal | ✅ |

**Goal**: View, download, delete generated papers

**Duration**: 3-4 days

### Backend Tasks

1. **Paper Management Endpoints**
   ```
   GET  /api/papers                  - List all papers (with pagination)
   GET  /api/papers/{id}             - Get paper details with questions
   DELETE /api/papers/{id}           - Delete paper
   GET  /api/papers/{id}/download    - Download as PDF/DOCX
   ```

2. **Export Service**
   - PDF generation (using reportlab or weasyprint)
   - DOCX generation (using python-docx)
   - Professional formatting with header, sections, numbering

3. **Paper Format Template**
   ```
   ┌─────────────────────────────────────────┐
   │ [Institution Name]                       │
   │ Subject: {subject_name}                  │
   │ Units: {units}  |  Difficulty: {level}   │
   │ Date: {date}    |  Faculty: {name}       │
   ├─────────────────────────────────────────┤
   │ SECTION A: Multiple Choice Questions    │
   │ 1. Question text...                      │
   │    a) Option 1  b) Option 2              │
   │    c) Option 3  d) Option 4              │
   │ ...                                      │
   ├─────────────────────────────────────────┤
   │ SECTION B: Fill in the Blanks           │
   │ ...                                      │
   └─────────────────────────────────────────┘
   ```

4. **Statistics Update**
   - Update faculty paper count on generation
   - Track papers per subject

### Frontend Tasks

1. **Papers List Page**
   - Table/grid of generated papers
   - Columns: Title, Subject, Units, Date, Difficulty, Actions
   - Pagination

2. **Paper Detail View**
   - Full paper display with all questions
   - Print-friendly layout
   - Toggle answer visibility

3. **Actions**
   - Download button (PDF/DOCX options)
   - Delete with confirmation modal
   - "Generate Another" quick action

4. **Dashboard Stats**
   - Update stats cards with real data
   - Click "View Papers" → Navigate to papers list

### Testable Outcome

```
1. Generate a paper
2. Navigate to "View Papers" → See paper in list
3. Click paper → View full details
4. Download as PDF → Verify formatting
5. Download as DOCX → Verify formatting
6. Delete paper → Confirm removal
7. Check dashboard stats reflect changes
```

### Files to Create

**Backend:**
- `backend/app/services/export_service.py`
- `backend/app/api/papers.py` (enhance)

**Frontend:**
- `frontend/src/pages/PapersList.jsx`
- `frontend/src/pages/PaperDetail.jsx`
- `frontend/src/components/PaperCard.jsx`
- `frontend/src/components/DeleteConfirmModal.jsx`

### Dependencies to Add

```bash
# Using uv
uv add reportlab python-docx
```

---

## Phase 8: Polish & Integration

### Phase 8 Checklist

| # | Task | Status |
|---|------|--------|
| 8.1 | Add global error boundary (React) | ✅ |
| 8.2 | Add API error interceptor with user-friendly messages | ✅ |
| 8.3 | Add retry logic for failed operations | ✅ |
| 8.4 | Add form validation messages | ✅ |
| 8.5 | Add skeleton loaders for data fetching | ✅ |
| 8.6 | Add progress indicators for long operations | ✅ |
| 8.7 | Disable buttons during submissions | ✅ |
| 8.8 | Add responsive design for different screen sizes | ✅ |
| 8.9 | Ensure consistent styling across pages | ✅ |
| 8.10 | Add tooltips and help text | ✅ |
| 8.11 | Add success/error toast notifications | ✅ |
| 8.12 | Implement proportional question distribution across units | ✅ |
| 8.13 | Add unit-wise breakdown in preview | ✅ |
| 8.14 | Handle empty states (no subjects, no papers) | ✅ |
| 8.15 | Handle large file uploads gracefully | ✅ |
| 8.16 | Handle session expiry | ✅ |
| 8.17 | E2E Test: Admin creates subject | ✅ |
| 8.18 | E2E Test: Admin registers faculty | ✅ |
| 8.19 | E2E Test: Admin allocates subject to faculty | ✅ |
| 8.20 | E2E Test: Faculty login and sees dashboard | ✅ |
| 8.21 | E2E Test: Faculty uploads files | ✅ |
| 8.22 | E2E Test: OCR extracts text correctly | ✅ |
| 8.23 | E2E Test: RAG retrieves relevant content | ✅ |
| 8.24 | E2E Test: Questions generate for all types | ✅ |
| 8.25 | E2E Test: Custom instructions respected | ✅ |
| 8.26 | E2E Test: Papers viewed/downloaded/deleted | ✅ |
| 8.27 | E2E Test: Statistics update correctly | ✅ |

**Goal**: Error handling, UX improvements, final integration testing

**Duration**: 3-4 days

### Tasks

1. **Error Handling**
   - Global error boundary (React)
   - API error interceptor with user-friendly messages
   - Retry logic for failed operations
   - Validation messages for forms

2. **Loading States**
   - Skeleton loaders for data fetching
   - Progress indicators for long operations
   - Disable buttons during submissions

3. **UI/UX Improvements**
   - Responsive design for different screen sizes
   - Consistent styling across pages
   - Tooltips and help text
   - Success/error toast notifications

4. **Multi-Unit Refinement**
   - Ensure proportional question distribution
   - Display unit-wise breakdown in preview
   - Tag questions with source unit

5. **Edge Cases**
   - Empty states (no subjects, no papers)
   - Large file handling
   - Session expiry handling
   - Concurrent generation requests

6. **Final Testing Checklist**
   - [ ] Admin can register faculty
   - [ ] Admin can create/manage subjects
   - [ ] Admin can allocate subjects to faculty
   - [ ] Faculty can login and see dashboard
   - [ ] Faculty can see allocated subjects
   - [ ] Faculty can upload files (PDF, DOCX, TXT)
   - [ ] OCR extracts text correctly
   - [ ] RAG retrieves relevant content
   - [ ] Questions generate for all types
   - [ ] Custom instructions are respected
   - [ ] Papers can be viewed/downloaded/deleted
   - [ ] Statistics update correctly

### Testable Outcome

```
Complete end-to-end workflow:
1. Admin creates subject "Computer Networks"
2. Admin registers faculty "Prof. Smith"
3. Admin allocates subject to faculty
4. Prof. Smith logs in, sees subject
5. Creates paper: selects Units 1,3, uploads PDFs
6. Configures: 10 MCQs, 5 short, 3 long, Medium difficulty
7. Adds instruction: "Include OSI model question"
8. Generates paper successfully
9. Views paper, downloads PDF
10. Dashboard shows "1 Paper Generated"
```

---

## Phase 9: Degree & Semester Structure

### Phase 9 Checklist

| # | Task | Status |
|---|------|--------|
| 9.1 | Create `degrees` table in Supabase | ⬜ |
| 9.2 | Modify `subjects` table to add degree_id and semester_number | ⬜ |
| 9.3 | Create GET /api/degrees endpoint | ⬜ |
| 9.4 | Create POST /api/degrees endpoint (admin) | ⬜ |
| 9.5 | Create PUT /api/degrees/{id} endpoint (admin) | ⬜ |
| 9.6 | Create DELETE /api/degrees/{id} endpoint (admin) | ⬜ |
| 9.7 | Update POST /api/subjects to include degree_id and semester | ⬜ |
| 9.8 | Create GET /api/degrees/{id}/subjects endpoint | ⬜ |
| 9.9 | Update Admin dashboard - add Degree Management section | ⬜ |
| 9.10 | Create DegreeCard component | ⬜ |
| 9.11 | Create DegreeForm component (create/edit) | ⬜ |
| 9.12 | Update Subject creation form to include degree/semester selection | ⬜ |
| 9.13 | Create semester filter/tabs in subject management | ⬜ |
| 9.14 | Update faculty allocation to show degree/semester info | ⬜ |
| 9.15 | Migrate existing subjects (if any) to new structure | ⬜ |
| 9.16 | Test: Admin creates degree → adds subjects to semesters | ⬜ |

**Goal**: Hierarchical academic structure (Degree → Semester → Subjects)

**Duration**: 3-4 days

### Backend Tasks

1. **Database Migration**
   - Create `degrees` table
   - Alter `subjects` table: add `degree_id` and `semester_number` columns
   - Create migration SQL script in `/sql/phase9_schema.sql`

2. **Endpoints**
   ```
   GET    /api/degrees                    - List all degrees
   POST   /api/degrees                    - Create degree (admin)
   PUT    /api/degrees/{id}               - Update degree (admin)
   DELETE /api/degrees/{id}               - Delete degree (admin)
   GET    /api/degrees/{id}/subjects      - Get subjects by degree (optionally filter by semester)
   ```

3. **Subject Endpoints Update**
   - Modify `POST /api/subjects` to require `degree_id` and `semester_number`
   - Update `GET /api/subjects` to support filtering by degree/semester

### Frontend Tasks

1. **Admin Dashboard Enhancement**
   - Degree Management section (CRUD)
   - Degree cards with semester count display
   - Subject assignment organized by semester

2. **Components**
   - DegreeCard
   - DegreeForm (create/edit modal)
   - SemesterTabs (for viewing subjects per semester)

### Testable Outcome

```
1. Admin creates degree "BCA" with 6 semesters
2. Admin creates degree "MCA" with 4 semesters
3. Admin adds subject "DBMS" to BCA Semester 3
4. Admin adds subject "Python" to MCA Semester 1
5. View degrees list with subject counts
6. Filter subjects by degree and semester
```

### Files to Create/Modify

**Backend:**
- `backend/app/api/degrees.py` (new)
- `backend/app/models/degree.py` (new)
- `backend/app/api/subjects.py` (modify)
- `sql/phase9_schema.sql` (new)

**Frontend:**
- `frontend/src/components/DegreeCard.jsx`
- `frontend/src/components/DegreeForm.jsx`
- `frontend/src/components/SemesterTabs.jsx`
- `frontend/src/pages/AdminDashboard.jsx` (enhance)

---

## Phase 10: Student Role & Practice Papers

### Phase 10 Checklist

| # | Task | Status |
|---|------|--------|
| 10.1 | Create `student_enrollments` table in Supabase | ⬜ |
| 10.2 | Create `practice_papers` table in Supabase | ⬜ |
| 10.3 | Update users table role constraint to include 'student' | ⬜ |
| 10.4 | Create POST /api/admin/register-student endpoint | ⬜ |
| 10.5 | Create GET /api/students endpoint (admin) | ⬜ |
| 10.6 | Create PUT /api/students/{id}/semester endpoint (admin) | ⬜ |
| 10.7 | Create GET /api/student/subjects endpoint | ⬜ |
| 10.8 | Create GET /api/student/subjects/{id} endpoint (with materials) | ⬜ |
| 10.9 | Create GET /api/documents/{subject_id}/files endpoint (student access) | ⬜ |
| 10.10 | Create POST /api/student/practice-papers endpoint | ⬜ |
| 10.11 | Create GET /api/student/practice-papers endpoint | ⬜ |
| 10.12 | Create DELETE /api/student/practice-papers/{id} endpoint | ⬜ |
| 10.13 | Create GET /api/student/practice-papers/{id}/download endpoint | ⬜ |
| 10.14 | Update login to handle student role routing | ⬜ |
| 10.15 | Create StudentDashboard page | ⬜ |
| 10.16 | Create StudentSubjectCard component | ⬜ |
| 10.17 | Create SubjectDetailPage (student view) | ⬜ |
| 10.18 | Create MaterialsList component (download files) | ⬜ |
| 10.19 | Create PracticePaperWizard (simplified version of CreatePaper) | ⬜ |
| 10.20 | Create StudentPapersList page | ⬜ |
| 10.21 | Add student registration to Admin dashboard | ⬜ |
| 10.22 | Add student management section (view, update semester) | ⬜ |
| 10.23 | Test: Admin registers student with degree/semester | ⬜ |
| 10.24 | Test: Student login → sees only enrolled subjects | ⬜ |
| 10.25 | Test: Student views materials and downloads files | ⬜ |
| 10.26 | Test: Student generates practice paper | ⬜ |
| 10.27 | Test: Admin updates student semester | ⬜ |

**Goal**: Student role with restricted access, material viewing, practice paper generation

**Duration**: 5-6 days

### Backend Tasks

1. **Database**
   - Create `student_enrollments` table
   - Create `practice_papers` table
   - Update users role constraint
   - Create migration SQL in `/sql/phase10_schema.sql`

2. **Student Registration (Admin)**
   ```
   POST /api/admin/register-student
   Body: { name, email, password, degree_id, semester }
   ```

3. **Student Management (Admin)**
   ```
   GET  /api/students                      - List all students
   PUT  /api/students/{id}/semester        - Update student's current semester
   GET  /api/students/{id}                 - Get student details
   ```

4. **Student Subject Access**
   ```
   GET  /api/student/subjects              - Get subjects for enrolled degree/semester
   GET  /api/student/subjects/{id}         - Get subject details with syllabus
   GET  /api/documents/{subject_id}/files  - Get downloadable files for subject
   ```

5. **Practice Papers**
   ```
   POST   /api/student/practice-papers           - Generate practice paper
   GET    /api/student/practice-papers           - List student's practice papers
   GET    /api/student/practice-papers/{id}      - Get practice paper details
   DELETE /api/student/practice-papers/{id}      - Delete practice paper
   GET    /api/student/practice-papers/{id}/download - Download as PDF/DOCX
   ```

6. **Practice Paper Generation**
   - Reuse AI generation logic from faculty papers
   - Store in `practice_papers` table (separate from `papers`)
   - Use same RAG pipeline for question generation

### Frontend Tasks

1. **Student Dashboard**
   - Welcome message with enrollment info
   - Stats cards (Subjects, Practice Papers, Quizzes)
   - Subject cards grid (restricted to enrolled degree/semester)

2. **Subject Detail View**
   - Subject info (name, code, description)
   - Syllabus display per unit
   - Materials list with download buttons
   - "Generate Practice Paper" button
   - "Take Quiz" button (placeholder for Phase 11)

3. **Practice Paper Wizard**
   - Simplified version of CreatePaper wizard
   - Unit selection, question config, difficulty
   - No content upload (uses faculty-uploaded content)
   - Generate → View → Download

4. **Admin Student Management**
   - Student registration form (name, email, password, degree, semester)
   - Students list view
   - Semester update action

### Testable Outcome

```
1. Admin creates student "John Doe" enrolled in BCA Semester 3
2. Student logs in → sees BCA Sem 3 subjects only
3. Student clicks subject → views syllabus and materials
4. Student downloads a PDF uploaded by faculty
5. Student generates practice paper (10 MCQs, Medium difficulty)
6. Student views and downloads practice paper
7. Admin updates student to Semester 4
8. Student now sees Semester 4 subjects
9. Previous practice papers still accessible in history
```

### Files to Create/Modify

**Backend:**
- `backend/app/api/students.py` (new)
- `backend/app/api/practice_papers.py` (new)
- `backend/app/models/student.py` (new)
- `backend/app/models/practice_paper.py` (new)
- `backend/app/api/auth.py` (modify for student role)
- `sql/phase10_schema.sql` (new)

**Frontend:**
- `frontend/src/pages/StudentDashboard.jsx` (new)
- `frontend/src/pages/StudentSubjectDetail.jsx` (new)
- `frontend/src/pages/StudentPapersList.jsx` (new)
- `frontend/src/pages/PracticePaperWizard.jsx` (new)
- `frontend/src/components/StudentSubjectCard.jsx` (new)
- `frontend/src/components/MaterialsList.jsx` (new)
- `frontend/src/components/StudentRegistrationForm.jsx` (new)
- `frontend/src/context/AuthContext.jsx` (modify for student routing)
- `frontend/src/App.jsx` (add student routes)

---

## Phase 11: Quiz System

### Phase 11 Checklist

| # | Task | Status |
|---|------|--------|
| 11.1 | Create `quiz_attempts` table in Supabase | ⬜ |
| 11.2 | Create POST /api/student/quizzes/start endpoint | ⬜ |
| 11.3 | Create POST /api/student/quizzes/{id}/submit endpoint | ⬜ |
| 11.4 | Create GET /api/student/quizzes/history endpoint | ⬜ |
| 11.5 | Create GET /api/student/quizzes/{id} endpoint (review mode) | ⬜ |
| 11.6 | Implement MCQ quiz generation logic | ⬜ |
| 11.7 | Implement Fill-in-the-Blanks quiz generation logic | ⬜ |
| 11.8 | Implement answer validation and scoring | ⬜ |
| 11.9 | Create QuizConfigModal component | ⬜ |
| 11.10 | Create QuizSession page | ⬜ |
| 11.11 | Create QuizQuestion component (MCQ) | ⬜ |
| 11.12 | Create QuizQuestion component (Fill-in-the-Blanks) | ⬜ |
| 11.13 | Create QuizProgress component | ⬜ |
| 11.14 | Create QuizResults page | ⬜ |
| 11.15 | Create QuizReview component (show correct answers) | ⬜ |
| 11.16 | Create QuizHistory page | ⬜ |
| 11.17 | Add quiz stats to StudentDashboard | ⬜ |
| 11.18 | Test: Student starts MCQ quiz | ⬜ |
| 11.19 | Test: Student completes quiz and sees score | ⬜ |
| 11.20 | Test: Student reviews answers after completion | ⬜ |
| 11.21 | Test: Quiz history shows all attempts | ⬜ |
| 11.22 | Test: Fill-in-the-Blanks quiz works correctly | ⬜ |

**Goal**: Interactive quiz system with MCQ and Fill-in-the-Blanks, scoring, and history

**Duration**: 4-5 days

### Backend Tasks

1. **Database**
   - Create `quiz_attempts` table
   - Create migration SQL in `/sql/phase11_schema.sql`

2. **Quiz Endpoints**
   ```
   POST /api/student/quizzes/start
   Body: { subject_id, quiz_type, units, num_questions }
   Response: { quiz_id, questions: [...] }
   
   POST /api/student/quizzes/{id}/submit
   Body: { answers: [{question_id, answer}] }
   Response: { score, percentage, correct_answers, results: [...] }
   
   GET  /api/student/quizzes/history
   Response: { attempts: [...] }
   
   GET  /api/student/quizzes/{id}
   Response: { quiz details with questions and answers for review }
   ```

3. **Quiz Generation Logic**
   - **MCQ Quiz**: Generate N MCQs using AI (similar to paper generation but MCQ-only)
   - **Fill-in-Blanks Quiz**: Generate N fill-in-the-blank questions
   - Use RAG to retrieve relevant content
   - Each question includes correct answer for validation

4. **Scoring Logic**
   - MCQ: Exact match of selected option
   - Fill-in-Blanks: Case-insensitive string matching (with optional fuzzy matching)
   - Calculate percentage: (correct / total) * 100

### Frontend Tasks

1. **Quiz Configuration**
   - Modal to configure quiz before starting
   - Select quiz type (MCQ / Fill-in-the-Blanks)
   - Select units (checkboxes)
   - Set number of questions (10, 20, 30)
   - Start button

2. **Quiz Session Interface**
   - One question per screen
   - Progress bar (Question X of Y)
   - MCQ: Radio buttons for options
   - Fill-in-Blanks: Text input field
   - Next/Previous navigation
   - Submit Quiz button (on last question)

3. **Quiz Results**
   - Score display (8/10 = 80%)
   - Visual feedback (pass/fail indicator)
   - "Review Answers" button
   - "Try Again" button
   - "Back to Subject" button

4. **Quiz Review**
   - Show each question with:
     - Student's answer (highlighted)
     - Correct answer
     - Visual indicator (✓ or ✗)

5. **Quiz History**
   - List of all quiz attempts
   - Columns: Subject, Type, Score, Date
   - Click to review past quiz

### Testable Outcome

```
1. Student navigates to subject → clicks "Take Quiz"
2. Configures: MCQ, Units 1-2, 10 questions
3. Quiz starts, student answers questions one by one
4. Submits quiz → sees score (e.g., 7/10 = 70%)
5. Reviews answers → sees correct vs. incorrect
6. Takes another quiz (Fill-in-the-Blanks)
7. Views quiz history → sees both attempts
8. Dashboard shows updated quiz stats
```

### Files to Create

**Backend:**
- `backend/app/api/quizzes.py` (new)
- `backend/app/models/quiz.py` (new)
- `backend/app/services/quiz_service.py` (new)
- `sql/phase11_schema.sql` (new)

**Frontend:**
- `frontend/src/pages/QuizSession.jsx` (new)
- `frontend/src/pages/QuizResults.jsx` (new)
- `frontend/src/pages/QuizHistory.jsx` (new)
- `frontend/src/components/QuizConfigModal.jsx` (new)
- `frontend/src/components/QuizQuestion.jsx` (new)
- `frontend/src/components/QuizProgress.jsx` (new)
- `frontend/src/components/QuizReview.jsx` (new)

---

## Summary Timeline

| Phase | Duration | Cumulative | Deliverable |
|-------|----------|------------|-------------|
| Phase 1: Foundation & Auth | 3-4 days | Week 1 | Working login, admin registration |
| Phase 2: Subjects & Dashboard | 2-3 days | Week 1-2 | Subject management, faculty dashboard |
| Phase 3: Paper Wizard UI | 4-5 days | Week 2-3 | Complete creation workflow (no AI) |
| Phase 4: File Processing & OCR | 3-4 days | Week 3 | File upload, text extraction |
| Phase 5: RAG Pipeline | 4-5 days | Week 4 | Chunking, embeddings, retrieval |
| Phase 6: AI Generation | 5-6 days | Week 5 | Question generation with Groq |
| Phase 7: Paper Management | 3-4 days | Week 5-6 | View, download, delete papers |
| Phase 8: Polish | 3-4 days | Week 6 | Error handling, UX, final testing |
| **Phase 9: Degree & Semester** | 3-4 days | Week 7 | Academic hierarchy structure |
| **Phase 10: Student Role** | 5-6 days | Week 8 | Student access, practice papers |
| **Phase 11: Quiz System** | 4-5 days | Week 9 | Interactive quizzes with scoring |

**Total Estimated Time: 8-9 weeks** (including new phases)

---

## Environment Variables

```env
# backend/.env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key  # For embeddings (optional)
```

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

---

## Getting Started Commands

```bash
# Backend setup (using uv)
cd backend
uv venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uv pip install -r requirements.txt
# OR use uv sync if using pyproject.toml
uv run uvicorn app.main:app --reload

# Frontend setup (using pnpm)
cd frontend
pnpm install
pnpm dev
```

---

## Notes for AI Agent Development

Each phase is designed to be:
1. **Self-contained**: Can be completed independently
2. **Testable**: Has clear verification steps
3. **Incremental**: Builds on previous phases
4. **Modular**: Files are organized for easy AI agent parsing

When building with AI agents:
- Complete one phase fully before moving to next
- Test the runnable outcome before proceeding
- Commit after each phase completion
- Reference this document for file structure and endpoints
