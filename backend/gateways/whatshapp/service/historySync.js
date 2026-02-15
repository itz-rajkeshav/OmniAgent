import { registerHistorySync } from "baileys/lib/Utils/history-sync.js";

export async function syncHistory(userId) {
  sock.ev.on(
    "messaging-history.set",
    ({
      chats: newChats,
      contacts: newContacts,
      messages: newMessages,
      syncType,
    }) => {
      console.log("history sync");
      console.log("chats", chats.length);
      console.log("Messages:", messages.length);
      console.log("Is latest batch:", isLatest);

      for (const msg of messages) {
        if (!msg.messages) continue;

        const jid = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const timestamp = msg.key.timestamp;

        const text =
          msg.messages.conversation ||
          msg.message.extendedTextMessage?.text ||
          null;

        if (!text) continue;

        console.log("HISTORY:", {
          jid,
          fromMe,
          text,
          timestamp,
        });
      }
      if (isLatest) {
        console.log("✅ History sync completed");
      }
    },
  );
}
