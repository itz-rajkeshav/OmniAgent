import { processMessage } from "./client.js";
import {
  getMessagesForConvo,
  getAgentTone,
  addMessage,
} from "../db/redis/Messages.js";

/**
 * Fetch conversation history and tone from Redis, call agent-core ProcessMessage gRPC,
 * send reply via sock.sendMessage, and save the AI reply to Redis.
 * @param {object} sock - Baileys socket (must have sendMessage)
 * @param {string} userId
 * @param {string} jid
 * @param {string} text - Incoming message text
 * @returns {Promise<string|null>} Reply text if sent, null on error or no reply
 */
export async function handleIncomingMessage(sock, userId, jid, text) {
  if (!sock || !userId || !jid || !text?.trim()) return null;

  try {
    const [history, toneId] = await Promise.all([
      getMessagesForConvo(userId, jid),
      getAgentTone(userId),
    ]);

    const response = await processMessage(
      userId,
      jid,
      text.trim(),
      history,
      toneId || "casual_friendly",
    );

    if (!response.success || !response.reply_text?.trim()) {
      return null;
    }

    const replyText = response.reply_text.trim();

    await sock.sendMessage(jid, { text: replyText });

    await addMessage(userId, jid, {
      jid,
      fromMe: true,
      text: replyText,
      timestamp: Date.now(),
    });

    return replyText;
  } catch (err) {
    console.error(
      `[${userId}] handleIncomingMessage error (jid=${jid}):`,
      err?.message || err,
    );
    return null;
  }
}
