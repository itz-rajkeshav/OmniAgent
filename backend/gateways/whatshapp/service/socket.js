import makeWASocket from "baileys";
import { useMultiFileAuthState } from "baileys/lib/Utils/use-multi-file-auth-state.js";
import { DisconnectReason } from "baileys/lib/Types/index.js";
import pino from "pino";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { syncHistory } from "./historySync.js";

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
    } catch (e) {
      console.warn(`[${userId}] cleanup:`, e.message);
    }
  }
  sessions.delete(userId);
}

function clearAuth(userId) {
  const dir = authDir(userId);
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`[${userId}] Auth cleared`);
    }
  } catch (e) {
    console.warn(`[${userId}] clearAuth:`, e.message);
  }
}

export async function connectWhatsapp(userId) {
  if (!userId) throw new Error("userId is required");

  const existing = sessions.get(userId);
  if (existing) {
    if (existing.status === "connected") {
      return existing.sock;
    }
    if (existing.status === "connecting" || existing.status === "qr_ready") {
      return existing.sock;
    }
    cleanup(userId);
    clearAuth(userId);
  }

  const dir = authDir(userId);
  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  const session = { sock, qr: null, status: "connecting" };
  sessions.set(userId, session);

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;
    const cur = sessions.get(userId);
    if (!cur || cur.sock !== sock) return;

    if (qr) {
      cur.qr = await QRCode.toDataURL(qr);
      cur.status = "qr_ready";
      console.log(`[${userId}] QR ready`);
    }

    if (connection === "open") {
      cur.qr = null;
      cur.status = "connected";
      console.log(`[${userId}] Connected`);
      syncHistory(sock, userId);
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      console.log(`[${userId}] Close code=${code} loggedOut=${loggedOut}`);

      cleanup(userId);
      if (loggedOut) {
        clearAuth(userId);
      } else {
        setTimeout(() => connectWhatsapp(userId), 3000);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

export function getQRCode(userId) {
  return sessions.get(userId)?.qr ?? null;
}

export function getUserStatus(userId) {
  return sessions.get(userId)?.status ?? "disconnected";
}

export async function disconnectUser(userId) {
  const s = sessions.get(userId);
  if (s?.sock) {
    try {
      await s.sock.logout();
    } catch (e) {
      console.warn(`[${userId}] logout:`, e.message);
    }
  }
  cleanup(userId);
  clearAuth(userId);
  console.log(`[${userId}] Disconnected`);
}

export function getAllSessions() {
  const out = {};
  for (const [id, s] of sessions) out[id] = s.status;
  return out;
}
