import { addMessage, isJidBlocked } from "../../db/redis/Messages.js";

export function messageHandler(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    // "notify" = new messages after WhatsApp connect (casual/live messages)
    if (type === "notify") {
      for (const msg of messages) {
        if (!msg?.key) continue;

        const jid = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const timestamp = msg.messageTimestamp;

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
