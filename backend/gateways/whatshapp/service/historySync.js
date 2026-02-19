import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export function syncHistory(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on("messaging-history.set", ({ messages, isLatest }) => {
    logger.info(
      { userId, event: "messaging-history.set" },
      "History sync started",
    );

    if (!Array.isArray(messages)) return;

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

      logger.info(
        { userId, jid, fromMe, text, timestamp },
        "New message from history",
      );
    }

    if (isLatest !== undefined) {
      logger.info({ userId, isLatest }, `History sync completed`);
    }
  });
}
