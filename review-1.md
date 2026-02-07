# Review 1: Requirement Analysis Document & System Design Document

## AI-Powered Question Paper Generator

**Team Members**: [Your Names]  
**Guide**: [Guide Name]  
**Course**: CSCI 3091 Project Work  
**Date**: January 2026

---

# PART A: REQUIREMENT ANALYSIS DOCUMENT (RAD)

---

## Slide 1: Title Slide

- **Project Title**: AI-Powered Question Paper Generator
- Team Members: [Your Names]
- Guide: [Guide Name]
- Course: CSCI 3091 Project Work
- Date: January 2026

---

## Slide 2: Introduction – Purpose of the System

- Automates question paper creation for college exams
- Uses AI to generate questions from uploaded study materials
- Reduces manual effort for faculty members
- Provides practice papers and quizzes for students
- Supports multiple question types (MCQ, Short Answer, Long Answer, Fill-in-blanks)

---

## Slide 3: Scope of the System

**Users**: Admin, Faculty, Students

**Core Functions**:
- User authentication & role-based access
- Degree, semester & subject management
- Document upload with OCR support
- AI-based question generation
- Practice papers and quizzes for students

**Out of Scope (V1)**:
- LMS integration
- Mobile application
- Answer key generation
- Bloom's taxonomy tagging

---

## Slide 4: Objectives & Success Criteria

| Objective | Success Criteria |
|-----------|------------------|
| Reduce paper creation time | 80% reduction (< 15 mins vs 2-3 hrs) |
| Question quality | 90% faculty satisfaction |
| Syllabus alignment | 95%+ topic coverage |
| Question variety | Different phrasings per generation |
| Student engagement | 60%+ students use practice papers |

---

## Slide 5: Current System (Problem Statement)

| Problem | Impact |
|---------|--------|
| Manual paper creation | Takes 2-3 hours per paper |
| Quality inconsistency | Questions may lack depth or relevance |
| Repetitive work | Same effort every semester |
| Limited variety | Hard to generate diverse questions |
| No student resources | Students lack practice materials |
| Question bank maintenance | Labor-intensive for faculty |

---

## Slide 6: Proposed System – Overview

- Web-based application accessible from any browser
- **Admin**: Manages degrees, semesters, subjects, and users
- **Faculty**: Uploads materials → Configures paper → Downloads generated paper
- **Students**: Access materials, generate practice papers, take quizzes
- AI-powered generation using RAG (Retrieval-Augmented Generation)
- OCR support for scanned documents

---

## Slide 7: Functional Requirements

| FR# | Category | Requirement |
|-----|----------|-------------|
| FR1 | Auth | User authentication (Admin/Faculty/Student) |
| FR2 | Auth | Role-based dashboard routing |
| FR3 | Admin | Register faculty and students |
| FR5 | Admin | CRUD operations for degree programs |
| FR7 | Admin | Create subjects and assign to degree/semester |
| FR8 | Admin | Allocate subjects to faculty |
| FR11 | Faculty | Select single or multiple units for paper |
| FR12 | Faculty | Upload syllabus and reference materials |
| FR14 | Faculty | OCR for scanned documents |
| FR15 | Faculty | Configure question types and quantities |
| FR16 | Faculty | Select difficulty level (Easy/Medium/Hard) |
| FR25 | Faculty | Export papers in PDF and DOCX |
| FR30 | Student | Generate practice papers |
| FR33 | Student | Take MCQ quizzes |
| FR36 | Student | Review answers after quiz |

---

## Slide 8: Non-Functional Requirements

| Requirement | Description |
|-------------|-------------|
| **Performance** | Paper generated within 2-3 minutes |
| **Usability** | Simple interface for non-technical users |
| **Reliability** | 95%+ valid question generation |
| **Scalability** | Support multiple concurrent users |
| **Security** | Role-based access, JWT authentication |
| **Data Isolation** | Student papers hidden from faculty & vice versa |
| **Availability** | System accessible 24/7 |
| **Accuracy** | Questions aligned with provided syllabus |

---

## Slide 9: Use Case Diagram

```mermaid
flowchart TB
    subgraph Actors
        Admin((Admin))
        Faculty((Faculty))
        Student((Student))
    end

    subgraph AdminUC["Admin Use Cases"]
        A1[Register Faculty]
        A2[Register Student]
        A3[Manage Degrees]
        A4[Manage Semesters]
        A5[Manage Subjects]
        A6[Allocate Subjects to Faculty]
        A7[Update Student Semester]
    end

    subgraph FacultyUC["Faculty Use Cases"]
        F1[Login]
        F2[View Dashboard]
        F3[Upload Syllabus]
        F4[Upload Reference Material]
        F5[Configure Question Paper]
        F6[Generate Question Paper]
        F7[Download Paper]
        F8[View Generated Papers]
    end

    subgraph StudentUC["Student Use Cases"]
        S1[Login]
        S2[View Dashboard]
        S3[View Subject Materials]
        S4[Download Study Materials]
        S5[Generate Practice Paper]
        S6[Take MCQ Quiz]
        S7[Take Fill-in-Blanks Quiz]
        S8[View Quiz Score]
    end

    Admin --> A1
    Admin --> A2
    Admin --> A3
    Admin --> A4
    Admin --> A5
    Admin --> A6
    Admin --> A7
    Faculty --> F1
    Faculty --> F2
    Faculty --> F3
    Faculty --> F4
    Faculty --> F5
    Faculty --> F6
    Faculty --> F7
    Faculty --> F8
    Student --> S1
    Student --> S2
    Student --> S3
    Student --> S4
    Student --> S5
    Student --> S6
    Student --> S7
    Student --> S8
```

---

## Slide 10: User Interface – Key Screens

| Screen | Description |
|--------|-------------|
| Login Page | Username/password with role selection |
| Admin Dashboard | Cards for Degrees, Subjects, Faculty, Students |
| Faculty Dashboard | Subject cards with "Create Paper" button |
| Paper Creation Wizard | Step-by-step: Units → Upload → Config → Generate |
| Student Dashboard | Enrolled subjects, practice papers, quiz history |
| Quiz Interface | Question display, timer, submit button |

*(Add screenshots or wireframes)*

---

# PART B: SYSTEM DESIGN DOCUMENT (SDD)

---

## Slide 11: System Design – Introduction

**Purpose**: Define the architecture for building the system

**Design Goals**:
- Modular, scalable architecture
- Clear separation between frontend & backend
- AI services as pluggable components
- Secure role-based access control
- Maintainable and extensible codebase

---

## Slide 12: Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19 + Vite 7 | Fast, modern UI framework |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Backend | FastAPI (Python 3.12) | High-performance API server |
| Database | Supabase (PostgreSQL) | Cloud-hosted relational DB |
| Vector Store | pgvector | Embeddings for RAG |
| OCR | Mistral OCR API | Extract text from documents |
| AI Generation | Groq (Llama 3.3 70B) | Question generation |
| Orchestration | LangChain | RAG pipeline management |
| Auth | JWT Tokens | Secure authentication |

---

## Slide 13: System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser[Web Browser]
    end

    subgraph Frontend["Frontend Layer"]
        React[React + Vite]
        Tailwind[Tailwind CSS]
        Router[React Router]
    end

    subgraph API["API Layer"]
        FastAPI[FastAPI Server]
        Auth[Auth Middleware]
        Routes[API Routes]
    end

    subgraph Service["Service Layer"]
        DocService[Document Service]
        GenService[Generation Service]
        RAGService[RAG Service]
        OCRService[OCR Service]
    end

    subgraph External["External APIs"]
        Mistral[Mistral OCR API]
        Groq[Groq LLM API]
    end

    subgraph Data["Data Layer"]
        Supabase[(Supabase PostgreSQL)]
        Storage[Supabase Storage]
        Vector[(pgvector)]
    end

    Browser --> React
    React --> Tailwind
    React --> Router
    React --> FastAPI
    FastAPI --> Auth
    Auth --> Routes
    Routes --> DocService
    Routes --> GenService
    Routes --> RAGService
    DocService --> OCRService
    OCRService --> Mistral
    GenService --> Groq
    RAGService --> Vector
    DocService --> Storage
    Routes --> Supabase
    RAGService --> Supabase
```

---

## Slide 14: Subsystem Decomposition

```mermaid
flowchart LR
    subgraph Backend["Backend Subsystems"]
        A[Auth Module]
        B[Admin Module]
        C[Document Module]
        D[Generation Module]
        E[Paper Module]
        F[Quiz Module]
        G[RAG Module]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    B --> C
    C --> G
    G --> D
    D --> E
    D --> F
```

| Subsystem | Responsibility |
|-----------|----------------|
| Auth Module | Login, JWT tokens, role verification |
| Admin Module | Degree, semester, subject, user management |
| Document Module | File upload, OCR processing, storage |
| RAG Module | Text chunking, embeddings, vector search |
| Generation Module | AI question generation with context |
| Paper Module | Store, view, download generated papers |
| Quiz Module | Generate quizzes, score, track attempts |

---

## Slide 15: Database Design (ER Diagram)

```mermaid
erDiagram
    USERS ||--o{ PAPERS : creates
    USERS ||--o{ QUIZ_ATTEMPTS : takes
    USERS }o--|| DEGREES : enrolled_in
    
    DEGREES ||--|{ SEMESTERS : has
    SEMESTERS ||--|{ SUBJECT_SEMESTER : contains
    SUBJECTS ||--|{ SUBJECT_SEMESTER : belongs_to
    
    SUBJECTS ||--|{ DOCUMENTS : has
    SUBJECTS ||--|{ PAPERS : generates
    SUBJECTS ||--o{ FACULTY_SUBJECTS : allocated_to
    USERS ||--o{ FACULTY_SUBJECTS : teaches
    
    USERS {
        uuid id PK
        string name
        string username
        string password_hash
        string role
        uuid degree_id FK
        int semester
    }
    
    DEGREES {
        uuid id PK
        string name
        string code
        int total_semesters
    }
    
    SUBJECTS {
        uuid id PK
        string name
        string code
        text syllabus
    }
    
    DOCUMENTS {
        uuid id PK
        uuid subject_id FK
        int unit_number
        string file_path
        text extracted_text
        boolean is_processed
    }
    
    PAPERS {
        uuid id PK
        uuid subject_id FK
        uuid created_by FK
        string config
        text content
        string paper_type
        timestamp created_at
    }
    
    QUIZ_ATTEMPTS {
        uuid id PK
        uuid student_id FK
        uuid subject_id FK
        int score
        int total_questions
        timestamp attempted_at
    }
```

---

## Slide 16: Data Flow Diagram (Level 0 & Level 1)

### Level 0 - Context Diagram

```mermaid
flowchart LR
    Faculty((Faculty))
    Student((Student))
    Admin((Admin))
    System[AI Question Paper Generator]
    
    Admin -->|User Data| System
    System -->|Confirmation| Admin
    
    Faculty -->|Materials| System
    System -->|Papers| Faculty
    
    Student -->|Quiz Requests| System
    System -->|Results| Student
```

### Level 1 - Process Breakdown

```mermaid
flowchart TB
    subgraph Auth["1.0 Authentication"]
        P1[Verify Credentials]
        P2[Generate JWT]
    end
    
    subgraph DocProc["2.0 Document Processing"]
        P3[Upload Document]
        P4[OCR Extraction]
        P5[Generate Embeddings]
        P6[Store in Vector DB]
    end
    
    subgraph QGen["3.0 Question Generation"]
        P7[Receive Config]
        P8[RAG Context Retrieval]
        P9[LLM Generation]
        P10[Format Output]
    end
    
    subgraph Quiz["4.0 Quiz Processing"]
        P11[Generate Quiz Questions]
        P12[Evaluate Answers]
        P13[Calculate Score]
    end
    
    User[User] --> P1
    P1 --> P2
    FacultyUp[Faculty Upload] --> P3
    P3 --> P4
    P4 --> P5
    P5 --> P6
    FacultyGen[Faculty Generate] --> P7
    P7 --> P8
    P8 --> P9
    P9 --> P10
    P10 --> Paper[Generated Paper]
    StudentQuiz[Student Quiz] --> P11
    P11 --> P12
    P12 --> P13
    P13 --> Score[Quiz Score]
```

---

## Slide 17: Hardware/Software Mapping

```mermaid
flowchart TB
    subgraph ClientSide["Client Side"]
        Browser[Web Browser]
    end
    
    subgraph Cloud["Cloud Infrastructure"]
        subgraph Compute["Compute"]
            Server[FastAPI Backend]
        end
        
        subgraph Database["Database"]
            DB[(PostgreSQL + pgvector)]
            Storage[File Storage]
        end
        
        subgraph AIServices["AI Services"]
            Groq[Groq - Llama 3.3]
            Mistral[Mistral OCR]
        end
    end
    
    Browser --> Server
    Server --> DB
    Server --> Storage
    Server --> Groq
    Server --> Mistral
```

| Component | Deployment | Specification |
|-----------|------------|---------------|
| Frontend | Client Browser | Any modern browser |
| Backend | Linux Server / Cloud VM | Python 3.12+, 2GB RAM |
| Database | Supabase Cloud | Free tier sufficient |
| File Storage | Supabase Storage | 1GB free storage |
| AI APIs | Groq + Mistral Cloud | Free tier API keys |

---

## Slide 18: Security & Access Control

```mermaid
flowchart TB
    subgraph AuthFlow["Authentication Flow"]
        Login[Login Request]
        Validate[Validate Credentials]
        JWT[Generate JWT Token]
        Store[Store in Client]
        Login --> Validate
        Validate --> JWT
        JWT --> Store
    end
    
    subgraph Authorization["Authorization"]
        Request[API Request]
        Verify[Verify JWT]
        Role{Check Role}
        AdminRoutes[Admin APIs]
        FacultyRoutes[Faculty APIs]
        StudentRoutes[Student APIs]
        Request --> Verify
        Verify --> Role
        Role -->|Admin| AdminRoutes
        Role -->|Faculty| FacultyRoutes
        Role -->|Student| StudentRoutes
    end
    
    subgraph DataIsolation["Data Isolation"]
        FacultyData[Faculty Papers]
        StudentData[Practice Papers]
    end
```

**Security Measures**:
- JWT-based stateless authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- API keys stored in environment variables
- Faculty can only access allocated subjects
- Students restricted to enrolled degree/semester
- Practice papers isolated from exam papers

---

## Slide 19: API Endpoints Overview

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| Auth | `/api/auth/login` | POST | User login |
| Auth | `/api/auth/me` | GET | Get current user |
| Admin | `/api/admin/register` | POST | Register user |
| Subjects | `/api/subjects` | GET/POST | List/Create subjects |
| Documents | `/api/documents` | POST | Upload document |
| Documents | `/api/documents/{id}/process` | POST | Process with OCR |
| Generation | `/api/generation/questions` | POST | Generate questions |
| Papers | `/api/papers` | GET/POST | List/Create papers |
| Papers | `/api/papers/{id}/download` | GET | Download paper |

---

## Slide 20: Glossary

| Term | Definition |
|------|------------|
| RAG | Retrieval-Augmented Generation - combines search with AI generation |
| OCR | Optical Character Recognition - extracts text from images/PDFs |
| JWT | JSON Web Token - secure authentication token |
| pgvector | PostgreSQL extension for storing vector embeddings |
| LLM | Large Language Model - AI model for text generation |
| Embeddings | Numerical representations of text for similarity search |
| FastAPI | Modern Python web framework for building APIs |
| Supabase | Open-source Firebase alternative with PostgreSQL |

---

## Slide 21: Conclusion & Next Steps

**What We Covered**:
- RAD defines WHAT the system should do
- SDD defines HOW the system will be built

**Current Status**:
- Core backend APIs implemented
- Database schema designed
- Frontend development in progress

**Next Steps (Review 2)**:
- Object Design Document
- Partial Code Execution
- Unit Testing

**Timeline**:
- Review 2: March 2-6, 2026
- Review 3: April 2-7, 2026
- External Review: April 10-15, 2026

---

## References

1. Object Oriented Software Engineering Using UML, Patterns, Java - Bernd Bruegge, Allen H. Dutoit (2nd Edition)
2. FastAPI Documentation - https://fastapi.tiangolo.com/
3. React Documentation - https://react.dev/
4. Supabase Documentation - https://supabase.com/docs
5. LangChain Documentation - https://python.langchain.com/
