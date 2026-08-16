import { Server } from "socket.io";
import http from "http";
import https from "https";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv-defaults";
import fs from "fs";
import morgan from "morgan";
import cors from "cors";

import apiRouter from "./api.js";
import socket from "./socket.js";

dotenv.config();

const { NODE_ENV, HTTPS, PORT, MONGO_URL, MONGODB_URI } = process.env;
const mongoUrl = MONGODB_URI || MONGO_URL;
const port = PORT || 4000;
const app = express();

if (NODE_ENV === "development") {
  console.log("NODE_ENV = development");
}

let server;
let protocol = "http";
const useHttps = NODE_ENV === "development" && HTTPS === "true";

if (useHttps) {
  console.log("Use https in development");
  protocol = "https";
  const { SSL_CRT_FILE, SSL_KEY_FILE } = process.env;
  const key = fs.readFileSync(SSL_KEY_FILE, "utf8");
  const cert = fs.readFileSync(SSL_CRT_FILE, "utf8");
  server = https.createServer({ key, cert }, app);
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use((request, response, next) => {
  request.io = io;
  next();
});

const databaseStates = [
  "disconnected",
  "connected",
  "connecting",
  "disconnecting",
];

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database:
      databaseStates[mongoose.connection.readyState] || "unknown",
  });
});

app.use(
  "/api",
  (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: "database_unavailable",
        message:
          "後端已啟動，但 MongoDB 尚未連線。請檢查 backend/.env 的 MONGODB_URI。",
      });
      return;
    }
    next();
  },
  apiRouter
);

socket(io);

server.listen(port, () =>
  console.log(`App listening at ${protocol}://localhost:${port}`)
);

const connectDatabase = async () => {
  if (!mongoUrl?.trim()) {
    console.error(
      "MongoDB 未設定：請在 backend/.env 填入有效的 MONGODB_URI。"
    );
    return;
  }

  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    const errorCode = error?.reason?.code || error?.code || error?.name;
    console.error(`MongoDB connection failed (${errorCode || "unknown"}).`);
    if (errorCode === "ENOTFOUND") {
      console.error(
        "找不到 MongoDB Atlas 主機；目前的 cluster 網址可能已失效或已被重新命名。"
      );
    }
    console.error(
      "後端會維持啟動並回覆 503；更新 backend/.env 後，請重新啟動後端。"
    );
  }
};

mongoose.connection.on("error", () => {
  console.error("MongoDB connection error.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

connectDatabase();
