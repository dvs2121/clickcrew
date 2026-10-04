function renderAuthChoice(mode) {
  const action = mode === "register" ? "Sign up" : "Log in";
  const verb = mode === "register" ? "Create an account" : "Welcome back";
  const route = mode === "register" ? "register" : "login";
  const roles = [
    {
      title: "Customer",
      detail: "Find your photographer and keep your plans together.",
      href: `pages/customer-${route}.html`,
      image:
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=85",
    },
    {
      title: "Photographer",
      detail: "Show your work, manage requests and grow your practice.",
      href: `pages/photographer-${route}.html`,
      image:
        "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1000&q=85",
    },
  ];
  const target = document.querySelector("[data-page-content]");
  target.innerHTML = `<section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">ClickCrew, for everyone behind the moment</p><h1>${verb}.</h1><p>Choose the space that brings you here.</p></div></section><section class="section role-choice-grid">${roles.map((role) => `<a class="role-choice" href="${appUrl(role.href)}"><img src="${role.image}" alt=""><div><p class="eyebrow">${action} as</p><h2>${role.title}</h2><p>${role.detail}</p><span class="text-link">Continue <span aria-hidden="true">→</span></span></div></a>`).join("")}</section><p class="admin-entry"><a href="${appUrl("pages/admin-login.html")}">Admin login</a></p>`;
}

function renderAuthPage(role, mode) {
  const isAdmin = role === "admin";
  const isRegister = mode === "register";
  const action = isRegister
    ? "Create your account"
    : isAdmin
      ? "Admin sign in"
      : "Welcome back";
  const roleLabel = isAdmin
    ? "ClickCrew admin"
    : role === "photographer"
      ? "For photographers"
      : "For customers";
  const image =
    role === "photographer"
      ? "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1300&q=85"
      : "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1300&q=85";
  const entry = isRegister ? "register" : "login";
  const switchHref = appUrl(
    isAdmin
      ? "pages/admin-login.html"
      : `pages/${role}-${isRegister ? "login" : "register"}.html`,
  );
  const switchLabel = isRegister
    ? "Already have an account? Log in"
    : "New to ClickCrew? Create an account";
  const fields = `${isRegister ? `<div class="form-field"><label class="form-label" for="auth-name">Full name</label><input class="form-control" id="auth-name" name="name" autocomplete="name" required></div>` : ""}<div class="form-field"><label class="form-label" for="auth-email">Email address</label><input class="form-control" id="auth-email" type="email" name="email" autocomplete="email" required></div><div class="form-field"><label class="form-label" for="auth-password">Password</label><input class="form-control" id="auth-password" type="password" name="password" autocomplete="${isRegister ? "new-password" : "current-password"}" minlength="${isRegister ? 10 : 1}" required></div>${isRegister && role === "photographer" ? `<div class="form-field"><label class="form-label" for="auth-city">Your city</label><input class="form-control" id="auth-city" name="city" autocomplete="address-level2" required></div>` : ""}`;

  const target = document.querySelector("[data-page-content]");
  target.innerHTML = `<section class="auth-layout"><div class="auth-visual"><img src="${image}" alt="A photographer capturing a meaningful moment"><div class="auth-visual-copy"><blockquote>“The best photographs feel like being there all over again.”</blockquote><p>ClickCrew · ${roleLabel}</p></div></div><div class="auth-panel"><p class="eyebrow">${roleLabel}</p><h1>${action}.</h1><p>${isRegister ? "A few details, then you're on your way." : "Your next favourite memory might be just around the corner."}</p>${!isAdmin ? `<nav class="role-switch" aria-label="Account type"><a class="${role === "customer" ? "is-active" : ""}" href="${appUrl(`pages/customer-${entry}.html`)}">Customer</a><a class="${role === "photographer" ? "is-active" : ""}" href="${appUrl(`pages/photographer-${entry}.html`)}">Photographer</a></nav>` : ""}<form class="auth-form" data-auth-form data-role="${role}" data-mode="${mode}">${fields}<button class="button button-primary" type="submit">${isRegister ? "Create account" : "Log in"} <span aria-hidden="true">→</span></button></form>${!isAdmin ? `<p class="auth-switch">${switchLabel.replace(isRegister ? "Log in" : "Create an account", `<a href="${switchHref}">${isRegister ? "Log in" : "Create an account"}</a>`)}</p>` : ""}<p class="auth-switch"><a href="${appUrl("index.html")}">Back to ClickCrew</a></p></div></section>`;
  target
    .querySelector("[data-auth-form]")
    .addEventListener("submit", submitAuthForm);
}

async function submitAuthForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const role = form.dataset.role;
  const mode = form.dataset.mode;
  const payload = Object.fromEntries(new FormData(form));
  if (role === "admin" && mode === "register") return;
  button.disabled = true;
  button.textContent =
    mode === "register" ? "Creating account…" : "Signing in…";
  try {
    if (mode === "register") await api.auth.register(role, payload);
    else await api.auth.login(role, payload);
    const { user } = await api.auth.currentUser();
    if (!user?.role) throw new Error("The authenticated account could not be verified.");
    sessionStorage.setItem("clickcrew.role", user.role);
    const destination =
      user.role === "admin"
        ? "dashboard/admin.html"
        : user.role === "photographer"
          ? "dashboard/photographer.html"
          : user.role === "customer"
            ? "dashboard/customer.html"
            : "";
    if (!destination) throw new Error("This account role cannot access a dashboard.");
    window.location.href = appUrl(destination);
  } catch (error) {
    button.disabled = false;
    button.innerHTML = `${mode === "register" ? "Create account" : "Log in"} <span aria-hidden="true">→</span>`;
    showToast(error.message || "Sign in could not be completed.");
  }
}
