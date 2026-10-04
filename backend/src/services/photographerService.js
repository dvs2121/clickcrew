import { db, transaction } from "../db/database.js";
import { HttpError, assert, optionalText, requiredText } from "../utils/errors.js";
import { newId } from "../utils/security.js";

export const defaultCategories = [
  "Wedding",
  "Birthday",
  "Couple",
  "Travel",
  "Party",
  "College Events",
  "Personal Shoot",
  "Portrait",
];

export function ensureDefaultCategories() {
  const insert = db.prepare("INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)");
  for (const name of defaultCategories) {
    insert.run(name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"), name);
  }
}

function relatedValues(table, column, photographerId, projection, orderBy = "rowid") {
  return db
    .prepare(
      `SELECT ${projection} FROM ${table} WHERE ${column} = ? ORDER BY ${orderBy}`,
    )
    .all(photographerId);
}

function normalizeProfile(row) {
  if (!row) return null;
  const categories = relatedValues(
    "photographer_categories pc JOIN categories c ON c.id = pc.category_id",
    "pc.photographer_id",
    row.id,
    "c.name",
    "c.name",
  ).map((item) => item.name);
  const camera = relatedValues(
    "camera_details",
    "photographer_id",
    row.id,
    "name",
  ).map((item) => item.name);
  const portfolio = relatedValues(
    "portfolio",
    "photographer_id",
    row.id,
    "id, image_url AS imageUrl, caption",
    "position",
  );

  return {
    id: row.id,
    name: row.name,
    rating: Number(row.rating || 0),
    reviews: Number(row.review_count || 0),
    city: row.city,
    region: row.region,
    location: row.location || [row.city, row.region].filter(Boolean).join(", "),
    specialties: categories,
    equipment: camera,
    price: Number(row.hourly_rate || 0),
    hourlyRate: Number(row.hourly_rate || 0),
    photoRate: Number(row.photo_rate || 0),
    available: Boolean(row.available),
    verified: Boolean(row.verified),
    image: row.photo_url || "",
    photoUrl: row.photo_url || "",
    gender: row.gender || null,
    dateOfBirth: row.date_of_birth || null,
    about: row.bio || "",
    portfolio,
  };
}

const profileSelect = `SELECT u.id, u.name, u.photo_url, u.location, u.gender,
  u.date_of_birth, p.city, p.region,
  p.bio, p.hourly_rate, p.photo_rate, p.available, p.verified, p.rating, p.review_count
  FROM photographer_profiles p JOIN users u ON u.id = p.user_id
  WHERE u.status = 'active'`;

export function listPhotographers(search) {
  const where = [];
  const values = [];
  const query = (search.get("search") || search.get("q") || "").trim();
  const location = (search.get("location") || "").trim();
  const category = (search.get("category") || "").trim();
  const type = (search.get("type") || "").trim();
  const maxPrice = Number(search.get("maxPrice") || search.get("price") || 0);
  const maxPhotoPrice = Number(search.get("maxPhotoPrice") || 0);
  const rating = Number(search.get("rating") || 0);
  const availability = search.get("availability");
  const equipment = (search.get("equipment") || "").trim();
  const date = (search.get("date") || "").trim();
  const time = (search.get("time") || "").trim().toLowerCase();

  for (const [name, value] of [
    ["Maximum hourly price", maxPrice],
    ["Maximum photo price", maxPhotoPrice],
    ["Minimum rating", rating],
  ]) {
    assert(
      Number.isFinite(value) && value >= 0,
      400,
      "VALIDATION_ERROR",
      `${name} must be a non-negative number.`,
    );
  }

  if (query) {
    where.push("(u.name LIKE ? OR p.bio LIKE ? OR p.city LIKE ? OR p.region LIKE ?)");
    values.push(...Array(4).fill(`%${query}%`));
  }
  if (location) {
    where.push("(p.city LIKE ? OR p.region LIKE ? OR u.location LIKE ?)");
    values.push(...Array(3).fill(`%${location}%`));
  }
  if (category) {
    where.push(
      `EXISTS (
        SELECT 1 FROM photographer_categories pc
        JOIN categories c ON c.id = pc.category_id
        WHERE pc.photographer_id = p.user_id AND c.name LIKE ?
      )`,
    );
    values.push(`%${category}%`);
  }
  if (type) {
    where.push(
      `EXISTS (
        SELECT 1 FROM photographer_categories pc
        JOIN categories c ON c.id = pc.category_id
        WHERE pc.photographer_id = p.user_id AND c.name LIKE ?
      )`,
    );
    values.push(`%${type}%`);
  }
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    where.push("p.hourly_rate <= ?");
    values.push(maxPrice);
  }
  if (Number.isFinite(rating) && rating > 0) {
    where.push("p.rating >= ?");
    values.push(rating);
  }
  if (maxPhotoPrice > 0) {
    where.push("p.photo_rate <= ? AND p.photo_rate > 0");
    values.push(maxPhotoPrice);
  }
  if (equipment) {
    where.push(
      "EXISTS (SELECT 1 FROM camera_details cd WHERE cd.photographer_id = p.user_id AND cd.name LIKE ?)",
    );
    values.push(`%${equipment}%`);
  }
  if (date) {
    assert(/^\d{4}-\d{2}-\d{2}$/.test(date), 400, "VALIDATION_ERROR", "Date must use YYYY-MM-DD format.");
    where.push(
      `NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.photographer_id = p.user_id AND b.event_date = ?
          AND b.status IN ('pending', 'accepted')
      )`,
    );
    values.push(date);
  }
  if (time) {
    const periods = {
      morning: ["00:00", "12:00"],
      afternoon: ["12:00", "17:00"],
      evening: ["17:00", "23:59"],
    };
    assert(
      !time || periods[time],
      400,
      "VALIDATION_ERROR",
      "Time must be morning, afternoon, or evening.",
    );
    if (date && periods[time]) {
      where.pop();
      values.pop();
      const [start, end] = periods[time];
      where.push(
        `NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.photographer_id = p.user_id AND b.event_date = ?
            AND b.event_time >= ? AND b.event_time < ?
            AND b.status IN ('pending', 'accepted')
        )`,
      );
      values.push(date, start, end);
    }
  }
  if (availability === "true" || availability === "on") {
    where.push("p.available = 1");
  }
  const rows = db
    .prepare(
      `${profileSelect}${where.length ? ` AND ${where.join(" AND ")}` : ""}
       ORDER BY p.verified DESC, p.rating DESC, u.created_at DESC LIMIT 100`,
    )
    .all(...values);
  return rows.map(normalizeProfile);
}

export function getPhotographer(id) {
  const row = db
    .prepare(`${profileSelect} AND u.id = ?`)
    .get(id);
  if (!row) throw new HttpError(404, "PHOTOGRAPHER_NOT_FOUND", "Photographer not found.");
  return normalizeProfile(row);
}

export function getPhotographerReviews(id) {
  getPhotographer(id);
  return db
    .prepare(
      `SELECT r.id, r.rating, r.text, r.created_at AS createdAt,
              r.created_at AS date, b.event_type AS eventType,
              u.name AS author
       FROM reviews r
       JOIN users u ON u.id = r.customer_id
       JOIN bookings b ON b.id = r.booking_id
       WHERE r.photographer_id = ? AND r.status = 'visible'
       ORDER BY r.created_at DESC`,
    )
    .all(id);
}

export function updatePhotographerProfile(userId, body) {
  const profile = db
    .prepare("SELECT user_id FROM photographer_profiles WHERE user_id = ?")
    .get(userId);
  assert(profile, 404, "PROFILE_NOT_FOUND", "Photographer profile not found.");

  const fields = [];
  const values = [];
  const userFields = [];
  const userValues = [];
  const textFields = [
    ["bio", "bio", 3000],
    ["city", "city", 120],
    ["region", "region", 120],
  ];
  for (const [input, column, max] of textFields) {
    if (body[input] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(optionalText(body[input], input, max));
    }
  }
  if (body.name !== undefined) {
    userFields.push("name = ?");
    userValues.push(requiredText(body.name, "Name", { max: 120 }));
  }
  if (body.photoUrl !== undefined || body.image !== undefined) {
    const photo = body.photoUrl ?? body.image;
    if (photo) {
      assert(
        typeof photo === "string" && /^https?:\/\//i.test(photo),
        400,
        "VALIDATION_ERROR",
        "Profile photo must be an HTTP or HTTPS URL.",
      );
    }
    userFields.push("photo_url = ?");
    userValues.push(photo || null);
  }
  for (const [input, column] of [
    ["gender", "gender"],
    ["dateOfBirth", "date_of_birth"],
    ["location", "location"],
  ]) {
    if (body[input] !== undefined) {
      userFields.push(`${column} = ?`);
      userValues.push(body[input] || null);
    }
  }
  if (body.specialties !== undefined || body.categories !== undefined) {
    const categories = body.specialties ?? body.categories;
    assert(Array.isArray(categories) && categories.length <= 20, 400, "VALIDATION_ERROR", "Categories must be an array of at most 20 values.");
    const ids = categories.map((name) =>
      db.prepare("SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND active = 1").get(requiredText(name, "Category", { max: 100 }))?.id,
    );
    assert(ids.every(Boolean), 400, "INVALID_CATEGORY", "One or more categories are not available.");
    db.prepare("DELETE FROM photographer_categories WHERE photographer_id = ?").run(userId);
    const insert = db.prepare("INSERT INTO photographer_categories (photographer_id, category_id) VALUES (?, ?)");
    for (const categoryId of ids) insert.run(userId, categoryId);
  }
  if (fields.length) {
    values.push(userId);
    db.prepare(`UPDATE photographer_profiles SET ${fields.join(", ")} WHERE user_id = ?`).run(...values);
  }
  if (userFields.length) {
    userValues.push(userId);
    userFields.push("updated_at = CURRENT_TIMESTAMP");
    db.prepare(`UPDATE users SET ${userFields.join(", ")} WHERE id = ?`).run(...userValues);
  }
  return getPhotographer(userId);
}

export function replacePortfolio(userId, images) {
  assert(Array.isArray(images) && images.length <= 30, 400, "VALIDATION_ERROR", "Portfolio must contain at most 30 images.");
  const normalized = images.map((value) => {
    const imageUrl = typeof value === "string" ? value : value?.imageUrl || value?.url;
    const caption = typeof value === "string" ? "" : optionalText(value?.caption, "Caption", 300);
    assert(typeof imageUrl === "string" && /^https?:\/\//i.test(imageUrl), 400, "VALIDATION_ERROR", "Portfolio image URLs must use HTTP or HTTPS.");
    return { imageUrl, caption };
  });
  const insert = db.prepare("INSERT INTO portfolio (id, photographer_id, image_url, caption, position) VALUES (?, ?, ?, ?, ?)");
  transaction(() => {
    db.prepare("DELETE FROM portfolio WHERE photographer_id = ?").run(userId);
    normalized.forEach(({ imageUrl, caption }, index) => {
      insert.run(newId(), userId, imageUrl, caption, index);
    });
  });
  return getPhotographer(userId).portfolio;
}

export function replaceCameraDetails(userId, equipment) {
  assert(Array.isArray(equipment) && equipment.length <= 30, 400, "VALIDATION_ERROR", "Equipment must contain at most 30 items.");
  const normalized = equipment.map((item) =>
    requiredText(item, "Equipment", { max: 120 }),
  );
  const insert = db.prepare("INSERT INTO camera_details (id, photographer_id, name) VALUES (?, ?, ?)");
  transaction(() => {
    db.prepare("DELETE FROM camera_details WHERE photographer_id = ?").run(userId);
    for (const item of normalized) insert.run(newId(), userId, item);
  });
  return getPhotographer(userId).equipment;
}

export function updatePricing(userId, body) {
  const current = db.prepare("SELECT * FROM photographer_profiles WHERE user_id = ?").get(userId);
  assert(current, 404, "PROFILE_NOT_FOUND", "Photographer profile not found.");
  const hourlyRate = body.hourlyRate === undefined ? current.hourly_rate : Number(body.hourlyRate);
  const photoRate = body.photoRate === undefined ? current.photo_rate : Number(body.photoRate);
  assert(Number.isInteger(hourlyRate) && hourlyRate >= 0 && hourlyRate <= 10000000, 400, "VALIDATION_ERROR", "Hourly rate must be a non-negative integer.");
  assert(Number.isInteger(photoRate) && photoRate >= 0 && photoRate <= 1000000, 400, "VALIDATION_ERROR", "Photo rate must be a non-negative integer.");
  db.prepare("UPDATE photographer_profiles SET hourly_rate = ?, photo_rate = ? WHERE user_id = ?").run(hourlyRate, photoRate, userId);
  return getPhotographer(userId);
}
