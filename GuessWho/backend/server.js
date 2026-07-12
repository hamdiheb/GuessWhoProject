import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
