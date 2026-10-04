import { db, transaction } from "../db/database.js";
import { HttpError, assert, requiredText, validEmail } from "../utils/errors.js";
import {
  createSession,
  hashPassword,
  newId,
  revokeSession,
  verifyPassword,
} from "../utils/security.js";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photo_url || null,
    gender: user.gender || null,
    dateOfBirth: user.date_of_birth || null,
    location: user.location || null,
  };
}

export async function register(role, body) {
  assert(
    role === "customer" || role === "photographer",
    404,
    "NOT_FOUND",
    "Registration is only available for customers and photographers.",
  );
  const name = requiredText(body.name, "Name", { max: 120 });
  const email = validEmail(body.email);
  const password = requiredText(body.password, "Password", { min: 10, max: 200 });
  assert(
    /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password),
    400,
    "WEAK_PASSWORD",
    "Password must include an uppercase letter, a lowercase letter, and a number.",
  );

  const city =
    role === "photographer" ? requiredText(body.city, "City", { max: 120 }) : "";
  const passwordHash = await hashPassword(password);
  const userId = newId();
  try {
    transaction(() => {
      db.prepare(
        "INSERT INTO users (id, name, email, password_hash, role, location, photo_url, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        userId,
        name,
        email,
        passwordHash,
        role,
        body.location?.trim() || city || null,
        body.photoUrl?.trim() || null,
        body.gender?.trim() || null,
        body.dateOfBirth || null,
      );
      if (role === "customer") {
        db.prepare("INSERT INTO customer_profiles (user_id) VALUES (?)").run(userId);
      } else {
        db.prepare(
          "INSERT INTO photographer_profiles (user_id, city, region, bio, hourly_rate, photo_rate) VALUES (?, ?, ?, ?, ?, ?)",
        ).run(
          userId,
          city,
          body.region?.trim() || "",
          body.bio?.trim() || "",
          0,
          0,
        );
      }
    });
  } catch (error) {
    if (error.code === "ERR_SQLITE_ERROR" && /UNIQUE constraint failed: users.email/i.test(error.message)) {
      throw new HttpError(409, "EMAIL_IN_USE", "An account with this email already exists.");
    }
    throw error;
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  const session = createSession(userId);
  return { user: publicUser(user), ...session };
}

export async function login(role, body) {
  const email = validEmail(body.email);
  const password = requiredText(body.password, "Password", { min: 1, max: 200 });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  const passwordMatches =
    user && (await verifyPassword(password, user.password_hash));
  if (!passwordMatches || user.role !== role) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }
  if (user.status !== "active") {
    throw new HttpError(403, "ACCOUNT_SUSPENDED", "This account is suspended.");
  }
  const session = createSession(user.id);
  return { user: publicUser(user), ...session };
}

export async function changePassword(user, body) {
  const current = db
    .prepare("SELECT password_hash FROM users WHERE id = ?")
    .get(user.id);
  if (!current || !(await verifyPassword(body.currentPassword, current.password_hash))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Current password is incorrect.");
  }
  const password = requiredText(body.password, "Password", { min: 10, max: 200 });
  assert(
    /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password),
    400,
    "WEAK_PASSWORD",
    "Password must include an uppercase letter, a lowercase letter, and a number.",
  );
  db.prepare(
    "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(await hashPassword(password), user.id);
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
}

export async function bootstrapAdmin(email, password) {
  if (!email || !password) return;
  assert(
    password.length >= 16,
    500,
    "INVALID_ADMIN_CONFIGURATION",
    "ADMIN_BOOTSTRAP_PASSWORD must contain at least 16 characters.",
  );
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    assert(
      db.prepare("SELECT user_id FROM admins WHERE user_id = ?").get(existing.id),
      500,
      "ADMIN_CONFIGURATION_CONFLICT",
      "The bootstrap email belongs to a non-admin account.",
    );
    return;
  }
  const userId = newId();
  const passwordHash = await hashPassword(password);
  transaction(() => {
    db.prepare(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')",
    ).run(userId, "ClickCrew Administrator", email, passwordHash);
    db.prepare("INSERT INTO admins (user_id) VALUES (?)").run(userId);
  });
}
