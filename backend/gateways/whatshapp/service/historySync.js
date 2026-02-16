export function syncHistory(sock, userId) {
  if (!sock?.ev) return;

  sock.ev.on(
    "messaging-history.set",
    ({
      chats: newChats,
      contacts: newContacts,
      messages: newMessages,
      syncType,
    }) => {
      console.log(
        `[${userId}] History sync: chats=${newChats?.length ?? 0}, contacts=${newContacts?.length ?? 0}, messages=${newMessages?.length ?? 0}, syncType=${syncType}`,
      );

      if (!Array.isArray(newMessages)) return;

      for (const item of newMessages) {
        const msg = item?.message;
        if (!msg?.key) continue;

        const jid = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const timestamp = msg.key.timestamp;

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          null;

        if (!text) continue;

        console.log(`[${userId}] HISTORY:`, {
          jid,
          fromMe,
          text,
          timestamp,
        });
      }

      if (syncType !== undefined) {
        console.log(
          `[${userId}] History sync batch completed (syncType=${syncType})`,
        );
      }
    },
  );
}
