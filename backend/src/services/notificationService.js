import { db } from "../db/database.js";
import { newId } from "../utils/security.js";

export function notify(userId, type, message, data = {}) {
  db.prepare(
    "INSERT INTO notifications (id, user_id, type, message, data) VALUES (?, ?, ?, ?, ?)",
  ).run(newId(), userId, type, message, JSON.stringify(data));
}
