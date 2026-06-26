from flask import Flask, render_template, request, jsonify
from chatbot import FAQChatbot

app = Flask(__name__)
chatbot = FAQChatbot()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    result = chatbot.get_response(user_message)
    return jsonify(result)

@app.route("/api/faqs", methods=["GET"])
def get_faqs():
    return jsonify({"faqs": chatbot.get_all_faqs()})

if __name__ == "__main__":
    app.run(debug=True)
