import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is reachable",
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });