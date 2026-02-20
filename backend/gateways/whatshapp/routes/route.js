import express from "express";
import {
  connectWhatsapp,
  getQRCode,
  getUserStatus,
  disconnectUser,
  getAllSessions,
} from "../service/socket.js";

const router = express.Router();

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

async function getSessionAndQR(userId) {
  const status = getUserStatus(userId);
  if (status === "disconnected") {
    await connectWhatsapp(userId);
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
  const { status, qr } = await getSessionAndQR(userId);

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

// router.get(["/scan", "/scan/:userId"], async (req, res) => {
//   const userId = getUserId(req);
//   const { status, qr } = await getSessionAndQR(userId);

//   const refreshMeta =
//     status !== "connected" ? '<meta http-equiv="refresh" content="5">' : "";

//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <title>WhatsApp – ${userId}</title>
//   ${refreshMeta}
//   <style>
//     * { box-sizing: border-box; }
//     body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
//            margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
//     .card { background: #fff; padding: 2rem; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); max-width: 420px; text-align: center; }
//     h1 { color: #128C7E; margin: 0 0 0.5rem; font-size: 1.5rem; }
//     .user { background: #e8f5e9; padding: 6px 14px; border-radius: 20px; font-weight: 600; color: #333; display: inline-block; margin-bottom: 1.5rem; }
//     .qr-box { background: #f5f5f5; padding: 20px; border-radius: 12px; margin: 1rem 0; }
//     .qr-box img { max-width: 260px; border-radius: 8px; display: block; margin: 0 auto; }
//     .status { color: #666; font-size: 0.9rem; margin-top: 1rem; }
//     .steps { text-align: left; background: #f9f9f9; padding: 1rem; border-radius: 10px; margin-top: 1rem; font-size: 0.9rem; }
//     .steps ol { margin: 0.5rem 0 0 1.2rem; padding: 0; }
//     .steps li { margin: 0.4rem 0; }
//     .big { font-size: 3rem; margin-bottom: 0.5rem; }
//   </style>
// </head>
// <body>
//   <div class="card">
//     <div class="big">${status === "connected" ? "✅" : qr ? "📱" : "⏳"}</div>
//     <h1>${status === "connected" ? "WhatsApp connected" : qr ? "Scan QR code" : "Connecting…"}</h1>
//     <div class="user">User: ${userId}</div>
//     ${qr ? `<div class="qr-box"><img src="${qr}" alt="QR Code" /></div>` : ""}
//     ${
//       status === "connected"
//         ? '<p class="status">You can close this page.</p>'
//         : qr
//           ? `<div class="steps"><strong>Steps:</strong><ol><li>Open WhatsApp on your phone</li><li>Settings → Linked Devices → Link a Device</li><li>Scan the QR code above</li></ol></div><p class="status">Page refreshes every 5s until connected.</p>`
//           : '<p class="status">Waiting for QR… (refresh in a few seconds)</p>'
//     }
//   </div>
// </body>
// </html>`;

//   res.send(html);
// });

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

export default router;
