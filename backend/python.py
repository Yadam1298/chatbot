import os
import requests
from dotenv import load_dotenv

load_dotenv()  # ✅ Loads variables from .env file

API_URL = "https://router.huggingface.co/v1/chat/completions"
HF_TOKEN = os.getenv("HF_TOKEN")  # ✅ Safe access
if not HF_TOKEN:
    raise ValueError("❌ HF_TOKEN not found in environment variables or .env file")

headers = {"Authorization": f"Bearer {HF_TOKEN}"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

response = query({
    "model": "meta-llama/Llama-3.2-1B-Instruct",
    "messages": [
        {"role": "user", "content": "What is the capital of France?"}
    ]
})

if "choices" in response:
    print(response["choices"][0]["message"]["content"])
else:
    print("Error:", response)
