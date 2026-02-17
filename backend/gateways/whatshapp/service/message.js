export function messageHandler(sock, userId) {
  if (!sock?.ev) return;
  sock.ev.on("messages.upsert", (type, messages) => {
    if (type == "notify") {
      for (const message of messages) {
        const msg = message?.message;
        if (!msg?.key) continue;

        const jid = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const timestamp = msg.key.timestamp;

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          null;

        if (!text) continue;

        console.log(`[${userId}] MESSAGE:`, {
          jid,
          fromMe,
          text,
          timestamp,
        });
      }
    }
  });
}
