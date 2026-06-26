import re
import math
from collections import Counter

import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from faq_data import FAQ_DATA

for pkg in ["punkt", "stopwords", "wordnet", "omw-1.4", "punkt_tab"]:
    try:
        nltk.data.find(f"tokenizers/{pkg}")
    except LookupError:
        nltk.download(pkg, quiet=True)


class FAQChatbot:
    def __init__(self):
        self.faqs = FAQ_DATA
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words("english"))
        self.stop_words -= {"what", "how", "when", "where", "why", "who", "which"}
        self.processed_questions = [
            self._preprocess(faq["question"]) for faq in self.faqs
        ]

    def _preprocess(self, text: str) -> list[str]:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", "", text)
        tokens = word_tokenize(text)
        tokens = [
            self.lemmatizer.lemmatize(t)
            for t in tokens
            if t not in self.stop_words and len(t) > 1
        ]
        return tokens

    def _term_frequency(self, tokens: list[str]) -> dict[str, float]:
        count = Counter(tokens)
        total = len(tokens) if tokens else 1
        return {term: freq / total for term, freq in count.items()}

    def _cosine_similarity(
        self, tokens_a: list[str], tokens_b: list[str]
    ) -> float:
        tf_a = self._term_frequency(tokens_a)
        tf_b = self._term_frequency(tokens_b)

        vocab = set(tf_a) | set(tf_b)
        dot = sum(tf_a.get(t, 0) * tf_b.get(t, 0) for t in vocab)
        mag_a = math.sqrt(sum(v ** 2 for v in tf_a.values()))
        mag_b = math.sqrt(sum(v ** 2 for v in tf_b.values()))

        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

  
    def _keyword_overlap(
        self, user_tokens: list[str], faq_tokens: list[str]
    ) -> float:
        user_set = set(user_tokens)
        faq_set = set(faq_tokens)
        if not user_set or not faq_set:
            return 0.0
        overlap = user_set & faq_set
        return len(overlap) / len(user_set | faq_set)  # Jaccard


    def get_response(self, user_message: str) -> dict:
        user_tokens = self._preprocess(user_message)

        scores = []
        for idx, faq_tokens in enumerate(self.processed_questions):
            cosine = self._cosine_similarity(user_tokens, faq_tokens)
            jaccard = self._keyword_overlap(user_tokens, faq_tokens)
            combined = 0.7 * cosine + 0.3 * jaccard
            scores.append(combined)

        best_idx = max(range(len(scores)), key=lambda i: scores[i])
        best_score = scores[best_idx]

        CONFIDENT = 0.15
        LOW_CONF = 0.05

        if best_score >= CONFIDENT:
            confidence = "high" if best_score >= 0.3 else "medium"
            return {
                "answer": self.faqs[best_idx]["answer"],
                "matched_question": self.faqs[best_idx]["question"],
                "confidence": confidence,
                "score": round(best_score, 4),
                "found": True,
            }
        elif best_score >= LOW_CONF:
            return {
                "answer": (
                    f"I found a possibly related topic: "
                    f"**{self.faqs[best_idx]['question']}**\n\n"
                    f"{self.faqs[best_idx]['answer']}"
                ),
                "matched_question": self.faqs[best_idx]["question"],
                "confidence": "low",
                "score": round(best_score, 4),
                "found": True,
            }
        else:
            return {
                "answer": (
                    "I couldn't find a good match for your question. "
                    "Try rephrasing, or browse the FAQ list on the left. "
                    "You can also contact support at support@example.com."
                ),
                "matched_question": None,
                "confidence": "none",
                "score": round(best_score, 4),
                "found": False,
            }

    def get_all_faqs(self) -> list[dict]:
        return [
            {"question": faq["question"], "answer": faq["answer"]}
            for faq in self.faqs
        ]
