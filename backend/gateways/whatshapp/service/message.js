import {
  addMessage,
  isJidBlocked,
  saveContactName,
  updateLastActivity,
  normalizeTimestampMs,
} from "../../db/redis/Messages.js";

export function messageHandler(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify") {
      for (const msg of messages) {
        if (!msg?.key) continue;

        const jid = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const timestamp = normalizeTimestampMs(msg.messageTimestamp);

        if (msg.pushName && jid && !fromMe) {
          saveContactName(userId, jid, msg.pushName).catch(() => {});
        }

        if (jid && timestamp > 0) {
          updateLastActivity(userId, jid, timestamp).catch(() => {});
        }

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          null;

        if (!text) continue;

        if (await isJidBlocked(userId, jid)) continue;

        const messageObj = { jid, fromMe, text, timestamp };
        console.log(`[${userId}] MESSAGE:`, messageObj);

        addMessage(userId, jid, messageObj).catch((err) =>
          console.error(`[${userId}] Redis save message:`, err.message),
        );
      }
    }
  });
}
