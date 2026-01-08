# Task 1: Rating Prediction via Prompting

## 📋 Task Description

**Objective**: Predict Yelp review star ratings (1–5) using Large Language Model prompting techniques—without any fine-tuning.

Given a text review, the model must output:
```json
{
  "predicted_stars": <integer 1-5>,
  "explanation": "<brief evidence-based explanation>"
}
```

**Key Constraints**:
- Use prompting only (zero-shot, few-shot, chain-of-thought)
- Evaluate on ~200 sampled reviews
- Compare accuracy, JSON validity, and consistency across approaches

---

## 💡 Solution Overview

### Approach
I implemented **three distinct prompting strategies**, each with carefully designed prompts that enforce a strict JSON output schema:

| Strategy | Description | Key Feature |
|----------|-------------|-------------|
| **Zero-Shot** | Direct prediction with rating rubric | No examples, relies on instruction clarity |
| **Few-Shot** | 10 curated examples (2 per rating 1–5) | Model learns from demonstration |
| **Chain-of-Thought** | Hidden internal reasoning with tie-break rules | Deeper analysis without verbose output |

### Pipeline
```
Load Data → Build Prompts → Call LLM (Cerebras) → Parse JSON → Evaluate → Compare
```

---

## ✨ Features

- **Strict JSON Schema Enforcement**: All prompts require exact JSON output format
- **Smart Few-Shot Selection**: Algorithm picks clear, unambiguous examples with sentiment scoring
- **Rating Rubric**: Consistent 5-point scale definition across all prompts
- **Robust Parsing**: JSON extraction with fallback to regex if model deviates
- **Comprehensive Evaluation**: Accuracy, JSON validity rate, and consistency metrics
- **Reproducible Results**: Fixed random seed (42) for sampling, temperature=0 for determinism

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| Python 3.x | Core language |
| Cerebras Cloud SDK | LLM API access |
| Pandas | Data manipulation |
| Scikit-learn | Evaluation metrics (accuracy, confusion matrix) |
| Matplotlib & Seaborn | Visualizations |
| python-dotenv | Environment variable management |

---

## 📁 Directory Structure

```
task1_rating_prediction/
├── README.md                         # This documentation
├── requirements.txt                  # Python dependencies
├── sample_yelp_data.py               # Script to create 200-row sample
├── task1_notebook.ipynb              # Main implementation notebook
│
├── prompts/
│   ├── zero_shot.txt                 # Zero-shot prompt template
│   ├── few_shot.txt                  # Few-shot prompt template
│   └── chain_of_thought.txt          # Chain-of-thought prompt template
│
├── data/
│   ├── yelp.csv                      # Original Yelp dataset
│   └── yelp_sample_200.csv           # Sampled 200 reviews (seed=42)
│
├── results/
│   ├── zero_shot_predictions.csv     # Predictions + explanations + raw responses
│   ├── few_shot_predictions.csv
│   └── chain_of_thought_predictions.csv
│
└── figures/
    ├── confusion_zero_shot.png       # Confusion matrices
    ├── confusion_few_shot.png
    ├── confusion_chain_of_thought.png
    └── strategy_comparison.png       # Accuracy comparison chart
```

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

**Dependencies**:
- `pandas` – Data handling
- `scikit-learn` – Metrics (accuracy, classification report)
- `matplotlib`, `seaborn` – Plotting
- `python-dotenv` – Load `.env` file
- `cerebras_cloud_sdk` – Cerebras API client

### Step 2: Get Cerebras API Key
1. Visit [https://cloud.cerebras.ai/](https://cloud.cerebras.ai/)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate and copy your API key

### Step 3: Configure Environment
Create a `.env` file in the **parent directory** (`Fynd Task/`):
```
CEREBRAS_API_KEY=your_api_key_here
```

### Step 4: Generate Sample Dataset
```bash
cd task1_rating_prediction
python sample_yelp_data.py
```
This creates `data/yelp_sample_200.csv` (200 stratified rows, seed=42).

### Step 5: Run the Notebook
1. Open `task1_notebook.ipynb` in VS Code or Jupyter
2. Select Python kernel with required packages
3. Run all cells sequentially

---

## ⚙️ Model & API Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Model** | `llama3.1-8b` | Fast, capable, available on Cerebras free tier |
| **Temperature** | `0.0` | Deterministic output for reproducibility |
| **Max Tokens** | `120` | Sufficient for JSON + short explanation |
| **Provider** | Cerebras Cloud | Free tier, fast inference |

**API Call Structure**:
```python
response = client.chat.completions.create(
    model="llama3.1-8b",
    messages=[
        {"role": "system", "content": system_prompt},  # Optional (CoT only)
        {"role": "user", "content": prompt}
    ],
    temperature=0.0,
    max_tokens=120
)
```

---

## 📝 Prompt Design & Improvements

### Common Elements (All Prompts)

All three prompts share these design principles:
- **Rating Rubric**: Clear 5-point scale definition prevents ambiguity
- **Strict JSON Schema**: Exact output format specified with examples
- **Rules Section**: Explicit constraints (integer only, no extra text)

### Zero-Shot Prompt

**Design**: Direct instruction with rubric, no examples.

```
You are predicting the Yelp review star rating as an integer from 1 to 5.

Use this rubric:
- 1: very negative (strong complaints, would not return)
- 2: negative (more bad than good)
- 3: mixed/neutral (okay, average, pros and cons)
- 4: positive (mostly good, minor issues)
- 5: very positive (strong praise, highly satisfied)

Rules:
- Output MUST be a single JSON object and nothing else.
- "predicted_stars" MUST be an integer 1-5 (no words, no decimals).
- "explanation" should be 1-2 short sentences citing key evidence.
```

**Why This Works**: Clear rubric reduces ambiguity; strict rules improve JSON compliance.

---

### Few-Shot Prompt

**Design**: Same rubric + **10 curated examples** (2 per rating class).

**Key Improvement – Smart Example Selection**:

Instead of randomly picking the first review for each rating, we use a **clarity scoring algorithm**:

```python
def select_clear_examples(df, rating, n=2, max_len=120):
    # Score reviews by:
    # 1. Length (shorter = clearer)
    # 2. Sentiment keywords (obvious positive/negative words)
    # Pick top-scoring reviews as examples
```

**Example Selection Criteria**:
| Rating | Preferred Keywords |
|--------|-------------------|
| 1–2 | "terrible", "awful", "worst", "disgusting", "never", "waste" |
| 3 | "okay", "average", "decent", "fine", "nothing special" |
| 4–5 | "amazing", "excellent", "love", "best", "fantastic", "great" |

**Why 10 Examples (2 per rating)**:
- Covers full rating spectrum (original only had ratings 1, 3, 5)
- Helps model distinguish subtle differences (2 vs 3, 4 vs 5)
- Multiple examples per class reduce bias from outliers

---

### Chain-of-Thought (Hidden) Prompt

**Design**: Internal reasoning checklist + tie-break rules (hidden from output).

**Key Differentiator**: Unlike standard CoT that outputs reasoning steps, this uses **hidden CoT**—the model reasons internally but only outputs JSON.

```
Internal checklist (do not output these steps):
1) Identify positive vs negative cues.
2) Weigh severity and frequency of complaints/praise.
3) Consider whether the reviewer would return/recommend.
4) Resolve ambiguity using tie-break rules below.

Tie-break rules:
- If the review is mixed, prefer 3 unless positives clearly outweigh negatives (→4) 
  or negatives clearly outweigh positives (→2).
- If there is strong praise with minor nitpicks, prefer 4 (or 5 if enthusiastic).
- If there are major issues (rude service, unsafe/dirty), prefer 1-2.
```

**Why Hidden CoT**:
- Encourages deeper analysis without wasting tokens on visible reasoning
- Tie-break rules handle ambiguous middle ratings (2, 3, 4)
- System prompt reinforces: *"Think step-by-step internally, but do not reveal reasoning"*

---

## 📊 Evaluation Metrics

### 1. Accuracy (Actual vs Predicted)

| Metric | Description |
|--------|-------------|
| **Exact Match** | % predictions matching ground truth exactly |
| **Within ±1** | % predictions within 1 star of ground truth |

### 2. JSON Validity Rate

Percentage of LLM responses that:
- Contain valid JSON
- Have `predicted_stars` key
- Have integer value in range 1–5

```python
def compute_json_validity_rate(df_with_outputs):
    valid = 0
    for text in df['llm_response']:
        try:
            _parse_llm_json(text)  # Validate schema
            valid += 1
        except: pass
    return valid / len(df)
```

### 3. Reliability & Consistency

Run the same prompts multiple times (3 repeats) and measure identical predictions:

```python
consistency_rate = (# identical across all runs) / total_prompts
```

**Note**: With `temperature=0`, consistency should be ~100%. Lower values indicate model instability or prompt ambiguity.

---

## 📈 Results & Comparison

### Comparison Table

| Strategy | Exact Accuracy | Within ±1 | JSON Validity Rate | Consistency Rate |
|----------|----------------|-----------|---------------|-------------|
| Zero-Shot | 64.50% | 98% | 100% | 100% |
| Few-Shot | 63.50% | 97.50% | 100% | 100% |
| Chain-of-Thought | 64.50% | 98% | 100% | 100% |


## 💬 Discussion: Results & Trade-offs

### Accuracy vs Prompt Complexity

| Strategy | Pros | Cons |
|----------|------|------|
| **Zero-Shot** | Simplest, fastest, lowest token cost | May struggle with middle ratings (2, 3, 4) |
| **Few-Shot** | Highest accuracy via calibration | Longer prompts = more tokens/cost |
| **CoT** | Deeper analysis for nuanced reviews | Slightly more complex prompt |

### JSON Validity Trade-offs
- Stricter prompts improve validity but may occasionally confuse the model
- Fallback parsing (regex) catches edge cases where JSON is malformed
- High validity (~95%+) indicates prompts are well-designed

### When to Use Each Approach

| Scenario | Recommended Strategy |
|----------|---------------------|
| Quick prototyping | Zero-Shot |
| Production accuracy | Few-Shot |
| Ambiguous/nuanced reviews | Chain-of-Thought |
| Token budget constrained | Zero-Shot |
| Balanced cost vs accuracy | Few-Shot (with fewer examples) |

### Limitations
- Accuracy bounded by model capability (8B parameters)
- Subjective reviews may have inherent rating ambiguity
- Few-shot examples are dataset-specific; may not generalize
- Middle ratings (2, 3, 4) are hardest to distinguish

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| API Key Error | Check `.env` file exists with correct `CEREBRAS_API_KEY` |
| Import Error | Run `pip install -r requirements.txt` |
| Rate Limit | Increase `time.sleep()` value in prediction loop |
| No predictions | Check Cerebras API status and quota |
| JSON parse failures | Review `llm_response` column in results CSV |

---

## 📚 References

- [Cerebras Cloud Documentation](https://cloud.cerebras.ai/docs)
- [Yelp Dataset](https://www.kaggle.com/datasets/omkarsabnis/yelp-reviews-dataset)
