import express from "express";
import { getLatestQR } from "../service/socket.js";

const router = express.Router();

router.get("/qr", (req, res) => {
  const qr = getLatestQR();
  if (!qr) {
    return res.status(404).json({ error: "No QR code available. Already connected or not yet generated." });
  }
  res.json({ qr });
});

export default router;
