# ClickCrew

ClickCrew is a photographer marketplace that retains the existing plain
HTML/CSS/JavaScript frontend and runs its API as a separate Node.js application.

## Project structure

```text
frontend/
  index.html
  pages/
  dashboard/
  css/
  js/
backend/
  src/config/
  src/db/
  src/middleware/
  src/routes/
  src/services/
  src/utils/
  test/
```

The existing page and dashboard paths were preserved under `frontend/` so their
relative asset references continue to work. There is no frontend framework or
build step.

## Requirements

- Node.js 22.13 or newer (the API uses built-in `node:sqlite`)
- A static HTTP server for `frontend/`

## Configure and run

1. Configure the API:

   ```sh
   cp backend/.env.example backend/.env
   ```

   Set `AUTH_SECRET` to a unique random value. Set `CORS_ORIGIN` to the exact
   origin serving the frontend. For an admin account, set both
   `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` (minimum 16
   characters). Admin registration is not public. By default, the API allows
   the local frontend origin `http://localhost:5500`.

2. Install the root development launcher and start both existing applications:

   ```sh
   npm install
   npm run dev
   ```

   The root package only runs the existing backend development script and
   serves `frontend/` with Python's built-in static HTTP server. Open
   `http://localhost:5500`; the API listens at `http://localhost:3000` and
   initializes `backend/data/clickcrew.sqlite` from the SQL schema at startup.

   The frontend's existing API client selects `http://localhost:3000/api/v1`
   when served locally. For other deployments, it retains `/api/v1` for
   same-origin hosting; configure the API base URL and backend `CORS_ORIGIN`
   as appropriate.

Do not expose `.env`, `DATABASE_URL`, `AUTH_SECRET`, admin bootstrap credentials,
or other private values to frontend JavaScript. `.env` files and local database
files are ignored by Git.

## Database and API

SQLite is persistent and authoritative for users, customer and photographer
profiles, categories, camera details, portfolio entries, bookings, favorites,
reviews, notifications, sessions, admin records, and contact requests. The
`payments` table is only a future integration record: no payment processor or
payment capture is implemented.

REST endpoints are versioned below `/api/v1`. `GET /api/v1/health` checks the
server and database. Route handlers enforce session and role authorization;
server-side booking pricing is derived from stored hourly/per-photo rates.
Detailed endpoint and environment information is in [backend/README.md](./backend/README.md).

## Tests and development workflow

```sh
cd backend
npm test
```

Tests use a temporary database; they do not create built-in test users in the
development database. Register customer and photographer accounts through the
frontend. Provision an administrator only with the bootstrap environment
variables. During development, run both services from the project root with
`npm run dev`.

The frontend setup notes are in [frontend/README.md](./frontend/README.md).
