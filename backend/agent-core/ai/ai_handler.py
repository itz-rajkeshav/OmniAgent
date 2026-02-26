import asyncio
import os
from groq import Groq

Groq_Apikey=os.getenv("GROK_APIKEY")

async def call_groq(prompt:str, max_retries:int=3)->str:
    
    if not Groq_Apikey:
        return {
            "status":"error",
            "message":"Groq API KEY is not set "
        }
    client = Groq(api_key = Groq_Apikey)

# run in execute.. basically say to process this into the other thread
# .get_event_loop basically tell to run inside the event loop

    for attempt in range(max_retries):
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model = "llama-3.1-8b-instant",
                    messages=[{"role":"user","content":prompt}],
                    temperature=0.1,
                    max_tokens=500,
                    timeout=30
                )
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