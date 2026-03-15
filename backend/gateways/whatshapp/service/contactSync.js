import pino from "pino";
import { upsertContacts } from "../../db/redis/Messages.js";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export function syncContacts(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on("contacts.upsert", async (contacts) => {
    logger.info({ userId, count: contacts.length }, "contacts.upsert received");

    try {
      await upsertContacts(userId, contacts);
      logger.info(
        { userId, count: contacts.length },
        "Contacts saved to Redis",
      );
    } catch (err) {
      logger.warn({ userId, err: err.message }, "Failed to save contacts");
    }
  });

  sock.ev.on("contacts.update", async (updates) => {
    if (!Array.isArray(updates) || updates.length === 0) return;

    logger.info({ userId, count: updates.length }, "contacts.update received");

    try {
      await upsertContacts(userId, updates);
      logger.info(
        { userId, count: updates.length },
        "Contact updates saved to Redis",
      );
    } catch (err) {
      logger.warn(
        { userId, err: err.message },
        "Failed to save contact updates",
      );
    }
  });
}
