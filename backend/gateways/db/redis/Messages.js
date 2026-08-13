import redisClient from "./redis.js";

const KEY_PREFIX = "messages:"; //list
const JIDS_KEY_PREFIX = "message_jids:"; // set
const AGENT_MODE_PREFIX = "agent_mode:";
const AGENT_TONE_PREFIX = "agent_tone:";
const BLOCKED_JIDS_PREFIX = "blocked_jids:"; //set
const CONTACTS_PREFIX = "contacts:";
const LAST_ACTIVITY_PREFIX = "last_activity:";

/**
 * Baileys messageTimestamp can be a plain number OR a protobuf Long object
 * ({ low, high, unsigned }). This normalises either to milliseconds.
 */
export function normalizeTimestampMs(ts) {
  if (ts == null) return 0;
  let n;
  if (typeof ts === "object" && ts !== null && "low" in ts) {
    n = (ts.high >>> 0) * 0x100000000 + (ts.low >>> 0);
  } else {
    n = Number(ts);
  }
  if (!n || Number.isNaN(n) || n <= 0) return 0;
  return n < 1e12 ? n * 1000 : n;
}

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

function blockedJidsKey(userId) {
  return `${BLOCKED_JIDS_PREFIX}${userId}`;
}

export async function addBlockedJid(userId, jid) {
  if (!userId || !jid) return;
  await redisClient.sadd(blockedJidsKey(userId), jid);
}

export async function removeBlockedJid(userId, jid) {
  if (!userId || !jid) return;
  await redisClient.srem(blockedJidsKey(userId), jid);
}

export async function getBlockedJids(userId) {
  if (!userId) return [];
  return redisClient.smembers(blockedJidsKey(userId));
}

export async function isJidBlocked(userId, jid) {
  if (!userId || !jid) return false;
  return redisClient.sismember(blockedJidsKey(userId), jid);
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
  //read current agent mode
  const mode = await getAgentMode(userId);
  // based on mode it trims
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
// it parse each entry
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
// get all members in a conversatonal for that user id
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
  // Do not clear blocked_jids so blocklist survives message clear / logout
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

function contactsKey(userId) {
  return `${CONTACTS_PREFIX}${userId}`;
}

export async function upsertContacts(userId, contacts) {
  if (!userId || !Array.isArray(contacts) || contacts.length === 0) return;
  const key = contactsKey(userId);
  // pipeline queue mutliple command and then send it to the redis server once and receive all responses in single batch
  const pipeline = redisClient.pipeline();
  for (const c of contacts) {
    const jid = c.id;
    const name = c.notify || c.verifiedName || c.name || null;
    if (jid && name) {
      pipeline.hset(key, jid, name);
    }
  }
  await pipeline.exec();
}

export async function getContactName(userId, jid) {
  if (!userId || !jid) return null;
  return redisClient.hget(contactsKey(userId), jid);
}

export async function saveContactName(userId, jid, name) {
  if (!userId || !jid || !name) return;
  const existing = await redisClient.hget(contactsKey(userId), jid);
  if (!existing) {
    await redisClient.hset(contactsKey(userId), jid, name);
  }
}

export async function getAllContacts(userId) {
  if (!userId) return {};
  return redisClient.hgetall(contactsKey(userId)) || {};
}

function lastActivityKey(userId) {
  return `${LAST_ACTIVITY_PREFIX}${userId}`;
}
// it is needed to fetch the rest messages like if reconnect then it fetch the new one bcz the olld one is existed with the timestapmps so it trips basically
// only update if newer
export async function updateLastActivity(userId, jid, rawTimestamp) {
  if (!userId || !jid) return;
  const ms = normalizeTimestampMs(rawTimestamp);
  if (ms <= 0) return;
  const key = lastActivityKey(userId);
  const existing = Number(await redisClient.hget(key, jid)) || 0;
  if (ms > existing) {
    await redisClient.hset(key, jid, String(ms));
  }
}

export async function bulkUpdateLastActivity(userId, entries) {
  if (!userId || !Array.isArray(entries) || entries.length === 0) return;
  const key = lastActivityKey(userId);
  const existing = (await redisClient.hgetall(key)) || {};
  const pipeline = redisClient.pipeline();
  for (const { jid, timestamp } of entries) {
    if (!jid) continue;
    const ms = normalizeTimestampMs(timestamp);
    if (ms <= 0) continue;
    const prev = Number(existing[jid]) || 0;
    if (ms > prev) {
      pipeline.hset(key, jid, String(ms));
    }
  }
  await pipeline.exec();
}

export async function getAllLastActivities(userId) {
  if (!userId) return {};
  return (await redisClient.hgetall(lastActivityKey(userId))) || {};
}
