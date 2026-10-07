const express = require("express");
const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});