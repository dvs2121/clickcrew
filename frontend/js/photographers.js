let photographers = [];
const favoriteIds = new Set();

async function loadFavoriteIds() {
  if (sessionStorage.getItem("clickcrew.role") !== "customer") {
    favoriteIds.clear();
    return;
  }
  try {
    const result = await api.favorites.list();
    favoriteIds.clear();
    (result.favorites || []).forEach((person) => favoriteIds.add(String(person.id)));
  } catch (error) {
    if (![401, 403].includes(error.status)) throw error;
    favoriteIds.clear();
  }
}

async function toggleFavorite(photographerId) {
  if (sessionStorage.getItem("clickcrew.role") !== "customer") {
    showToast("Log in as a customer to save photographers.");
    return;
  }
  const id = String(photographerId);
  const wasFavorite = favoriteIds.has(id);
  try {
    if (wasFavorite) await api.favorites.remove(id);
    else await api.favorites.add(id);
    if (wasFavorite) favoriteIds.delete(id);
    else favoriteIds.add(id);
    document
      .querySelectorAll(`[data-favorite="${CSS.escape(id)}"]`)
      .forEach((button) => {
        const isFavorite = favoriteIds.has(id);
        button.classList.toggle("is-favorite", isFavorite);
        button.setAttribute("aria-pressed", String(isFavorite));
        button.setAttribute(
          "aria-label",
          isFavorite ? "Remove from favorites" : "Add to favorites",
        );
      });
    if (wasFavorite) {
      const favoriteCard = document
        .querySelector(`[data-favorite="${CSS.escape(id)}"]`)
        ?.closest("[data-photographer-card]");
      const favoritesList = favoriteCard?.closest("[data-favorites-list]");
      if (favoritesList) {
        favoriteCard.remove();
        if (!favoritesList.querySelector("[data-photographer-card]")) {
          favoritesList.innerHTML =
            '<div class="empty-state">You have not saved any photographers yet.</div>';
        }
      }
    }
    showToast(
      wasFavorite
        ? "Removed from your favorites."
        : "Added to your favorites.",
    );
  } catch (error) {
    showToast(
      [401, 403].includes(error.status)
        ? "Log in as a customer to save photographers."
        : error.message,
    );
  }
}

function renderPhotographerCard(person) {
  const id = String(person.id);
  const favorite = favoriteIds.has(id);
  const specialties = (person.specialties || []).slice(0, 3).join(" · ");
  const equipment = (person.equipment || []).join(", ");
  const image = person.image || person.photoUrl || "";
  return `<article class="photographer-card" data-photographer-card data-name="${escapeHTML(person.name)}" data-location="${escapeHTML(`${person.city || ""} ${person.region || ""}`)}" data-specialties="${escapeHTML(specialties)}" data-price="${Number(person.price ?? person.hourlyRate) || 0}" data-rating="${Number(person.rating) || 0}" data-available="${Boolean(person.available)}" data-equipment="${escapeHTML(equipment)}">
    <div class="photographer-card-image">${image ? `<img src="${escapeHTML(image)}" alt="Portrait of photographer ${escapeHTML(person.name)}" loading="lazy">` : ""}<button type="button" class="favorite-button${favorite ? " is-favorite" : ""}" data-favorite="${escapeHTML(id)}" aria-label="${favorite ? "Remove from favorites" : "Add to favorites"}" aria-pressed="${favorite}">♡</button></div>
    <div class="photographer-card-body"><div class="photographer-card-title"><h3>${escapeHTML(person.name)}${person.verified ? ' <span class="verified-mark" title="Verified photographer" aria-label="Verified photographer">✓</span>' : ""}</h3><span class="rating">★ ${Number(person.rating || 0).toFixed(1)} <span>(${Number(person.reviews || person.reviewCount || 0)} reviews)</span></span></div>
      <p class="card-meta">⌖ ${escapeHTML([person.city, person.region].filter(Boolean).join(", "))}</p><p class="card-tags">${escapeHTML(specialties)}</p><p class="card-meta equipment-line">Equipment: ${escapeHTML(equipment || "Not specified")}</p>
      <div class="card-bottom"><div><span class="card-price">From ₹${Number(person.price ?? person.hourlyRate ?? 0).toLocaleString("en-IN")}<small>per hour</small></span><span class="availability-indicator ${person.available ? "is-available" : "is-busy"}">${person.available ? "Open to requests" : "Limited availability"}</span></div><a class="card-profile-link" href="${appUrl(`pages/photographer-profile.html?id=${encodeURIComponent(id)}`)}">View Profile</a></div></div></article>`;
}

async function loadPhotographers(filters = {}) {
  const result = await api.photographers.list(filters);
  photographers = Array.isArray(result.photographers)
    ? result.photographers
    : [];
  return photographers;
}

async function loadCategories() {
  const result = await api.categories.list();
  return Array.isArray(result.categories) ? result.categories : [];
}

async function loadProfileDetails(photographerId) {
  const [profileResult, reviewResult] = await Promise.all([
    api.photographers.get(photographerId),
    api.photographers.reviews(photographerId),
  ]);
  return {
    profile: profileResult.photographer || null,
    reviews: Array.isArray(reviewResult.reviews) ? reviewResult.reviews : [],
  };
}

function renderPhotographerCards(target, list, limit = list.length) {
  if (!target) return;
  const visible = list.slice(0, limit);
  target.innerHTML = visible.length
    ? visible.map(renderPhotographerCard).join("")
    : `<div class="empty-state">No photographers match those filters yet. Try widening your search.</div>`;
  target.querySelectorAll("[data-favorite]").forEach((button) =>
    button.addEventListener("click", () => toggleFavorite(button.dataset.favorite)),
  );
}

function findPhotographer(photographerId) {
  return photographers.find(
    (person) => String(person.id) === String(photographerId),
  );
}
