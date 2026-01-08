# Task 2 – Two-Dashboard AI Feedback System

This folder contains a real web application (no Streamlit/Gradio/notebooks):
- **Frontend (Next.js)** with two routes:
  - `/` (User Dashboard)
  - `/admin` (Admin Dashboard)
- **Backend (FastAPI)** with server-side LLM calls + persistent storage

## Backend endpoints
- `GET /health`
- `POST /api/submit-review`
- `GET /api/submissions`
- `POST /api/retry/{submission_id}`

## Deployment (high level)
- Deploy `backend/` to Render (set `DATABASE_URL`, `CEREBRAS_API_KEY`)
- Deploy `frontend/` to Vercel (set `NEXT_PUBLIC_BACKEND_URL`)

JSON schemas required by the assignment are in `backend/schemas_json/`.
