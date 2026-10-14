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
        const form = event.currentTarget;
        const button = form.querySelector("[type=submit]");
        const originalLabel = button.innerHTML;
        button.disabled = true;
        button.textContent = "Sending your message…";
        try {
          await api.post(
            "/contact",
            Object.fromEntries(new FormData(form)),
          );
          showToast("Thanks for writing. We'll be in touch.");
          form.reset();
        } catch (error) {
          showToast(error.message || "Your message could not be sent. Please try again.");
        } finally {
          button.disabled = false;
          button.innerHTML = originalLabel;
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
    if (homeCards) {
      homeCards.innerHTML = `<div class="photographer-skeleton" role="status" aria-label="Loading photographers"><span></span><span></span><span></span><span></span></div>`;
    }
    initializeHeroCarousel();
    bindHomeSearch();
    try {
      await Promise.all([loadPhotographers(), loadFavoriteIds()]);
      renderPhotographerCards(homeCards, photographers, limit);
    } catch (error) {
      if (homeCards) {
        homeCards.innerHTML = `<div class="empty-state" role="alert">${escapeHTML(error.message || "Photographers could not be loaded.")}</div>`;
      }
    }
  } else if (page === "directory" || page === "profile") {
    const target = document.querySelector("[data-page-content]");
    target.innerHTML = '<section class="section"><p class="empty-state" role="status">Loading…</p></section>';
    try {
      const query = new URLSearchParams(window.location.search);
      const filters = Object.fromEntries(
        ["search", "category", "location", "date", "time", "type"].filter((key) =>
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
        const searchField = target.querySelector('[name="search"]');
        if (searchField) searchField.value = query.get("search") || "";
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
  const form = document.querySelector("[data-search-form]");
  const intentInput = form?.elements.intent;
  const searchInput = form?.querySelector("[data-quick-search-input]");
  const results = form?.querySelector("[data-quick-results]");
  const submitButton = form?.querySelector("[type=submit]");
  const photographerFilters = form?.querySelector("[data-photographer-filters]");
  let requestVersion = 0;
  const invalidateSearch = () => {
    requestVersion += 1;
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    results.hidden = true;
    results.replaceChildren();
  };

  form?.querySelectorAll("[data-search-intent]").forEach((button) =>
    button.addEventListener("click", () => {
      invalidateSearch();
      document
        .querySelectorAll("[data-search-intent]")
        .forEach((choice) =>
          choice.classList.toggle("is-selected", choice === button),
        );
      document
        .querySelectorAll("[data-search-intent]")
        .forEach((choice) =>
          choice.setAttribute("aria-pressed", String(choice === button)),
        );
      intentInput.value = button.dataset.searchIntent;
      photographerFilters.hidden = button.dataset.searchIntent !== "photographer";
      searchInput.placeholder =
        button.dataset.searchIntent === "lactation"
          ? "Search for a lactation consultant near you..."
          : "Search for a photographer near you...";
    }),
  );
  form?.querySelectorAll("[data-search-category]").forEach((button) =>
    button.addEventListener("click", () => {
      invalidateSearch();
      form.querySelectorAll("[data-search-category]").forEach((choice) => {
        const isSelected = choice === button;
        choice.classList.toggle("is-selected", isSelected);
        choice.setAttribute("aria-pressed", String(isSelected));
      });
      form.elements.category.value = button.dataset.searchCategory;
    }),
  );
  form?.addEventListener("input", (event) => {
    if (event.target.matches("input[name=search], input[name=location], input[name=date]")) {
      invalidateSearch();
    }
  });
  form?.addEventListener("change", (event) => {
    if (event.target.matches("select[name=time], select[name=type]")) {
      invalidateSearch();
    }
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const version = ++requestVersion;
    const values = new FormData(form);
    const intent = values.get("intent");
    const query = String(values.get("search") || "").trim();
    const location = String(values.get("location") || "").trim();
    const filters = Object.fromEntries(
      ["category", "date", "time", "type"].map((key) => [
        key,
        String(values.get(key) || ""),
      ]),
    );
    results.hidden = false;

    if (intent === "lactation") {
      results.innerHTML = `<p class="quick-search-note">Our lactation consultant directory is not available yet. <a href="${appUrl("pages/contact.html")}">Contact our support team</a> and we’ll help point you in the right direction.</p>`;
      return;
    }

    results.innerHTML = `<div class="quick-search-loading" role="status"><span class="loading-pulse"></span>Finding photographers${location ? ` near ${escapeHTML(location)}` : ""}…</div>`;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    try {
      const [response] = await Promise.all([
        api.photographers.list({ search: query, location, ...filters }),
        loadFavoriteIds(),
      ]);
      if (version !== requestVersion) return;
      const people = Array.isArray(response?.photographers)
        ? response.photographers
        : [];
      const searchParams = new URLSearchParams({ search: query, location, ...filters });
      results.innerHTML = `<div class="quick-search-result-heading"><strong>${people.length} photographer${people.length === 1 ? "" : "s"} found</strong><a href="${appUrl(`pages/photographers.html?${searchParams}`)}">Browse all <span aria-hidden="true">→</span></a></div><div class="photographer-grid quick-result-grid" data-quick-result-grid></div>`;
      renderPhotographerCards(results.querySelector("[data-quick-result-grid]"), people, 4);
      if (!people.length) {
        results.querySelector("[data-quick-result-grid]").innerHTML =
          '<div class="empty-state">No photographers match yet. Try another search or location.</div>';
      }
    } catch (error) {
      if (version !== requestVersion) return;
      results.innerHTML = `<p class="quick-search-note" role="alert">${escapeHTML(error.message || "Search could not be completed. Please try again.")}</p>`;
    } finally {
      if (version === requestVersion) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}

function initializeHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");
  const track = carousel?.querySelector("[data-carousel-track]");
  const dots = carousel?.querySelector("[data-carousel-dots]");
  if (!carousel || !track || !dots) return;

  const slides = [
    ["photo-1511285560929-80b456fea0bc", "A couple celebrating their wedding outdoors"],
    ["photo-1519741497674-611481863552", "A joyful wedding moment"],
    ["photo-1532712938310-34cb3982ef74", "A couple enjoying a quiet moment"],
    ["photo-1476514525535-07fb3b4ae5f1", "A scenic travel moment"],
    ["photo-1530103862676-de8c9debad1d", "A birthday celebration"],
    ["photo-1523580494863-6f3031224c94", "A joyful college celebration"],
    ["photo-1534528741775-53994a69daeb", "A relaxed portrait session"],
    ["photo-1518621736915-f3b1c41bfd00", "A romantic proposal"],
    ["photo-1492684223066-81342ee5ff30", "Friends celebrating together"],
    ["photo-1452587925148-ce544e77e70d", "A photographer at work"],
  ];
  const sourceFor = (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1500&q=85`;
  let activeIndex = 0;
  let intervalId;
  let pointerStartX = null;
  let isHovered = false;
  let hasFocus = false;
  let isRotationPaused = false;
  const pauseButton = carousel.querySelector("[data-carousel-pause]");

  track.innerHTML = slides
    .map(
      ([imageId, description], index) => `
        <div class="hero-carousel-slide${index === 0 ? " is-active" : ""}" data-carousel-slide aria-roledescription="slide" aria-label="${index + 1} of ${slides.length}" aria-hidden="${index !== 0}">
          <img class="hero-image" data-carousel-image data-src="${sourceFor(imageId)}" alt="${description}" ${index === 0 ? `src="${sourceFor(imageId)}" fetchpriority="high"` : 'loading="lazy"'} decoding="async">
        </div>`,
    )
    .join("");
  dots.innerHTML = slides
    .map(
      (_, index) =>
        `<button class="carousel-dot${index === 0 ? " is-active" : ""}" type="button" data-carousel-dot="${index}" aria-label="Show image ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"></button>`,
    )
    .join("");

  const slideElements = [...track.querySelectorAll("[data-carousel-slide]")];
  const dotElements = [...dots.querySelectorAll("[data-carousel-dot]")];
  const counter = document.querySelector("[data-carousel-counter]");
  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slideElements.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
      if (isActive) {
        const image = slide.querySelector("[data-carousel-image]");
        if (!image.src) image.src = image.dataset.src;
      }
    });
    dotElements.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
    if (counter) counter.textContent = String(activeIndex + 1).padStart(2, "0");
    // Load only the active and next images; the remaining slots stay lazy until needed.
    const nextImage = slideElements[(activeIndex + 1) % slides.length]
      .querySelector("[data-carousel-image]");
    if (!nextImage.src) nextImage.src = nextImage.dataset.src;
  };

  const stopRotation = () => window.clearInterval(intervalId);
  const startRotation = (resumeWhileInteracting = false) => {
    stopRotation();
    if (
      ((isHovered || hasFocus) && !resumeWhileInteracting) ||
      isRotationPaused ||
      document.hidden ||
      slides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    intervalId = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  };
  carousel.querySelector("[data-carousel-previous]").addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startRotation();
  });
  carousel.querySelector("[data-carousel-next]").addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startRotation();
  });
  dotElements.forEach((dot) =>
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.carouselDot));
      startRotation();
    }),
  );
  carousel.addEventListener("mouseenter", () => {
    isHovered = true;
    stopRotation();
  });
  carousel.addEventListener("mouseleave", () => {
    isHovered = false;
    startRotation();
  });
  carousel.addEventListener("focusin", () => {
    hasFocus = true;
    stopRotation();
  });
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      hasFocus = false;
      startRotation();
    }
  });
  pauseButton.addEventListener("click", () => {
    isRotationPaused = !isRotationPaused;
    pauseButton.setAttribute("aria-pressed", String(isRotationPaused));
    pauseButton.setAttribute(
      "aria-label",
      isRotationPaused ? "Resume automatic slideshow" : "Pause automatic slideshow",
    );
    pauseButton.textContent = isRotationPaused ? "▶" : "Ⅱ";
    if (isRotationPaused) stopRotation();
    else startRotation(true);
  });
  track.addEventListener("pointerdown", (event) => {
    pointerStartX = event.pointerType === "touch" ? event.clientX : null;
  });
  track.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const deltaX = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(deltaX) > 45) showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopRotation();
    else startRotation();
  });
  showSlide(0);
  startRotation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage, { once: true });
} else {
  initializePage();
}
