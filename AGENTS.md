# Agent Operation Guide: Jenisha Project

This repository hosts a full-stack **AI-Powered Question Paper Generator** application for educational institutions.

**Frontend**: React 19 (Vite 7) + Tailwind CSS v4 + react-router-dom v7
**Backend**: FastAPI (Python 3.12+) + Supabase (PostgreSQL + pgvector) + LangChain + Groq/Gemini LLMs + Mistral OCR

Follow these strict guidelines to maintain codebase integrity and quality.

## 🚀 Build & Run Commands

### Backend (`/backend`)
Managed by `uv`.

- **Install Dependencies**:
  ```bash
  cd backend
  uv sync
  # OR if uv is not installed: pip install -r requirements.txt
  ```
- **Run Development Server**:
  ```bash
  cd backend
  uv run uvicorn app.main:app --reload --port 8000
  ```
- **Linting**:
  Currently relies on IDE settings. Ensure code complies with PEP 8.
- **Testing**:
  *No automated test runner is currently configured.*
  - **Manual Verification**: Use `curl` or Postman to test endpoints.
  - **Future Setup**: If adding tests, use `pytest`.
    ```bash
    # Future command example
    # uv run pytest tests/test_api.py
    ```

### Frontend (`/frontend`)
Managed by `pnpm`.

- **Install Dependencies**:
  ```bash
  cd frontend
  pnpm install
  ```
- **Run Development Server**:
  ```bash
  cd frontend
  pnpm dev
  ```
- **Build for Production**:
  ```bash
  cd frontend
  pnpm build
  ```
- **Lint Code**:
  ```bash
  cd frontend
  pnpm lint
  ```
- **Testing**:
  *No automated test runner configured.* 
  - Verify UI changes by checking the browser at `http://localhost:5173`.

## 🏗 Codebase Structure & Conventions

### Directory Overview
- `backend/app/`: Core application logic.
  - `api/`: Route handlers (keep these thin).
  - `core/`: Config (`config.py`), security, DB connections.
  - `services/`: Business logic (LLM calls, OCR, heavy lifting).
  - `models/`: Pydantic schemas (Request/Response models).
- `frontend/src/`: React source.
  - `components/`: Reusable UI elements (PascalCase).
  - `pages/`: Route views.
  - `services/`: API integration (`api.js`).
  - `context/`: Global state (e.g., `AuthContext`).

### Backend Guidelines (Python/FastAPI)
1. **Type Hints**: **MANDATORY**. Use standard `typing` and Pydantic.
   ```python
   def process_document(file_id: str) -> ProcessingResult: ...
   ```
2. **Pydantic Models**: Use for ALL request bodies and response schemas.
   - Place in `app/models/`.
   - Use `Field(..., description="...")` for better API docs.
3. **Database (Supabase)**:
   - Use the `supabase` client from `app.core.supabase`.
   - **Security**: Do NOT run raw SQL strings if possible; use the client builder.
   - **RLS**: Ensure SQL scripts in `/sql` define Row Level Security policies.
4. **AI & OCR Services**:
   - Use `mistralai` for OCR (specifically `mistral-ocr-latest`).
   - Use `langchain` or provider SDKs (`google-generativeai`, `groq`) for generation.
   - **Long-running tasks**: Offload to `FastAPI.BackgroundTasks` to avoid blocking APIs.
5. **Error Handling**:
   - Raise `HTTPException` (e.g., `raise HTTPException(status_code=404, detail="Item not found")`).
   - Log errors before raising if they are unexpected.

### Frontend Guidelines (React/Vite)
1. **Component Style**:
   - Functional components only.
   - Use **Hooks** for state and side effects.
   - **Tailwind CSS v4**: Use utility classes directly in `className`.
     ```jsx
     <div className="flex flex-col gap-4 p-6 bg-white shadow-md rounded-lg">
     ```
2. **State Management**:
   - Local state: `useState`, `useReducer`.
   - Global state: React Context (e.g., `useAuth`). Avoid Redux unless complex.
   - Forms: Controlled components or `react-hook-form` (if installed).
3. **API Integration**:
   - **MUST** use the configured Axios instance in `src/services/api.js`.
   - Do not use `fetch` directly. The interceptors handle auth tokens.
   - Handle loading (`isLoading`) and error (`error`) states in UI.
   - Use `react-hot-toast` for notifications (`toast.success()`, `toast.error()`).
4. **Icons**: Use `lucide-react`.
   ```jsx
   import { BookOpen, FileText } from 'lucide-react';
   ```
5. **Routing**: Use `react-router-dom` (v7).
6. **File Uploads**: Use `react-dropzone` for drag-and-drop file uploads.

## 📝 SQL & Database
- **Schema Management**:
  - All database changes must be recorded in `.sql` files in the `/sql` directory.
  - Do NOT change the database schema manually without creating a corresponding migration script.
- **Naming**: `snake_case` for tables and columns.

## 🛡 Security Rules
1. **Secrets**: NEVER hardcode API keys or credentials.
   - Backend: `app.core.config.settings` (reads from env).
   - Frontend: `import.meta.env.VITE_...`.
2. **Auth**:
   - Verify JWT tokens on protected backend routes (`Depends(get_current_user)`).
   - Frontend routes should be protected via a `ProtectedRoute` wrapper.

## 🤖 Agent Workflow Checklist
When working on this codebase, follow this cycle:

1. **Context Phase**:
   - Run `ls -R` or `grep` to locate relevant files.
   - Read `PRD.md` or `IMPLEMENTATION_PLAN.md` if available to understand features.

2. **Implementation Phase**:
   - **Modify**: specific files based on requirements.
   - **Style**: Apply the conventions listed above.
   - **Dependencies**: If adding a library:
     - Backend: `uv add <package>`
     - Frontend: `pnpm add <package>`

3. **Verification Phase (CRITICAL)**:
   - **Lint**: Run `pnpm lint` in frontend.
   - **Compile**: Check for syntax errors.
   - **Manual Test**:
     - Check if the dev server starts (`pnpm dev`, `uv run uvicorn...`).
     - Verify the specific feature implemented works as expected.
     - **Self-Correction**: If it fails, analyze the error, fix, and retry.

4. **Cleanup**:
   - Remove any temporary print statements or "TODO" comments you added.
   - Ensure no "agent signature" comments remain in the code.

## 📡 API Routes Reference

### Backend API Endpoints (prefix: `/api`)
- **Auth**: `/auth/login`, `/auth/logout`, `/auth/me`, `/admin/register`
- **Subjects**: `/subjects`, `/subjects/{id}`, `/faculty/subjects`
- **Documents**: `/documents/`, `/documents/{id}`, `/documents/{id}/process`
- **Papers**: `/papers/`, `/papers/{id}`, `/papers/{id}/download`
- **RAG**: `/rag/search`, `/rag/embed`
- **Generation**: `/generation/questions`

### Frontend Routes
- `/login` - Login page
- `/admin-dashboard` - Admin: manage faculty, subjects
- `/faculty-dashboard` - Faculty: view subjects, papers
- `/subjects/:subjectId/create-paper` - Paper creation wizard
- `/papers` - List all generated papers
- `/papers/:paperId` - View/download generated paper

---
*Generated by Agentic Analysis - Keep this file updated as the project evolves.*
