# ClickCrew frontend

This is the existing ClickCrew HTML, CSS, and JavaScript application, preserved
inside its own directory. No frontend build step is required.

## Run locally

Serve this directory with a static HTTP server and open its `index.html`. Avoid
opening pages directly with `file://`, since browser security policies restrict
API requests from local files.

The API client defaults to the local backend at `http://localhost:3000/api/v1`
when the frontend is served from a static local server such as
`python3 -m http.server 5500`, while keeping `/api/v1` for same-origin
production deployments. Override it by adding
`<meta name="api-base-url" content="http://localhost:3000/api/v1">` to a page's
`<head>`, or by setting `window.CLICKCREW_CONFIG.API_BASE_URL` before loading
`js/api.js`.

Pages remain grouped in the existing `pages/` and `dashboard/` directories.
Their relative CSS and JavaScript references are intentional.
