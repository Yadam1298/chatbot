import os
import requests
from dotenv import load_dotenv
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Initialization ---

# Explicitly load the .env file from the same directory as this script
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Hugging Face API details
API_URL = "https://router.huggingface.co/v1/chat/completions"

# Load the HF token from .env
HF_TOKEN = os.getenv("HF_TOKEN")
if HF_TOKEN:
    print("✅ Loaded HF_TOKEN from .env")
else:
    raise ValueError("❌ HF_TOKEN not found in environment variables or .env file")

# Setup authorization headers
headers = {"Authorization": f"Bearer {HF_TOKEN}"}


def query(payload):
    """
    Function to query the Hugging Face API.
    """
    response = requests.post(API_URL, headers=headers, json=payload)
    
    # Debugging info if something goes wrong
    if response.status_code != 200:
        print(f"HF API returned status {response.status_code}. Response text: {response.text[:200]}")
    
    return response.json()


# --- Flask App Setup ---

app = Flask(__name__)
# Allow CORS from React frontend (localhost:3000)
CORS(app, resources={r"/chat": {"origins": "http://localhost:3000"}})


@app.route('/chat', methods=['POST'])
def chat_handler():
    data = request.json
    user_content = data.get('content')

    if not user_content:
        return jsonify({"error": "No 'content' provided in JSON body"}), 400

    # Example model payload
    payload = {
        "model": "Qwen/Qwen2.5-Coder-32B-Instruct:nscale",
        "messages": [
            {"role": "user", "content": user_content}
        ]
    }

    try:
        response = query(payload)
    except requests.exceptions.JSONDecodeError as e:
        return jsonify({
            "error": "Upstream API returned a non-JSON response (e.g., Auth Error or Bad URL). Check server console.",
            "details": str(e)
        }), 502

    if "choices" in response and len(response["choices"]) > 0:
        ai_response = response["choices"][0]["message"]["content"]
        return jsonify({"response": ai_response})
    else:
        print("Error from HF API (JSON body was present but contained no choices):", response)
        return jsonify({"error": "Model response was valid JSON but empty", "details": response}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5500)
