# Jenisha Question Paper Generator

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new project in Supabase.
2. Go to the SQL Editor in Supabase dashboard.
3. Open `supabase_schema.sql` from this project and copy its content.
4. Run the SQL query to create tables and seed the admin user.

### 2. Backend Setup
1. Navigate to `backend` directory:
   ```bash
   cd backend
   ```
2. Update `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```
3. Run the server:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not done):
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```

### 4. Login Credentials
- **Email**: `admin@jenisha.com`
- **Password**: `admin123`
