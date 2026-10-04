import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

const backendPath = new URL("..", import.meta.url).pathname;
const dataDirectory = mkdtempSync(join(tmpdir(), "clickcrew-api-test-"));
const databasePath = join(dataDirectory, "test.sqlite");
const adminEmail = "api-admin@clickcrew.test";
const adminPassword = "SecureAdminPass12345";
let child;
let baseUrl;
let childOutput = "";

async function availablePort() {
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const { port } = listener.address();
  await new Promise((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function api(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  const setCookie = response.headers.get("set-cookie")?.split(";")[0] || "";
  return { response, result, cookie: setCookie };
}

async function waitForServer() {
  const timeoutAt = Date.now() + 10000;
  while (Date.now() < timeoutAt) {
    if (child.exitCode !== null) {
      throw new Error(`Backend exited early: ${childOutput}`);
    }
    try {
      const result = await api("/api/v1/health");
      if (result.response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Backend did not start: ${childOutput}`);
}

before(async () => {
  const port = await availablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ["src/server.js"], {
    cwd: backendPath,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      DATABASE_PATH: databasePath,
      AUTH_SECRET: "test-secret-used-only-by-the-integration-test",
      CORS_ORIGIN: "http://localhost:5500",
      ADMIN_BOOTSTRAP_EMAIL: adminEmail,
      ADMIN_BOOTSTRAP_PASSWORD: adminPassword,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => {
    childOutput += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    childOutput += chunk.toString();
  });
  await waitForServer();
});

after(async () => {
  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([
      once(child, "exit"),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  }
  rmSync(dataDirectory, { recursive: true, force: true });
});

test("auth, roles, discovery, bookings, favorites, reviews, notifications, and admin APIs", async () => {
  const health = await api("/api/v1/health");
  assert.equal(health.response.status, 200);
  assert.deepEqual(health.result, { status: "ok", database: "ok" });

  assert.equal((await api("/api/v1/dashboard/customer")).response.status, 401);
  assert.equal(
    (
      await api("/api/v1/auth/admin/register", {
        method: "POST",
        body: {
          name: "Not an admin",
          email: "public-admin@clickcrew.test",
          password: "SecurePassword123",
        },
      })
    ).response.status,
    404,
  );

  const customerRegistration = await api("/api/v1/auth/customer/register", {
    method: "POST",
    body: {
      name: "Casey Customer",
      email: "casey@clickcrew.test",
      password: "StrongPassword123",
      gender: "Prefer not to say",
      dateOfBirth: "1995-02-03",
      location: "Mumbai",
    },
  });
  assert.equal(customerRegistration.response.status, 201);
  const customerCookie = customerRegistration.cookie;
  assert.ok(customerCookie.startsWith("clickcrew_session="));
  const customerId = customerRegistration.result.user.id;

  const duplicate = await api("/api/v1/auth/customer/register", {
    method: "POST",
    body: {
      name: "Casey Duplicate",
      email: "casey@clickcrew.test",
      password: "StrongPassword123",
    },
  });
  assert.equal(duplicate.response.status, 409);

  const photographerRegistration = await api(
    "/api/v1/auth/photographer/register",
    {
      method: "POST",
      body: {
        name: "Morgan Photographer",
        email: "morgan@clickcrew.test",
        password: "PhotographerPass123",
        city: "Mumbai",
        region: "Maharashtra",
      },
    },
  );
  assert.equal(photographerRegistration.response.status, 201);
  const photographerCookie = photographerRegistration.cookie;
  const photographerId = photographerRegistration.result.user.id;

  assert.equal(
    (
      await api("/api/v1/photographers/me/pricing", {
        method: "PATCH",
        cookie: photographerCookie,
        body: { hourlyRate: 1000, photoRate: 25 },
      })
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api("/api/v1/photographers/me/profile", {
        method: "PATCH",
        cookie: photographerCookie,
        body: {
          bio: "Documentary wedding photographer.",
          categories: ["Wedding", "Portrait"],
          photoUrl: "https://images.example.test/portrait.jpg",
        },
      })
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api("/api/v1/photographers/me/equipment", {
        method: "PUT",
        cookie: photographerCookie,
        body: { equipment: ["Sony A7 IV", "35mm Film"] },
      })
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api("/api/v1/photographers/me/portfolio", {
        method: "PUT",
        cookie: photographerCookie,
        body: {
          images: [
            "https://images.example.test/work-1.jpg",
            "https://images.example.test/work-2.jpg",
          ],
        },
      })
    ).response.status,
    200,
  );

  const listing = await api(
    "/api/v1/photographers?location=Mumbai&category=Wedding&maxPrice=1500",
  );
  assert.equal(listing.response.status, 200);
  assert.equal(listing.result.photographers.length, 1);
  assert.deepEqual(listing.result.photographers[0].equipment, [
    "Sony A7 IV",
    "35mm Film",
  ]);
  const profile = await api(`/api/v1/photographers/${photographerId}`);
  assert.equal(profile.result.photographer.id, photographerId);
  assert.equal(profile.result.photographer.portfolio.length, 2);

  assert.equal(
    (
      await api(`/api/v1/favorites/${photographerId}`, {
        method: "POST",
        cookie: customerCookie,
      })
    ).response.status,
    201,
  );
  assert.equal(
    (await api("/api/v1/favorites", { cookie: customerCookie })).result.favorites
      .length,
    1,
  );

  const day = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const bookingResponse = await api("/api/v1/bookings", {
    method: "POST",
    cookie: customerCookie,
    body: {
      photographerId,
      eventType: "Wedding",
      date: day,
      time: "23:59",
      hours: 2,
      location: "Mumbai",
      price: 1,
    },
  });
  assert.equal(bookingResponse.response.status, 201);
  const bookingId = bookingResponse.result.booking.id;
  assert.equal(bookingResponse.result.booking.price, 2000);
  assert.equal(bookingResponse.result.booking.status, "pending");
  assert.equal(
    (
      await api("/api/v1/bookings", {
        method: "POST",
        cookie: customerCookie,
        body: {
          photographerId,
          eventType: "Birthday",
          date: day,
          time: "23:59",
          hours: 1,
          location: "Mumbai",
        },
      })
    ).response.status,
    409,
  );

  const bookingList = await api("/api/v1/bookings", { cookie: customerCookie });
  assert.equal(bookingList.result.bookings.length, 1);
  const photoPricedBooking = await api("/api/v1/bookings", {
    method: "POST",
    cookie: customerCookie,
    body: {
      photographerId,
      eventType: "Portrait",
      date: day,
      time: "12:00",
      hours: 1,
      photoCount: 50,
      pricingModel: "photos",
      location: "Mumbai",
      price: 1,
    },
  });
  assert.equal(photoPricedBooking.response.status, 201);
  assert.equal(photoPricedBooking.result.booking.price, 1250);
  assert.equal(
    (
      await api(
        `/api/v1/bookings/${photoPricedBooking.result.booking.id}/status`,
        {
          method: "PATCH",
          cookie: customerCookie,
          body: { status: "cancelled" },
        },
      )
    ).result.booking.status,
    "cancelled",
  );
  assert.equal(
    (
      await api(`/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        cookie: photographerCookie,
        body: { status: "accepted" },
      })
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api(`/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        cookie: photographerCookie,
        body: { status: "completed" },
      })
    ).result.booking.status,
    "completed",
  );

  const review = await api("/api/v1/reviews", {
    method: "POST",
    cookie: customerCookie,
    body: { bookingId, rating: 5, text: "A wonderful experience." },
  });
  assert.equal(review.response.status, 201);
  assert.equal(
    (
      await api("/api/v1/reviews", {
        method: "POST",
        cookie: customerCookie,
        body: { bookingId, rating: 5, text: "A duplicate review." },
      })
    ).response.status,
    409,
  );
  assert.equal(
    (await api(`/api/v1/photographers/${photographerId}`)).result.photographer
      .rating,
    5,
  );

  const wrongPassword = await api("/api/v1/auth/customer/login", {
    method: "POST",
    body: { email: "casey@clickcrew.test", password: "IncorrectPass123" },
  });
  assert.equal(wrongPassword.response.status, 401);
  assert.equal(
    (
      await api("/api/v1/admin/users", { cookie: customerCookie })
    ).response.status,
    403,
  );

  const adminLogin = await api("/api/v1/auth/admin/login", {
    method: "POST",
    body: { email: adminEmail, password: adminPassword },
  });
  assert.equal(adminLogin.response.status, 200);
  const adminCookie = adminLogin.cookie;
  assert.equal(
    (
      await api("/api/v1/admin/users", { cookie: adminCookie })
    ).result.users.length,
    2,
  );
  assert.equal(
    (
      await api("/api/v1/admin/reviews", {
        method: "GET",
        cookie: adminCookie,
      })
    ).result.reviews.length,
    1,
  );
  assert.equal(
    (
      await api(`/api/v1/admin/reviews/${review.result.review.id}/moderation`, {
        method: "PATCH",
        cookie: adminCookie,
        body: { status: "hidden" },
      })
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api("/api/v1/admin/categories", {
        method: "POST",
        cookie: adminCookie,
        body: { name: "Nature" },
      })
    ).response.status,
    201,
  );
  assert.equal(
    (
      await api(`/api/v1/admin/photographers/${photographerId}/verify`, {
        method: "PATCH",
        cookie: adminCookie,
        body: { verified: true },
      })
    ).result.photographer.verified,
    true,
  );
  assert.equal(
    (await api(`/api/v1/photographers/${photographerId}`)).result.photographer
      .rating,
    0,
  );
  assert.ok(
    (await api("/api/v1/notifications", { cookie: photographerCookie })).result
      .notifications.some((item) => item.type === "booking.requested"),
  );
  assert.equal(
    (
      await api("/api/v1/dashboard/photographer", {
        cookie: photographerCookie,
      })
    ).response.status,
    200,
  );

  assert.equal(
    (
      await api("/api/v1/auth/logout", {
        method: "POST",
        cookie: customerCookie,
      })
    ).response.status,
    200,
  );
  assert.equal(
    (await api("/api/v1/auth/me", { cookie: customerCookie })).response.status,
    401,
  );
  assert.equal(
    (
      await api("/api/v1/health", {
        headers: { Origin: "https://untrusted.example" },
      })
    ).response.status,
    403,
  );
});
