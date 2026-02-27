export function isGroupJid(jid) {
  return typeof jid === "string" && jid.endsWith("@g.us");
}
