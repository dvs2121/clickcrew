const port = Number(process.env.PORT || 3000);
const authSecret = process.env.AUTH_SECRET || "";
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase() || "";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";
const databaseUrl = process.env.DATABASE_URL || "";
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5500")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

if (process.env.NODE_ENV === "production" && authSecret.length < 32) {
  throw new Error("AUTH_SECRET must contain at least 32 characters in production.");
}

if (Boolean(adminEmail) !== Boolean(adminPassword)) {
  throw new Error("Set both ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD, or neither.");
}

if (
  databaseUrl &&
  databaseUrl !== ":memory:" &&
  !databaseUrl.startsWith("file:")
) {
  throw new Error("DATABASE_URL must be a SQLite file: URL or :memory:.");
}

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV || "development",
  databasePath:
    process.env.DATABASE_PATH ||
    (databaseUrl.startsWith("file:")
      ? databaseUrl.slice("file:".length)
      : databaseUrl) ||
    "./data/clickcrew.sqlite",
  authSecret: authSecret || "development-only-change-this-secret",
  corsOrigin: corsOrigins[0] || "http://localhost:5500",
  corsOrigins,
  secureCookie:
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production",
  adminEmail,
  adminPassword,
};
