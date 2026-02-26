import asyncio
import os
from groq import Groq

from ai.tones import get_tone_prompt

Groq_Apikey = os.getenv("GROK_APIKEY")


def _build_messages(user_content: str, tone_id: str | None = None):
    """Build messages list: optional system from tone, then user content."""
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
    if not Groq_Apikey:
        return {
            "status": "error",
            "message": "Groq API KEY is not set ",
        }
    client = Groq(api_key=Groq_Apikey)
    messages = _build_messages(prompt, tone_id)

    for attempt in range(max_retries):
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=messages,
                    temperature=0.1,
                    max_tokens=500,
                    timeout=30,
                ),
            )
            return response.choices[0].message.content

        except Exception as e:
            error_msg = str(e).lower()
            
            if "rate_limit" in error_msg:
                if attempt < max_retries:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return "Service is busy. Please try again in a moment."
                
            elif "api_key" in error_msg or "unauthorized" in error_msg:
                return "AI service configuration error."
                
            else:
                print(f"Groq error (attempt {attempt+1}): {e}")
                if attempt == max_retries:
                    return "Sorry, I'm having trouble processing your request right now."

    return "Unable to generate response after retries."