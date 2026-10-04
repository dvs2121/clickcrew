import { requireRole } from "../middleware/auth.js";
import {
  listAdminBookings,
  listAdminReviews,
  listContactRequests,
  listUsers,
  moderateReview,
  updatePhotographerVerification,
  updateContactRequestStatus,
  updateUserStatus,
} from "../services/adminService.js";
import { createCategory, updateCategory } from "../services/userService.js";
import { listPhotographers } from "../services/photographerService.js";
import { assert } from "../utils/errors.js";
import { decodeSegment, sendJson } from "../utils/http.js";
import { db } from "../db/database.js";

export async function handleAdmin({ request, response, url, body, user }) {
  if (!url.pathname.startsWith("/api/v1/admin")) return false;
  const current = requireRole(user, "admin");
  void current;
  const method = request.method;
  const path = url.pathname;

  if (method === "GET" && path === "/api/v1/admin/users") {
    sendJson(response, 200, { users: listUsers(url.searchParams) });
    return true;
  }
  if (method === "GET" && path === "/api/v1/admin/customers") {
    sendJson(response, 200, { customers: listUsers(new URLSearchParams("role=customer")) });
    return true;
  }
  if (method === "GET" && path === "/api/v1/admin/photographers") {
    sendJson(response, 200, {
      photographers: listPhotographers(url.searchParams),
      total: db.prepare("SELECT COUNT(*) AS count FROM photographer_profiles").get().count,
    });
    return true;
  }
  if (method === "GET" && path === "/api/v1/admin/bookings") {
    sendJson(response, 200, { bookings: listAdminBookings(url.searchParams) });
    return true;
  }
  if (method === "GET" && path === "/api/v1/admin/reviews") {
    sendJson(response, 200, { reviews: listAdminReviews(url.searchParams) });
    return true;
  }
  if (method === "GET" && path === "/api/v1/admin/categories") {
    sendJson(
      response,
      200,
      {
        categories: db
          .prepare("SELECT id, name, active FROM categories ORDER BY name")
          .all()
          .map((item) => ({ ...item, active: Boolean(item.active) })),
      },
    );
    return true;
  }
  if (method === "POST" && path === "/api/v1/admin/categories") {
    sendJson(response, 201, { category: createCategory(body.name) });
    return true;
  }
  if (method === "GET" && path === "/api/v1/admin/contact-requests") {
    sendJson(response, 200, { contactRequests: listContactRequests() });
    return true;
  }
  const contactMatch = path.match(/^\/api\/v1\/admin\/contact-requests\/([^/]+)$/);
  if (method === "PATCH" && contactMatch) {
    sendJson(response, 200, {
      contactRequest: updateContactRequestStatus(
        decodeSegment(contactMatch[1]),
        body.status,
      ),
    });
    return true;
  }
  if (method === "GET" && path === "/api/v1/admin/activity") {
    sendJson(response, 200, {
      activity: {
        users: db.prepare("SELECT COUNT(*) AS count FROM users").get().count,
        photographers: db.prepare("SELECT COUNT(*) AS count FROM photographer_profiles").get().count,
        bookings: db.prepare("SELECT COUNT(*) AS count FROM bookings").get().count,
        pendingBookings: db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status = 'pending'").get().count,
        reviews: db.prepare("SELECT COUNT(*) AS count FROM reviews").get().count,
      },
    });
    return true;
  }

  const statusMatch = path.match(/^\/api\/v1\/admin\/users\/([^/]+)\/status$/);
  if (method === "PATCH" && statusMatch) {
    sendJson(response, 200, {
      user: updateUserStatus(decodeSegment(statusMatch[1]), body.status),
    });
    return true;
  }
  const verifyMatch = path.match(/^\/api\/v1\/admin\/photographers\/([^/]+)\/verify$/);
  if (method === "PATCH" && verifyMatch) {
    assert(typeof body.verified === "boolean", 400, "VALIDATION_ERROR", "Verified must be a boolean.");
    sendJson(response, 200, {
      photographer: updatePhotographerVerification(
        decodeSegment(verifyMatch[1]),
        body.verified,
      ),
    });
    return true;
  }
  const reviewMatch = path.match(/^\/api\/v1\/admin\/reviews\/([^/]+)\/moderation$/);
  if (method === "PATCH" && reviewMatch) {
    sendJson(response, 200, {
      review: moderateReview(
        decodeSegment(reviewMatch[1]),
        body.status,
      ),
    });
    return true;
  }
  const categoryMatch = path.match(/^\/api\/v1\/admin\/categories\/([^/]+)$/);
  if (method === "PATCH" && categoryMatch) {
    sendJson(response, 200, {
      category: updateCategory(decodeSegment(categoryMatch[1]), body),
    });
    return true;
  }
  if (method === "DELETE" && categoryMatch) {
    const id = decodeSegment(categoryMatch[1]);
    const result = db.prepare("UPDATE categories SET active = 0 WHERE id = ?").run(id);
    assert(result.changes > 0, 404, "CATEGORY_NOT_FOUND", "Category not found.");
    sendJson(response, 200, { success: true });
    return true;
  }
  return false;
}
