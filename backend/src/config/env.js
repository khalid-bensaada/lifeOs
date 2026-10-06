import "dotenv/config";

for (const key of ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"]) {
  if (!process.env[key])
    throw new Error(`Missing environment variable: ${key}`);
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim()),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresInSec: 7 * 24 * 60 * 60,
  },
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  },
};
