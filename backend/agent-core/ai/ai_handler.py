import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

from ai.tones import get_tone_prompt

_env_dir = Path(__file__).resolve().parent.parent
load_dotenv(_env_dir / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"
REQUEST_TIMEOUT = 60


def _build_messages(user_content: str, tone_id: str | None = None):
    messages = []
    if tone_id:
        system_prompt = get_tone_prompt(tone_id)
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_content})
    return messages


async def call_groq(
    prompt: str,
    max_retries: int = 3,
    tone_id: str | None = None,
) -> str:
    if not GROQ_API_KEY:
        return {
            "status": "error",
            "message": "AI service configuration error. Set GROQ_API_KEY in your .env.",
        }

    client = Groq(api_key=GROQ_API_KEY)
    messages = _build_messages(prompt, tone_id)

    for attempt in range(max_retries):
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda c=client, m=messages: c.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=m,
                    temperature=0.9,
                    max_tokens=500,
                    timeout=REQUEST_TIMEOUT,
                ),
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            error_msg = str(e).lower()
            if "rate_limit" in error_msg:
                if attempt < max_retries - 1:
                    await asyncio.sleep(2**attempt)
                    continue
                return "Service is busy. Please try again in a moment."
            if "api_key" in error_msg or "unauthorized" in error_msg:
                return "AI service configuration error. Check GROQ_API_KEY in .env."
            if attempt == max_retries - 1:
                return "Sorry, I'm having trouble processing your request right now."
    return "Unable to generate response after retries."
