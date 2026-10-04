const dashboardNavigation = {
  customer: [
    ["Overview", "▦"],
    ["My Booking Requests", "◷"],
    ["Upcoming Sessions", "◷"],
    ["Past Sessions", "✓"],
    ["Favorites", "♡"],
    ["Reviews", "☆"],
    ["Profile", "◉"],
    ["Notifications", "♧"],
  ],
  photographer: [
    ["Overview", "▦"],
    ["Booking Requests", "◷"],
    ["Upcoming Bookings", "◷"],
    ["Availability", "◉"],
    ["Portfolio", "▧"],
    ["Equipment", "▣"],
    ["Pricing", "₹"],
    ["Reviews", "☆"],
    ["Profile", "◉"],
    ["Notifications", "♧"],
  ],
  admin: [
    ["Overview", "▦"],
    ["Users", "♙"],
    ["Photographers", "◎"],
    ["Customers", "♙"],
    ["Bookings", "◷"],
    ["Categories", "▧"],
    ["Reviews", "☆"],
    ["Reports", "↗"],
    ["Contact Requests", "✉"],
    ["Settings", "⚙"],
  ],
};

const demoBookings = [];

async function getDashboardData(role) {
  return api.dashboard(role);
}

function renderDashboard(role, dashboardData = null) {
  const content = document.querySelector("[data-page-content]");
  const navigation = dashboardNavigation[role] || dashboardNavigation.customer;
  const title =
    role === "admin"
      ? "Admin workspace"
      : role === "photographer"
        ? "Your studio"
        : "Your moments";
  const statsData = dashboardData?.stats || {};
  const stats =
    role === "admin"
      ? [
          [statsData.users ?? 0, "Total users"],
          [statsData.photographers ?? 0, "Photographers"],
          [statsData.bookings ?? 0, "Bookings"],
          [statsData.reviewsToModerate ?? 0, "Needs review"],
        ]
      : role === "photographer"
        ? [
            [statsData.newRequests ?? 0, "New requests"],
            [statsData.upcomingBookings ?? 0, "Upcoming bookings"],
            [Number(statsData.rating ?? 0).toFixed(1), "Your rating"],
            [statsData.completedBookings ?? 0, "Completed"],
          ]
        : [
            [statsData.openRequests ?? 0, "Open requests"],
            [statsData.upcomingSessions ?? 0, "Upcoming sessions"],
            [statsData.favorites ?? 0, "Saved photographers"],
            [statsData.pastSessions ?? 0, "Past sessions"],
          ];
  content.innerHTML = `<section class="dashboard-layout"><aside class="dashboard-sidebar"><div class="dashboard-user"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt=""><div><strong>${role === "admin" ? "ClickCrew team" : role === "photographer" ? "Your photographer profile" : "Your account"}</strong><span>${role[0].toUpperCase()}${role.slice(1)} workspace</span></div></div><nav class="dashboard-nav" aria-label="Dashboard sections">${navigation.map(([label, icon], index) => `<a href="#${label.toLowerCase().replaceAll(" ", "-")}" class="${index === 0 ? "is-active" : ""}"><span aria-hidden="true">${icon}</span>${label}</a>`).join("")}</nav></aside><div class="dashboard-main"><header class="dashboard-heading"><div><p class="eyebrow">${role === "photographer" ? "A good day to make something" : role === "admin" ? "ClickCrew operations" : "Welcome back"}</p><h1>${title}.</h1><p>${role === "photographer" ? "A clear view of your requests, sessions and studio." : role === "admin" ? "A quick view of activity across the marketplace." : "Keep your plans and favourite people close."}</p></div>${role === "photographer" ? `<button class="button button-outline" data-availability-toggle type="button">Availability: Open</button>` : role === "customer" ? `<a class="button button-primary" href="${appUrl("pages/photographers.html")}">Find a Photographer <span aria-hidden="true">→</span></a>` : ""}</header><div class="dashboard-stats">${stats.map(([value, label]) => `<article class="dashboard-stat"><strong>${value}</strong><span>${label}</span></article>`).join("")}</div><section class="dashboard-section" id="booking-requests"><div class="dashboard-section-heading"><h2>${role === "admin" ? "Recent bookings" : role === "photographer" ? "Booking requests" : "Your booking requests"}</h2>${role !== "admin" ? `<a class="text-link" href="#booking-requests">View all <span aria-hidden="true">→</span></a>` : ""}</div><div class="dashboard-panel dashboard-table-wrap"><table class="dashboard-table"><thead><tr><th>Request</th><th>${role === "photographer" ? "Customer" : "Photographer"}</th><th>Date</th><th>Status</th><th>${role === "admin" ? "Estimate" : "Action"}</th></tr></thead><tbody>${demoBookings.map((booking) => `<tr><td>${booking.name}</td><td>${role === "photographer" ? booking.customer : "Arjun Sharma"}</td><td>${booking.date}</td><td><span class="status-pill ${booking.status === "Pending" ? "pending" : ""}">${booking.status}</span></td><td>${role === "photographer" ? `<button class="table-action" type="button" data-booking-action="accept">Accept</button> <button class="table-action secondary" type="button" data-booking-action="decline">Decline</button>` : role === "admin" ? booking.amount : `<a href="${appUrl("pages/photographer-profile.html?id=arjun-sharma")}">View details</a>`}</td></tr>`).join("")}</tbody></table></div></section><div class="dashboard-content-grid"><section class="dashboard-section"><div class="dashboard-section-heading"><h2>${role === "photographer" ? "Your profile" : role === "admin" ? "Marketplace activity" : "Upcoming session"}</h2></div><div class="dashboard-panel dashboard-note"><h3>${role === "photographer" ? "A good profile gets noticed." : role === "admin" ? "Everything is in good order." : "A little more to look forward to."}</h3><p>${role === "photographer" ? "Add a few portfolio images, check your equipment and keep your availability up to date." : role === "admin" ? "Recent account and booking updates will appear here." : "Your photographer will confirm the final details in your booking requests."}</p>${role === "photographer" ? `<button class="button button-outline" type="button" data-edit-profile>Edit profile</button>` : ""}</div></section><section class="dashboard-section"><div class="dashboard-section-heading"><h2>${role === "photographer" ? "Studio tools" : role === "admin" ? "Needs your attention" : "Your shortcuts"}</h2></div><div class="dashboard-panel dashboard-note"><p>${role === "photographer" ? "Portfolio · Equipment · Pricing · Availability" : role === "admin" ? "Photographer verification · Contact requests · Reported reviews" : "Favorites · Reviews · Account details"}</p><a class="text-link" href="${appUrl(role === "photographer" ? "pages/photographer-profile.html" : "pages/photographers.html")}">${role === "photographer" ? "View your public profile" : role === "admin" ? "Open review queue" : "Browse photographers"} <span aria-hidden="true">→</span></a></div></section></div></div></section>`;
  const dashboardUser = dashboardData?.user || {};
  const logoutButton = document.createElement("button");
  logoutButton.className = "button button-outline";
  logoutButton.type = "button";
  logoutButton.textContent = "Log out";
  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
      await api.auth.logout();
      sessionStorage.removeItem("clickcrew.role");
      window.location.href = appUrl("index.html");
    } catch (error) {
      logoutButton.disabled = false;
      showToast(error.message || "You could not be logged out.");
    }
  });
  content.querySelector(".dashboard-heading").append(logoutButton);
  const nameElement = content.querySelector(".dashboard-user strong");
  if (dashboardUser.name) nameElement.textContent = dashboardUser.name;
  const avatar = content.querySelector(".dashboard-user img");
  const photoUrl = dashboardUser.photoUrl || dashboardUser.photo_url;
  if (photoUrl) avatar.src = photoUrl;
  else avatar.remove();
  const availabilityButton = content.querySelector("[data-availability-toggle]");
  if (availabilityButton) {
    const available = Boolean(statsData.available);
    availabilityButton.textContent = `Availability: ${available ? "Open" : "Paused"}`;
    availabilityButton.classList.toggle("button-accent", !available);
  }
  if (role === "photographer") {
    const studioTools = content.querySelectorAll(
      ".dashboard-content-grid .dashboard-note",
    )[1];
    studioTools.innerHTML = `<p>Keep the details of your public profile current.</p><div class="studio-actions"><button class="table-action" type="button" data-studio-edit="portfolio">Portfolio</button><button class="table-action" type="button" data-studio-edit="equipment">Equipment</button><button class="table-action" type="button" data-studio-edit="pricing">Pricing</button></div><a class="text-link" href="${appUrl("pages/photographer-profile.html")}">View your public profile <span aria-hidden="true">→</span></a>`;
    content
      .querySelector("[data-edit-profile]")
      ?.addEventListener("click", () => openStudioEditor("profile"));
    content
      .querySelectorAll("[data-studio-edit]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          openStudioEditor(button.dataset.studioEdit),
        ),
      );
  }
  const apiBookings = dashboardData?.bookings || dashboardData?.data?.bookings;
  if (Array.isArray(apiBookings)) {
    const tableBody = content.querySelector(".dashboard-table tbody");
    tableBody.innerHTML = apiBookings
      .map((booking) => {
        const bookingId = booking.id || booking.bookingId || "";
        const name =
          booking.eventType ||
          booking.title ||
          booking.name ||
          "Photography request";
        const counterpart =
          role === "photographer"
            ? booking.customerName || booking.customer?.name || "Customer"
            : booking.photographerName ||
              booking.photographer?.name ||
              "Photographer";
        const date = booking.date || booking.eventDate || "To be confirmed";
        const status = booking.status || "Pending";
        const normalizedStatus = status.toLowerCase();
        const amount = booking.estimatedPrice
          ? `₹${Number(booking.estimatedPrice).toLocaleString("en-IN")}`
          : "View details";
        const action =
          role === "photographer"
            ? normalizedStatus === "pending"
              ? `<button class="table-action" type="button" data-booking-action="accept" data-booking-id="${escapeHTML(bookingId)}">Accept</button> <button class="table-action secondary" type="button" data-booking-action="reject" data-booking-id="${escapeHTML(bookingId)}">Reject</button>`
              : normalizedStatus === "accepted"
                ? `<button class="table-action" type="button" data-booking-action="complete" data-booking-id="${escapeHTML(bookingId)}">Complete</button>`
                : escapeHTML(amount)
            : role === "admin"
              ? escapeHTML(amount)
              : ["pending", "accepted"].includes(normalizedStatus)
                ? `<button class="table-action secondary" type="button" data-booking-action="cancel" data-booking-id="${escapeHTML(bookingId)}">Cancel</button>`
                : escapeHTML(amount);
        return `<tr><td>${escapeHTML(name)}</td><td>${escapeHTML(counterpart)}</td><td>${escapeHTML(date)}</td><td><span class="status-pill ${status.toLowerCase() === "pending" ? "pending" : ""}">${escapeHTML(status)}</span></td><td>${action}</td></tr>`;
      })
      .join("");
    if (!apiBookings.length) {
      tableBody.innerHTML =
        '<tr><td colspan="5">No booking activity yet.</td></tr>';
    }
  }
  content
    .querySelector("[data-availability-toggle]")
    ?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const open = button.textContent.includes("Open");
      button.disabled = true;
      try {
        await api.photographers.updateAvailability(!open);
        button.textContent = `Availability: ${open ? "Paused" : "Open"}`;
        button.classList.toggle("button-accent", open);
      } catch (error) {
        showToast(error.message || "Availability could not be updated.");
      } finally {
        button.disabled = false;
      }
    });
  content.querySelectorAll("[data-booking-action]").forEach((button) =>
    button.addEventListener("click", async () => {
      const action = button.dataset.bookingAction;
      try {
        const bookingId = button.dataset.bookingId;
        if (!bookingId) throw new Error("Booking identifier is not available.");
        const statusByAction = {
          accept: "accepted",
          reject: "rejected",
          complete: "completed",
          cancel: "cancelled",
        };
        await api.bookings.updateStatus(bookingId, statusByAction[action]);
        renderDashboard(role, await getDashboardData(role));
        showToast(`Booking ${statusByAction[action]}.`);
      } catch (error) {
        showToast(error.message || "The booking could not be updated.");
      }
    }),
  );
  if (role === "customer") loadCustomerWorkspace(content, dashboardData);
  if (role === "photographer") loadPhotographerWorkspace(content);
  if (role === "admin") loadAdminWorkspace(content);
}

function appendWorkspace(content, markup) {
  const workspace = document.createElement("div");
  workspace.className = "dashboard-content-grid";
  workspace.innerHTML = markup;
  content.querySelector(".dashboard-main").append(workspace);
  return workspace;
}

async function loadCustomerWorkspace(content, dashboardData) {
  const workspace = appendWorkspace(
    content,
    `<section class="dashboard-section" id="upcoming-sessions"><div class="dashboard-section-heading"><h2>Upcoming sessions</h2></div><div class="dashboard-panel" data-upcoming-sessions>Loading…</div></section><section class="dashboard-section" id="past-sessions"><div class="dashboard-section-heading"><h2>Past sessions</h2></div><div class="dashboard-panel" data-past-sessions>Loading…</div></section><section class="dashboard-section" id="favorites"><div class="dashboard-section-heading"><h2>Your favorites</h2></div><div class="photographer-grid" data-favorites-list>Loading…</div></section><section class="dashboard-section" id="reviews"><div class="dashboard-section-heading"><h2>Reviews</h2></div><div class="dashboard-panel" data-customer-reviews>Loading…</div></section><section class="dashboard-section" id="profile"><div class="dashboard-section-heading"><h2>Your profile</h2></div><div class="dashboard-panel"><form class="auth-form" data-customer-profile><label class="form-field"><span class="form-label">Name</span><input class="form-control" name="name" required></label><label class="form-field"><span class="form-label">Email</span><input class="form-control" name="email" type="email" readonly></label><label class="form-field"><span class="form-label">Profile photo URL</span><input class="form-control" name="photoUrl" type="url"></label><label class="form-field"><span class="form-label">Gender</span><input class="form-control" name="gender"></label><label class="form-field"><span class="form-label">Date of birth</span><input class="form-control" name="dateOfBirth" type="date"></label><label class="form-field"><span class="form-label">Location</span><input class="form-control" name="location"></label><button class="button button-primary" type="submit">Save profile</button></form></div></section><section class="dashboard-section" id="notifications"><div class="dashboard-section-heading"><h2>Notifications</h2></div><div class="dashboard-panel" data-customer-notifications>Loading…</div></section>`,
  );
  const bookings = dashboardData.bookings || [];
  const upcoming = bookings.filter((booking) => booking.status === "accepted");
  const past = bookings.filter((booking) =>
    ["completed", "rejected", "cancelled"].includes(booking.status),
  );
  for (const [selector, list] of [
    ["[data-upcoming-sessions]", upcoming],
    ["[data-past-sessions]", past],
  ]) {
    workspace.querySelector(selector).innerHTML = list.length
      ? list
          .map(
            (booking) =>
              `<p>${escapeHTML(booking.eventType)} · ${escapeHTML(booking.date)} · ${escapeHTML(booking.status)}</p>`,
          )
          .join("")
      : '<p class="empty-state">Nothing here yet.</p>';
  }

  try {
    const [favoriteResult, profileResult, notificationResult] =
      await Promise.all([
        api.favorites.list(),
        api.customers.currentProfile(),
        api.notifications.list(),
      ]);
    photographers = favoriteResult.favorites || [];
    favoriteIds.clear();
    photographers.forEach((person) => favoriteIds.add(String(person.id)));
    renderPhotographerCards(
      workspace.querySelector("[data-favorites-list]"),
      photographers,
    );
    const profile = profileResult.user || {};
    Object.entries(profile).forEach(([key, value]) => {
      const field = workspace.querySelector(`[name="${key}"]`);
      if (field && value) field.value = value;
    });
    workspace.querySelector("[name=email]").value = profile.email || "";
    workspace.querySelector("[data-customer-notifications]").innerHTML =
      notificationResult.notifications.length
        ? notificationResult.notifications
            .map(
              (item) =>
                `<p>${escapeHTML(item.message)} <small>${escapeHTML(item.createdAt)}</small></p>`,
            )
            .join("")
        : '<p class="empty-state">No notifications yet.</p>';
  } catch (error) {
    workspace.querySelector("[data-favorites-list]").innerHTML =
      `<p class="empty-state" role="alert">${escapeHTML(error.message)}</p>`;
    workspace.querySelector("[data-customer-notifications]").textContent =
      error.message;
  }

  const profileForm = workspace.querySelector("[data-customer-profile]");
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = profileForm.querySelector("[type=submit]");
    button.disabled = true;
    try {
      const payload = Object.fromEntries(new FormData(profileForm));
      delete payload.email;
      await api.customers.updateProfile(payload);
      showToast("Your profile has been updated.");
    } catch (error) {
      showToast(error.message || "Your profile could not be updated.");
    } finally {
      button.disabled = false;
    }
  });

  const reviewPanel = workspace.querySelector("[data-customer-reviews]");
  const completed = bookings.filter((booking) => booking.status === "completed");
  if (!completed.length) {
    reviewPanel.innerHTML =
      '<p class="empty-state">Reviews are available after a completed session.</p>';
    return;
  }
  const reviews = await Promise.all(
    completed.map(async (booking) => ({
      booking,
      result: await api.bookings.existingReview(booking.id),
    })),
  ).catch((error) => {
    reviewPanel.innerHTML =
      `<p class="empty-state" role="alert">${escapeHTML(error.message)}</p>`;
    return [];
  });
  if (!reviews.length) return;
  reviewPanel.innerHTML = reviews
    .map(({ booking, result }) =>
      result.review
        ? `<article class="dashboard-note"><strong>${escapeHTML(booking.eventType)}</strong><p>Your ${result.review.rating}-star review: ${escapeHTML(result.review.text)}</p></article>`
        : `<form class="dashboard-note" data-review-form data-booking-id="${escapeHTML(booking.id)}"><strong>${escapeHTML(booking.eventType)} · ${escapeHTML(booking.date)}</strong><label class="form-field"><span class="form-label">Rating</span><select class="form-control" name="rating" required><option value="">Choose a rating</option><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label><label class="form-field"><span class="form-label">Your review</span><textarea class="form-control" name="text" required minlength="2"></textarea></label><button class="button button-outline" type="submit">Submit review</button></form>`,
    )
    .join("");
  reviewPanel.querySelectorAll("[data-review-form]").forEach((form) =>
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      try {
        await api.reviews.create({
          bookingId: form.dataset.bookingId,
          rating: Number(values.rating),
          text: values.text,
        });
        showToast("Your review has been submitted.");
        renderDashboard("customer", await getDashboardData("customer"));
      } catch (error) {
        showToast(error.message || "Your review could not be submitted.");
      }
    }),
  );
}

async function loadPhotographerWorkspace(content) {
  const workspace = appendWorkspace(
    content,
    `<section class="dashboard-section" id="upcoming-bookings"><div class="dashboard-section-heading"><h2>Upcoming bookings</h2></div><div class="dashboard-panel"><p>Accepted bookings are shown in the booking table above.</p></div></section><section class="dashboard-section" id="availability"><div class="dashboard-section-heading"><h2>Availability</h2></div><div class="dashboard-panel"><p>Use the availability control above to accept or pause new requests.</p></div></section><section class="dashboard-section" id="portfolio"><div class="dashboard-section-heading"><h2>Portfolio</h2></div><div class="dashboard-panel"><button class="button button-outline" data-studio-edit="portfolio">Manage portfolio</button></div></section><section class="dashboard-section" id="equipment"><div class="dashboard-section-heading"><h2>Equipment</h2></div><div class="dashboard-panel"><button class="button button-outline" data-studio-edit="equipment">Manage equipment</button></div></section><section class="dashboard-section" id="pricing"><div class="dashboard-section-heading"><h2>Pricing</h2></div><div class="dashboard-panel"><button class="button button-outline" data-studio-edit="pricing">Manage pricing</button></div></section><section class="dashboard-section" id="profile"><div class="dashboard-section-heading"><h2>Public profile</h2></div><div class="dashboard-panel"><button class="button button-outline" data-studio-edit="profile">Edit profile</button></div></section><section class="dashboard-section" id="reviews"><div class="dashboard-section-heading"><h2>Your reviews</h2></div><div class="dashboard-panel" data-photographer-reviews>Loading…</div></section><section class="dashboard-section" id="notifications"><div class="dashboard-section-heading"><h2>Notifications</h2></div><div class="dashboard-panel" data-photographer-notifications>Loading…</div></section>`,
  );
  workspace.querySelectorAll("[data-studio-edit]").forEach((button) =>
    button.addEventListener("click", () =>
      openStudioEditor(button.dataset.studioEdit),
    ),
  );
  try {
    const [profileResult, notificationResult] = await Promise.all([
      api.photographers.currentProfile(),
      api.notifications.list(),
    ]);
    const profile = profileResult.photographer;
    const [reviewResult] = await Promise.all([
      api.photographers.reviews(profile.id),
    ]);
    workspace.querySelector("[data-photographer-reviews]").innerHTML =
      reviewResult.reviews.length
        ? reviewResult.reviews
            .map(
              (review) =>
                `<article class="dashboard-note"><strong>${escapeHTML(review.rating)} / 5 · ${escapeHTML(review.author)}</strong><p>${escapeHTML(review.text)}</p></article>`,
            )
            .join("")
        : '<p class="empty-state">You do not have any reviews yet.</p>';
    workspace.querySelector("[data-photographer-notifications]").innerHTML =
      notificationResult.notifications.length
        ? notificationResult.notifications
            .map((item) => `<p>${escapeHTML(item.message)}</p>`)
            .join("")
        : '<p class="empty-state">No notifications yet.</p>';
  } catch (error) {
    workspace.querySelector("[data-photographer-reviews]").textContent =
      error.message;
    workspace.querySelector("[data-photographer-notifications]").textContent =
      error.message;
  }
}

async function loadAdminWorkspace(content) {
  const workspace = appendWorkspace(
    content,
    `<section class="dashboard-section" id="users"><div class="dashboard-section-heading"><h2>Users</h2></div><div class="dashboard-panel dashboard-table-wrap" data-admin-users>Loading…</div></section><section class="dashboard-section" id="photographers"><div class="dashboard-section-heading"><h2>Photographers</h2></div><div class="dashboard-panel dashboard-table-wrap" data-admin-photographers>Loading…</div></section><section class="dashboard-section" id="customers"><div class="dashboard-section-heading"><h2>Customers</h2></div><div class="dashboard-panel dashboard-table-wrap" data-admin-customers>Loading…</div></section><section class="dashboard-section" id="bookings"><div class="dashboard-section-heading"><h2>Bookings</h2></div><div class="dashboard-panel dashboard-table-wrap" data-admin-bookings>Loading…</div></section><section class="dashboard-section" id="categories"><div class="dashboard-section-heading"><h2>Categories</h2></div><div class="dashboard-panel" data-admin-categories>Loading…</div></section><section class="dashboard-section" id="reviews"><div class="dashboard-section-heading"><h2>Review moderation</h2></div><div class="dashboard-panel" data-admin-reviews>Loading…</div></section><section class="dashboard-section" id="reports"><div class="dashboard-section-heading"><h2>Platform activity</h2></div><div class="dashboard-panel" data-admin-activity>Loading…</div></section><section class="dashboard-section" id="contact-requests"><div class="dashboard-section-heading"><h2>Contact requests</h2></div><div class="dashboard-panel" data-admin-contacts>Loading…</div></section><section class="dashboard-section" id="settings"><div class="dashboard-section-heading"><h2>Admin account</h2></div><div class="dashboard-panel" data-admin-settings>Loading…</div></section>`,
  );
  const renderList = (items, columns, row) =>
    items.length
      ? `<table class="dashboard-table"><thead><tr>${columns
          .map((label) => `<th>${label}</th>`)
          .join("")}</tr></thead><tbody>${items.map(row).join("")}</tbody></table>`
      : '<p class="empty-state">No records found.</p>';
  const loadPanel = async (selector, request, render) => {
    const panel = workspace.querySelector(selector);
    try {
      panel.innerHTML = render(await request());
    } catch (error) {
      panel.innerHTML = `<p class="empty-state" role="alert">${escapeHTML(error.message)}</p>`;
    }
  };
  await Promise.all([
    loadPanel("[data-admin-users]", () => api.admin.users(), (result) =>
      renderList(result.users, ["Name", "Email", "Role", "Status", "Action"], (item) =>
        `<tr><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.email)}</td><td>${escapeHTML(item.role)}</td><td>${escapeHTML(item.status)}</td><td><button class="table-action" data-admin-action="user-status" data-id="${escapeHTML(item.id)}" data-status="${item.status === "active" ? "suspended" : "active"}">${item.status === "active" ? "Suspend" : "Restore"}</button></td></tr>`,
      ),
    ),
    loadPanel("[data-admin-photographers]", () => api.admin.photographers(), (result) =>
      renderList(result.photographers, ["Name", "Location", "Hourly rate", "Verified", "Action"], (item) =>
        `<tr><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.city)}</td><td>₹${Number(item.hourlyRate).toLocaleString("en-IN")}</td><td>${item.verified ? "Yes" : "No"}</td><td><button class="table-action" data-admin-action="photographer-verify" data-id="${escapeHTML(item.id)}" data-verified="${!item.verified}">${item.verified ? "Unverify" : "Verify"}</button></td></tr>`,
      ),
    ),
    loadPanel("[data-admin-customers]", () => api.admin.customers(), (result) =>
      renderList(result.customers, ["Name", "Email", "Status"], (item) =>
        `<tr><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.email)}</td><td>${escapeHTML(item.status)}</td></tr>`,
      ),
    ),
    loadPanel("[data-admin-bookings]", () => api.admin.bookings(), (result) =>
      renderList(result.bookings, ["Request", "Customer", "Photographer", "Date", "Status"], (item) =>
        `<tr><td>${escapeHTML(item.eventType)}</td><td>${escapeHTML(item.customerName)}</td><td>${escapeHTML(item.photographerName)}</td><td>${escapeHTML(item.date)}</td><td><select class="form-control" data-admin-booking-status="${escapeHTML(item.id)}"><option value="${escapeHTML(item.status)}">${escapeHTML(item.status)}</option><option value="accepted">accepted</option><option value="rejected">rejected</option><option value="cancelled">cancelled</option><option value="completed">completed</option></select><button class="table-action" data-admin-action="booking-status" data-id="${escapeHTML(item.id)}">Save</button></td></tr>`,
      ),
    ),
    loadPanel("[data-admin-categories]", () => api.admin.categories(), (result) =>
      `<form class="auth-form" data-category-form><input class="form-control" name="name" placeholder="New category name" required><button class="button button-primary" type="submit">Add category</button></form>${renderList(result.categories, ["Category", "Status", "Action"], (item) =>
        `<tr><td>${escapeHTML(item.name)}</td><td>${item.active ? "Active" : "Inactive"}</td><td><button class="table-action" data-admin-action="category-toggle" data-id="${escapeHTML(item.id)}" data-active="${!item.active}">${item.active ? "Deactivate" : "Activate"}</button></td></tr>`,
      )}`,
    ),
    loadPanel("[data-admin-reviews]", () => api.admin.reviews(), (result) =>
      renderList(result.reviews, ["Photographer", "Customer", "Rating", "Review", "Status", "Action"], (item) =>
        `<tr><td>${escapeHTML(item.photographerName)}</td><td>${escapeHTML(item.customerName)}</td><td>${escapeHTML(item.rating)}</td><td>${escapeHTML(item.text)}</td><td>${escapeHTML(item.status)}</td><td><button class="table-action" data-admin-action="review-moderate" data-id="${escapeHTML(item.id)}" data-status="${item.status === "visible" ? "hidden" : "visible"}">${item.status === "visible" ? "Hide" : "Restore"}</button></td></tr>`,
      ),
    ),
    loadPanel("[data-admin-activity]", () => api.admin.activity(), (result) =>
      `<pre>${escapeHTML(JSON.stringify(result.activity, null, 2))}</pre>`,
    ),
    loadPanel("[data-admin-contacts]", () => api.admin.contactRequests(), (result) =>
      result.contactRequests.length
        ? result.contactRequests.map((item) => `<article class="dashboard-note"><strong>${escapeHTML(item.topic)} · ${escapeHTML(item.name)}</strong><p>${escapeHTML(item.email)}</p><p>${escapeHTML(item.message)}</p><button class="table-action" data-admin-action="contact-status" data-id="${escapeHTML(item.id)}" data-status="${item.status === "open" ? "closed" : "open"}">${item.status === "open" ? "Close request" : "Reopen request"}</button></article>`).join("")
        : '<p class="empty-state">No contact requests.</p>',
    ),
    loadPanel("[data-admin-settings]", () => api.auth.currentUser(), (result) =>
      `<p>${escapeHTML(result.user.name)} · ${escapeHTML(result.user.email)}</p>`,
    ),
  ]);

  workspace.querySelector("[data-category-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name");
    try {
      await api.admin.createCategory(name);
      loadAdminWorkspace(content);
    } catch (error) {
      showToast(error.message || "Category could not be added.");
    }
  });
  workspace.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-action]");
    if (!button) return;
    try {
      const { id, adminAction } = button.dataset;
      if (adminAction === "user-status") {
        await api.admin.updateUserStatus(id, button.dataset.status);
      } else if (adminAction === "photographer-verify") {
        await api.admin.verifyPhotographer(id, button.dataset.verified === "true");
      } else if (adminAction === "review-moderate") {
        await api.admin.moderateReview(id, button.dataset.status);
      } else if (adminAction === "category-toggle") {
        if (button.dataset.active === "false") await api.admin.deleteCategory(id);
        else await api.admin.updateCategory(id, { active: true });
      } else if (adminAction === "booking-status") {
        const status = workspace.querySelector(`[data-admin-booking-status="${CSS.escape(id)}"]`).value;
        await api.bookings.updateStatus(id, status);
      } else if (adminAction === "contact-status") {
        await api.admin.updateContactRequest(id, button.dataset.status);
      }
      await loadAdminWorkspace(content);
    } catch (error) {
      showToast(error.message || "The admin action could not be completed.");
    }
  });
}

async function openStudioEditor(section) {
  let profile;
  try {
    profile = (await api.photographers.currentProfile()).photographer;
  } catch (error) {
    showToast(error.message || "Your photographer profile could not be loaded.");
    return;
  }
  const labels = {
    profile: {
      title: "Edit your public profile",
      path: "/photographers/me/profile",
      fields: `<div class="form-field"><label class="form-label" for="studio-name">Display name</label><input class="form-control" id="studio-name" name="name" required></div><div class="form-field"><label class="form-label" for="studio-city">City</label><input class="form-control" id="studio-city" name="city" required></div><div class="form-field"><label class="form-label" for="studio-region">Region</label><input class="form-control" id="studio-region" name="region"></div><div class="form-field"><label class="form-label" for="studio-about">Introduction</label><textarea class="form-control" id="studio-about" name="about"></textarea></div><div class="form-field"><label class="form-label" for="studio-photo">Profile photo URL</label><input class="form-control" id="studio-photo" name="photoUrl" type="url"></div><div class="form-field"><label class="form-label" for="studio-gender">Gender</label><input class="form-control" id="studio-gender" name="gender"></div><div class="form-field"><label class="form-label" for="studio-dob">Date of birth</label><input class="form-control" id="studio-dob" name="dateOfBirth" type="date"></div><div class="form-field"><label class="form-label" for="studio-location">Location</label><input class="form-control" id="studio-location" name="location"></div><div class="form-field"><label class="form-label" for="studio-specialties">Photography categories</label><textarea class="form-control" id="studio-specialties" name="specialties" placeholder="One category per line"></textarea></div>`,
    },
    portfolio: {
      title: "Manage your portfolio",
      path: "/photographers/me/portfolio",
      fields: `<div class="form-field"><label class="form-label" for="studio-portfolio">Image URLs</label><textarea class="form-control" id="studio-portfolio" name="images" placeholder="Add one image URL per line"></textarea><p class="form-hint">Use images you own or have permission to share.</p></div>`,
    },
    equipment: {
      title: "Update your equipment",
      path: "/photographers/me/equipment",
      fields: `<div class="form-field"><label class="form-label" for="studio-equipment">Cameras and equipment</label><textarea class="form-control" id="studio-equipment" name="equipment" placeholder="One item per line"></textarea></div>`,
    },
    pricing: {
      title: "Update your starting price",
      path: "/photographers/me/pricing",
      fields: `<div class="form-field"><label class="form-label" for="studio-price">Starting price per hour (₹)</label><input class="form-control" id="studio-price" type="number" name="hourlyRate" min="0" required></div><div class="form-field"><label class="form-label" for="studio-photo-rate">Price per photo (₹)</label><input class="form-control" id="studio-photo-rate" type="number" name="photoRate" min="0"></div>`,
    },
  }[section];
  const modal = openModal(
    `<p class="eyebrow">Your studio</p><h2 id="modal-title">${labels.title}</h2><form data-studio-form>${labels.fields}<button class="button button-primary" type="submit">Save changes <span aria-hidden="true">→</span></button></form>`,
  );
  const values = {
    name: profile.name,
    city: profile.city,
    about: profile.about,
    region: profile.region,
    photoUrl: profile.photoUrl,
    gender: profile.gender,
    dateOfBirth: profile.dateOfBirth,
    location: profile.location,
    specialties: (profile.specialties || []).join("\n"),
    images: (profile.portfolio || [])
      .map((item) => item.imageUrl || item.url || "")
      .filter(Boolean)
      .join("\n"),
    equipment: (profile.equipment || []).join("\n"),
    hourlyRate: profile.hourlyRate,
    photoRate: profile.photoRate,
  };
  Object.entries(values).forEach(([name, value]) => {
    const field = modal?.element.querySelector(`[name="${name}"]`);
    if (field && value !== undefined) field.value = value;
  });
  modal?.element
    .querySelector("[data-studio-form]")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form));
      if (section === "portfolio")
        payload.images = String(payload.images)
          .split("\n")
          .map((image) => image.trim())
          .filter(Boolean);
      if (section === "equipment")
        payload.equipment = String(payload.equipment)
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
      if (section === "pricing")
        payload.hourlyRate = Number(payload.hourlyRate);
      try {
        if (section === "profile") {
          await api.photographers.updateProfile({
            name: payload.name,
            city: payload.city,
            bio: payload.about,
            region: payload.region,
            photoUrl: payload.photoUrl,
            gender: payload.gender,
            dateOfBirth: payload.dateOfBirth,
            location: payload.location,
            specialties: String(payload.specialties || "")
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          });
        } else if (section === "portfolio") {
          await api.photographers.updatePortfolio(payload.images);
        } else if (section === "equipment") {
          await api.photographers.updateEquipment(payload.equipment);
        } else {
          await api.photographers.updatePricing({
            hourlyRate: payload.hourlyRate,
            photoRate: Number(payload.photoRate || 0),
          });
        }
        modal.close();
        showToast("Your studio details have been updated.");
      } catch (error) {
        showToast(error.message || "Your studio details could not be updated.");
      }
    });
}
