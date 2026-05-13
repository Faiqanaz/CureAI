from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import get_response

app = Flask(__name__)
CORS(app)

# ─── Home Route ───
@app.route("/", methods=["GET"])
def home():
    return "CureAI backend is running"


# ─── Chat Route (ONLY ONE) ───
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    messages = data.get("messages", [])

    user_input = messages[-1]["content"]
    reply = get_response(user_input)

    return jsonify({
        "reply": reply
    })


# ─── Run server ───
if __name__ == "__main__":
    app.run(debug=True, port=5000)