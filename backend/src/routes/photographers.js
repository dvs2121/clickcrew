import { requireRole } from "../middleware/auth.js";
import {
  getPhotographer,
  getPhotographerReviews,
  listPhotographers,
  replaceCameraDetails,
  replacePortfolio,
  updatePhotographerProfile,
  updatePricing,
} from "../services/photographerService.js";
import { assert } from "../utils/errors.js";
import { decodeSegment, sendJson } from "../utils/http.js";
import { db } from "../db/database.js";

export async function handlePhotographers({ request, response, url, body, user }) {
  const method = request.method;
  const path = url.pathname;

  if (method === "GET" && path === "/api/v1/photographers") {
    sendJson(response, 200, { photographers: listPhotographers(url.searchParams) });
    return true;
  }

  if (method === "GET" && path === "/api/v1/photographers/me/profile") {
    const current = requireRole(user, "photographer");
    sendJson(response, 200, { photographer: getPhotographer(current.id) });
    return true;
  }

  const selfRoute = path.match(/^\/api\/v1\/photographers\/me\/(profile|availability|pricing|portfolio|equipment|camera-details)$/);
  if (selfRoute && ["PATCH", "PUT"].includes(method)) {
    const current = requireRole(user, "photographer");
    const [, resource] = selfRoute;
    if (resource === "profile") {
      sendJson(response, 200, { photographer: updatePhotographerProfile(current.id, body) });
    } else if (resource === "availability") {
      assert(typeof body.available === "boolean", 400, "VALIDATION_ERROR", "Availability must be a boolean.");
      db.prepare("UPDATE photographer_profiles SET available = ? WHERE user_id = ?").run(Number(body.available), current.id);
      sendJson(response, 200, { photographer: getPhotographer(current.id) });
    } else if (resource === "pricing") {
      sendJson(response, 200, { photographer: updatePricing(current.id, body) });
    } else if (resource === "portfolio") {
      sendJson(response, 200, { portfolio: replacePortfolio(current.id, body.images) });
    } else {
      const equipment = body.equipment || body.cameras;
      sendJson(response, 200, { equipment: replaceCameraDetails(current.id, equipment) });
    }
    return true;
  }

  const reviewMatch = path.match(/^\/api\/v1\/photographers\/([^/]+)\/reviews$/);
  if (method === "GET" && reviewMatch) {
    sendJson(response, 200, {
      reviews: getPhotographerReviews(decodeSegment(reviewMatch[1])),
    });
    return true;
  }

  const photographerMatch = path.match(/^\/api\/v1\/photographers\/([^/]+)$/);
  if (method === "GET" && photographerMatch) {
    const photographer = getPhotographer(decodeSegment(photographerMatch[1]));
    sendJson(response, 200, { photographer });
    return true;
  }
  return false;
}
