# Fynd AI Intern Home Assessment 2.0

---

## 📋 Assessment Overview

This repository contains solutions for two AI/LLM-focused tasks:

| Task | Description | Key Focus |
|------|-------------|-----------|
| **Task 1** | Rating Prediction via Prompting | Prompt engineering, evaluation methodology |
| **Task 2** | AI-Powered Feedback System | Full-stack web app with server-side LLM |

### 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Task 2 - User Dashboard** | [Live Demo](https://fynd-ai-intern-home-assessment-2-0.vercel.app/) |
| **Task 2 - Admin Dashboard** | [Live Demo](https://fynd-ai-intern-home-assessment-2-0.vercel.app/admin) |
| **Task 1 - Notebook** | [task1_notebook.ipynb](task1_rating_prediction/task1_notebook.ipynb) |

---

## 🎯 Overall Approach

### Task 1 Approach: Systematic Prompt Engineering

| Phase | Action | Outcome |
|-------|--------|---------|
| **Exploration** | Implemented 3 distinct prompting strategies | Comparative baseline established |
| **Standardization** | Enforced strict JSON output schema | 100% parse success rate |
| **Optimization** | Designed rating rubric + tie-break rules | Reduced ambiguity in middle ratings |
| **Evaluation** | Measured accuracy, validity, consistency | Data-driven strategy selection |

**Key Insight**: All three strategies (zero-shot, few-shot, chain-of-thought) achieved similar accuracy (~64%), suggesting the 8B model's capability—not prompt design—is the primary bottleneck.

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

### System Behaviour

**Application Workflow**:
```
1. User submits rating + review
2. Backend validates input (Pydantic)
3. Record inserted with status="pending"
4. LLM called async with truncated review
5. Database updated with AI response
6. User sees personalized acknowledgment
7. Admin sees summary + actions in table
```

**Error Handling Behaviour**:
| Scenario | System Response |
|----------|-----------------|
| Empty review | Default response: "Thanks for rating. Add details for faster action." |
| Long review (>2500 chars) | Truncated with `[TRUNCATED]` marker |
| LLM timeout (30s) | Fallback: "Thanks for feedback. Team will review shortly." |
| LLM API error | Status set to "failed", retry button appears |
| Database error | Returns 502 with structured error JSON |

### Trade-offs

| Trade-off | Choice Made | Alternative Considered |
|-----------|-------------|------------------------|
| **Sync vs Async LLM** | Sync (blocking) | Async with webhooks |
| *Rationale* | Simpler UX—user sees response immediately | Would require polling/websockets |
| **Truncation limit** | 2500 chars | Full review (no limit) |
| *Rationale* | Prevents context overflow, consistent latency | Could miss details in very long reviews |
| **Temperature** | 0.2 | 0.0 (deterministic) |
| *Rationale* | Slight variation feels more natural | May occasionally produce odd responses |
| **Retry mechanism** | Manual button | Auto-retry with backoff |
| *Rationale* | Gives admin control, avoids infinite loops | Better for fully automated systems |

### Limitations

1. **Cold Start Latency**
   - Render free tier spins down after inactivity
   - First request may take 10-30s to wake up

2. **No Authentication**
   - Admin dashboard is publicly accessible
   - Production would need auth (NextAuth, Clerk, etc.)

3. **Single LLM Provider**
   - Dependent on Cerebras API availability
   - No fallback to OpenAI/Anthropic

4. **No Rate Limiting**
   - Could be abused with spam submissions
   - Would add Redis-based rate limiting in production

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
