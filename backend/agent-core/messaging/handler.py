"""
Orchestrate knowledge retrieval, prompt building (history + knowledge + incoming message), and call_groq.
"""
import asyncio
import logging
from typing import Sequence

from ai.ai_handler import call_groq
from ai.tones import is_valid_tone
from messaging.knowledge import search_knowledge

logger = logging.getLogger(__name__)


def _format_history(history: Sequence[tuple[str, bool, int]]) -> str:
    """Format list of (text, from_me, timestamp) as [You]: / [Contact]: lines."""
    lines = []
    for text, from_me, _ in history:
        text = (text or "").strip()
        if not text:
            continue
        prefix = "[You]: " if from_me else "[Contact]: "
        lines.append(prefix + text)
    return "\n".join(lines) if lines else "(No prior messages)"


async def process_message(
    user_id: str,
    jid: str,
    incoming_text: str,
    conversation_history: Sequence[tuple[str, bool, int]],
    tone_id: str | None,
) -> tuple[bool, str]:
    """
    Run the full pipeline: knowledge search, prompt build, Groq call.
    Returns (success, reply_text_or_error).
    """
    tone_id = (tone_id or "").strip() or "casual_friendly"
    if not is_valid_tone(tone_id):
        tone_id = "casual_friendly"

    knowledge_chunks = search_knowledge(user_id, incoming_text, top_k=5)
    history_block = _format_history(conversation_history)

    user_content_parts = [
        "Conversation so far:",
        history_block,
        "",
    ]
    if knowledge_chunks:
        user_content_parts.append("Relevant knowledge from your documents:")
        user_content_parts.append("\n\n".join(knowledge_chunks))
        user_content_parts.append("")
    user_content_parts.append(
        "Reply as the user's proxy to the LATEST [Contact] message above. Rules:\n"
        "- Match the language and script the contact is using (e.g. if they write in Hindi/Hinglish, reply in the same).\n"
        "- Do NOT repeat or rephrase your previous replies. Each response must be fresh and directly address what the contact just said.\n"
        "- Keep it concise, natural, and human — like a real chat reply, not a paragraph.\n"
        "- If the contact sounds upset, worried, or emotional, respond with appropriate care and concern.\n"
        "- Output ONLY the reply text, nothing else."
    )

    user_content = "\n".join(user_content_parts)

    try:
        result = await call_groq(user_content, tone_id=tone_id)
        if isinstance(result, dict):
            err = result.get("message", "AI service error.")
            return False, err
        return True, (result or "").strip()
    except Exception as e:
        logger.exception("process_message failed: %s", e)
        return False, "Sorry, I couldn't generate a reply right now."
