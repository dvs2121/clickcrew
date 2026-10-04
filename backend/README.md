# ClickCrew backend

The backend is an independent Node.js HTTP API. It uses Node's built-in
`node:sqlite` database driver and has no third-party runtime dependencies.

## Requirements and setup

- Node.js 22.13 or newer
- SQLite is provided through `node:sqlite`

From the `backend/` directory:

```sh
cp .env.example .env
# Edit .env and replace AUTH_SECRET. Configure an admin bootstrap account if needed.
npm start
```

The server listens on `PORT` (default `3000`) and stores SQLite data at
`DATABASE_URL` (default `file:./data/clickcrew.sqlite`). The database schema is
created on startup. `DATABASE_PATH=:memory:` is useful for isolated tests.

`AUTH_SECRET` must be at least 32 characters in production. Configure
`CORS_ORIGIN` to the exact frontend origin; credentials are never allowed from
arbitrary origins. Set `COOKIE_SECURE=true` when serving over HTTPS (it is
automatically enabled in production).

There is no public admin registration. To provision the first administrator,
set both `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD`; the password
must be at least 16 characters. The account is created once when the database
does not already contain that email. Do not commit the resulting `.env` file.

## API overview

All endpoints are versioned under `/api/v1`.

- `GET /health`
- `POST /auth/customer/register`, `POST /auth/customer/login`
- `POST /auth/photographer/register`, `POST /auth/photographer/login`
- `POST /auth/admin/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /photographers`, `GET /photographers/:id`, `GET /photographers/:id/reviews`
- `GET|PATCH /photographers/me/profile`
- `PATCH /photographers/me/availability`, `PATCH /photographers/me/pricing`
- `PUT /photographers/me/portfolio`, `PUT /photographers/me/equipment`
- `GET|PATCH /customers/me`
- `GET|POST /bookings`, `PATCH /bookings/:id/status`
- `GET|POST|DELETE /favorites`
- `POST /reviews`, `GET /bookings/:id/reviews`
- `GET /categories`, `GET /notifications`, `PATCH /notifications/:id/read`
- `GET /dashboard/:role`
- Protected operations under `/admin` for user, photographer, booking, category,
  review, contact-request, and activity management.

Authentication uses a random, expiring, HTTP-only session cookie. Passwords are
stored as salted scrypt hashes. Request failures use
`{ "error": { "code": "...", "message": "..." } }`.

Bookings store server-calculated INR amounts for hourly or per-photo pricing.
No payment is taken; the payments table provides a future provider/status
record without pretending that a payment has been authorized or captured.

## Tests

```sh
npm test
```

The integration test launches a separate server against a temporary SQLite
database and exercises authentication, role restrictions, profile updates,
discovery, favorites, both pricing models, booking transitions, reviews,
notifications, admin operations, and CORS rejection.
