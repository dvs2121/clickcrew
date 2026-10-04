const defaultApiBaseUrl = (() => {
  const configured =
    window.CLICKCREW_CONFIG?.API_BASE_URL ||
    document.querySelector('meta[name="api-base-url"]')?.content;
  if (configured) {
    return configured;
  }

  const hostname = window.location.hostname;
  if (window.location.protocol === "file:") {
    return "http://localhost:3000/api/v1";
  }
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    if (window.location.port === "3000") {
      return `${window.location.origin || "http://localhost:3000"}/api/v1`;
    }
    return `http://${hostname === "127.0.0.1" ? "127.0.0.1" : "localhost"}:3000/api/v1`;
  }
  return "/api/v1";
})();

const API_BASE_URL = defaultApiBaseUrl.replace(/\/+$/, "");

class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status || 0;
    this.code = code || "NETWORK_ERROR";
    this.details = details;
  }
}

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "The API could not be reached.",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = result?.error || {};
    throw new ApiError(
      error.message || result?.message || `Request failed (${response.status})`,
      {
        status: response.status,
        code: error.code,
        details: error.details,
      },
    );
  }

  return result;
}

function withQuery(values = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

const api = {
  get(path) {
    return apiRequest(path, { method: "GET" });
  },
  post(path, body) {
    return apiRequest(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });
  },
  patch(path, body) {
    return apiRequest(path, {
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });
  },
  put(path, body) {
    return apiRequest(path, {
      method: "PUT",
      body: JSON.stringify(body ?? {}),
    });
  },
  delete(path) {
    return apiRequest(path, { method: "DELETE" });
  },
  auth: {
    register(role, body) {
      return api.post(`/auth/${encodeURIComponent(role)}/register`, body);
    },
    login(role, body) {
      return api.post(`/auth/${encodeURIComponent(role)}/login`, body);
    },
    currentUser() {
      return api.get("/auth/me");
    },
    logout() {
      return api.post("/auth/logout");
    },
  },
  photographers: {
    list(filters = {}) {
      return api.get(`/photographers${withQuery(filters)}`);
    },
    get(id) {
      return api.get(`/photographers/${encodeURIComponent(id)}`);
    },
    reviews(id) {
      return api.get(`/photographers/${encodeURIComponent(id)}/reviews`);
    },
    currentProfile() {
      return api.get("/photographers/me/profile");
    },
    updateProfile(body) {
      return api.patch("/photographers/me/profile", body);
    },
    updateAvailability(available) {
      return api.patch("/photographers/me/availability", { available });
    },
    updatePortfolio(images) {
      return api.put("/photographers/me/portfolio", { images });
    },
    updateEquipment(equipment) {
      return api.put("/photographers/me/equipment", { equipment });
    },
    updatePricing(body) {
      return api.patch("/photographers/me/pricing", body);
    },
  },
  customers: {
    currentProfile() {
      return api.get("/customers/me");
    },
    updateProfile(body) {
      return api.patch("/customers/me", body);
    },
  },
  dashboard(role) {
    return api.get(`/dashboard/${encodeURIComponent(role)}`);
  },
  bookings: {
    list() {
      return api.get("/bookings");
    },
    create(body) {
      return api.post("/bookings", body);
    },
    updateStatus(id, status) {
      return api.patch(`/bookings/${encodeURIComponent(id)}/status`, { status });
    },
    review(id, body) {
      return api.post(`/bookings/${encodeURIComponent(id)}/reviews`, body);
    },
    existingReview(id) {
      return api.get(`/bookings/${encodeURIComponent(id)}/reviews`);
    },
  },
  favorites: {
    list() {
      return api.get("/favorites");
    },
    add(photographerId) {
      return api.post(`/favorites/${encodeURIComponent(photographerId)}`);
    },
    remove(photographerId) {
      return api.delete(`/favorites/${encodeURIComponent(photographerId)}`);
    },
  },
  reviews: {
    create(body) {
      return api.post("/reviews", body);
    },
  },
  categories: {
    list() {
      return api.get("/categories");
    },
  },
  notifications: {
    list({ unread = false } = {}) {
      return api.get(`/notifications${withQuery({ unread: unread || "" })}`);
    },
    markRead(id) {
      return api.patch(`/notifications/${encodeURIComponent(id)}/read`, {});
    },
  },
  admin: {
    users(filters) {
      return api.get(`/admin/users${withQuery(filters)}`);
    },
    photographers(filters) {
      return api.get(`/admin/photographers${withQuery(filters)}`);
    },
    customers(filters) {
      return api.get(`/admin/customers${withQuery(filters)}`);
    },
    bookings(filters) {
      return api.get(`/admin/bookings${withQuery(filters)}`);
    },
    reviews(filters) {
      return api.get(`/admin/reviews${withQuery(filters)}`);
    },
    categories() {
      return api.get("/admin/categories");
    },
    createCategory(name) {
      return api.post("/admin/categories", { name });
    },
    updateCategory(id, body) {
      return api.patch(`/admin/categories/${encodeURIComponent(id)}`, body);
    },
    deleteCategory(id) {
      return api.delete(`/admin/categories/${encodeURIComponent(id)}`);
    },
    updateUserStatus(id, status) {
      return api.patch(`/admin/users/${encodeURIComponent(id)}/status`, { status });
    },
    verifyPhotographer(id, verified) {
      return api.patch(`/admin/photographers/${encodeURIComponent(id)}/verify`, {
        verified,
      });
    },
    moderateReview(id, status) {
      return api.patch(`/admin/reviews/${encodeURIComponent(id)}/moderation`, {
        status,
      });
    },
    activity() {
      return api.get("/admin/activity");
    },
    contactRequests() {
      return api.get("/admin/contact-requests");
    },
    updateContactRequest(id, status) {
      return api.patch(`/admin/contact-requests/${encodeURIComponent(id)}`, {
        status,
      });
    },
  },
};
