# Product Requirements Document (PRD)- Detailed overview

---

## 1. Executive Summary

### 1.1 Product Overview

The AI-Powered Question Paper Generator is an intelligent educational tool designed to automate the creation of question papers for college faculty members. The system uses artificial intelligence and natural language processing to generate contextually relevant, syllabus-aligned questions from reference materials, eliminating the time-consuming manual process of question paper creation.

**Technical Stack**:
- **Frontend**: React (Vite) + Tailwind CSS (v4)
- **Backend**: FastAPI (Python 3.12+) + Supabase (Postgres + pgvector)
- **AI/ML Engine**:
  - **OCR**: Mistral OCR (via `mistralai`) for document understanding
  - **Generation**: Groq (Llama 3.3 70B Versatile) for high-quality question synthesis
  - **Orchestration**: LangChain + RAG (Retrieval-Augmented Generation) pipeline

### 1.2 Problem Statement

Currently, educators face several challenges:

- **Time-consuming process**: Manual question paper creation takes significant time
- **Quality inconsistency**: Questions may lack depth or relevance to study materials
- **Repetitive work**: Faculty create similar papers repeatedly across semesters
- **Limited variety**: Difficult to generate diverse questions from the same content
- **Resource constraints**: Maintaining question banks is labor-intensive

### 1.3 Product Goals

- Reduce question paper creation time by 80%+
- Generate high-quality, contextually relevant questions
- Ensure syllabus alignment and content understanding
- Support multiple question types and difficulty levels
- Provide varied questions with option to specify priority topics
- Handle diverse subject types (theory, programming, mathematics, diagrams)

---

## 2. Target Users

### 2.1 User Roles

**Administrator**
- System administrators with full access
- Manages degrees, semesters, subjects, and user accounts
- Allocates subjects to faculty and enrolls students

**College Faculty Members**
- Professors and lecturers across various departments
- Subject matter experts teaching multiple courses (cross-functional across degrees/semesters)
- Educators responsible for examination preparation
- Generate official question papers for exams

**Students**
- Enrolled in a specific degree program and semester
- Access study materials uploaded by faculty
- Generate practice papers for self-study (separate from exam papers)
- Participate in quizzes for self-assessment

### 2.2 User Characteristics

**Faculty**
- Technical proficiency: Basic to intermediate computer skills
- Domain expertise: High subject knowledge
- Time constraints: Limited availability for administrative tasks
- Need: Efficient, reliable question generation for exams

**Students**
- Technical proficiency: Comfortable with web applications
- Domain expertise: Learning stage
- Time constraints: Balancing multiple subjects
- Need: Access to study materials and practice resources

---

## 3. Core Features & Functionality

### 3.1 Authentication & User Management

#### Login System

- **Faculty credentials**: Username and password authentication
- **Validation**: Real-time credential verification
- **Error handling**: Clear feedback for invalid credentials
- **Session management**: Secure session after successful login

#### Admin-Only Registration

- **Admin accounts**: Pre-configured in backend database
- **Registration capability**: Only admins can register new faculty members AND students
- **Faculty Registration flow**:
  - Admin logs in with admin credentials
  - Access "Register Faculty" section
  - Enter new faculty details (name, username, password)
  - Submit to create new faculty account
- **Student Registration flow**:
  - Admin accesses "Register Student" section
  - Enter student details (name, username, password, degree, semester)
  - Submit to create new student account with enrollment
- **No self-registration**: Faculty and students cannot create their own accounts

### 3.2 Degree & Semester Management (Admin)

#### Degree Programs

- **CRUD Operations**: Admin can create, view, update, delete degree programs
- **Degree Information**:
  - Name (e.g., "Bachelor of Computer Application")
  - Code (e.g., "BCA")
  - Description (optional)
  - Total semesters (e.g., 6 or 8)
- **Examples**: BCA, MCA, B.Tech CSE, Masters in Data Science

#### Semester Management

- **Linked to Degrees**: Each semester belongs to a specific degree
- **Semester Numbers**: 1 through N (based on degree's total semesters)
- **Subject Assignment**: Admin assigns subjects to specific degree + semester combinations

#### Subject-Degree-Semester Mapping

- **Hierarchical Structure**:
  ```
  Degree (BCA)
    └── Semester 3
          ├── DBMS
          ├── Data Structures
          └── Operating Systems
    └── Semester 5
          ├── Computer Networks
          └── Software Engineering
  ```
- **Admin Actions**:
  - Assign existing subjects to degree/semester
  - Remove subjects from degree/semester
  - View all subjects under a degree/semester

### 3.3 Faculty Dashboard

#### Welcome Screen

- **Personalized greeting**: "Welcome [Faculty Name]"
- **Subject allocation display**: Shows all subjects assigned to faculty (across multiple degrees/semesters)
- **Quick statistics cards**:
  - Total Allocated Subjects
  - Total Papers Generated
  - View Papers Generated (clickable to see history)

#### Subject Cards

- **Visual representation**: Each assigned subject displayed as a card
- **Subject information**: Subject name, degree, semester
- **Primary action**: "Create Paper" button on each card
- **Cross-functional display**: Faculty sees subjects from all degrees/semesters they teach

### 3.4 Question Paper Creation Workflow (Faculty)

#### Step 1: Unit Selection

- **Multiple selection interface**: Checkboxes or multi-select for units
- **Available units**: Unit 1, Unit 2, Unit 3, Unit 4, Unit 5
- **Flexibility**:
  - Single unit selection (e.g., Unit 1 only)
  - Multiple units (e.g., Unit 1, 2, 3 combined)
  - All units combined (comprehensive paper)
- **Visual indicator**: Clear display of selected units

#### Step 2: Content Upload (Per Selected Unit)

**For each selected unit, faculty must provide:**

**Mandatory Field 1: Syllabus**

- **Input method**: Text input or file upload
- **Purpose**: Defines scope and topics to be covered
- **Format**: Plain text or document

**Mandatory Field 2: Reference Material (Choose One)**

- **Option A: File Upload**
  - Supported formats: PDF, DOCX, TXT
  - OCR capability: Extract text from scanned documents/images
  - File size validation
- **Option B: Text Content**
  - Direct text input field
  - Rich text editor support
  - Character/word count display

**Upload Rules**:

- Syllabus + Reference Material (file), OR
- Syllabus + Text Content, OR
- Syllabus + Both Reference Material AND Text Content

**Multi-unit handling**:

- If multiple units selected, repeat content upload for each unit
- Clear visual separation between unit uploads
- Progress indicator showing completion status

#### Step 3: Question Type Selection

**Available Question Types**:

1. **MCQ (Multiple Choice Questions)**
   - Standard multiple choice
   - Match the following
   - Choosing correct options
   - Assertion-reasoning questions
   - True or false

2. **Fill in the Blanks**
   - Single word answers
   - One blank per question

3. **Short Answer Questions**
   - Brief explanatory answers
   - 2-5 marks type questions

4. **Long Answer Questions**
   - Detailed explanatory answers
   - 10+ marks type questions

**Quantity Selection**:

- **Numeric input**: For each question type
- **Flexibility**: Generate any number (N) of questions per type
- **Examples**:
  - MCQs: 5 questions
  - Fill in the blanks: 5 questions
  - Short answers: 6 questions
  - Long answers: 10 questions
- **Optional types**: Faculty can skip question types by setting quantity to 0

#### Step 4: Difficulty Level Selection

**Three Difficulty Levels**:

- **Easy**: Basic recall and comprehension
- **Medium**: Application and analysis
- **Hard**: Synthesis and evaluation

**Selection method**: Radio buttons or dropdown **Impact**: AI adjusts question complexity based on selection

#### Step 5: Custom Instructions (Optional)

**Purpose**: Allow faculty to specify priority topics or essential questions that must be covered.

**Use Case**: 
- Certain topics are fundamental to a subject (e.g., OSI model in Networking, Normalization in DBMS)
- Faculty may want specific question types for important topics
- Ensures critical concepts are always tested regardless of AI variation

**Input Field**:
- **Optional text area**: Faculty can enter custom instructions
- **Examples of valid input**:
  - "Include at least one long answer question on OSI model layers"
  - "Always cover SQL joins and normalization concepts"
  - "Ensure questions on sorting algorithms for programming section"
  - "Include diagram-based question on ER diagrams"
- **Behavior**: Instructions passed to AI as guidance during generation
- **No input**: If left empty, AI generates based purely on content analysis

#### Step 6: Preview & Confirmation

**Preview Screen displays**:

- **Unit(s) selected**: List of chosen units
- **Syllabus content**: Summary or full text for each unit
- **Reference materials**: Uploaded files or text content preview
- **Question type distribution**: Breakdown of question types and quantities
- **Difficulty level**: Selected difficulty
- **Custom instructions**: Display if provided (or "None" if empty)
- **Total questions**: Aggregate count

**Actions Available**:

- **Rename paper**: Custom name/title for the question paper
- **Edit/Back**: Return to previous steps to modify
- **Generate Paper**: Finalize and create the question paper

### 3.5 AI Generation Engine (Conceptual)

#### Intelligence Requirements

**Content Understanding**:

- **Complete material analysis**: Read reference material from start to end
- **Syllabus alignment**: Map questions to syllabus topics
- **Context awareness**: Generate questions based on actual content, not templates

**Subject Type Recognition**: The AI must identify and adapt to different subject categories:

1. **Theory-based subjects**
   - Generate conceptual questions
   - Focus on definitions, explanations, comparisons
   - Examples: Operating Systems, Database Theory

2. **Programming subjects**
   - Generate code-based questions
   - Include syntax, logic, and algorithm questions
   - Request program writing or code analysis
   - Examples: C++, Python, Java

3. **Mathematics subjects**
   - Generate numerical problems
   - Include formulas, calculations, proofs
   - Provide problem-solving scenarios
   - Examples: Statistics, Calculus, Discrete Mathematics

4. **Diagram-based subjects**
   - Generate questions requiring diagrams
   - Include flowcharts, ER diagrams, circuit diagrams
   - Request visual representations
   - Examples: System Design, Digital Electronics

**Uniqueness & Priority Topics**:

- **Varied generation**: Each generation produces fresh questions with different phrasings
- **Priority topic support**: Faculty can specify must-have topics via custom instructions
- **Balanced approach**: AI respects custom instructions while maintaining variety in other areas
- **Creative variation**: Different phrasings and scenarios for similar concepts
- **No rigid templates**: Questions generated from actual content, not recycled banks

**Multi-unit Intelligence**:

- **Combined analysis**: When multiple units selected, analyze all content together
- **Proportional distribution**: Questions distributed across selected units
- **Topic coverage**: Ensure coverage of major topics from each unit
- **Balanced generation**: Avoid over-representation of any single unit

### 3.6 Faculty Paper Management

#### View Generated Papers

- **List view**: All previously generated papers
- **Paper information**:
  - Paper name/title
  - Subject
  - Unit(s) covered
  - Generation date and time
  - Number of questions
  - Difficulty level
- **Actions per paper**:
  - View/Download: Open or save the paper
  - Delete: Remove paper from history

#### Paper Format

- **Well-structured output**: Professional formatting
- **Question numbering**: Clear sequential numbering
- **Section separation**: Questions grouped by type
- **Header information**: Subject, units, date, faculty name
- **Export options**: PDF, DOCX, or print-friendly format

### 3.7 Student Dashboard

#### Welcome Screen

- **Personalized greeting**: "Welcome [Student Name]"
- **Enrollment display**: Shows current degree and semester
- **Quick statistics cards**:
  - Total Subjects (in current semester)
  - Practice Papers Generated
  - Quizzes Attempted

#### Subject Browsing

- **Restricted Access**: Students see ONLY subjects from their enrolled degree + semester
- **Subject Cards**: Each subject displayed as a card with:
  - Subject name and code
  - Faculty name (who teaches this subject)
  - "View Materials" button
  - "Practice Paper" button
  - "Take Quiz" button

#### Subject Detail View

- **Subject Information**: Name, code, description
- **Syllabus**: View syllabus content per unit
- **Reference Materials**: Download/view raw files uploaded by faculty (PDFs, DOCX, etc.)
- **Unit-wise Organization**: Materials organized by unit numbers

### 3.8 Practice Paper Generation (Student)

#### Purpose

Students can generate their own practice papers for self-study. These are **completely separate** from faculty-generated exam papers and are never exposed to faculty.

#### Workflow

**Step 1: Subject Selection**
- Student selects from their enrolled subjects

**Step 2: Unit Selection**
- Same as faculty: select one or multiple units (1-5)

**Step 3: Question Configuration**
- Select question types (MCQ, Fill in Blanks, Short, Long)
- Enter quantity for each type
- Select difficulty level (Easy/Medium/Hard)

**Step 4: Generate**
- AI generates questions using faculty-uploaded content
- Questions stored in `practice_papers` table (separate from `papers`)

#### Practice Paper Management

- **List view**: All practice papers generated by the student
- **Actions**: View, Download (PDF/DOCX), Delete
- **History preserved**: Even when student moves to next semester

### 3.9 Quiz System (Student)

#### Purpose

Interactive self-assessment quizzes for students to test their knowledge in real-time.

#### Quiz Types

- **MCQ Quiz**: Multiple choice questions with 4 options
- **Fill in the Blanks Quiz**: Type-in answers

#### Quiz Flow

**Starting a Quiz**:
1. Student selects a subject
2. Chooses quiz type (MCQ or Fill in Blanks)
3. Selects units to cover
4. Sets number of questions (e.g., 10, 20, 30)
5. Clicks "Start Quiz"

**Taking a Quiz**:
- **Timed or Untimed**: Optional timer per question or total quiz
- **One question at a time**: Clean, focused interface
- **Progress indicator**: Shows current question number
- **Submit button**: Move to next question

**Quiz Completion**:
- **Instant scoring**: Show score immediately (e.g., 8/10 = 80%)
- **Review mode**: Show correct answers vs. student answers
- **Explanations**: Display answer explanations (if available)

#### Quiz History

- **Attempt tracking**: Store all quiz attempts
- **Information stored**:
  - Subject and units covered
  - Score and percentage
  - Date and time
  - Individual answers (for review)
- **Progress visualization**: Track improvement over time

---

## 4. System Modules

### 4.1 Authentication Module

- Multi-role login validation (Admin, Faculty, Student)
- Role-based routing after login
- Session management
- Credential verification against backend database

### 4.2 Admin Module

- Admin login validation
- **Degree Management**: Create, update, delete degree programs
- **Semester Management**: Configure semesters per degree
- **Subject Management**: Create subjects, assign to degree/semester
- **Faculty Registration**: Create faculty accounts
- **Student Registration**: Create student accounts with degree/semester enrollment
- **Faculty Allocation**: Assign subjects to faculty (cross-functional)
- **Student Progression**: Manually update student semester
- Session management for admin users

### 4.3 Faculty Profile Module

- Faculty information management
- Subject allocation mapping (across multiple degrees/semesters)
- Dashboard statistics calculation

### 4.4 Student Profile Module

- Student information management
- Degree and semester enrollment tracking
- Practice paper history
- Quiz attempt history
- Semester progression (with history preservation)

### 4.5 Content Management Module

- File upload handling (PDF, DOCX, TXT)
- **OCR Processing**: Integration with Mistral OCR to extract rich text, tables, and equations from scanned PDFs and images
- Text extraction and cleaning
- Syllabus parsing
- Unit-wise content organization

### 4.6 AI Processing Module

- **RAG Pipeline (Retrieval-Augmented Generation)**:
  - Chunking of uploaded content into semantic segments
  - Vector embedding generation (using `sentence-transformers` or OpenAI)
  - Storage in Supabase `pgvector` for semantic retrieval
- **Generation Engine (Groq/Llama 3.3)**:
  - Context-aware prompt construction using retrieved chunks
  - Question generation logic based on Bloom's taxonomy
  - Difficulty level calibration
  - Structured JSON output parsing for consistent formatting
- Subject type identification
- Custom instruction handling

### 4.7 Question Generation Module

- MCQ generation with options
- Fill-in-the-blank creation
- Short answer formulation
- Long answer development
- Question type-specific formatting

### 4.8 Paper Management Module

- **Faculty Papers**: Exam papers storage and management
- **Practice Papers**: Student-generated practice papers (separate storage)
- Paper preview generation
- Paper naming and metadata
- Retrieval and display
- Deletion functionality

### 4.9 Quiz Module

- Quiz session management
- Real-time question serving
- Answer validation and scoring
- Attempt history tracking
- Progress analytics

### 4.10 Database Module

- **User Management**: Admin, faculty, and student credentials
- **Academic Structure**: Degrees, semesters, subjects
- **Enrollments**: Student-degree-semester mappings
- **Allocations**: Faculty-subject mappings
- Reference material storage
- Faculty exam paper records
- Student practice paper records
- Quiz attempt records
- Usage statistics tracking

---

## 5. User Flow Diagram (Textual)

```
START
  ↓
LOGIN PAGE
  ├── Enter username and password
  ├── Click "Login"
  ├── If credentials invalid → Show error "Invalid username/password"
  ├── If admin → Go to ADMIN DASHBOARD
  ├── If faculty → Go to FACULTY DASHBOARD
  └── If student → Go to STUDENT DASHBOARD
  ↓
═══════════════════════════════════════════════════════════════
                        ADMIN FLOW
═══════════════════════════════════════════════════════════════
ADMIN DASHBOARD
  ├── Display "Welcome Admin"
  ├── Manage Degrees → Create/Edit/Delete degree programs
  ├── Manage Subjects → Create subjects, assign to degree/semester
  ├── Register Faculty → Enter details, create account
  ├── Register Student → Enter details, assign degree/semester
  ├── Allocate Subjects → Assign subjects to faculty
  ├── Manage Students → Update semester, view enrollments
  └── Logout
  ↓
═══════════════════════════════════════════════════════════════
                       FACULTY FLOW
═══════════════════════════════════════════════════════════════
FACULTY DASHBOARD
  ├── Display "Welcome [Faculty Name]"
  ├── Show statistics cards (Total Subjects, Total Papers, View Papers)
  ├── Display subject cards (across all degrees/semesters)
  └── Select subject → Click "Create Paper"
  ↓
UNIT SELECTION
  ├── Display units 1-5 as checkboxes
  ├── Select one or multiple units
  └── Click "Next"
  ↓
CONTENT UPLOAD (For each selected unit)
  ├── Upload/Enter syllabus (mandatory)
  ├── Upload reference material (PDF/DOCX/TXT) OR Enter text content
  ├── Repeat for each selected unit
  └── Click "Next"
  ↓
QUESTION CONFIGURATION
  ├── Select question types (MCQ, Fill in the Blanks, Short Answer, Long Answer)
  ├── Enter quantity for each type
  ├── Select difficulty level (Easy/Medium/Hard)
  ├── (Optional) Enter custom instructions for priority topics
  └── Click "Next"
  ↓
PREVIEW & CONFIRMATION
  ├── Review all inputs
  ├── Option to rename paper
  ├── Edit previous steps if needed
  └── Click "Generate Paper"
  ↓
AI PROCESSING → PAPER GENERATED
  ├── Display success message
  ├── Options: View Paper, Download Paper, Generate Another
  └── Paper saved to "View Papers Generated"
  ↓
VIEW PAPERS
  ├── List all generated exam papers
  ├── Actions: View, Download (PDF/DOCX), Delete
  └── Return to dashboard
  ↓
═══════════════════════════════════════════════════════════════
                       STUDENT FLOW
═══════════════════════════════════════════════════════════════
STUDENT DASHBOARD
  ├── Display "Welcome [Student Name]"
  ├── Show enrollment info (Degree, Semester)
  ├── Show statistics (Subjects, Practice Papers, Quizzes)
  └── Display subject cards (restricted to enrolled degree/semester)
  ↓
SUBJECT VIEW
  ├── Select a subject card
  ├── View subject details (name, code, syllabus)
  ├── Download reference materials (PDFs, DOCX uploaded by faculty)
  ├── Click "Generate Practice Paper" → Go to PRACTICE PAPER FLOW
  └── Click "Take Quiz" → Go to QUIZ FLOW
  ↓
PRACTICE PAPER FLOW
  ├── Select units (1-5)
  ├── Configure question types and quantities
  ├── Select difficulty level
  ├── Click "Generate"
  ├── AI generates practice paper (stored separately from faculty papers)
  ├── View/Download practice paper
  └── Return to subject or dashboard
  ↓
QUIZ FLOW
  ├── Select quiz type (MCQ or Fill in the Blanks)
  ├── Select units to cover
  ├── Set number of questions
  ├── Click "Start Quiz"
  ├── Answer questions one by one
  ├── Submit quiz
  ├── View score and review answers
  └── Return to subject or dashboard
  ↓
END or RETURN TO DASHBOARD
```

---

## 6. Key Requirements

### 6.1 Functional Requirements

#### Authentication & User Management
**FR1**: System shall authenticate users (admin, faculty, student) using credentials
**FR2**: System shall route users to role-specific dashboards after login
**FR3**: System shall allow admins to register new faculty members
**FR4**: System shall allow admins to register new students with degree/semester enrollment

#### Academic Structure (Admin)
**FR5**: System shall allow admins to create, update, delete degree programs
**FR6**: System shall allow admins to configure semesters per degree
**FR7**: System shall allow admins to create subjects and assign to degree/semester
**FR8**: System shall allow admins to allocate subjects to faculty (cross-functional)
**FR9**: System shall allow admins to update student semester (manual progression)

#### Faculty Features
**FR10**: System shall display personalized faculty dashboard with allocated subjects
**FR11**: System shall allow selection of single or multiple units for paper creation
**FR12**: System shall accept syllabus and reference materials per unit
**FR13**: System shall support PDF, DOCX, and TXT file uploads
**FR14**: System shall perform OCR on scanned documents (Mistral OCR)
**FR15**: System shall allow configuration of question types and quantities
**FR16**: System shall provide three difficulty levels (Easy, Medium, Hard)
**FR17**: System shall generate varied questions with different phrasings
**FR18**: System shall accept optional custom instructions for priority topics
**FR19**: System shall incorporate custom instructions into AI generation
**FR20**: System shall recognize subject types (theory, programming, math, diagrams)
**FR21**: System shall combine content from multiple units when selected
**FR22**: System shall provide preview before final generation
**FR23**: System shall store faculty-generated exam papers with metadata
**FR24**: System shall allow viewing, downloading, and deletion of exam papers
**FR25**: System shall export papers in PDF and DOCX formats

#### Student Features
**FR26**: System shall restrict student access to subjects in their enrolled degree/semester
**FR27**: System shall display student dashboard with enrollment info and statistics
**FR28**: System shall allow students to view subject details and syllabus
**FR29**: System shall allow students to download reference materials uploaded by faculty
**FR30**: System shall allow students to generate practice papers (separate from exam papers)
**FR31**: System shall store practice papers per student (never visible to faculty)
**FR32**: System shall preserve student history when semester changes

#### Quiz System
**FR33**: System shall allow students to take MCQ quizzes
**FR34**: System shall allow students to take Fill-in-the-Blanks quizzes
**FR35**: System shall provide instant scoring after quiz submission
**FR36**: System shall allow review of correct answers after quiz completion
**FR37**: System shall track all quiz attempts with scores and dates

### 6.2 Non-Functional Requirements

**NFR1 - Performance**: Paper generation should complete within 2-3 minutes
**NFR2 - Usability**: Interface should be intuitive for non-technical users
**NFR3 - Reliability**: System should generate valid questions 95%+ of the time
**NFR4 - Scalability**: Support multiple concurrent users (admin, faculty, students)
**NFR5 - Uniqueness**: Questions vary per generation with different phrasings
**NFR6 - Security**: Secure authentication, role-based access control, data isolation
**NFR7 - Availability**: System accessible 24/7
**NFR8 - Accuracy**: Questions must align with provided syllabus and materials
**NFR9 - Data Isolation**: Student practice papers never visible to faculty; faculty exam papers never visible to students

### 6.3 Constraints

**C1**: AI must be free or low-cost (Groq free tier, Mistral API)
**C2**: Must work with uploaded content (no external data sources initially)
**C3**: Admin accounts pre-configured in backend database
**C4**: Faculty and student registration only via admin (no self-registration)
**C5**: Students restricted to their enrolled degree/semester
**C6**: Subject allocation to faculty managed by admin

---

## 7. Success Metrics

### 7.1 User Adoption

- **Target**: 80% of faculty generate at least one paper within first month
- **Measure**: Login frequency and paper generation rate

### 7.2 Time Savings

- **Target**: Average paper generation time < 15 minutes (vs. 2-3 hours manually)
- **Measure**: Time from login to paper download

### 7.3 Question Quality

- **Target**: 90% faculty satisfaction with generated questions
- **Measure**: Post-generation survey and deletion rate

### 7.4 System Usage

- **Target**: Average 3-5 papers generated per faculty per month
- **Measure**: Papers generated vs. faculty count

### 7.5 Custom Instruction Adoption

- **Target**: 70%+ of faculty use custom instructions feature
- **Measure**: Count of papers generated with custom instructions vs. total papers

### 7.6 Priority Topic Coverage

- **Target**: 95%+ of custom instruction topics appear in generated questions
- **Measure**: Manual verification or keyword matching on generated papers

### 7.7 Student Engagement

- **Target**: 60%+ of students generate at least one practice paper per month
- **Measure**: Practice paper count per student

### 7.8 Quiz Participation

- **Target**: Average 5+ quiz attempts per student per month
- **Measure**: Quiz attempt frequency and completion rate

---

## 8. Future Enhancements (Out of Scope for V1)

### 8.1 Advanced Features

- Collaborative paper creation among faculty
- Integration with Learning Management Systems (LMS)
- Mobile application
- Student progress analytics and recommendations

### 8.2 Enhanced AI Capabilities

- Answer key generation
- Marking scheme creation
- Bloom's taxonomy level tagging
- Question clustering by topic
- Automatic question review and quality scoring
- Adaptive difficulty based on student quiz performance

### 8.3 Administrative Features

- Admin dashboard for institution management
- Faculty performance analytics
- Subject-wise question generation statistics
- Bulk paper generation
- Template management

---

## 9. Open Questions & Assumptions

### 9.1 Open Questions

1. What is the maximum file size for reference material uploads?
2. How long should generated papers be retained in the system?
3. Should there be a limit on papers generated per faculty per month?
4. What format should the final question paper follow (university-specific)?
5. Should the system support multiple languages?

### 9.2 Assumptions

1. Faculty have basic computer literacy and internet access
2. Reference materials are in readable format (not heavily corrupted)
3. Syllabus provided is clear and well-structured
4. Faculty can judge question quality and provide feedback
5. Institution provides necessary backend infrastructure and support

---

## 10. Dependencies

### 10.1 External Dependencies

- **AI Generation**: Groq API (Free tier/Developer plan) using Llama-3.3-70b
- **OCR Service**: Mistral API (`mistral-ocr-latest`) for document processing
- **Orchestration**: LangChain framework
- **Database**: Supabase (PostgreSQL with `pgvector` extension)

### 10.2 Internal Dependencies

- Backend database with faculty and subject data
- Content hosting for uploaded materials (Supabase Storage)
- Authentication system (JWT-based)

---

## Document Control

**Version**: 2.0  
**Date**: January 17, 2026  
**Status**: Updated with Student Role, Degree/Semester Structure, Practice Papers, Quiz System  
**Owner**: Product Team  
**Reviewers**: Development Team, Faculty Representatives, Academic Leadership
