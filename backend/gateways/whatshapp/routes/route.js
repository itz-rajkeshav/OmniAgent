import express from "express";
import {
  connectWhatsapp,
  getQRCode,
  getUserStatus,
  disconnectUser,
  getAllSessions,
  getSocket,
} from "../service/socket.js";
import {
  getConversationJids,
  getBlockedJids,
  addBlockedJid,
  removeBlockedJid,
  getAllContacts,
  getAllLastActivities,
} from "../../db/redis/Messages.js";
import { isGroupJid } from "../utils/jid.js";

const router = express.Router();

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function getUserId(req) {
  return (
    req.params.userId || req.query.userId || req.body?.userId || "default_user"
  );
}

function waitForQR(userId, maxWaitMs = 4500, intervalMs = 300) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const status = getUserStatus(userId);
      const qr = getQRCode(userId);
      if (status === "connected" || qr) {
        return resolve({ status, qr });
      }
      if (Date.now() - start >= maxWaitMs) {
        return resolve({ status, qr: null });
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

async function getSessionAndQR(userId, phoneNumber = null) {
  const status = getUserStatus(userId);
  if (status === "disconnected") {
    await connectWhatsapp(userId, phoneNumber);
  }
  let statusNow = getUserStatus(userId);
  let qr = getQRCode(userId);
  // If we just started connecting, give the library a short time to emit the first QR
  if (statusNow === "connecting" && !qr) {
    const result = await waitForQR(userId);
    statusNow = result.status;
    qr = result.qr;
  }
  return { status: statusNow, qr };
}

router.get(["/qr", "/qr/:userId"], async (req, res) => {
  const userId = getUserId(req);
  const phoneNumber = req.query.phoneNumber || req.body?.phoneNumber || null;
  const { status, qr } = await getSessionAndQR(userId, phoneNumber);

  if (status === "connected") {
    return res.json({
      success: true,
      userId,
      status,
      message: "Already connected; no QR needed",
      qr: null,
    });
  }

  if (qr) {
    return res.json({ success: true, userId, status, qr });
  }

  res.json({
    success: false,
    userId,
    status,
    message: "QR not ready yet; call again in a moment",
    qr: null,
  });
});

router.post("/disconnect", express.json(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId || userId === "default_user") {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }
  await disconnectUser(userId);
  res.json({ success: true, message: "Disconnected" });
});

router.get(["/status", "/status/:userId"], (req, res) => {
  const userId = getUserId(req);
  res.json({ success: true, userId, status: getUserStatus(userId) });
});

router.get("/sessions", (req, res) => {
  res.json({ success: true, sessions: getAllSessions() });
});

router.get(["/chats", "/chats/:userId"], async (req, res) => {
  const userId = getUserId(req);
  if (!userId || userId === "default_user") {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }

  const sock = getSocket(userId);
  if (!sock) {
    return res.status(503).json({
      success: false,
      message: "User must be connected to WhatsApp to list chats",
    });
  }

  try {
    let groups = [];
    if (typeof sock.groupFetchAllParticipating === "function") {
      const groupsMap = await sock.groupFetchAllParticipating();
      groups = Object.entries(groupsMap || {}).map(([jid, g]) => ({
        jid: g?.id || jid,
        name: g?.subject || jid?.split?.("@")?.[0] || jid || "",
        isGroup: true,
      }));
    }

    const [recentJids, contactsMap, activityMap] = await Promise.all([
      getConversationJids(userId),
      getAllContacts(userId),
      getAllLastActivities(userId),
    ]);
    const groupsByJid = new Map(groups.map((group) => [group.jid, group]));

    function toChatMeta(jid) {
      const lastTs = Number(activityMap[jid]) || 0;
      const now = Date.now();
      const withinLastMonth =
        lastTs > 0 && lastTs <= now && now - lastTs <= ONE_MONTH_MS;
      const phoneNumber = jid.split("@")[0] || jid;
      const contactName =
        contactsMap[jid] || groupsByJid.get(jid)?.name || null;

      return {
        jid,
        isGroup: isGroupJid(jid),
        name: contactName || phoneNumber,
        phoneNumber,
        contactName,
        lastActivity: lastTs || null,
        withinLastMonth,
      };
    }

    const recentWithMeta = [];
    for (const jid of recentJids) {
      recentWithMeta.push(toChatMeta(jid));
    }

    const contactEntries = Object.entries(contactsMap || {});
    const allContacts = contactEntries
      .map(([jid, contactValue]) => {
        if (isGroupJid(jid)) return null;
        const item = toChatMeta(jid);
        return {
          ...item,
          name: contactValue || item.name,
          contactName: contactValue || item.contactName,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      userId,
      groups,
      recentChats: recentWithMeta,
      allContacts,
      contacts: contactsMap || {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch chats",
    });
  }
});

router.post(["/block", "/block-group"], express.json(), async (req, res) => {
  const userId = req.body?.userId || req.params.userId || req.query.userId;
  const jid = req.body?.jid;
  if (!userId || userId === "default_user") {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }
  if (!jid || typeof jid !== "string") {
    return res.status(400).json({ success: false, message: "jid is required" });
  }
  try {
    await addBlockedJid(userId, jid);
    res.json({ success: true, message: "Chat blocked", jid });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to block",
    });
  }
});

router.post(
  ["/unblock", "/unblock-group"],
  express.json(),
  async (req, res) => {
    const userId = req.body?.userId || req.params.userId || req.query.userId;
    const jid = req.body?.jid;
    if (!userId || userId === "default_user") {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }
    if (!jid || typeof jid !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "jid is required" });
    }
    try {
      await removeBlockedJid(userId, jid);
      res.json({ success: true, message: "Chat unblocked", jid });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to unblock",
      });
    }
  },
);

router.get(
  [
    "/blocked",
    "/blocked/:userId",
    "/blocked-groups",
    "/blocked-groups/:userId",
  ],
  async (req, res) => {
    const userId = getUserId(req);
    if (!userId || userId === "default_user") {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }
    try {
      const blockedJids = await getBlockedJids(userId);
      res.json({ success: true, userId, blockedJids });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch blocked list",
      });
    }
  },
);

export default router;
