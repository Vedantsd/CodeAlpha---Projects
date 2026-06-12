# Lingua — Translator App (Flask + Murf API)

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set your Murf API key as an environment variable:
   ```
   set MURF_API_KEY="api_key"         # Windows
   ```

3. Run the app:
   ```
   python app.py
   ```

4. Open http://127.0.0.1:5000 in your browser.

## Notes

- The translation endpoint is `/api/translate`, called via POST with JSON body:
  ```json
  { "text": "Hello world", "target_locale": "es-ES" }
  ```
- Murf's translation endpoint and response shape may differ slightly by account/version —
  if you get errors, check the response shape returned in `result` (the app prints it
  in the error JSON) and adjust the parsing in `app.py`'s `translate()` function
  (the `translations` / `translated_text` keys) to match.
- Edit the `LANGUAGES` dict in `app.py` to add/remove target languages.