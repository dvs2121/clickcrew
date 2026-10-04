import { config } from "../config/env.js";
import { HttpError } from "../utils/errors.js";

const authAttempts = new Map();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 20;

const rateLimitCleanup = setInterval(() => {
  const expiredBefore = Date.now() - AUTH_WINDOW_MS;
  for (const [address, attempt] of authAttempts) {
    if (attempt.startedAt < expiredBefore) authAttempts.delete(address);
  }
}, AUTH_WINDOW_MS);
rateLimitCleanup.unref();

export function applySecurityHeaders(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (config.secureCookie) {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  const origin = request.headers.origin;
  if (!origin) return;
  if (!config.corsOrigins.includes(origin)) {
    throw new HttpError(403, "ORIGIN_FORBIDDEN", "This origin is not allowed.");
  }
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization",
  );
  response.setHeader("Vary", "Origin");
}

export function checkRateLimit(request, pathname) {
  if (!pathname.startsWith("/api/v1/auth/")) return;
  const address = request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = authAttempts.get(address);
  const next =
    !current || now - current.startedAt > AUTH_WINDOW_MS
      ? { startedAt: now, count: 1 }
      : { ...current, count: current.count + 1 };
  authAttempts.set(address, next);
  if (next.count > AUTH_MAX_ATTEMPTS) {
    throw new HttpError(
      429,
      "RATE_LIMITED",
      "Too many authentication attempts. Please try again later.",
    );
  }
}
