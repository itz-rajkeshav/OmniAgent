import makeWASocket, {
  makeCacheableSignalKeyStore,
  DisconnectReason,
} from "baileys";
import { useMultiFileAuthState } from "baileys";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import P from "pino";
import { syncHistory } from "./historySync.js";
import { messageHandler } from "./message.js";

const logger = P({
  level: "trace",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: { colorize: true },
        level: "trace",
      },
      {
        target: "pino/file",
        options: { destination: "./wa-logs.txt" },
        level: "trace",
      },
    ],
  },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_BASE = path.join(__dirname, "..", "auth_info");

// Session storage: Map<userId, SessionObject>
// SessionObject: { sock, qr, status, initialized }
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
    if (
      existing.status === "connected" ||
      existing.status === "connecting" ||
      existing.status === "qr_ready"
    ) {
      logger.info(
        `[${userId}] Already in state: ${existing.status}, reusing socket`,
      );
      return existing.sock;
    }
    cleanup(userId);
  }

  logger.info(`[${userId}] Creating new WhatsApp connection...`);

  const dir = authDir(userId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(dir);

  // Create socket
  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    logger,
    browser: ["WhatsApp Gateway", "Chrome", "1.0.0"],
    defaultQueryTimeoutMs: undefined,
  });

  sessions.set(userId, {
    sock,
    qr: null,
    status: "connecting",
    initialized: false,
  });

  logger.info(`[${userId}] Session registered, waiting for connection...`);

  sock.ev.process(async (events) => {
    const cur = sessions.get(userId);

    if (!cur || cur.sock !== sock) {
      logger.warn(`[${userId}] Event received for stale socket, ignoring`);
      return;
    }

    if (events["connection.update"]) {
      const { connection, qr, lastDisconnect } = events["connection.update"];

      if (qr) {
        try {
          cur.qr = await QRCode.toDataURL(qr);
          cur.status = "qr_ready";
          logger.info(`[${userId}] ✅ QR Code generated and ready`);
        } catch (error) {
          logger.error(`[${userId}] QR generation error: ${error.message}`);
        }
      }

      // Connection Opened
      if (connection === "open") {
        cur.qr = null;
        cur.status = "connected";
        logger.info(`[${userId}] ✅✅ WhatsApp Connected Successfully!`);

        // ✅ Only attach message handlers ONCE per connection
        if (!cur.initialized) {
          cur.initialized = true;
          logger.info(`[${userId}] Initializing message handlers...`);

          try {
            syncHistory(sock, userId);
            messageHandler(sock, userId);
            logger.info(`[${userId}] Message handlers initialized`);
          } catch (error) {
            logger.error(
              `[${userId}] Handler initialization error: ${error.message}`,
            );
          }
        }
      }

      // Connection Closed
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason =
          lastDisconnect?.error?.output?.payload?.error || "Unknown";
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        logger.warn(
          `[${userId}] ❌ Connection closed. Reason: ${reason}, Code: ${statusCode}, LoggedOut: ${loggedOut}`,
        );

        cleanup(userId);

        if (loggedOut) {
          clearAuth(userId);
          logger.fatal(
            `[${userId}] 🚫 User logged out. Auth cleared. Must re-scan QR.`,
          );
        } else {
          logger.info(`[${userId}] 🔄 Reconnecting in 3 seconds...`);
          setTimeout(() => connectWhatsapp(userId), 3000);
        }
      }
    }

    if (events["creds.update"]) {
      try {
        await saveCreds();
        logger.debug(`[${userId}] Credentials saved`);
      } catch (error) {
        logger.error(
          `[${userId}] Failed to save credentials: ${error.message}`,
        );
      }
    }
  });

  return sock;
}

export function getQRCode(userId) {
  const qr = sessions.get(userId)?.qr ?? null;
  if (qr) {
    logger.debug(`[${userId}] QR code requested`);
  } else {
    logger.debug(`[${userId}] No QR code available`);
  }
  return qr;
}

export function getUserStatus(userId) {
  const status = sessions.get(userId)?.status ?? "disconnected";
  logger.debug(`[${userId}] Status: ${status}`);
  return status;
}

export async function disconnectUser(userId) {
  logger.info(`[${userId}] Disconnecting user...`);

  const s = sessions.get(userId);
  if (s?.sock) {
    try {
      await s.sock.logout();
      logger.info(`[${userId}] Logout successful`);
    } catch (e) {
      logger.warn(`[${userId}] Logout error: ${e.message}`);
    }
  }

  cleanup(userId);
  clearAuth(userId);
  logger.info(`[${userId}] ✅ User disconnected and cleaned up`);
}

export function getAllSessions() {
  const out = {};
  for (const [id, s] of sessions) {
    out[id] = s.status;
  }
  logger.debug(`Active sessions: ${Object.keys(out).length}`);
  return out;
}

export function getSocket(userId) {
  return sessions.get(userId)?.sock ?? null;
}

export function isUserConnected(userId) {
  return sessions.get(userId)?.status === "connected";
}

process.on("SIGINT", async () => {
  logger.info("🛑 Shutting down gracefully...");

  for (const [userId] of sessions) {
    try {
      await disconnectUser(userId);
    } catch (e) {
      logger.error(`Failed to disconnect ${userId}: ${e.message}`);
    }
  }

  logger.info("✅ All sessions closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("🛑 SIGTERM received, shutting down...");

  for (const [userId] of sessions) {
    try {
      await disconnectUser(userId);
    } catch (e) {
      logger.error(`Failed to disconnect ${userId}: ${e.message}`);
    }
  }

  process.exit(0);
});
