import {
  addMessage,
  isJidBlocked,
  saveContactName,
  updateLastActivity,
  normalizeTimestampMs,
} from "../../db/redis/Messages.js";
import { handleIncomingMessage } from "../../messaging/processor.js";
import { getAgentSchedule } from "../grpc/client.js";

const WEEKDAY_TO_INDEX = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

const SCHEDULE_TIMEZONE = "Asia/Kolkata";

function parseHHMMToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isCurrentTimeAllowed(entry, nowMinutes) {
  const startMinutes = parseHHMMToMinutes(entry?.start_time);
  const endMinutes = parseHHMMToMinutes(entry?.end_time);
  if (startMinutes === null || endMinutes === null) return false;

  if (startMinutes === endMinutes) {
    return true; // treat equal boundaries as always-on for that day
  }
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  // Overnight window, e.g., 22:00 -> 06:00
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

async function shouldProcessMessageBySchedule(userId) {
  try {
    const schedule = await getAgentSchedule(userId);
    if (!schedule?.found) return true; // No schedule configured means no restriction.
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: SCHEDULE_TIMEZONE,
      weekday: "long",
    }).format(now);
    const dayIndex = WEEKDAY_TO_INDEX[weekday];
    if (dayIndex === undefined) return true;

    const timeParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: SCHEDULE_TIMEZONE,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(now);
    const hour = Number(timeParts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(
      timeParts.find((p) => p.type === "minute")?.value ?? "0",
    );
    const nowMinutes = hour * 60 + minute;

    const entry = (schedule.entries || []).find(
      (item) => Number(item.day) === dayIndex,
    );
    if (!entry || !entry.is_enabled) return false;

    return isCurrentTimeAllowed(entry, nowMinutes);
  } catch (err) {
    console.error(
      `[${userId}] schedule check failed, allowing message:`,
      err?.message || err,
    );
    return true;
  }
}

export function messageHandler(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify") {
      for (const msg of messages) {
        if (!msg?.key) continue;

        const jid = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const timestamp = normalizeTimestampMs(msg.messageTimestamp);

        if (jid === "status@broadcast") {
          continue;
        }

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

        addMessage(userId, jid, messageObj)
          .then(() => {
            if (!fromMe) {
              shouldProcessMessageBySchedule(userId)
                .then((allowed) => {
                  if (!allowed) return;
                  handleIncomingMessage(sock, userId, jid, text).catch((err) =>
                    console.error(
                      `[${userId}] Agent reply error (jid=${jid}):`,
                      err?.message || err,
                    ),
                  );
                })
                .catch((err) =>
                  console.error(
                    `[${userId}] schedule guard error (jid=${jid}):`,
                    err?.message || err,
                  ),
                );
            }
          })
          .catch((err) =>
            console.error(`[${userId}] Redis save message:`, err.message),
          );
      }
    }
  });
}
