import express from "express";
import whatshappRoutes from "./whatshapp/routes/route.js";

const app = express();

app.get("/", (req, res) => {
  res.send("hey the gateway server is running boi :)");
});

app.use("/whatshapp", whatshappRoutes);
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
