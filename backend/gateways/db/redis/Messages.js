import redisClient from "./redis.js";

const KEY_PREFIX = "messages:";
const JIDS_KEY_PREFIX = "message_jids:";
const AGENT_MODE_PREFIX = "agent_mode:";
const AGENT_TONE_PREFIX = "agent_tone:";

const PROFESSIONAL_MAX_PER_CONVO = 10;
const DEFAULT_TONE_ID = "casual_friendly";

function convoKey(userId, jid) {
  return `${KEY_PREFIX}${userId}:${jid}`;
}

function jidsKey(userId) {
  return `${JIDS_KEY_PREFIX}${userId}`;
}

function agentModeKey(userId) {
  return `${AGENT_MODE_PREFIX}${userId}`;
}

function agentToneKey(userId) {
  return `${AGENT_TONE_PREFIX}${userId}`;
}

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

export async function setAgentTone(userId, tone) {
  if (!userId || !tone) return;
  await redisClient.set(agentToneKey(userId), String(tone));
}

export async function getAgentTone(userId) {
  if (!userId) return DEFAULT_TONE_ID;
  const tone = await redisClient.get(agentToneKey(userId));
  return tone || DEFAULT_TONE_ID;
}

export async function addMessage(userId, jid, messageObj, source = "notify") {
  if (!userId || !jid) return;
  const k = convoKey(userId, jid);
  const jidsK = jidsKey(userId);
  const value = JSON.stringify(messageObj);
  await redisClient.sadd(jidsK, jid);
  await redisClient.rpush(k, value);

  const mode = await getAgentMode(userId);

  if (source === "notify") {
    if (mode === "casual") {
      const len = await redisClient.llen(k);
      if (len > 1) await redisClient.lpop(k);
    } else {
      await redisClient.ltrim(k, -PROFESSIONAL_MAX_PER_CONVO, -1);
    }
  } else {
    if (mode === "professional") {
      await redisClient.ltrim(k, -PROFESSIONAL_MAX_PER_CONVO, -1);
    }
  }
}

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

export async function getConversationJids(userId) {
  if (!userId) return [];
  return redisClient.smembers(jidsKey(userId));
}

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
  pipeline.del(agentToneKey(userId));
  await pipeline.exec();
}

export async function deleteMessages(userId) {
  return deleteAllUserMessages(userId);
}

export async function getMessages(userId) {
  const ctx = await getConversationContext(userId);
  const out = [];
  for (const msgs of Object.values(ctx)) {
    out.push(...msgs);
  }
  return out.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}
