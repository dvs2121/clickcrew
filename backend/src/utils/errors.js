export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function assert(condition, status, code, message, details) {
  if (!condition) throw new HttpError(status, code, message, details);
}

export function requiredText(value, field, { max = 300, min = 1 } = {}) {
  assert(typeof value === "string", 400, "VALIDATION_ERROR", `${field} is required.`);
  const normalized = value.trim();
  assert(
    normalized.length >= min && normalized.length <= max,
    400,
    "VALIDATION_ERROR",
    `${field} must be between ${min} and ${max} characters.`,
  );
  return normalized;
}

export function optionalText(value, field, max = 2000) {
  if (value === undefined || value === null || value === "") return "";
  return requiredText(value, field, { max, min: 0 });
}

export function validEmail(value) {
  assert(
    typeof value === "string" &&
      value.length <= 254 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    400,
    "VALIDATION_ERROR",
    "A valid email address is required.",
  );
  return value.trim().toLowerCase();
}
