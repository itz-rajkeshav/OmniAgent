import makeWASocket, {
  makeCacheableSignalKeyStore,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { useMultiFileAuthState } from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import P from "pino";
import { syncHistory } from "./historySync.js";
import { messageHandler } from "./message.js";
import {
  saveAccount,
  updateAccountStatus,
  getAccount,
} from "../grpc/client.js";

const LOG_LEVEL = process.env.WA_LOG_LEVEL || "info";

const logger = P({
  level: LOG_LEVEL,
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: { colorize: true },
        level: LOG_LEVEL,
      },
      {
        target: "pino/file",
        options: { destination: "./wa-logs.txt" },
        level: LOG_LEVEL,
      },
    ],
  },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_BASE = path.join(__dirname, "..", "auth_info");

const sessions = new Map();

function authDir(userId) {
  return path.join(AUTH_BASE, `user_${userId}`);
}

function cleanup(userId) {
  const s = sessions.get(userId);
  if (s?.sock) {
    try {
      s.sock.ev.removeAllListeners();
      s.sock.end(undefined);
      logger.info(`[${userId}] Socket cleaned up`);
    } catch (e) {
      logger.warn(`[${userId}] Cleanup error: ${e.message}`);
    }
  }
  sessions.delete(userId);
}

function clearAuth(userId) {
  const dir = authDir(userId);
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      logger.info(`[${userId}] Auth files cleared`);
    }
  } catch (e) {
    logger.warn(`[${userId}] clearAuth error: ${e.message}`);
  }
}

export async function connectWhatsapp(userId) {
  if (!userId) throw new Error("userId is required");

  const existing = sessions.get(userId);
  if (existing) {
    if (["connected", "connecting", "qr_ready"].includes(existing.status)) {
      logger.info(
        `[${userId}] Reusing existing session (status: ${existing.status})`,
      );
      return existing.sock;
    }
    logger.info(`[${userId}] Cleaning up stale session...`);
    cleanup(userId);
  }

  try {
    const accountInfo = await getAccount(userId);
    if (accountInfo?.status === "active") {
      const current = sessions.get(userId);
      if (current?.status === "connected") {
        logger.info(
          `[${userId}] Account already active in DB and socket is connected — skipping duplicate connection`,
        );
        return current.sock;
      }
      logger.info(
        `[${userId}] Account found in DB (status: active) but no live socket — reconnecting...`,
      );
    }
  } catch (err) {
    logger.debug(`[${userId}] getAccount check skipped: ${err.message}`);
  }

  logger.info(`[${userId}] Creating new WhatsApp connection...`);

  const dir = authDir(userId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(dir);

  const sessionUserId = userId;

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    logger,
    browser: ["Omni Agent", "Chrome", "1.0.0"],
    defaultQueryTimeoutMs: undefined,
  });

  sessions.set(sessionUserId, {
    sock,
    qr: null,
    status: "connecting",
    initialized: false,
    qrTimestamp: null,
  });

  logger.info(`[${sessionUserId}] Session registered`);

  sock.ev.on("connection.update", async (update) => {
    const session = sessions.get(sessionUserId);
    if (!session || session.sock !== sock) {
      logger.warn(`[${sessionUserId}] Ignoring stale connection.update event`);
      return;
    }

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrDataUrl = await QRCode.toDataURL(qr);
        session.qr = qrDataUrl;
        session.status = "qr_ready";
        session.qrTimestamp = Date.now();
        logger.info(
          `[${sessionUserId}] ✅ QR code generated (expires in ~20s)`,
        );
      } catch (error) {
        logger.error(
          `[${sessionUserId}] QR generation failed: ${error.message}`,
        );
      }
      return;
    }

    if (connection === "open") {
      session.qr = null;
      session.status = "connected";
      session.qrTimestamp = null;
      logger.info(`[${sessionUserId}] ✅✅ WhatsApp CONNECTED!`);

      try {
        const jid = sock.user.id;
        const phoneNumber = jid.split(":")[0].split("@")[0];
        const result = await saveAccount(sessionUserId, phoneNumber, jid);
        logger.info(`[${sessionUserId}] gRPC SaveAccount: ${result.message}`);
      } catch (err) {
        logger.error(
          `[${sessionUserId}] gRPC SaveAccount failed: ${err.message}`,
        );
      }

      if (!session.initialized) {
        session.initialized = true;
        logger.info(`[${sessionUserId}] Initializing message handlers...`);
        try {
          syncHistory(sock, sessionUserId);
          messageHandler(sock, sessionUserId);
          logger.info(`[${sessionUserId}] Handlers initialized`);
        } catch (error) {
          logger.error(
            `[${sessionUserId}] Handler init failed: ${error.message}`,
          );
        }
      }
      return;
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.output?.payload?.error || "Unknown";
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      logger.warn(
        `[${sessionUserId}] ❌ Disconnected (reason: ${reason}, code: ${statusCode})`,
      );

      cleanup(sessionUserId);

      if (loggedOut) {
        clearAuth(sessionUserId);
        logger.fatal(
          `[${sessionUserId}] 🚫 Logged out - auth cleared. Requires re-scan.`,
        );
        // ── gRPC: mark account inactive in agent-core ────────
        updateAccountStatus(sessionUserId, "inactive")
          .then((r) =>
            logger.info(`[${sessionUserId}] gRPC UpdateStatus: ${r.message}`),
          )
          .catch((err) =>
            logger.error(
              `[${sessionUserId}] gRPC UpdateStatus failed: ${err.message}`,
            ),
          );
      } else {
        logger.info(`[${sessionUserId}] 🔄 Reconnecting in 3s...`);
        setTimeout(() => connectWhatsapp(sessionUserId), 3000);
      }
    }
  });

  sock.ev.on("creds.update", async () => {
    try {
      await saveCreds();
      logger.debug(`[${sessionUserId}] Credentials saved`);
    } catch (error) {
      logger.error(`[${sessionUserId}] Failed to save creds: ${error.message}`);
    }
  });

  setInterval(() => {
    const session = sessions.get(sessionUserId);
    if (session?.status === "qr_ready" && session.qrTimestamp) {
      const age = Date.now() - session.qrTimestamp;
      if (age > 18000) {
        // QR expires after ~20s, refresh hint
        logger.debug(
          `[${sessionUserId}] QR is ${Math.round(age / 1000)}s old - frontend should refresh`,
        );
      }
    }
  }, 5000);

  return sock;
}

export function getQRCode(userId) {
  const session = sessions.get(userId);
  if (!session || session.status !== "qr_ready") {
    logger.debug(
      `[${userId}] No valid QR available (status: ${session?.status || "none"})`,
    );
    return null;
  }
  logger.debug(`[${userId}] Returning QR code`);
  return session.qr;
}

export function getUserStatus(userId) {
  return sessions.get(userId)?.status || "disconnected";
}

export async function disconnectUser(userId) {
  logger.info(`[${userId}] Disconnecting...`);
  const session = sessions.get(userId);
  if (session?.sock) {
    try {
      await session.sock.logout();
      logger.info(`[${userId}] Logout successful`);
    } catch (e) {
      logger.warn(`[${userId}] Logout error: ${e.message}`);
    }
  }
  cleanup(userId);
  clearAuth(userId);
  logger.info(`[${userId}] ✅ Disconnected and cleaned up`);
}

export function getAllSessions() {
  const result = {};
  for (const [id, session] of sessions) {
    result[id] = session.status;
  }
  return result;
}

export function getSocket(userId) {
  return sessions.get(userId)?.sock || null;
}

export function isUserConnected(userId) {
  return sessions.get(userId)?.status === "connected";
}

async function shutdown() {
  logger.info("🛑 Shutting down WhatsApp sessions...");
  const userIds = Array.from(sessions.keys());
  for (const userId of userIds) {
    await disconnectUser(userId).catch((e) =>
      logger.error(`Failed to disconnect ${userId}: ${e.message}`),
    );
  }
  logger.info("✅ All sessions closed");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
