# Agent Operation Guide

This repository contains a full-stack application with a FastAPI backend and a React (Vite) frontend.
Follow these guidelines to maintain code quality and consistency.

## 🛠 Project Structure & Commands

### Backend (`/backend`)
Managed by `uv` (modern Python package manager).

- **Install**: `cd backend && uv venv && source .venv/bin/activate && uv sync` (or `uv pip install -r requirements.txt` if using legacy)
- **Run Dev Server**: `cd backend && uv run uvicorn app.main:app --reload`
- **Lint/Format**: Follow PEP 8. Use standard Python tooling.
- **Dependencies**: Manage via `pyproject.toml`. Add new packages with `uv add <package>`.

### Frontend (`/frontend`)
Managed by `pnpm`.

- **Install**: `cd frontend && pnpm install`
- **Run Dev Server**: `cd frontend && pnpm dev`
- **Build**: `cd frontend && pnpm build`
- **Lint**: `cd frontend && pnpm lint`

### Database (`/sql`)
- **SQL Scripts**: Any SQL scripts to be run in the Postgres SQL editor (Supabase) MUST be placed in the `sql/` folder.
- **Naming**: Use descriptive names (e.g., `phase3_schema.sql`).
- **Comments**: Include comments explaining what each block does.

## 🧠 Code Style & Conventions

### General
- **Comments**: Code must be self-documenting. Use comments ONLY for:
  - Complex algorithmic logic.
  - Security-critical decisions.
  - "Why" something is done (not "what").
  - **AVOID** agent "memo" comments like "Updated X", "Fixed Y", "Added function Z". Let Git handle history.

### Backend (Python/FastAPI)
- **Type Hints**: MANDATORY. Use `typing` (`List`, `Optional`, `Dict`, `Any`) and Pydantic models.
  ```python
  # Good
  def get_item(item_id: UUID) -> ItemResponse: ...
  
  # Bad
  def get_item(item_id): ...
  ```
- **Imports**: Use absolute imports starting from `app`.
  `from app.core.config import settings` (NOT `from ..core import config`)
- **Models**: Use Pydantic `BaseModel` for schemas. Put them in `app/models/`.
- **API Structure**:
  - Routers in `app/api/`.
  - Business logic in `app/services/` (keep routers thin).
  - Database access via `supabase` client in `app/core/supabase.py` or services.
- **Error Handling**: Raise `HTTPException` with status codes. Do not return dictionaries for errors.

### Frontend (React/Vite)
- **Components**: Functional components only. Use hooks.
- **Styling**: Tailwind CSS via `className`. Avoid inline styles or separate CSS files unless necessary.
- **State Management**: Use `useState` for local state, Context API for global (e.g., AuthContext).
- **API Calls**: Use the configured `api` instance from `src/services/api.js`.
  - Handle errors gracefully (try/catch in components or services).
- **File Naming**: PascalCase for components (`SubjectCard.jsx`), camelCase for helpers/hooks (`useAuth.js`).
- **Imports**:
  - Group imports: React/Third-party -> Local Components -> Services/Utils -> Assets/Styles.

## 🧪 Testing & Verification
Since explicit test runners are not yet fully configured in the analyzed files:
- **Verification**: ALWAYS verify changes by running the dev servers.
- **Manual Test**: If adding a new endpoint, verify with `curl` or by integrating into the frontend.
- **Safety**:
  - NEVER commit broken code.
  - Fix lsp_diagnostics errors before marking a task complete.
  - Check for "memo" comments and remove them before finishing.

## 🔒 Security & Best Practices
- **Env Vars**: Access via `settings` (backend) or `import.meta.env` (frontend). NEVER hardcode secrets.
- **Supabase**: Use RLS policies (SQL) for data security. The backend uses the service key, so be careful with permissions.
- **Validation**: Validate all inputs using Pydantic (backend) and form validation (frontend).

## 🤖 Agent Workflow
1. **Plan**: Read `IMPLEMENTATION_PLAN.md` to understand the current phase.
2. **Context**: Use `ls` and `grep` to understand the file structure before creating files.
3. **Implement**: Write code following the styles above.
4. **Verify**: Check for syntax errors and logic flaws.
5. **Clean**: Remove any "agent self-notes" or verbose comments.
