import { requireAuth, requireRole } from "../middleware/auth.js";
import { createReview } from "../services/bookingService.js";
import {
  addFavorite,
  listCategories,
  listFavorites,
  listNotifications,
  markNotificationRead,
  removeFavorite,
  updateCustomerProfile,
} from "../services/userService.js";
import { saveContactRequest } from "../services/adminService.js";
import { validEmail } from "../utils/errors.js";
import { decodeSegment, sendJson } from "../utils/http.js";
import { newId } from "../utils/security.js";
import { db } from "../db/database.js";

export async function handleUsers({ request, response, url, body, user }) {
  const method = request.method;
  const path = url.pathname;

  if (method === "GET" && path === "/api/v1/categories") {
    sendJson(response, 200, { categories: listCategories() });
    return true;
  }

  if (method === "POST" && path === "/api/v1/contact") {
    saveContactRequest({ ...body, email: validEmail(body.email) }, newId());
    sendJson(response, 201, { success: true });
    return true;
  }

  if (path === "/api/v1/users/me" && method === "GET") {
    const current = requireAuth(user);
    sendJson(response, 200, {
      user: {
        id: current.id,
        name: current.name,
        email: current.email,
        role: current.role,
        photoUrl: current.photo_url || null,
        gender: current.gender || null,
        dateOfBirth: current.date_of_birth || null,
        location: current.location || null,
      },
    });
    return true;
  }

  if (path === "/api/v1/customers/me" && ["GET", "PATCH"].includes(method)) {
    const current = requireRole(user, "customer");
    if (method === "PATCH") {
      sendJson(response, 200, { user: updateCustomerProfile(current.id, body) });
    } else {
      sendJson(response, 200, {
        user: db
          .prepare(
            "SELECT id, name, email, role, photo_url AS photoUrl, gender, date_of_birth AS dateOfBirth, location FROM users WHERE id = ?",
          )
          .get(current.id),
      });
    }
    return true;
  }

  if (path === "/api/v1/favorites" && method === "GET") {
    const current = requireRole(user, "customer");
    sendJson(response, 200, { favorites: listFavorites(current.id) });
    return true;
  }
  const favoriteMatch = path.match(/^\/api\/v1\/favorites\/([^/]+)$/);
  if (favoriteMatch && ["POST", "PUT", "DELETE"].includes(method)) {
    const current = requireRole(user, "customer");
    const photographerId = decodeSegment(favoriteMatch[1]);
    sendJson(
      response,
      method === "POST" || method === "PUT" ? 201 : 200,
      method === "DELETE"
        ? removeFavorite(current.id, photographerId)
        : addFavorite(current.id, photographerId),
    );
    return true;
  }

  if (method === "POST" && path === "/api/v1/reviews") {
    const current = requireRole(user, "customer");
    sendJson(response, 201, { review: createReview(current.id, body) });
    return true;
  }

  if (method === "GET" && path === "/api/v1/notifications") {
    const current = requireAuth(user);
    sendJson(response, 200, {
      notifications: listNotifications(current.id, {
        unreadOnly: url.searchParams.get("unread") === "true",
      }),
    });
    return true;
  }
  const notificationMatch = path.match(/^\/api\/v1\/notifications\/([^/]+)\/read$/);
  if (method === "PATCH" && notificationMatch) {
    const current = requireAuth(user);
    sendJson(response, 200, {
      notification: markNotificationRead(current.id, decodeSegment(notificationMatch[1])),
    });
    return true;
  }

  const dashboardMatch = path.match(/^\/api\/v1\/dashboard\/(customer|photographer|admin)$/);
  if (method === "GET" && dashboardMatch) {
    const [, role] = dashboardMatch;
    const current = requireRole(user, role);
    const bookings = db
      .prepare(
        `SELECT b.id, b.event_type AS eventType, b.event_date AS date,
                b.event_time AS time, b.price AS estimatedPrice, b.status,
                c.name AS customerName, p.name AS photographerName
         FROM bookings b JOIN users c ON c.id = b.customer_id
         JOIN users p ON p.id = b.photographer_id
         ${role === "customer" ? "WHERE b.customer_id = ?" : role === "photographer" ? "WHERE b.photographer_id = ?" : ""}
         ORDER BY b.created_at DESC LIMIT 100`,
      )
      .all(...(role === "admin" ? [] : [current.id]));
    const stats =
      role === "admin"
        ? {
            users: db.prepare("SELECT COUNT(*) AS count FROM users WHERE role != 'admin'").get().count,
            photographers: db.prepare("SELECT COUNT(*) AS count FROM photographer_profiles").get().count,
            bookings: db.prepare("SELECT COUNT(*) AS count FROM bookings").get().count,
            reviewsToModerate: db.prepare("SELECT COUNT(*) AS count FROM reviews WHERE status = 'visible'").get().count,
          }
        : role === "photographer"
          ? {
              newRequests: bookings.filter((booking) => booking.status === "pending").length,
              upcomingBookings: bookings.filter((booking) => booking.status === "accepted").length,
              completedBookings: bookings.filter((booking) => booking.status === "completed").length,
              ...db.prepare(
                "SELECT rating, available FROM photographer_profiles WHERE user_id = ?",
              ).get(current.id),
            }
          : {
              openRequests: bookings.filter((booking) => booking.status === "pending").length,
              upcomingSessions: bookings.filter((booking) => booking.status === "accepted").length,
              favorites: db.prepare("SELECT COUNT(*) AS count FROM favorites WHERE customer_id = ?").get(current.id).count,
              pastSessions: bookings.filter((booking) => booking.status === "completed").length,
            };
    sendJson(response, 200, { user: current, stats, bookings });
    return true;
  }

  return false;
}
