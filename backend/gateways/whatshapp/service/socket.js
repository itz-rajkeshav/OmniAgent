import makeWASocket from "baileys";
import { useMultiFileAuthState } from "baileys/lib/Utils/use-multi-file-auth-state.js";
import { DisconnectReason } from "baileys/lib/Types/index.js";
import pino from "pino";
import QRCode from "qrcode";

let latestQR = null;
export async function connectWhatsapp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnected } = update;

    if (qr) {
      latestQR = await QRCode.toDataURL(qr);
      console.log("New QR Code:", latestQR);
    }
    if (connection === "open") {
      console.log("Connected to WhatsApp");
      latestQR = null;
    }
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnected?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("Reconnecting to WhatsApp...");
        connectWhatsapp();
      }
    }
  });
  sock.ev.on("creds.update", saveCreds);
  return sock;
}

export function getLatestQR() {
  return latestQR;
}
