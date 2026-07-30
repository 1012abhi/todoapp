import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./config/db";



const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is reachable",
  });
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
