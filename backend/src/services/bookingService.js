import { db, transaction } from "../db/database.js";
import { HttpError, assert, optionalText, requiredText } from "../utils/errors.js";
import { newId } from "../utils/security.js";
import { notify } from "./notificationService.js";

const bookingSelect = `SELECT b.*, c.name AS customer_name,
  p.name AS photographer_name
  FROM bookings b
  JOIN users c ON c.id = b.customer_id
  JOIN users p ON p.id = b.photographer_id`;

function normalizeBooking(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    photographerId: row.photographer_id,
    customerName: row.customer_name,
    photographerName: row.photographer_name,
    eventType: row.event_type,
    date: row.event_date,
    time: row.event_time,
    hours: row.hours,
    photoCount: row.photo_count,
    pricingModel: row.pricing_model,
    location: row.location,
    notes: row.notes,
    equipmentPreference: row.equipment_preference,
    estimatedPrice: row.price,
    price: row.price,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function requestBooking(customerId, body) {
  const photographerId = requiredText(body.photographerId, "Photographer", { max: 100 });
  const photographer = db
    .prepare(
      `SELECT p.user_id, p.hourly_rate, p.photo_rate, p.available, u.status
       FROM photographer_profiles p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?`,
    )
    .get(photographerId);
  assert(photographer && photographer.status === "active", 404, "PHOTOGRAPHER_NOT_FOUND", "Photographer not found.");
  assert(photographer.available, 409, "PHOTOGRAPHER_UNAVAILABLE", "This photographer is not currently accepting requests.");

  const eventType = requiredText(body.eventType, "Event type", { max: 120 });
  const date = requiredText(body.date, "Date", { max: 10 });
  const time = requiredText(body.time, "Time", { max: 5 });
  assert(/^\d{4}-\d{2}-\d{2}$/.test(date), 400, "VALIDATION_ERROR", "Date must use YYYY-MM-DD format.");
  assert(/^([01]\d|2[0-3]):[0-5]\d$/.test(time), 400, "VALIDATION_ERROR", "Time must use HH:MM format.");
  const parsedDate = new Date(`${date}T00:00:00Z`);
  assert(
    Number.isFinite(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === date,
    400,
    "INVALID_BOOKING_DATE",
    "Booking date is not a valid calendar date.",
  );
  const eventAt = new Date(`${date}T${time}:00`);
  assert(Number.isFinite(eventAt.getTime()) && eventAt.getTime() > Date.now(), 400, "INVALID_BOOKING_DATE", "Booking date and time must be in the future.");

  const pricingModel = body.pricingModel === "photos" ? "photos" : "hourly";
  const hours = Number(body.hours ?? 1);
  assert(Number.isInteger(hours) && hours >= 1 && hours <= 24, 400, "VALIDATION_ERROR", "Hours must be between 1 and 24.");
  const photoCount =
    body.photoCount === undefined || body.photoCount === null || body.photoCount === ""
      ? null
      : Number(body.photoCount);
  if (pricingModel === "photos") {
    assert(photographer.photo_rate > 0, 400, "PRICING_UNAVAILABLE", "This photographer has not configured per-photo pricing.");
    assert(Number.isInteger(photoCount) && photoCount >= 1 && photoCount <= 10000, 400, "VALIDATION_ERROR", "Photo count must be between 1 and 10000.");
  }
  if (pricingModel === "hourly") {
    assert(photographer.hourly_rate > 0, 400, "PRICING_UNAVAILABLE", "This photographer has not configured hourly pricing.");
  }
  const existing = db
    .prepare(
      `SELECT event_date, event_time, hours FROM bookings
       WHERE photographer_id = ?
         AND event_date BETWEEN date(?, '-1 day') AND date(?, '+1 day')
         AND status IN ('pending', 'accepted')`,
    )
    .all(photographerId, date, date);
  const overlaps = existing.some((booking) => {
    const existingStart = new Date(
      `${booking.event_date}T${booking.event_time}:00`,
    ).getTime();
    const existingEnd = existingStart + booking.hours * 60 * 60 * 1000;
    const requestedStart = eventAt.getTime();
    const requestedEnd = requestedStart + hours * 60 * 60 * 1000;
    return requestedStart < existingEnd && existingStart < requestedEnd;
  });
  assert(!overlaps, 409, "TIME_SLOT_UNAVAILABLE", "This photographer already has a request or booking at that time.");
  const price =
    pricingModel === "photos"
      ? photographer.photo_rate * photoCount
      : photographer.hourly_rate * hours;
  assert(Number.isSafeInteger(price) && price <= 1000000000, 400, "PRICE_LIMIT", "Calculated booking price is out of range.");

  const bookingId = newId();
  transaction(() => {
    db.prepare(
      `INSERT INTO bookings
       (id, customer_id, photographer_id, event_type, event_date, event_time,
        hours, photo_count, pricing_model, location, notes, equipment_preference, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      bookingId,
      customerId,
      photographerId,
      eventType,
      date,
      time,
      hours,
      photoCount,
      pricingModel,
      requiredText(body.location, "Location", { max: 300 }),
      optionalText(body.notes, "Notes", 3000),
      optionalText(body.equipment, "Equipment preference", 200),
      price,
    );
    notify(photographerId, "booking.requested", "You have a new booking request.", {
      bookingId,
    });
  });
  return getBooking(bookingId);
}

export function getBooking(id) {
  const row = db.prepare(`${bookingSelect} WHERE b.id = ?`).get(id);
  if (!row) throw new HttpError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  return normalizeBooking(row);
}

export function listBookings(user) {
  let where = "";
  let values = [];
  if (user.role === "customer") {
    where = "WHERE b.customer_id = ?";
    values = [user.id];
  } else if (user.role === "photographer") {
    where = "WHERE b.photographer_id = ?";
    values = [user.id];
  }
  return db
    .prepare(`${bookingSelect} ${where} ORDER BY b.created_at DESC LIMIT 200`)
    .all(...values)
    .map(normalizeBooking);
}

export function updateBookingStatus(user, id, nextStatus) {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
  assert(booking, 404, "BOOKING_NOT_FOUND", "Booking not found.");
  const status = requiredText(nextStatus, "Status", { max: 20 }).toLowerCase();
  const isAdmin = user.role === "admin";
  const isPhotographer =
    user.role === "photographer" && booking.photographer_id === user.id;
  const isCustomer = user.role === "customer" && booking.customer_id === user.id;

  if (isPhotographer) {
    assert(
      (booking.status === "pending" && ["accepted", "rejected"].includes(status)) ||
        (booking.status === "accepted" && status === "completed"),
      409,
      "INVALID_STATUS_TRANSITION",
      "This booking cannot be moved to that status.",
    );
  } else if (isCustomer) {
    assert(
      ["pending", "accepted"].includes(booking.status) && status === "cancelled",
      409,
      "INVALID_STATUS_TRANSITION",
      "Only pending or accepted bookings can be cancelled.",
    );
  } else if (isAdmin) {
    assert(
      ["pending", "accepted", "rejected", "cancelled", "completed"].includes(status),
      400,
      "VALIDATION_ERROR",
      "Invalid booking status.",
    );
  } else {
    throw new HttpError(403, "FORBIDDEN", "You cannot update this booking.");
  }

  transaction(() => {
    db.prepare(
      "UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(status, id);
    const recipient =
      isPhotographer || isAdmin ? booking.customer_id : booking.photographer_id;
    notify(
      recipient,
      `booking.${status}`,
      `Your booking request was ${status}.`,
      { bookingId: id },
    );
  });
  return getBooking(id);
}

export function createReview(customerId, body) {
  const bookingId = requiredText(body.bookingId, "Booking", { max: 100 });
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);
  assert(booking, 404, "BOOKING_NOT_FOUND", "Booking not found.");
  assert(booking.customer_id === customerId, 403, "FORBIDDEN", "You can only review your own booking.");
  assert(booking.status === "completed", 409, "BOOKING_NOT_COMPLETED", "Only completed bookings can be reviewed.");
  const rating = Number(body.rating);
  assert(Number.isInteger(rating) && rating >= 1 && rating <= 5, 400, "VALIDATION_ERROR", "Rating must be between 1 and 5.");
  const text = requiredText(body.text || body.comment, "Review", { max: 3000, min: 2 });
  const reviewId = newId();

  try {
    transaction(() => {
      db.prepare(
        "INSERT INTO reviews (id, booking_id, customer_id, photographer_id, rating, text) VALUES (?, ?, ?, ?, ?, ?)",
      ).run(reviewId, bookingId, customerId, booking.photographer_id, rating, text);
      const aggregate = db
        .prepare(
          "SELECT AVG(rating) AS rating, COUNT(*) AS count FROM reviews WHERE photographer_id = ? AND status = 'visible'",
        )
        .get(booking.photographer_id);
      db.prepare(
        "UPDATE photographer_profiles SET rating = ?, review_count = ? WHERE user_id = ?",
      ).run(aggregate.rating || 0, aggregate.count, booking.photographer_id);
      notify(booking.photographer_id, "review.received", "A customer left you a review.", {
        reviewId,
      });
    });
  } catch (error) {
    if (/UNIQUE constraint failed: reviews.booking_id/i.test(error.message)) {
      throw new HttpError(409, "DUPLICATE_REVIEW", "This booking already has a review.");
    }
    throw error;
  }
  return db.prepare("SELECT * FROM reviews WHERE id = ?").get(reviewId);
}

export function getCustomerReview(customerId, bookingId) {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);
  assert(booking, 404, "BOOKING_NOT_FOUND", "Booking not found.");
  assert(booking.customer_id === customerId, 403, "FORBIDDEN", "You can only view your own booking review.");
  return db
    .prepare(
      "SELECT id, booking_id AS bookingId, rating, text, status, created_at AS createdAt FROM reviews WHERE booking_id = ?",
    )
    .get(bookingId) || null;
}
