import { HttpError } from "./errors.js";

const MAX_BODY_BYTES = 1024 * 1024;

export function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(body));
}

export function sendError(response, error) {
  const status = error instanceof HttpError ? error.status : 500;
  const code = error instanceof HttpError ? error.code : "INTERNAL_ERROR";
  const message =
    error instanceof HttpError
      ? error.message
      : "An unexpected server error occurred.";
  sendJson(response, status, {
    error: {
      code,
      message,
      ...(error instanceof HttpError && error.details
        ? { details: error.details }
        : {}),
    },
  });
  if (status >= 500) {
    console.error(error);
  }
}

export async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    }
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (value === null || Array.isArray(value) || typeof value !== "object") {
      throw new Error("Expected an object.");
    }
    return value;
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
}

export function decodeSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new HttpError(400, "INVALID_PATH", "Path contains invalid encoding.");
  }
}

export function notFound() {
  throw new HttpError(404, "NOT_FOUND", "The requested resource was not found.");
}
