import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("hey the gateway server is running boi :)");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
