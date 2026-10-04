import { db } from "../db/database.js";
import { HttpError } from "../utils/errors.js";
import { getCookie, tokenDigest } from "../utils/security.js";

export function authenticate(request) {
  const authorization = request.headers.authorization || "";
  const bearer = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const token = bearer || getCookie(request, "clickcrew_session");
  if (!token) return null;

  const session = db
    .prepare(
      `SELECT users.id, users.name, users.email, users.role, users.photo_url,
              users.gender, users.date_of_birth, users.location, users.status
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .get(tokenDigest(token), new Date().toISOString());
  if (!session) return null;
  if (session.status !== "active") {
    throw new HttpError(403, "ACCOUNT_SUSPENDED", "This account is suspended.");
  }
  return { ...session, sessionToken: token };
}

export function requireAuth(user) {
  if (!user) {
    throw new HttpError(401, "UNAUTHENTICATED", "Please sign in to continue.");
  }
  return user;
}

export function requireRole(user, ...roles) {
  requireAuth(user);
  if (!roles.includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "You do not have permission to do this.");
  }
  return user;
}
