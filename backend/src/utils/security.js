import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  randomUUID,
} from "node:crypto";
import { promisify } from "node:util";
import { config } from "../config/env.js";
import { db } from "../db/database.js";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_DAYS = 7;

export function newId() {
  return randomUUID();
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("hex")}$${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, n, r, p, saltHex, keyHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = Buffer.from(
    await scrypt(password, Buffer.from(saltHex, "hex"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    }),
  );
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function tokenDigest(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  db.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
  ).run(tokenDigest(token), userId, expiresAt);
  return { token, expiresAt };
}

export function revokeSession(token) {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenDigest(token));
}

export function sessionCookie(token, maxAge = SESSION_TTL_DAYS * 86400) {
  const secure = config.secureCookie ? "; Secure" : "";
  const sameSite = config.secureCookie ? "None" : "Strict";
  return `clickcrew_session=${token}; HttpOnly; Path=/; SameSite=${sameSite}; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie() {
  const secure = config.secureCookie ? "; Secure" : "";
  const sameSite = config.secureCookie ? "None" : "Strict";
  return `clickcrew_session=; HttpOnly; Path=/; SameSite=${sameSite}; Max-Age=0${secure}`;
}

export function getCookie(request, name) {
  const raw = request.headers.cookie || "";
  const cookie = raw
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
}

export function constantTimeEqual(left, right) {
  const first = Buffer.from(String(left));
  const second = Buffer.from(String(right));
  return (
    first.length === second.length && timingSafeEqual(first, second)
  );
}
