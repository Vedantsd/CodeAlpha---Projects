# FAQ Chatbot

A Python Flask web application that matches user questions to the most relevant FAQ using NLP techniques — tokenization, lemmatization, TF-IDF weighting, cosine similarity, and Jaccard keyword overlap.

---

## Features

- **NLP preprocessing** via NLTK — tokenize, stop-word removal, lemmatization
- **Cosine similarity** (TF-IDF vectors) + **Jaccard overlap** for robust matching
- **Confidence badges** — High / Medium / Low displayed on each bot response
- **Sidebar FAQ browser** with live search/filter
- **Auto-growing textarea** and Enter-to-send
- Fully responsive dark UI

---

## Project Structure

```
faq-chatbot/
├── app.py              # Flask routes
├── chatbot.py          # NLP engine (preprocessing + matching)
├── faq_data.py         # FAQ question-answer database
├── requirements.txt
├── README.md
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── chat.js
└── templates/
    └── index.html
```

---

## Setup & Run

### 1. Clone / download the project

```bash
git clone <repo-url>
cd faq-chatbot
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the app

```bash
python app.py
```

Open your browser at **http://127.0.0.1:5000**

---

## How It Works

| Step | Detail |
|------|--------|
| **Input** | User types a question in the chat |
| **Preprocess** | Lowercase → strip punctuation → tokenize → remove stop words → lemmatize (NLTK) |
| **Score** | Cosine similarity (70 %) + Jaccard overlap (30 %) against every FAQ |
| **Threshold** | ≥ 0.15 → confident match; 0.05–0.15 → low-confidence suggestion; < 0.05 → no match |
| **Response** | Best-matching answer returned with a confidence badge |

---

## Customising the FAQ Database

Edit `faq_data.py` and add entries to the `FAQ_DATA` list:

```python
{
    "question": "Your question here?",
    "answer": "Your detailed answer here."
},
```

No retraining needed — the system scores on the fly.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `flask` | Web framework |
| `nltk`  | Tokenization, stop words, lemmatization |

NLTK corpora (`punkt`, `stopwords`, `wordnet`) are downloaded automatically on first run.
