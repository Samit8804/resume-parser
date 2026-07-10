import express from "express";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import jobRoutes from "./routes/jobs";
import candidateRoutes from "./routes/candidates";
import uploadRoutes from "./routes/upload";
import analyzeRoutes from "./routes/analyze";
import insightsRoutes from "./routes/insights";
import publicRoutes from "./routes/public";
import emailRoutes from "./routes/emails";
import notificationRoutes from "./routes/notifications";

const app = express();
const prisma = new PrismaClient();

const frontendUrls = process.env.FRONTEND_URL || "http://localhost:3000,https://resume-parser-tau-ten.vercel.app";
const allowedOrigins = frontendUrls.split(",").map(s => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { prisma };
