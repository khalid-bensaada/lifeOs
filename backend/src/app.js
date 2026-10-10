import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const dist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../frontend/dist",
);

app.set("trust proxy", env.trustProxy);

app.use(helmet());
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use("/api", apiLimiter);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/api", routes);
app.use("/api", notFound);

if (env.nodeEnv === "production" && fs.existsSync(dist)) {
  app.use(
    "/assets",
    express.static(path.join(dist, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  app.use(express.static(dist, { index: false }));
  app.get(/^\/(?!api(\/|$)|assets\/).*/, (req, res) =>
    res.sendFile(path.join(dist, "index.html")),
  );
}

app.use(notFound);
app.use(errorHandler);

export default app;
