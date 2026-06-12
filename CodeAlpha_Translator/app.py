import os
import requests
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify

load_dotenv()

app = Flask(__name__)

MURF_API_KEY = os.environ.get("MURF_API_KEY")
MURF_TRANSLATE_URL = "https://api.murf.ai/v1/text/translate"

LANGUAGES = {
    "en-US": "English (US)",
    "es-ES": "Spanish (Spain)",
    "fr-FR": "French",
    "de-DE": "German",
    "it-IT": "Italian",
    "pt-BR": "Portuguese (Brazil)",
    "hi-IN": "Hindi",
    "ja-JP": "Japanese",
    "ko-KR": "Korean",
    "zh-CN": "Chinese (Simplified)",
    "nl-NL": "Dutch",
    "pl-PL": "Polish",
    "ru-RU": "Russian",
    "ta-IN": "Tamil",
    "tr-TR": "Turkish",
}


@app.route("/")
def index():
    return render_template("index.html", languages=LANGUAGES)


@app.route("/api/translate", methods=["POST"])
def translate():
    data = request.get_json(force=True)
    text = data.get("text", "").strip()
    target_locale = data.get("target_locale", "")

    if not text:
        return jsonify({"error": "Text to translate is required."}), 400
    if not target_locale:
        return jsonify({"error": "Target language is required."}), 400

    headers = {
        "Content-Type": "application/json",
        "api-key": MURF_API_KEY,
    }
    payload = {
        "targetLanguage": target_locale,
        "texts": [text],
    }

    try:
        resp = requests.post(MURF_TRANSLATE_URL, json=payload, headers=headers, timeout=20)
        resp.raise_for_status()
        result = resp.json()

        translated_text = ""
        translations = result.get("translations") or result.get("data") or []
        if translations and isinstance(translations, list):
            first = translations[0]
            translated_text = first.get("translated_text") or first.get("translatedText") or ""

        if not translated_text:
            return jsonify({"error": "No translation returned by Murf API.", "raw": result}), 502

        return jsonify({"translated_text": translated_text})

    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"Murf API error: {e.response.text}"}), 502
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)