import { requireAuth } from "../middleware/auth.js";
import {
  clearSessionCookie,
  revokeSession,
  sessionCookie,
} from "../utils/security.js";
import { sendJson } from "../utils/http.js";
import { changePassword, login, register } from "../services/authService.js";

export async function handleAuth({ request, response, url, body, user }) {
  const { method } = request;
  const path = url.pathname;
  const authMatch = path.match(/^\/api\/v1\/auth\/(customer|photographer|admin)\/(login|register)$/);
  if (method === "POST" && authMatch) {
    const [, role, action] = authMatch;
    if (action === "register") {
      if (role === "admin") return false;
      const result = await register(role, body);
      sendJson(response, 201, { user: result.user }, {
        "Set-Cookie": sessionCookie(result.token),
      });
      return true;
    }
    const result = await login(role, body);
    sendJson(response, 200, { user: result.user }, {
      "Set-Cookie": sessionCookie(result.token),
    });
    return true;
  }

  if (method === "GET" && path === "/api/v1/auth/me") {
    const current = requireAuth(user);
    sendJson(response, 200, {
      user: {
        id: current.id,
        name: current.name,
        email: current.email,
        role: current.role,
        photoUrl: current.photo_url || null,
        gender: current.gender || null,
        dateOfBirth: current.date_of_birth || null,
        location: current.location || null,
      },
    });
    return true;
  }

  if (method === "POST" && path === "/api/v1/auth/logout") {
    if (user?.sessionToken) revokeSession(user.sessionToken);
    sendJson(response, 200, { success: true }, { "Set-Cookie": clearSessionCookie() });
    return true;
  }

  if (method === "POST" && path === "/api/v1/auth/password") {
    const current = requireAuth(user);
    await changePassword(current, body);
    sendJson(response, 200, { success: true }, { "Set-Cookie": clearSessionCookie() });
    return true;
  }

  return false;
}
