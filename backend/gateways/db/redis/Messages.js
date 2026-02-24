import redisClient from "./redis.js";

const KEY_PREFIX = "messages:";
const JIDS_KEY_PREFIX = "message_jids:";
const AGENT_MODE_PREFIX = "agent_mode:";

const PROFESSIONAL_MAX_PER_CONVO = 10;

function convoKey(userId, jid) {
  return `${KEY_PREFIX}${userId}:${jid}`;
}

function jidsKey(userId) {
  return `${JIDS_KEY_PREFIX}${userId}`;
}

function agentModeKey(userId) {
  return `${AGENT_MODE_PREFIX}${userId}`;
}

/**
 * Store agent mode when user connects (from SaveAccount response).
 * Used to decide: casual = store all messages per convo, professional = last 10 per convo.
 */
export async function setAgentMode(userId, mode) {
  if (!userId) return;
  const normalized = (mode || "casual").toLowerCase();
  if (normalized !== "professional" && normalized !== "casual") return;
  await redisClient.set(agentModeKey(userId), normalized);
}

export async function getAgentMode(userId) {
  if (!userId) return "casual";
  const mode = await redisClient.get(agentModeKey(userId));
  return mode === "professional" ? "professional" : "casual";
}

/**
 * Add a message to the conversation (userId's chat with jid).
 * Casual: append and keep all. Professional: append then trim to last 10 per convo.
 */
export async function addMessage(userId, jid, messageObj) {
  if (!userId || !jid) return;
  const k = convoKey(userId, jid);
  const jidsK = jidsKey(userId);
  const value = JSON.stringify(messageObj);
  await redisClient.sadd(jidsK, jid);
  await redisClient.rpush(k, value);
  const mode = await getAgentMode(userId);
  if (mode === "professional") {
    await redisClient.ltrim(k, -PROFESSIONAL_MAX_PER_CONVO, -1);
  }
}

/**
 * Get messages for one conversation (for LLM context for that chat).
 */
export async function getMessagesForConvo(userId, jid) {
  if (!userId || !jid) return [];
  const k = convoKey(userId, jid);
  const raw = await redisClient.lrange(k, 0, -1);
  return raw.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return { raw: s };
    }
  });
}

/**
 * Get full conversation context for a user: all jids and their messages.
 * Use this to build LLM context per convo.
 * Returns { [jid]: [ { jid, fromMe, text, timestamp }, ... ], ... }
 */
export async function getConversationContext(userId) {
  if (!userId) return {};
  const jidsK = jidsKey(userId);
  const jids = await redisClient.smembers(jidsK);
  const context = {};
  for (const jid of jids) {
    context[jid] = await getMessagesForConvo(userId, jid);
  }
  return context;
}

/**
 * Get list of jids (conversations) for a user.
 */
export async function getConversationJids(userId) {
  if (!userId) return [];
  return redisClient.smembers(jidsKey(userId));
}

/**
 * Delete all message data for a user (all convos + agent_mode). Call on logout.
 */
export async function deleteAllUserMessages(userId) {
  if (!userId) return;
  const jidsK = jidsKey(userId);
  const jids = await redisClient.smembers(jidsK);
  const pipeline = redisClient.pipeline();
  for (const jid of jids) {
    pipeline.del(convoKey(userId, jid));
  }
  pipeline.del(jidsK);
  pipeline.del(agentModeKey(userId));
  await pipeline.exec();
}

/** @deprecated Use deleteAllUserMessages. Kept for compatibility. */
export async function deleteMessages(userId) {
  return deleteAllUserMessages(userId);
}

/** @deprecated Use getMessagesForConvo or getConversationContext. Kept for compatibility. */
export async function getMessages(userId) {
  const ctx = await getConversationContext(userId);
  const out = [];
  for (const msgs of Object.values(ctx)) {
    out.push(...msgs);
  }
  return out.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}
