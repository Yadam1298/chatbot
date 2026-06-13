import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load the .env file from the same directory as this script
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Debug info
print("===========================================")
print("🔍 Checking .env file loading status")
print("Looking for .env file at:", env_path)

# Try to fetch HF_TOKEN
HF_TOKEN = os.getenv("HF_TOKEN")

if HF_TOKEN:
    print("✅ HF_TOKEN successfully loaded!")
    print("Token preview:", HF_TOKEN[:15] + "..." + HF_TOKEN[-5:])  # Hide most of the token for safety
else:
    print("❌ HF_TOKEN not found in .env or environment variables.")
    print("Possible issues:")
    print(" - The .env file is not in the same folder as this script.")
    print(" - The .env file does not contain `HF_TOKEN=...` line.")
    print(" - You ran the script from a different working directory.")
print("===========================================")
