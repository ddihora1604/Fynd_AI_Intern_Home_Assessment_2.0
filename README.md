# Fynd AI Intern Home Assessment 2.0

---

## 📋 Assessment Overview

This repository contains solutions for two AI/LLM-focused tasks:

| Task | Description | Key Focus |
|------|-------------|-----------|
| **Task 1** | Rating Prediction via Prompting | Prompt engineering, evaluation methodology |
| **Task 2** | AI-Powered Feedback System | Full-stack web app with server-side LLM |

### 🔗 Quick Links

#### 🌐 Live Demos (Task 2)
| Dashboard | Description | Link |
|-----------|-------------|------|
| 🧑‍💻 **User Dashboard** | Submit ratings & reviews, get AI responses | [![Live Demo](https://img.shields.io/badge/▶_User_Dashboard-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://fynd-ai-intern-home-assessment-2-0.vercel.app/) |
| 👨‍💼 **Admin Dashboard** | View submissions, analytics & AI summaries | [![Live Demo](https://img.shields.io/badge/▶_Admin_Dashboard-059669?style=for-the-badge&logo=vercel&logoColor=white)](https://fynd-ai-intern-home-assessment-2-0.vercel.app/admin) |

#### 📂 Source Code
| Resource | Link |
|----------|------|
| 📓 **Task 1 - Notebook** | [task1_notebook.ipynb](task1_rating_prediction/task1_notebook.ipynb) |
| 📁 **Task 1 - Full Directory** | [task1_rating_prediction/](task1_rating_prediction/) |
| 📁 **Task 2 - Full Directory** | [task2_user_admin_ai_feedback_system/](task2_user_admin_ai_feedback_system/) |

---

## 🎯 Overall Approach

### Task 1 Approach: Systematic Prompt Engineering

| Phase | Action | Outcome |
|-------|--------|---------|
| **Exploration** | Implemented 3 distinct prompting strategies | Comparative baseline established |
| **Standardization** | Enforced strict JSON output schema | 100% parse success rate |
| **Optimization** | Designed rating rubric + tie-break rules | Reduced ambiguity in middle ratings |
| **Evaluation** | Measured accuracy, validity, consistency | Data-driven strategy selection |

**Key Insight**: All three strategies (zero-shot, few-shot, chain-of-thought) achieved similar accuracy (~64%), suggesting the 8B model's capability - not prompt design - is the primary bottleneck.

### Task 2 Approach: Production-Grade System Design

| Phase | Action | Outcome |
|-------|--------|---------|
| **Architecture** | Separated frontend/backend with clear API contracts | Secure LLM calls, scalable design |
| **Reliability** | Implemented fallbacks for all failure modes | Graceful degradation under errors |
| **Persistence** | Added Supabase for durable storage | Data survives restarts, enables admin analytics |
| **Deployment** | Deployed to Vercel + Render | Publicly accessible, auto-scaling |


### LLM Configuration (Both Tasks)

| Parameter | Task 1 | Task 2 | Rationale |
|-----------|--------|--------|-----------|
| **Model** | Llama 3.1-8B | Llama 3.1-8B | Fast inference, free tier, sufficient capability |
| **Temperature** | 0.0 | 0.2 | Deterministic for evaluation vs. natural variation |
| **Output Format** | Strict JSON | Strict JSON | Enables automated parsing and validation |
| **Error Strategy** | Regex fallback | Graceful fallback response | Never fail silently |

---

## 🏗️ Design & Architecture Decisions

### Task 1: Rating Prediction

**Decision 1: Three-Strategy Comparison**
```
Zero-Shot → Few-Shot → Chain-of-Thought
```
Rather than picking one approach, I implemented all three to:
- Understand accuracy/complexity trade-offs
- Provide quantitative comparison data
- Identify which works best for different scenarios

**Decision 2: Strict JSON Schema**
```json
{"predicted_stars": <int>, "explanation": "<string>"}
```
- Forces structured output (no free-form text parsing)
- Enables automated evaluation at scale
- Achieves 100% JSON validity rate

**Decision 3: Smart Few-Shot Selection**
- Algorithm scores reviews by clarity (sentiment keywords + length)
- Selects 2 examples per rating class (1-5)
- Avoids ambiguous reviews that could confuse the model

---

### Task 2: Feedback System

**Architecture: Separated Frontend + Backend**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Next.js 14    │────▶│    FastAPI      │────▶│  Cerebras   │
│   (Vercel)      │     │    (Render)     │     │    LLM      │
└─────────────────┘     └────────┬────────┘     └─────────────┘
                                 │
                        ┌────────▼────────┐
                        │    Supabase     │
                        │   (PostgreSQL)  │
                        └─────────────────┘
```

**Why This Architecture?**
| Decision | Rationale |
|----------|-----------|
| Separate backend | Server-side LLM calls (API keys never exposed) |
| FastAPI | Async support for LLM calls, automatic OpenAPI docs |
| Supabase | Free PostgreSQL with real-time capabilities |
| Next.js 14 | App Router, React 18, edge-ready |

**Decision: Async LLM Processing**
- Submit returns immediately with `ai_status: "pending"`
- LLM runs async, updates database on completion
- Failed calls can be retried via `/api/retry/{id}`

---

## 📝 Prompt Iterations & Improvements

### Task 1: Evolution of Prompts

**Iteration 1 → 2: Added Rating Rubric**
```diff
- Predict the star rating (1-5).
+ Use this rubric:
+   1: very negative (strong complaints)
+   2: negative (more bad than good)
+   3: mixed/neutral (pros and cons)
+   4: positive (mostly good, minor issues)
+   5: very positive (strong praise)
```
*Result*: Reduced ambiguity in middle ratings (2-4)

**Iteration 2 → 3: Strict Output Rules**
```diff
+ Rules:
+ - Output MUST be a single JSON object and nothing else.
+ - "predicted_stars" MUST be an integer 1-5 (no words, no decimals).
```
*Result*: JSON validity improved to 100%

**Iteration 3 → 4: Chain-of-Thought Tie-Breakers**
```diff
+ Tie-break rules:
+ - If mixed, prefer 3 unless positives clearly outweigh (→4)
+ - If strong praise with minor nitpicks, prefer 4 (or 5 if enthusiastic)
+ - If major issues (rude service, unsafe), prefer 1-2
```
*Result*: Better handling of ambiguous reviews

### Task 2: LLM Prompt Design

**Production Prompt Structure**:
```
System: You are an assistant handling customer feedback.
        Return ONLY valid JSON: {"user_response", "summary", "recommended_actions"}

User: Rating: {rating}/5
      Review: {truncated_text}
      Task: (1) user-facing response, (2) summary, (3) 3-6 actions
```

**Key Improvements**:
- Truncation at 2500 chars prevents context overflow
- Empty review handling with helpful defaults
- Temperature 0.2 for slight variation in responses

---

## 📊 Evaluation Methodology & Results (Task 1)

### Methodology

**Dataset**: 200 stratified samples from Yelp reviews (seed=42 for reproducibility)

**Metrics**:
| Metric | Description |
|--------|-------------|
| Exact Accuracy | Predicted == Actual rating |
| Within ±1 | Predicted within 1 star of actual |
| JSON Validity | % of valid, parseable responses |
| Consistency | Same output across multiple runs (temp=0) |

### Results

| Strategy | Exact Accuracy | Within ±1 | JSON Valid | Consistent |
|----------|----------------|-----------|------------|------------|
| **Zero-Shot** | 64.50% | 98.00% | 100% | 100% |
| **Few-Shot** | 63.50% | 97.50% | 100% | 100% |
| **Chain-of-Thought** | 64.50% | 98.00% | 100% | 100% |

### Key Findings

1. **All strategies perform similarly** (~64% exact, ~98% within ±1)
   - 8B parameter model is the bottleneck, not prompt design
   - Middle ratings (2, 3, 4) remain hardest to distinguish

2. **100% JSON validity achieved**
   - Strict schema enforcement works
   - Fallback regex parsing never needed

3. **Zero-shot is most cost-effective**
   - Same accuracy as few-shot
   - Fewer tokens = lower cost

4. **Error Analysis**: Most errors are ±1 off
   - Model rarely predicts 1 when actual is 5 (or vice versa)
   - Confusion concentrated in adjacent ratings

---

## ⚙️ System Behaviour, Trade-offs & Limitations (Task 2)

### How the System Actually Works

**Submit Flow (`POST /api/submit-review`)**:
```
User clicks Submit
       ↓
Pydantic validates: rating (1-5), review (≤8000 chars)
       ↓
Insert row into Supabase with ai_status="pending"
       ↓
Call run_llm_and_build_update() ← wrapped in try/except
       ↓
   ┌───────────────────────────────────────┐
   │  If LLM succeeds:                     │
   │  - Parse JSON response                │
   │  - Extract: user_response, summary,   │
   │             recommended_actions       │
   │  - Update row: ai_status="success"    │
   └───────────────────────────────────────┘
   ┌───────────────────────────────────────┐
   │  If LLM fails (timeout, API error,    │
   │  malformed JSON):                     │
   │  - Use fallback response              │
   │  - Update row: ai_status="failed"     │
   │  - Admin can retry later              │
   └───────────────────────────────────────┘
       ↓
Return {submission_id, status: "accepted", ai_response}
```

### What I Actually Implemented for Edge Cases

| Edge Case | How It's Handled in Code | Code Location |
|-----------|--------------------------|---------------|
| **Empty review text** | Returns pre-defined response: *"Thanks for your rating. If you add a short note, we can act on it faster."* + generic summary/actions | `llm/client.py` line 28-33 |
| **Long review (>2500 chars)** | `_truncate()` function cuts text and appends `[TRUNCATED]` marker before sending to LLM | `llm/client.py` line 19-22 |
| **LLM returns non-JSON** | `json.loads()` wrapped in try/except → raises `RuntimeError` → caught by service layer → returns fallback | `llm/client.py` line 79-80 |
| **LLM missing required fields** | Explicit check for `user_response`, `summary`, `recommended_actions` → raises error if missing | `llm/client.py` line 86-87 |
| **Cerebras API timeout** | `httpx.AsyncClient(timeout=30.0)` → timeout exception → fallback response | `llm/client.py` line 56 |
| **Supabase insert fails** | Returns `502` with structured `ErrorResponse(code="SUPABASE_ERROR")` | `routes/feedback.py` line 31-34 |
| **Supabase update fails** | Silently uses fallback response but still returns success to user (row exists with pending status) | `routes/feedback.py` line 48-50 |

### Trade-offs

| Decision | What I Did | Why | What I Sacrificed |
|----------|------------|-----|-------------------|
| **Blocking LLM call** | User waits for LLM response before seeing result | Simpler UX—immediate feedback, no polling needed | Slower perceived response (~2-4s wait) |
| **Insert-then-update pattern** | First insert row as "pending", then update with LLM result | Ensures data is saved even if LLM fails; allows retry | Extra database call per submission |
| **Hard truncation at 2500 chars** | Just cut the text with `[TRUNCATED]` marker | Prevents token overflow, keeps latency consistent | May lose important context in very long reviews |
| **No retry queue** | Admin manually clicks "Retry" button for failed submissions | Simple implementation, no background job infrastructure | Failed submissions sit until admin notices |
| **Temperature 0.2** | Slight randomness in LLM responses | Responses feel more natural, less robotic | Occasional inconsistency in tone |

### Limitations of This Implementation

1. **Render Cold Starts**
   - I deployed backend on Render free tier
   - After 15 min inactivity, server sleeps
   - First request after sleep takes 10-30 seconds
   - *Workaround*: Could add a cron job to ping `/health` every 10 min

2. **No Authentication**
   - Anyone can access `/admin` dashboard
   - Anyone can submit reviews (no user accounts)
   - *Why I skipped it*: Not required for the assessment; would add NextAuth.js in production

3. **Single Point of Failure (Cerebras)**
   - If Cerebras API is down, all new submissions get `ai_status="failed"`
   - No automatic fallback to another LLM provider
   - *Mitigation in code*: Fallback response ensures user still gets acknowledgment

4. **Actions Array Not Validated**
   - LLM returns `recommended_actions` as array, I just cap it at 8 items
   - No check for action quality/relevance
   - *Why*: Trusting LLM output for this use case; validation would require another LLM call

5. **No Rate Limiting**
   - Someone could spam `/api/submit-review` and burn through Cerebras quota
   - *Would add*: `slowapi` or Redis-based rate limiting in production

---

## 🛠️ Technologies Summary

| Category | Task 1 | Task 2 |
|----------|--------|--------|
| **Language** | Python | Python + JavaScript |
| **LLM** | Cerebras Llama 3.1-8B | Cerebras Llama 3.1-8B |
| **Framework** | Jupyter Notebook | FastAPI + Next.js 14 |
| **Database** | CSV files | Supabase (PostgreSQL) |
| **Deployment** | Local | Vercel + Render |
| **Key Libraries** | pandas, sklearn, matplotlib | Pydantic, httpx, React 18 |

---

## 🚀 Quick Start

### Task 1
```bash
cd task1_rating_prediction
pip install -r requirements.txt
# Add CEREBRAS_API_KEY to .env
jupyter notebook task1_notebook.ipynb
```

### Task 2
```bash
# Backend
cd task2_user_admin_ai_feedback_system/backend
pip install -r requirements.txt
# Add CEREBRAS_API_KEY, SUPABASE_URL, SUPABASE_API_KEY to .env
uvicorn app.main:app --reload

# Frontend (new terminal)
cd task2_user_admin_ai_feedback_system/frontend
npm install
# Add NEXT_PUBLIC_BACKEND_URL to .env.local
npm run dev
```

---

## 📝 Conclusion

Both tasks demonstrate practical LLM integration with emphasis on:
- **Reliability**: Strict schemas, fallback handling, validation
- **Measurability**: Quantitative evaluation with clear metrics
- **Production-readiness**: Deployed, documented, maintainable code

Task 1 shows that prompt engineering has diminishing returns—model capability is the primary bottleneck. Task 2 demonstrates a complete system architecture suitable for real-world deployment with appropriate error handling and user experience considerations.

---

## 📚 References

- [Cerebras Cloud Documentation](https://cloud.cerebras.ai/docs)
- [Yelp Dataset (Kaggle)](https://www.kaggle.com/datasets/omkarsabnis/yelp-reviews-dataset)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
