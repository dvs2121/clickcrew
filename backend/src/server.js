import { createServer } from "node:http";
import { config } from "./config/env.js";
import { db } from "./db/database.js";
import { authenticate } from "./middleware/auth.js";
import { applySecurityHeaders, checkRateLimit } from "./middleware/security.js";
import { handleAdmin } from "./routes/admin.js";
import { handleAuth } from "./routes/auth.js";
import { handleBookings } from "./routes/bookings.js";
import { handlePhotographers } from "./routes/photographers.js";
import { handleUsers } from "./routes/users.js";
import { bootstrapAdmin } from "./services/authService.js";
import { ensureDefaultCategories } from "./services/photographerService.js";
import { HttpError } from "./utils/errors.js";
import { readJson, sendError, sendJson } from "./utils/http.js";

ensureDefaultCategories();
await bootstrapAdmin(config.adminEmail, config.adminPassword);

const handlers = [
  handleAuth,
  handleAdmin,
  handlePhotographers,
  handleBookings,
  handleUsers,
];

const server = createServer(async (request, response) => {
  try {
    applySecurityHeaders(request, response);
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (url.pathname === "/api/v1/health" && request.method === "GET") {
      db.prepare("SELECT 1").get();
      sendJson(response, 200, { status: "ok", database: "ok" });
      return;
    }

    if (url.pathname === "/api/v1/health/ready" && request.method === "GET") {
      db.prepare("SELECT 1").get();
      sendJson(response, 200, { status: "ready", database: "ok" });
      return;
    }

    if (!url.pathname.startsWith("/api/v1/")) {
      throw new HttpError(404, "NOT_FOUND", "The requested resource was not found.");
    }

    checkRateLimit(request, url.pathname);
    const body =
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
        ? await readJson(request)
        : {};
    const context = {
      request,
      response,
      url,
      body,
      user: authenticate(request),
    };
    for (const handler of handlers) {
      if (await handler(context)) return;
    }
    throw new HttpError(404, "NOT_FOUND", "The requested resource was not found.");
  } catch (error) {
    if (error?.code === "ERR_SQLITE_ERROR" && /constraint failed/i.test(error.message)) {
      error = new HttpError(409, "CONFLICT", "The request conflicts with existing data.");
    }
    sendError(response, error);
  }
});

server.listen(config.port, () => {
  console.log(`ClickCrew API listening on port ${config.port} (${config.nodeEnv}).`);
});

function shutdown(signal) {
  console.log(`Received ${signal}; closing ClickCrew API.`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
