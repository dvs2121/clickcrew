/*
  target.innerHTML = `<section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">Find your person behind the camera</p><h1>Good photographs<br>start with a good fit.</h1><p>Meet independent photographers across India. Browse the work, compare the details, and find someone who feels right.</p></div></section><section class="section directory-section"><div class="directory-toolbar"><div><p class="eyebrow">Your next favourite photographer</p><h2>Photographers <span data-result-count></span></h2></div><div class="directory-actions"><button class="button button-outline mobile-filter-open" type="button" data-open-filters aria-controls="filter-drawer">☷ Filters</button><label class="sort-control"><span>Sort by</span><select name="sort" data-sort><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="reviews">Most reviewed</option></select></label></div></div><div class="directory-layout"><aside class="filter-panel" data-filter-panel><form data-filter-form><div class="filter-heading"><h3>Refine your search</h3><button class="text-button" type="reset" data-clear-filters>Clear all</button></div><label class="form-field"><span class="form-label">Search</span><input class="form-control" name="search" placeholder="Name, style, equipment"></label><label class="form-field"><span class="form-label">Location</span><input class="form-control" name="location" placeholder="City or region" value="${escapeHTML(query.get("location") || "")}"></label><label class="form-field"><span class="form-label">Event category</span><select class="form-control" name="category"><option value="">All categories</option>${["Wedding", "Birthday", "Couple", "Travel", "Party", "College Events", "Personal Shoot", "Portrait"].map((item) => `<option ${query.get("category")?.toLowerCase() === item.toLowerCase() ? "selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">Photography type</span><select class="form-control" name="type"><option value="">Any style</option>${["Candid", "Traditional", "Portrait", "Film"].map((item) => `<option ${query.get("type")?.toLowerCase() === item.toLowerCase() ? "selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">Event date</span><input class="form-control" type="date" name="date" value="${escapeHTML(query.get("date") || "")}"></label><label class="form-field"><span class="form-label">Preferred time</span><select class="form-control" name="time"><option value="">Any time</option>${["Morning", "Afternoon", "Evening"].map((item) => `<option ${query.get("time")?.toLowerCase() === item.toLowerCase() ? "selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">Maximum price per hour</span><select class="form-control" name="price"><option value="">Any price</option><option value="1000">Up to ₹1,000</option><option value="1500">Up to ₹1,500</option><option value="2500">Up to ₹2,500</option></select></label><label class="form-field"><span class="form-label">Minimum rating</span><select class="form-control" name="rating"><option value="">Any rating</option><option value="4">4.0+</option><option value="4.5">4.5+</option><option value="4.8">4.8+</option></select></label><label class="form-field"><span class="form-label">Equipment / camera</span><input class="form-control" name="equipment" placeholder="Try Sony or film"></label><label class="availability-filter"><input type="checkbox" name="availability"> Available for new requests</label><button class="button button-primary filter-apply" type="submit">Show photographers</button></form></aside><div class="directory-results"><div class="photographer-grid" data-directory-grid></div></div></div><div class="drawer-backdrop" data-drawer-backdrop></div><aside class="filter-drawer" id="filter-drawer" aria-label="Photographer filters" aria-hidden="true"><div class="drawer-header"><h2>Filters</h2><button class="icon-button" type="button" data-close-filters aria-label="Close filters">×</button></div><div data-drawer-filter-slot></div></aside>`;
*/
const portfolioImages = [];

function renderDirectory(
  categories = [],
) {
  const target = document.querySelector("[data-page-content]");
  const query = new URLSearchParams(window.location.search);
  const categoryNames = categories
    .map((category) =>
      typeof category === "string"
        ? category
        : category.name || category.label || category.title,
    )
    .filter(Boolean);
  target.innerHTML = `<section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">Find your person behind the camera</p><h1>Good photographs<br>start with a good fit.</h1><p>Meet independent photographers across India. Browse the work, compare the details, and find someone who feels right.</p></div></section><section class="section directory-section"><div class="directory-toolbar"><div><p class="eyebrow">Your next favourite photographer</p><h2>Photographers <span data-result-count></span></h2></div><div class="directory-actions"><button class="button button-outline mobile-filter-open" type="button" data-open-filters aria-controls="filter-drawer">☷ Filters</button><label class="sort-control"><span>Sort by</span><select name="sort" data-sort><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="reviews">Most reviewed</option></select></label></div></div><div class="directory-layout"><aside class="filter-panel" data-filter-panel><form data-filter-form><div class="filter-heading"><h3>Refine your search</h3><button class="text-button" type="reset" data-clear-filters>Clear all</button></div><label class="form-field"><span class="form-label">Search</span><input class="form-control" name="search" placeholder="Name, style, equipment"></label><label class="form-field"><span class="form-label">Location</span><input class="form-control" name="location" placeholder="City or region" value="${escapeHTML(query.get("location") || "")}"></label><label class="form-field"><span class="form-label">Event category</span><select class="form-control" name="category"><option value="">All categories</option>${["Wedding", "Birthday", "Couple", "Travel", "Party", "College Events", "Personal Shoot", "Portrait"].map((item) => `<option ${query.get("category")?.toLowerCase() === item.toLowerCase() ? "selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">Photography type</span><select class="form-control" name="type"><option value="">Any style</option><option>Candid</option><option>Traditional</option><option>Portrait</option><option>Film</option></select></label><label class="form-field"><span class="form-label">Maximum price per hour</span><select class="form-control" name="price"><option value="">Any price</option><option value="1000">Up to ₹1,000</option><option value="1500">Up to ₹1,500</option><option value="2500">Up to ₹2,500</option></select></label><label class="form-field"><span class="form-label">Minimum rating</span><select class="form-control" name="rating"><option value="">Any rating</option><option value="4">4.0+</option><option value="4.5">4.5+</option><option value="4.8">4.8+</option></select></label><label class="form-field"><span class="form-label">Equipment / camera</span><input class="form-control" name="equipment" placeholder="Try Sony or film"></label><label class="availability-filter"><input type="checkbox" name="availability"> Available for new requests</label><button class="button button-primary filter-apply" type="submit">Show photographers</button></form></aside><div class="directory-results"><div class="photographer-grid" data-directory-grid></div></div></div></section><div class="drawer-backdrop" data-drawer-backdrop></div><aside class="filter-drawer" id="filter-drawer" aria-label="Photographer filters" aria-hidden="true"><div class="drawer-header"><h2>Filters</h2><button class="icon-button" type="button" data-close-filters aria-label="Close filters">×</button></div><div data-drawer-filter-slot></div></aside>`;
  const originalForm = target.querySelector("[data-filter-form]");
  const extraFilters = document.createElement("div");
  extraFilters.innerHTML = `<label class="form-field"><span class="form-label">Event date</span><input class="form-control" type="date" name="date" value="${escapeHTML(query.get("date") || "")}"></label><label class="form-field"><span class="form-label">Preferred time</span><select class="form-control" name="time"><option value="">Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label><label class="form-field"><span class="form-label">Maximum price per photo</span><select class="form-control" name="photoPrice"><option value="">Any price</option><option value="10">Up to ₹10</option><option value="25">Up to ₹25</option><option value="50">Up to ₹50</option></select></label>`;
  originalForm
    .querySelector("[type=submit]")
    .before(extraFilters);
  const categorySelect = originalForm.elements.category;
  categorySelect.innerHTML = `<option value="">All categories</option>${categoryNames.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}`;
  categorySelect.value = query.get("category") || "";
  const drawerForm = originalForm.cloneNode(true);
  drawerForm.classList.add("drawer-filter-form");
  target.querySelector("[data-drawer-filter-slot]").append(drawerForm);
  const render = (sourceForm = originalForm) => {
    const sorted = sortPhotographers(
      photographers,
      target.querySelector("[data-sort]").value,
    );
    renderPhotographerCards(
      target.querySelector("[data-directory-grid]"),
      sorted,
    );
    target.querySelector("[data-result-count]").textContent =
      `(${sorted.length})`;
  };
  let filterTimer;
  const refresh = async (form) => {
    const grid = target.querySelector("[data-directory-grid]");
    grid.innerHTML = `<div class="empty-state" role="status">Loading photographers…</div>`;
    try {
      await loadPhotographers(getPhotographerFilters(form));
      await loadFavoriteIds();
      render();
    } catch (error) {
      grid.innerHTML = `<div class="empty-state" role="alert">${escapeHTML(error.message || "Photographers could not be loaded.")}</div>`;
      showToast(error.message || "Photographers could not be loaded.");
    }
  };
  [originalForm, drawerForm].forEach((form) => {
    form.addEventListener("input", (event) => {
      if (event.target.matches("input[type=search], input[type=text]")) {
        window.clearTimeout(filterTimer);
        filterTimer = window.setTimeout(() => refresh(form), 350);
      }
    });
    form.addEventListener("change", () => refresh(form));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      refresh(form);
      closeFilterDrawer();
    });
    form.addEventListener("reset", () =>
      window.setTimeout(() => {
        originalForm.reset();
        drawerForm.reset();
        refresh(originalForm);
      }, 0),
    );
  });
  target
    .querySelector("[data-sort]")
    .addEventListener("change", () => render());
  const panel = target.querySelector("[data-filter-panel]");
  const drawer = target.querySelector("#filter-drawer");
  const backdrop = target.querySelector("[data-drawer-backdrop]");
  const openDrawer = () => {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    target.querySelector("[data-close-filters]").focus();
  };
  window.closeFilterDrawer = () => {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    target.querySelector("[data-open-filters]").focus();
  };
  target
    .querySelector("[data-open-filters]")
    .addEventListener("click", openDrawer);
  target
    .querySelector("[data-close-filters]")
    .addEventListener("click", closeFilterDrawer);
  backdrop.addEventListener("click", closeFilterDrawer);
  render();
}

function renderProfile(profileData = {}) {
  const target = document.querySelector("[data-page-content]");
  const profileId = new URLSearchParams(window.location.search).get("id");
  const fallback = findPhotographer(profileId) || {};
  const person = { ...fallback, ...(profileData.profile || {}) };
  person.price = person.price ?? person.hourlyRate ?? 0;
  person.image = person.image || person.photoUrl || "";
  person.specialties = person.specialties || [];
  person.equipment = person.equipment || [];
  person.portfolio = person.portfolio || [];
  person.about = person.about || "";
  person.reviews = person.reviewCount ?? person.reviews ?? 0;
  document.title = `${person.name} | ClickCrew`;
  target.innerHTML = `<section class="profile-cover" style="--profile-image:url('${escapeHTML(person.image)}')"><div class="profile-cover-inner"><span class="profile-location">⌖ ${escapeHTML(person.city)}, ${escapeHTML(person.region)}</span></div></section><section class="section profile-main"><div class="profile-heading"><img class="profile-avatar" src="${escapeHTML(person.image)}" alt="Portrait of ${escapeHTML(person.name)}"><div class="profile-name-block"><p class="eyebrow">${person.verified ? "Verified ClickCrew photographer" : "ClickCrew photographer"}</p><h1>${escapeHTML(person.name)} <span class="verified-mark" aria-label="Verified">✓</span></h1><p>★ ${Number(person.rating).toFixed(1)} <span class="muted">(${Number(person.reviews)} reviews)</span> · ${escapeHTML(person.city)}, ${escapeHTML(person.region)}</p></div><div class="profile-actions"><button class="button button-outline" type="button" data-favorite="${escapeHTML(person.id)}" aria-label="Add to favorites" aria-pressed="false">♡ Save</button><button class="button button-primary" type="button" data-request-booking>Request Photographer <span aria-hidden="true">→</span></button></div></div><div class="profile-content-grid"><div><section class="profile-section"><p class="eyebrow">A little introduction</p><h2>Here for the real stuff.</h2><p>${escapeHTML(person.about)}</p></section><section class="profile-section"><p class="eyebrow">Made for your kind of moment</p><h2>Specialties</h2><div class="profile-tags">${person.specialties.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div></section><section class="profile-section"><p class="eyebrow">A few things in my kit</p><h2>Equipment</h2><p>${person.equipment.map(escapeHTML).join(" · ")}</p></section><section class="profile-section"><p class="eyebrow">A collection of moments</p><h2>Selected portfolio</h2><div class="gallery-grid">${portfolioImages.map((image, index) => `<button class="gallery-item" type="button" data-lightbox="${image}" data-caption="A moment captured by ${escapeHTML(person.name)}"><img src="${image}" alt="Portfolio photograph ${index + 1} by ${escapeHTML(person.name)}" loading="lazy"></button>`).join("")}</div></section><section class="profile-section"><p class="eyebrow">From the people I've photographed</p><h2>Reviews</h2><div class="profile-review"><span class="stars">★★★★★</span><blockquote>“The whole experience felt effortless. The photos are full of the little moments we almost missed.”</blockquote><strong>Rhea & Nikhil</strong><small>Wedding · Lucknow</small></div><div class="profile-review"><span class="stars">★★★★★</span><blockquote>“Warm, thoughtful, and so easy to work with. We felt completely like ourselves.”</blockquote><strong>Tanvi S.</strong><small>Portrait session · Jaipur</small></div></section></div><aside class="profile-booking-panel"><p class="eyebrow">The details</p><h2>₹${Number(person.price).toLocaleString("en-IN")}<small> / hour</small></h2><p>Starting rate · final estimate depends on the details of your day.</p><div class="profile-fact"><span>Availability</span><strong class="${person.available ? "is-available" : "is-busy"}">${person.available ? "Open to requests" : "Limited availability"}</strong></div><div class="profile-fact"><span>Based in</span><strong>${escapeHTML(person.city)}, ${escapeHTML(person.region)}</strong></div><div class="profile-fact"><span>Typical response</span><strong>Within a day</strong></div><button class="button button-primary" type="button" data-request-booking>Request Photographer <span aria-hidden="true">→</span></button><p class="form-hint">No online payment. Your request is confirmed directly with the photographer.</p></aside></div></section>`;
  if (!person.image) target.querySelector(".profile-avatar")?.remove();
  const reviewSection = target.querySelectorAll(".profile-section")[4];
  reviewSection
    .querySelectorAll(".profile-review")
    .forEach((review) => review.remove());
  if (!person.portfolio.length) {
    target.querySelector(".gallery-grid").innerHTML =
      '<p class="empty-state">Portfolio images will appear here when available.</p>';
  }
  target.querySelectorAll("[data-favorite]").forEach((button) => {
    const favorite = favoriteIds.has(String(person.id));
    button.classList.toggle("is-favorite", favorite);
    button.setAttribute("aria-pressed", String(favorite));
    button.addEventListener("click", () => toggleFavorite(person.id));
  });
  target
    .querySelectorAll("[data-request-booking]")
    .forEach((button) =>
      button.addEventListener("click", () => openBookingRequest(person)),
    );
  target
    .querySelectorAll("[data-lightbox]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        openLightbox(button.dataset.lightbox, button.dataset.caption),
      ),
    );
  if (Array.isArray(person.portfolio) && person.portfolio.length) {
    const portfolio = person.portfolio
      .map((item) =>
        typeof item === "string" ? item : item.imageUrl || item.url,
      )
      .filter(Boolean);
    const gallery = target.querySelector(".gallery-grid");
    gallery.innerHTML = portfolio
      .map(
        (image, index) =>
          `<button class="gallery-item" type="button" data-lightbox="${escapeHTML(image)}" data-caption="A moment captured by ${escapeHTML(person.name)}"><img src="${escapeHTML(image)}" alt="Portfolio photograph ${index + 1} by ${escapeHTML(person.name)}" loading="lazy"></button>`,
      )
      .join("");
    gallery
      .querySelectorAll("[data-lightbox]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          openLightbox(button.dataset.lightbox, button.dataset.caption),
        ),
      );
  }
  if (profileData.reviews?.length) {
    profileData.reviews.forEach((review) => {
      const item = document.createElement("article");
      item.className = "profile-review";
      const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
      item.innerHTML = `<span class="stars" aria-label="${rating} out of 5 stars">${"★".repeat(rating)}</span><blockquote>“${escapeHTML(review.text || review.comment || "")}"</blockquote><strong>${escapeHTML(review.author || review.customerName || "ClickCrew customer")}</strong><small>${escapeHTML(review.eventType || review.location || "ClickCrew customer")}</small>`;
      reviewSection.append(item);
    });
  } else {
    reviewSection.insertAdjacentHTML(
      "beforeend",
      '<p class="empty-state">No reviews yet.</p>',
    );
  }
}

function renderStaticPage(page) {
  const target = document.querySelector("[data-page-content]");
  const pages = {
    about: {
      eyebrow: "A little about us",
      title: "The best moments don't need a script.",
      text: "ClickCrew is a photography marketplace built around a simple idea: finding the right photographer should feel as good as the photographs themselves.",
      image:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85",
      cta: "Find your photographer",
      href: "pages/photographers.html",
    },
    "how-it-works": {
      eyebrow: "Simple by design",
      title: "From “what if” to “remember when”.",
      text: "Share your plans, find a creative whose work speaks to you, choose the details that fit, and send a request. You and your photographer agree on the final plan directly.",
      image:
        "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1400&q=85",
      cta: "Find a Photographer",
      href: "pages/photographers.html",
    },
  };
  if (page === "contact") {
    target.innerHTML = `<section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">We're glad you're here</p><h1>Let's talk.</h1><p>Questions about finding a photographer, joining ClickCrew, or something else? Send us a note.</p></div></section><section class="section contact-section"><form class="contact-form" data-contact-form><div class="form-field"><label class="form-label" for="contact-name">Your name</label><input class="form-control" id="contact-name" name="name" required></div><div class="form-field"><label class="form-label" for="contact-email">Email address</label><input class="form-control" id="contact-email" type="email" name="email" required></div><div class="form-field"><label class="form-label" for="contact-topic">What can we help with?</label><select class="form-control" id="contact-topic" name="topic"><option>Finding a photographer</option><option>Joining as a photographer</option><option>Booking support</option><option>Something else</option></select></div><div class="form-field"><label class="form-label" for="contact-message">Your message</label><textarea class="form-control" id="contact-message" name="message" required></textarea></div><button class="button button-primary" type="submit">Send a note <span aria-hidden="true">→</span></button></form><aside class="contact-aside"><p class="eyebrow">A note on safety</p><h2>Good people, good pictures.</h2><p>ClickCrew only shares the details needed to coordinate your booking. Private profile information stays private.</p></aside></section>`;
    target
      .querySelector("[data-contact-form]")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          await api.post(
            "/contact",
            Object.fromEntries(new FormData(event.currentTarget)),
          );
          showToast("Thanks for writing. We'll be in touch.");
          event.currentTarget.reset();
        } catch {
          showToast("Connect the ClickCrew API to send your message.");
        }
      });
    return;
  }
  const content = pages[page];
  target.innerHTML = `<section class="editorial-page-hero"><div class="editorial-page-copy"><p class="eyebrow">${content.eyebrow}</p><h1>${content.title}</h1><p>${content.text}</p><a class="button button-primary" href="${appUrl(content.href)}">${content.cta} <span aria-hidden="true">→</span></a></div><div class="editorial-page-image"><img src="${content.image}" alt="A photographer capturing an important moment"></div></section><section class="section editorial-values"><p class="eyebrow">What matters to us</p><h2>More present.<br>More personal.</h2><p>We believe great photography starts with trust. Every photographer shares their real work, clear starting rates, equipment and availability. Customers choose what matters to them, then connect directly with the photographer to confirm the details.</p></section>`;
}

async function initializePage() {
  renderSiteHeader();
  renderSiteFooter();
  renderDeveloperBranding();
  const page = document.body.dataset.page;
  if (page === "home") {
    const homeCards = document.querySelector("[data-photographer-grid]");
    const limit = Number(homeCards?.dataset.limit || 4);
    homeCards.innerHTML = '<div class="empty-state" role="status">Loading photographers…</div>';
    try {
      await Promise.all([loadPhotographers(), loadFavoriteIds()]);
      renderPhotographerCards(homeCards, photographers, limit);
    } catch (error) {
      homeCards.innerHTML = `<div class="empty-state" role="alert">${escapeHTML(error.message || "Photographers could not be loaded.")}</div>`;
    }
    bindHomeSearch();
  } else if (page === "directory" || page === "profile") {
    const target = document.querySelector("[data-page-content]");
    target.innerHTML = '<section class="section"><p class="empty-state" role="status">Loading…</p></section>';
    try {
      const query = new URLSearchParams(window.location.search);
      const filters = Object.fromEntries(
        ["category", "location", "date", "time", "type"].filter((key) =>
          query.has(key),
        ).map((key) => [key, query.get(key)]),
      );
      if (page === "directory") {
        const [, categories] = await Promise.all([
          loadPhotographers(filters),
          loadCategories(),
          loadFavoriteIds(),
        ]);
        renderDirectory(categories);
      } else {
        const profileId = query.get("id");
        if (!profileId) throw new Error("This photographer profile is unavailable.");
        await loadFavoriteIds();
        renderProfile(await loadProfileDetails(profileId));
      }
    } catch (error) {
      target.innerHTML = `<section class="section"><div class="empty-state" role="alert">${escapeHTML(error.message || "This page could not be loaded.")}</div></section>`;
    }
  } else if (page === "auth-choice") {
    renderAuthChoice(document.body.dataset.mode || "login");
  } else if (page === "auth") {
    const role = document.body.dataset.role || "customer";
    const mode = document.body.dataset.mode || "login";
    renderAuthPage(role, mode);
  } else if (page === "dashboard") {
    const role = document.body.dataset.role || "customer";
    const target = document.querySelector("[data-page-content]");
    target.innerHTML = '<section class="section"><p class="empty-state" role="status">Loading your dashboard…</p></section>';
    try {
      const dashboardData = await getDashboardData(role);
      renderDashboard(role, dashboardData);
    } catch (error) {
      const loginPath =
        role === "admin"
          ? "pages/admin-login.html"
          : `pages/${role}-login.html`;
      const action =
        error.status === 401
          ? `<a class="button button-primary" href="${appUrl(loginPath)}">Log in</a>`
          : "";
      target.innerHTML = `<section class="section"><div class="empty-state" role="alert">${escapeHTML(error.message || "Your dashboard could not be loaded.")}<div>${action}</div></div></section>`;
    }
  } else if (["about", "how-it-works", "contact"].includes(page)) {
    renderStaticPage(page);
  }
  document
    .querySelectorAll("[data-anchor-categories]")
    .forEach((link) =>
      link.setAttribute("href", `${appUrl("index.html")}#categories`),
    );
}

function bindHomeSearch() {
  document.querySelectorAll(".category-choice").forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".category-choice")
        .forEach((choice) =>
          choice.classList.toggle("is-selected", choice === button),
        );
      document.querySelector("[name=category]").value = button.dataset.category;
    }),
  );
  document
    .querySelector("[data-search-form]")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const params = new URLSearchParams();
      ["category", "location", "date", "time", "type"].forEach((key) => {
        if (values.get(key)) params.set(key, values.get(key));
      });
      window.location.href = appUrl(
        `pages/photographers.html?${params.toString()}`,
      );
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage, { once: true });
} else {
  initializePage();
}
