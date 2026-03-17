import express from "express";
import cors from "cors";
import whatshappRoutes from "./whatshapp/routes/route.js";
import { reconnectExistingSessions } from "./whatshapp/service/socket.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hey the gateway server is running boi :)");
});

app.use("/whatshapp", whatshappRoutes);
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  reconnectExistingSessions().catch((err) =>
    console.error("Auto-reconnect error:", err.message),
  );
});
