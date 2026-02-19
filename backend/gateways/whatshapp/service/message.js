export function messageHandler(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on("messages.upsert", ({ messages, type }) => {
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
