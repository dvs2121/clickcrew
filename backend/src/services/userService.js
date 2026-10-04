import { db } from "../db/database.js";
import { HttpError, assert, optionalText, requiredText } from "../utils/errors.js";
import { newId } from "../utils/security.js";
import { getPhotographer } from "./photographerService.js";

export function getCurrentProfile(user) {
  if (user.role === "photographer") {
    return { user, photographer: getPhotographer(user.id) };
  }
  if (user.role === "customer") {
    const customer = db
      .prepare("SELECT * FROM customer_profiles WHERE user_id = ?")
      .get(user.id);
    assert(customer, 404, "PROFILE_NOT_FOUND", "Customer profile not found.");
  }
  return { user };
}

export function updateCustomerProfile(userId, body) {
  const fields = [];
  const values = [];
  for (const [input, column, limit] of [
    ["name", "name", 120],
    ["location", "location", 300],
    ["gender", "gender", 80],
    ["dateOfBirth", "date_of_birth", 10],
  ]) {
    if (body[input] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(
        input === "name"
          ? requiredText(body[input], "Name", { max: limit })
          : optionalText(body[input], input, limit) || null,
      );
    }
  }
  if (body.photoUrl !== undefined) {
    assert(
      !body.photoUrl || /^https?:\/\//i.test(body.photoUrl),
      400,
      "VALIDATION_ERROR",
      "Profile photo must be an HTTP or HTTPS URL.",
    );
    fields.push("photo_url = ?");
    values.push(body.photoUrl || null);
  }
  if (fields.length) {
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(userId);
    db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }
  const profile = db
    .prepare(
      "SELECT id, name, email, role, photo_url AS photoUrl, gender, date_of_birth AS dateOfBirth, location FROM users WHERE id = ?",
    )
    .get(userId);
  return profile;
}

export function listFavorites(customerId) {
  const rows = db
    .prepare(
      `SELECT p.user_id FROM favorites f
       JOIN photographer_profiles p ON p.user_id = f.photographer_id
       JOIN users u ON u.id = p.user_id
       WHERE f.customer_id = ? AND u.status = 'active'
       ORDER BY f.created_at DESC`,
    )
    .all(customerId);
  return rows.map((row) => getPhotographer(row.user_id));
}

export function addFavorite(customerId, photographerId) {
  assert(
    db.prepare("SELECT user_id FROM photographer_profiles WHERE user_id = ?").get(photographerId),
    404,
    "PHOTOGRAPHER_NOT_FOUND",
    "Photographer not found.",
  );
  db.prepare(
    "INSERT OR IGNORE INTO favorites (customer_id, photographer_id) VALUES (?, ?)",
  ).run(customerId, photographerId);
  return { photographerId, favorite: true };
}

export function removeFavorite(customerId, photographerId) {
  db.prepare(
    "DELETE FROM favorites WHERE customer_id = ? AND photographer_id = ?",
  ).run(customerId, photographerId);
  return { photographerId, favorite: false };
}

export function listCategories() {
  return db
    .prepare("SELECT id, name FROM categories WHERE active = 1 ORDER BY name")
    .all();
}

export function createCategory(name) {
  const normalized = requiredText(name, "Category name", { max: 100 });
  const id = newId();
  try {
    db.prepare("INSERT INTO categories (id, name) VALUES (?, ?)").run(id, normalized);
  } catch (error) {
    if (/UNIQUE constraint failed: categories.name/i.test(error.message)) {
      throw new HttpError(409, "CATEGORY_EXISTS", "That category already exists.");
    }
    throw error;
  }
  return { id, name: normalized };
}

export function updateCategory(id, body) {
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  assert(category, 404, "CATEGORY_NOT_FOUND", "Category not found.");
  const name = body.name === undefined ? category.name : requiredText(body.name, "Category name", { max: 100 });
  assert(
    body.active === undefined || typeof body.active === "boolean",
    400,
    "VALIDATION_ERROR",
    "Category active status must be a boolean.",
  );
  const active = body.active === undefined ? category.active : Number(body.active);
  try {
    db.prepare("UPDATE categories SET name = ?, active = ? WHERE id = ?").run(name, active, id);
  } catch (error) {
    if (/UNIQUE constraint failed: categories.name/i.test(error.message)) {
      throw new HttpError(409, "CATEGORY_EXISTS", "That category already exists.");
    }
    throw error;
  }
  return { id, name, active: Boolean(active) };
}

export function listNotifications(userId, { unreadOnly = false } = {}) {
  const where = unreadOnly ? "AND read_at IS NULL" : "";
  return db
    .prepare(
      `SELECT id, type, message, data, read_at AS readAt, created_at AS createdAt
       FROM notifications WHERE user_id = ? ${where} ORDER BY created_at DESC LIMIT 100`,
    )
    .all(userId)
    .map((item) => ({ ...item, data: JSON.parse(item.data) }));
}

export function markNotificationRead(userId, id) {
  const result = db
    .prepare(
      "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    )
    .run(id, userId);
  assert(result.changes > 0, 404, "NOTIFICATION_NOT_FOUND", "Notification not found.");
  return { id, read: true };
}

export function platformCounts() {
  return {
    users: db.prepare("SELECT COUNT(*) AS count FROM users WHERE role != 'admin'").get().count,
    photographers: db.prepare("SELECT COUNT(*) AS count FROM photographer_profiles").get().count,
    customers: db.prepare("SELECT COUNT(*) AS count FROM customer_profiles").get().count,
    bookings: db.prepare("SELECT COUNT(*) AS count FROM bookings").get().count,
    pendingBookings: db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status = 'pending'").get().count,
    reviewsToModerate: db.prepare("SELECT COUNT(*) AS count FROM reviews WHERE status = 'visible'").get().count,
  };
}
