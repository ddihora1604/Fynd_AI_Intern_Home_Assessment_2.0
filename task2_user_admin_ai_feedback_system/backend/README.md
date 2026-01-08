# Task 2 Backend (FastAPI)

## Endpoints
- `GET /health`
- `POST /api/submit-review`
- `GET /api/submissions?limit=50&since=...`
- `POST /api/retry/{submission_id}`

## Env vars (Render)
- `CEREBRAS_API_KEY` (required for LLM)
- `SUPABASE_URL`
- `SUPABASE_API_KEY`

## Run locally
```powershell
cd task2_user_admin_ai_feedback_system\backend
pip install -r requirements.txt
$env:CEREBRAS_API_KEY="..."
uvicorn app.main:app --reload --port 3001
```
