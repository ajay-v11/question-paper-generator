# Product Requirements Document (PRD)- Detailed overview

---

## 1. Executive Summary

### 1.1 Product Overview

The AI-Powered Question Paper Generator is an intelligent educational tool designed to automate the creation of question papers for college faculty members. The system uses artificial intelligence and natural language processing to generate contextually relevant, syllabus-aligned questions from reference materials, eliminating the time-consuming manual process of question paper creation.

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

### 2.1 Primary Users

**College Faculty Members**

- Professors and lecturers across various departments
- Subject matter experts teaching multiple courses
- Educators responsible for examination preparation

### 2.2 User Characteristics

- Technical proficiency: Basic to intermediate computer skills
- Domain expertise: High subject knowledge
- Time constraints: Limited availability for administrative tasks
- Need: Efficient, reliable question generation

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
- **Registration capability**: Only admins can register new faculty members
- **Registration flow**:
  - Admin logs in with admin credentials
  - Access "Register Faculty" section
  - Enter new faculty details (name, username, password, allocated subjects)
  - Submit to create new faculty account
- **No self-registration**: Faculty cannot create their own accounts

### 3.2 Dashboard

#### Welcome Screen

- **Personalized greeting**: "Welcome [Faculty Name]"
- **Subject allocation display**: Shows all subjects assigned to faculty
- **Quick statistics cards**:
  - Total Allocated Subjects
  - Total Papers Generated
  - View Papers Generated (clickable to see history)

#### Subject Cards

- **Visual representation**: Each assigned subject displayed as a card
- **Subject information**: Subject name and relevant details
- **Primary action**: "Create Paper" button on each card

### 3.3 Question Paper Creation Workflow

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

### 3.4 AI Generation Engine (Conceptual)

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

### 3.5 Paper Management

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

---

## 4. System Modules

### 4.1 Authentication Module

- Faculty login validation
- Session management
- Credential verification against backend database

### 4.2 Admin Module

- Admin login validation
- Faculty registration capability
- New faculty account creation with subject allocation
- Session management for admin users

### 4.3 User Profile Module

- Faculty information management
- Subject allocation mapping
- Dashboard statistics calculation

### 4.4 Content Management Module

- File upload handling (PDF, DOCX, TXT)
- OCR processing for scanned documents
- Text extraction and cleaning
- Syllabus parsing
- Unit-wise content organization

### 4.5 AI Processing Module

- Natural Language Processing
- Content comprehension and analysis
- Keyword and concept extraction
- Subject type identification
- Question generation logic
- Difficulty level calibration
- Custom instruction handling

### 4.6 Question Generation Module

- MCQ generation with options
- Fill-in-the-blank creation
- Short answer formulation
- Long answer development
- Question type-specific formatting

### 4.7 Paper Management Module

- Paper preview generation
- Paper naming and metadata
- Paper storage
- Retrieval and display
- Deletion functionality

### 4.8 Database Module

- Admin credentials storage
- Faculty credentials storage
- Subject allocation data
- Reference material storage
- Generated paper records
- Usage statistics tracking

---

## 5. User Flow Diagram (Textual)

```
START
  ↓
LOGIN PAGE
  ├── Enter username and password
  ├── Click "Login"
  ├── If credentials valid → Continue
  ├── If admin → Show admin dashboard with "Register Faculty" option
  └── If credentials invalid → Show error "Invalid username/password"
  ↓
ADMIN DASHBOARD (Admin only)
  ├── Display "Welcome Admin"
  ├── Access "Register Faculty" section
  ├── Enter new faculty details
  ├── Submit to create account
  └── Return to admin dashboard
  ↓
FACULTY DASHBOARD
  ├── Display "Welcome [Faculty Name]"
  ├── Show statistics cards (Total Subjects, Total Papers, View Papers)
  ├── Display subject cards with "Create Paper" button
  └── Select subject → Click "Create Paper"
  ↓
UNIT SELECTION
  ├── Display units 1-5 as checkboxes
  ├── Select one or multiple units
  └── Click "Next"
  ↓
CONTENT UPLOAD (For each selected unit)
  ├── Upload/Enter syllabus (mandatory)
  ├── Upload reference material (PDF/DOCX/TXT) OR Enter text content (mandatory - one option)
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
  ├── Review all inputs (units, syllabus, materials, question config, custom instructions)
  ├── Option to rename paper
  ├── Edit previous steps if needed
  └── Click "Generate Paper"
  ↓
AI PROCESSING
  ├── Analyze syllabus and reference materials
  ├── Identify subject type
  ├── Incorporate custom instructions (if provided)
  ├── Generate varied questions based on difficulty and instructions
  └── Format question paper
  ↓
PAPER GENERATED
  ├── Display success message
  ├── Options: View Paper, Download Paper, Generate Another
  └── Paper saved to "View Papers Generated"
  ↓
VIEW PAPERS (Optional)
  ├── List all generated papers
  ├── Actions: View, Download, Delete
  └── Return to dashboard
  ↓
END or RETURN TO DASHBOARD
```

---

## 6. Key Requirements

### 6.1 Functional Requirements

**FR1**: System shall authenticate faculty using pre-configured credentials
**FR2**: System shall authenticate admin using pre-configured credentials
**FR3**: System shall allow admins to register new faculty members
**FR4**: System shall display personalized dashboard with subject allocations
**FR5**: System shall allow selection of single or multiple units
**FR6**: System shall accept syllabus and reference materials per unit
**FR7**: System shall support PDF, DOCX, and TXT file uploads
**FR8**: System shall perform OCR on scanned documents
**FR9**: System shall allow configuration of question types and quantities
**FR10**: System shall provide three difficulty levels
**FR11**: System shall generate varied questions with different phrasings for each request
**FR12**: System shall accept optional custom instructions for priority topics
**FR13**: System shall incorporate custom instructions into AI generation prompt
**FR14**: System shall recognize subject types (theory, programming, math, diagrams)
**FR15**: System shall generate subject-appropriate questions
**FR16**: System shall combine content from multiple units when selected
**FR17**: System shall provide preview before final generation
**FR18**: System shall allow paper renaming
**FR19**: System shall store generated papers with metadata
**FR20**: System shall allow viewing and deletion of past papers
**FR21**: System shall export papers in standard formats

### 6.2 Non-Functional Requirements

**NFR1 - Performance**: Paper generation should complete within 2-3 minutes **NFR2 - Usability**: Interface should be intuitive for non-technical users **NFR3 - Reliability**: System should generate valid questions 95%+ of the time **NFR4 - Scalability**: Support multiple concurrent faculty users **NFR5 - Uniqueness & Custom Instructions**: Questions vary per generation with different phrasings; faculty can use custom instructions to ensure priority topics are covered **NFR6 - Security**: Secure authentication and data protection **NFR7 - Availability**: System accessible 24/7 **NFR8 - Accuracy**: Questions must align with provided syllabus and materials

### 6.3 Constraints

**C1**: AI must be free and accessible without paid subscription
**C2**: Must work with uploaded content (no external data sources initially)
**C3**: Backend database pre-populated with admin and faculty credentials
**C4**: Faculty registration only via admin (no self-registration)
**C5**: Subject allocation managed at backend level

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

---

## 8. Future Enhancements (Out of Scope for V1)

### 8.1 Advanced Features

- Question bank storage for reuse
- Collaborative paper creation among faculty
- Student difficulty analysis and adaptive generation
- Integration with Learning Management Systems (LMS)
- Mobile application

### 8.2 Enhanced AI Capabilities

- Answer key generation
- Marking scheme creation
- Bloom's taxonomy level tagging
- Question clustering by topic
- Automatic question review and quality scoring

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

- Free AI/NLP service for question generation
- OCR library for document scanning
- File processing libraries for PDF/DOCX handling

### 10.2 Internal Dependencies

- Backend database with faculty and subject data
- Content hosting for uploaded materials
- Authentication system

---

## Document Control

**Version**: 1.0  
**Date**: January 12, 2026  
**Status**: Draft for Review  
**Owner**: Product Team  
**Reviewers**: Development Team, Faculty Representatives, Academic Leadership
