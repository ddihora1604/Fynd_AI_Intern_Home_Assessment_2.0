# Fynd AI Intern - Take Home Assessment

## 📁 Directory Structure
```
Fynd Task/
├── README.md                        # This file
├── requirements.txt                 # Python dependencies
├── .env                             # Your API key (create this)
├── .env.example                     # Template for .env file
│
└── task1_rating_prediction/
    ├── task1_notebook.ipynb         # Main notebook
    ├── sample_yelp_data.py          # Script to sample 200 rows
    │
    ├── prompts/
    │   ├── zero_shot.txt            # Zero-shot prompt template
    │   ├── few_shot.txt             # Few-shot prompt template
    │   └── chain_of_thought.txt     # Chain-of-thought prompt template
    │
    ├── data/
    │   ├── yelp.csv                 # Original dataset
    │   ├── eval_sample.csv          # 200-row sample (generated)
    │   └── dataset_info.txt         # Dataset documentation
    │
    ├── results/
    │   ├── zero_shot_predictions.csv
    │   ├── few_shot_predictions.csv
    │   └── chain_of_thought_predictions.csv
    │
    └── figures/
        ├── confusion_zero_shot.png
        ├── confusion_few_shot.png
        ├── confusion_chain_of_thought.png
        └── strategy_comparison.png
```

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```powershell
pip install -r requirements.txt
```

This installs:
- `pandas` - Data manipulation
- `scikit-learn` - Evaluation metrics
- `matplotlib` & `seaborn` - Visualizations
- `python-dotenv` - Environment variable management
- `cerebras_cloud_sdk` - Cerebras API client

### Step 2: Get Cerebras API Key
1. Go to https://cloud.cerebras.ai/
2. Sign up / Log in
3. Generate an API key
4. Copy the API key

### Step 3: Create .env File
Create a file named `.env` in the root directory (`Fynd Task/`):
```powershell
Copy-Item .env.example .env
```

Then edit `.env` and add your API key:
```
CEREBRAS_API_KEY=your_actual_api_key_here
```

### Step 4: Generate Sample Dataset
Navigate to the task folder and run the sampling script:
```powershell
cd task1_rating_prediction
python sample_yelp_data.py
```

This creates `data/eval_sample.csv` (200 rows) from `data/yelp.csv`.

### Step 5: Run the Notebook
1. Open `task1_notebook.ipynb` in VS Code or Jupyter
2. Select Python kernel
3. Run all cells sequentially

**Note**: The notebook processes 50 reviews by default for testing. To run on all 200 rows:
- In cell 7, change `test_df = df.head(50).copy()` to `test_df = df.copy()`

## 📊 What the Code Does

### 3 Prompting Techniques:

1. **Zero-shot**: Direct prediction without examples
2. **Few-shot**: Provides multiple examples (ratings 1, 3, 5) before prediction
3. **Chain-of-Thought**: Asks model to reason step-by-step

### Prompt Templates:
All prompts are stored as reusable templates in `prompts/` directory and loaded at runtime.

### Outputs Generated:

**Results (CSV files in `results/`):**
- `zero_shot_predictions.csv` - Predictions with LLM responses
- `few_shot_predictions.csv` - Predictions with LLM responses
- `chain_of_thought_predictions.csv` - Predictions with LLM responses

**Figures (PNG files in `figures/`):**
- `confusion_zero_shot.png` - Confusion matrix for zero-shot
- `confusion_few_shot.png` - Confusion matrix for few-shot
- `confusion_chain_of_thought.png` - Confusion matrix for chain-of-thought
- `strategy_comparison.png` - Side-by-side accuracy comparison

### Evaluation Metrics:
- Exact match accuracy (predicted rating = actual rating)
- Within ±1 star accuracy
- Classification report (precision, recall, F1)
- Confusion matrices for each strategy

## ⚙️ Configuration

### Model
Default: `llama3.1-8b`

To change model, edit the `get_rating_prediction()` function:
```python
def get_rating_prediction(prompt, model="llama3.1-70b"):  # Change here
```

### Rate Limiting
Default: 0.1 second delay between API calls

Adjust in cell 7:
```python
time.sleep(0.1)  # Increase if hitting rate limits
```

## 💡 Tips

- Start with 50 reviews to test setup (faster, cheaper)
- Monitor API usage/costs before running full 200 rows
- Temperature is set to 0.0 for consistent results
- All results auto-save to `results/` and `figures/` directories
- Prompt templates in `prompts/` can be customized for experimentation

## 🔧 Troubleshooting

**API Key Error**: Check `.env` file exists and has correct key format
**Import Error**: Run `pip install -r requirements.txt` again
**Rate Limit**: Increase `time.sleep()` value in prediction loop
**No predictions**: Check Cerebras API status and quota

## 📝 Expected Runtime

- 50 reviews: ~5-10 minutes (3 strategies × 50 reviews × 0.1s delay)
- 200 reviews: ~20-40 minutes (3 strategies × 200 reviews × 0.1s delay)

Times vary based on API response speed and rate limits.
