import pino from "pino";
import {
  addMessage,
  isJidBlocked,
  saveContactName,
  bulkUpdateLastActivity,
  normalizeTimestampMs,
} from "../../db/redis/Messages.js";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export function syncHistory(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on(
    "messaging-history.set",
    async ({ chats, messages, isLatest }) => {
      logger.info(
        { userId, event: "messaging-history.set" },
        "History sync started",
      );

      if (Array.isArray(chats) && chats.length > 0) {
        const entries = chats
          .filter((c) => c.id && c.conversationTimestamp)
          .map((c) => ({ jid: c.id, timestamp: c.conversationTimestamp }));
        if (entries.length > 0) {
          bulkUpdateLastActivity(userId, entries).catch((err) =>
            logger.warn(
              { userId, err: err.message },
              "Failed to bulk-update last activity from chats",
            ),
          );
          logger.info(
            { userId, count: entries.length },
            "Chat last-activity timestamps queued",
          );
        }
      }

      if (!Array.isArray(messages)) return;

      for (const msg of messages) {
        if (!msg?.key) continue;

        const jid = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const timestamp = normalizeTimestampMs(msg.messageTimestamp);

        if (msg.pushName && jid && !fromMe) {
          saveContactName(userId, jid, msg.pushName).catch(() => {});
        }

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          null;

        if (!text) continue;

        if (await isJidBlocked(userId, jid)) continue;

        const messageObj = { jid, fromMe, text, timestamp };
        try {
          await addMessage(userId, jid, messageObj, "history");
        } catch (err) {
          logger.warn(
            { userId, jid, err: err.message },
            "Failed to store history message",
          );
        }
      }

      if (isLatest !== undefined) {
        logger.info({ userId, isLatest }, "History sync completed");
      }
    },
  );
}
