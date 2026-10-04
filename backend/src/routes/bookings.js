import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createReview,
  getCustomerReview,
  listBookings,
  requestBooking,
  updateBookingStatus,
} from "../services/bookingService.js";
import { decodeSegment, sendJson } from "../utils/http.js";

export async function handleBookings({ request, response, url, body, user }) {
  const method = request.method;
  const path = url.pathname;

  if (method === "POST" && path === "/api/v1/bookings") {
    const current = requireRole(user, "customer");
    sendJson(response, 201, { booking: requestBooking(current.id, body) });
    return true;
  }
  if (method === "GET" && path === "/api/v1/bookings") {
    sendJson(response, 200, { bookings: listBookings(requireAuth(user)) });
    return true;
  }

  const bookingReview = path.match(/^\/api\/v1\/bookings\/([^/]+)\/reviews$/);
  if (method === "GET" && bookingReview) {
    const current = requireRole(user, "customer");
    sendJson(response, 200, {
      review: getCustomerReview(current.id, decodeSegment(bookingReview[1])),
    });
    return true;
  }
  if (method === "POST" && bookingReview) {
    const current = requireRole(user, "customer");
    sendJson(response, 201, {
      review: createReview(current.id, {
        ...body,
        bookingId: decodeSegment(bookingReview[1]),
      }),
    });
    return true;
  }

  const statusMatch = path.match(/^\/api\/v1\/bookings\/([^/]+)\/status$/);
  if (method === "PATCH" && statusMatch) {
    sendJson(response, 200, {
      booking: updateBookingStatus(
        requireRole(user, "customer", "photographer", "admin"),
        decodeSegment(statusMatch[1]),
        body.status,
      ),
    });
    return true;
  }

  return false;
}
