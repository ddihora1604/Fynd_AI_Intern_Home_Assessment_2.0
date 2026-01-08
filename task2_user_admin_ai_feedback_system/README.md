# Task 2 – AI-Powered User & Admin Feedback System

A production-ready, two-dashboard web application that collects customer feedback and generates AI-powered responses, summaries, and actionable recommendations using server-side LLM integration.

---

## 📋 Task Description

Build a **real web application** (not Streamlit/Gradio/notebook-based) with:
- **User Dashboard**: Collect star ratings (1-5) and optional review text, display AI-generated responses
- **Admin Dashboard**: View all submissions with AI summaries, recommended actions, and status tracking
- **Server-side LLM Integration**: All AI calls handled securely on the backend
- **Persistent Storage**: All submissions stored in a database
- **Graceful Error Handling**: Handle empty reviews, long reviews, and LLM/API failures

---

## 🎯 Solution Overview

| Component | Technology | Deployment |
|-----------|------------|------------|
| Frontend | Next.js 14 (React 18) | Vercel |
| Backend | FastAPI (Python) | Render |
| Database | Supabase (PostgreSQL) | Supabase Cloud |
| LLM | Cerebras API (Llama 3.1-8B) | API |

### Architecture Flow
```
User → Next.js Frontend → FastAPI Backend → Cerebras LLM API
                                ↓
                          Supabase DB
                                ↓
Admin ← Next.js Frontend ← FastAPI Backend
```

---

## ✨ Features

### Core Features
- ⭐ **Star Rating System**: Interactive 1-5 star rating selection
- 💬 **Review Text Input**: Optional detailed feedback with character limit handling
- 🤖 **AI-Generated Responses**: Personalized acknowledgment for users
- 📊 **AI Summaries**: Concise feedback summaries for admins
- ✅ **Recommended Actions**: 3-6 actionable items per submission
- 🔄 **Retry Mechanism**: Re-process failed LLM calls
- 📱 **Responsive Design**: Modern SaaS-style UI

### Error Handling
- Empty reviews handled with helpful prompts
- Long reviews automatically truncated (configurable limit)
- LLM failures return graceful fallback responses
- Database errors logged with user-friendly messages

---

## 🖥️ User Dashboard (`/`)

### Functionality
1. **Rating Selection**: Click to select 1-5 stars with visual feedback
2. **Review Input**: Optional textarea for detailed feedback (max 8000 chars)
3. **Submit**: Send feedback to backend for AI processing
4. **AI Response Display**: View personalized AI-generated acknowledgment

### UI Components
- Interactive star rating buttons with hover effects
- Premium textarea
- Submit button with loading spinner
- AI response card with success/error states
- Auto-scroll to response section

---

## 👨‍💼 Admin Dashboard (`/admin`)

### Functionality
1. **Analytics Overview**: Real-time statistics cards
   - Total submissions count
   - Average rating
   - Positive/Neutral/Negative sentiment breakdown
   - AI success rate percentage

2. **Advanced Filtering**:
   - Filter by rating (1-5 stars)
   - Filter by sentiment (Positive/Neutral/Negative)
   - Filter by AI status (Success/Pending/Failed)

3. **Submissions Table**:
   - Timestamp (date + time)
   - Star rating with visual badge
   - Original review text
   - AI-generated summary
   - Recommended actions list
   - Status badge (Success/Pending/Failed)
   - Retry button for failed submissions

---

## 🛠️ Technologies Used

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.8 | React framework with App Router |
| React | 18.3.1 | UI components |
| CSS Custom Properties | - | Theming and styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | Async REST API framework |
| Pydantic | Latest | Request/response validation |
| httpx | Latest | Async HTTP client for LLM calls |
| python-dotenv | Latest | Environment configuration |
| supabase-py | Latest | Database client |

### External Services
| Service | Purpose |
|---------|---------|
| Cerebras API | LLM inference (Llama 3.1-8B) |
| Supabase | PostgreSQL database + real-time |
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## 📁 Directory Structure

```
task2_user_admin_ai_feedback_system/
├── README.md
├── backend/
│   ├── render.yaml              # Render deployment config
│   ├── requirements.txt         # Python dependencies
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── config.py           # Environment & settings
│   │   ├── database.py         # Supabase client
│   │   ├── schemas.py          # Pydantic models
│   │   ├── llm/
│   │   │   └── client.py       # Cerebras LLM integration
│   │   ├── routes/
│   │   │   ├── health.py       # Health check endpoint
│   │   │   └── feedback.py     # Core API endpoints
│   │   └── services/
│   │       └── feedback.py     # Business logic
│   └── schemas_json/           # JSON Schema definitions
│       ├── error_response.json
│       ├── retry_response.json
│       ├── submission_item.json
│       ├── submission_list.json
│       ├── submit_review.json
│       └── submit_review_response.json
└── frontend/
    ├── package.json
    ├── next.config.js
    ├── jsconfig.json
    ├── app/
    │   ├── globals.css         # Global styles & theme
    │   ├── layout.jsx          # Root layout
    │   ├── page.jsx            # User Dashboard
    │   └── admin/
    │       └── page.jsx        # Admin Dashboard
    ├── components/
    │   ├── ReviewForm.jsx      # Rating + review form
    │   ├── StarRating.jsx      # Star selector component
    │   ├── AdminTable.jsx      # Submissions table
    │   └── StatusBadge.jsx     # Status indicator
    └── lib/
        └── api.js              # Backend API client

```

---

## 🔌 API Endpoints

### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{ "status": "ok" }
```

### `POST /api/submit-review`
Submit a new feedback review.

**Request:**
```json
{
  "user_id": "optional-user-id",
  "rating": 4,
  "review": "Great product, fast delivery!"
}
```

**Response:**
```json
{
  "submission_id": "uuid-string",
  "status": "accepted",
  "ai_response": "Thank you for your positive feedback..."
}
```

### `GET /api/submissions`
Fetch all submissions (Admin).

**Query Parameters:**
- `limit` (int, default: 50, max: 200)
- `since` (datetime, optional)

**Response:**
```json
[
  {
    "id": "uuid-string",
    "rating": 4,
    "review_text": "Great product...",
    "ai_summary": "Positive feedback about product quality...",
    "ai_actions": ["Send thank you email", "Feature in testimonials"],
    "ai_status": "success",
    "created_at": "2026-01-08T10:30:00Z"
  }
]
```

### `POST /api/retry/{submission_id}`
Retry LLM processing for failed submissions.

**Response:**
```json
{
  "ok": true,
  "submission_id": "uuid-string",
  "new_status": "success"
}
```

---

## ⚙️ Model & API Configuration

### Cerebras LLM Settings
| Setting | Value | Description |
|---------|-------|-------------|
| Model | `llama3.1-8b` | Llama 3.1 8B parameter model |
| Temperature | `0.2` | Low randomness for consistent outputs |
| Timeout | `30s` | HTTP request timeout |


## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Supabase account
- Cerebras API key

### 1. Clone Repository
```bash
git clone https://github.com/ddihora1604/Fynd_AI_Intern_Home_Assessment_2.0.git
cd Fynd_AI_Intern_Home_Assessment_2.0/task2_user_admin_ai_feedback_system
```

### 2. Supabase Setup
Create a table in Supabase:
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  ai_response TEXT,
  ai_summary TEXT,
  ai_actions TEXT[],
  ai_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo CEREBRAS_API_KEY=your-cerebras-api-key > .env
echo SUPABASE_URL=https://your-project.supabase.co >> .env
echo SUPABASE_API_KEY=your-supabase-anon-key >> .env

# Run development server
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 > .env.local

# Run development server
npm run dev
```

### 5. Access Application
- User Dashboard: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin
- API Docs: http://localhost:8000/docs

---

## 🌐 Deployment

### Backend on Render

1. **Create Web Service** on [Render](https://render.com)
2. **Connect Repository** and select `backend/` directory
3. **Configure Settings:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables:**
   ```
   CEREBRAS_API_KEY=your-key
   SUPABASE_URL=your-url
   SUPABASE_API_KEY=your-key
   ```
5. **Deploy**

### Frontend on Vercel

1. **Import Project** on [Vercel](https://vercel.com)
2. **Set Root Directory:** `frontend`
3. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
   ```
4. **Deploy**


## ⚠️ Important Constraints

### What This Project Does NOT Use
- ❌ Streamlit
- ❌ HuggingFace Spaces
- ❌ Gradio
- ❌ Jupyter Notebooks
- ❌ Client-side LLM API calls