import { db, transaction } from "../db/database.js";
import { HttpError, assert, requiredText } from "../utils/errors.js";
import { notify } from "./notificationService.js";

function pageOptions(search) {
  const limit = Math.min(100, Math.max(1, Number(search.get("limit") || 50)));
  const offset = Math.max(0, Number(search.get("offset") || 0));
  assert(Number.isInteger(limit) && Number.isInteger(offset), 400, "VALIDATION_ERROR", "Pagination values must be integers.");
  return { limit, offset };
}

export function listUsers(search) {
  const { limit, offset } = pageOptions(search);
  const role = search.get("role");
  const values = [];
  let where = "WHERE u.role != 'admin'";
  if (role === "customer" || role === "photographer") {
    where += " AND u.role = ?";
    values.push(role);
  }
  values.push(limit, offset);
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.location, u.created_at AS createdAt
       FROM users u ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...values);
  return rows;
}

export function listAdminBookings(search) {
  const { limit, offset } = pageOptions(search);
  return db
    .prepare(
      `SELECT b.id, b.event_type AS eventType, b.event_date AS date, b.event_time AS time,
              b.price AS estimatedPrice, b.status, c.name AS customerName,
              p.name AS photographerName, b.created_at AS createdAt
       FROM bookings b JOIN users c ON c.id = b.customer_id
       JOIN users p ON p.id = b.photographer_id
       ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(limit, offset);
}

export function listAdminReviews(search) {
  const { limit, offset } = pageOptions(search);
  return db
    .prepare(
      `SELECT r.id, r.booking_id AS bookingId, r.rating, r.text, r.status,
              r.created_at AS createdAt, c.name AS customerName,
              p.name AS photographerName
       FROM reviews r JOIN users c ON c.id = r.customer_id
       JOIN users p ON p.id = r.photographer_id
       ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(limit, offset);
}

export function moderateReview(reviewId, status) {
  assert(["visible", "hidden", "removed"].includes(status), 400, "VALIDATION_ERROR", "Review status must be visible, hidden, or removed.");
  const review = db.prepare("SELECT * FROM reviews WHERE id = ?").get(reviewId);
  assert(review, 404, "REVIEW_NOT_FOUND", "Review not found.");
  transaction(() => {
    db.prepare(
      "UPDATE reviews SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(status, reviewId);
    const aggregate = db
      .prepare(
        "SELECT AVG(rating) AS rating, COUNT(*) AS count FROM reviews WHERE photographer_id = ? AND status = 'visible'",
      )
      .get(review.photographer_id);
    db.prepare(
      "UPDATE photographer_profiles SET rating = ?, review_count = ? WHERE user_id = ?",
    ).run(aggregate.rating || 0, aggregate.count, review.photographer_id);
    notify(review.customer_id, "review.moderated", "Your review was moderated by ClickCrew.", {
      reviewId,
      status,
    });
  });
  return { id: reviewId, status };
}

export function updateUserStatus(userId, status) {
  assert(["active", "suspended"].includes(status), 400, "VALIDATION_ERROR", "Account status must be active or suspended.");
  const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(userId);
  assert(user, 404, "USER_NOT_FOUND", "User not found.");
  assert(user.role !== "admin", 403, "FORBIDDEN", "Admin accounts cannot be modified here.");
  db.prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, userId);
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  notify(userId, "account.status", `Your account was ${status}.`);
  return { id: userId, status };
}

export function listContactRequests() {
  return db
    .prepare(
      `SELECT id, name, email, topic, message, status, created_at AS createdAt
       FROM contact_requests ORDER BY created_at DESC LIMIT 200`,
    )
    .all();
}

export function updateContactRequestStatus(id, status) {
  assert(["open", "closed"].includes(status), 400, "VALIDATION_ERROR", "Contact request status must be open or closed.");
  const result = db
    .prepare("UPDATE contact_requests SET status = ? WHERE id = ?")
    .run(status, id);
  assert(result.changes > 0, 404, "CONTACT_REQUEST_NOT_FOUND", "Contact request not found.");
  return { id, status };
}

export function updatePhotographerVerification(userId, verified) {
  assert(typeof verified === "boolean", 400, "VALIDATION_ERROR", "Verified must be a boolean.");
  const result = db
    .prepare("UPDATE photographer_profiles SET verified = ? WHERE user_id = ?")
    .run(Number(Boolean(verified)), userId);
  assert(result.changes > 0, 404, "PHOTOGRAPHER_NOT_FOUND", "Photographer not found.");
  notify(userId, "photographer.verification", `Your profile was ${verified ? "verified" : "unverified"}.`);
  return { id: userId, verified: Boolean(verified) };
}

export function saveContactRequest(body, id) {
  db.prepare(
    "INSERT INTO contact_requests (id, name, email, topic, message) VALUES (?, ?, ?, ?, ?)",
  ).run(
    id,
    requiredText(body.name, "Name", { max: 120 }),
    requiredText(body.email, "Email", { max: 254 }),
    requiredText(body.topic, "Topic", { max: 120 }),
    requiredText(body.message, "Message", { max: 5000 }),
  );
}
