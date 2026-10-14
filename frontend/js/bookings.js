function openBookingRequest(person) {
  const minimumDate = new Date();
  const dateMin = `${minimumDate.getFullYear()}-${String(minimumDate.getMonth() + 1).padStart(2, "0")}-${String(minimumDate.getDate()).padStart(2, "0")}`;
  const serviceTypes = [
    "Wedding",
    "Birthday",
    "Couple",
    "Travel",
    "Party",
    "College Events",
    "Personal Shoot",
    "Other",
  ];
  const content = `
    <p class="eyebrow">A good plan starts here</p>
    <h2 id="modal-title">Request ${escapeHTML(person.name)}</h2>
    <p class="card-meta">Share a few essentials. No payment is taken now; the photographer will confirm availability and final details.</p>
    <form class="booking-form" data-booking-form data-photographer-id="${escapeHTML(person.id)}">
      <div class="form-field">
        <label class="form-label" for="booking-event">Service type</label>
        <select class="form-control" id="booking-event" name="eventType" required>
          <option value="">Choose a service</option>
          ${serviceTypes.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}
        </select>
      </div>
      <div class="booking-form-grid">
        <div class="form-field">
          <label class="form-label" for="booking-date">Date</label>
          <input class="form-control" id="booking-date" type="date" name="date" min="${dateMin}" required>
        </div>
        <div class="form-field">
          <label class="form-label" for="booking-time">Start time</label>
          <input class="form-control" id="booking-time" type="time" name="time" required>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label" for="booking-location">Location</label>
        <input class="form-control" id="booking-location" name="location" placeholder="City, venue or area" autocomplete="address-level2" required>
      </div>
      <p class="form-hint">Starting at ₹${Number(person.price ?? person.hourlyRate ?? 0).toLocaleString("en-IN")} per hour. Final pricing and availability are confirmed directly.</p>
      <button class="button button-primary" type="submit">Request Photographer <span aria-hidden="true">→</span></button>
    </form>`;
  const modal = openModal(content);
  const form = modal?.element.querySelector("[data-booking-form]");
  form?.addEventListener("submit", (event) =>
    submitBookingRequest(event, modal),
  );
}

async function submitBookingRequest(event, modal) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const payload = Object.fromEntries(new FormData(form));
  payload.photographerId = form.dataset.photographerId;
  payload.hours = 1;
  button.disabled = true;
  button.textContent = "Sending request…";

  try {
    const response = await api.bookings.create(payload);
    const booking = response?.booking;
    const details = [
      booking?.id
        ? `<p><span>Booking reference</span><strong>${escapeHTML(booking.id)}</strong></p>`
        : "",
      booking?.status
        ? `<p><span>Status</span><strong>${escapeHTML(booking.status)}</strong></p>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    modal?.close();
    const confirmation = openModal(
      `<p class="eyebrow">Your request is with the photographer</p><h2 id="modal-title">The first step is taken.</h2><p class="booking-confirmation-copy">Your booking request has been sent. The photographer will be in touch to confirm availability and the details.</p>${details ? `<div class="booking-confirmation-details">${details}</div>` : ""}<button class="button button-primary" type="button" data-confirmation-close>Return to photographer</button>`,
    );
    confirmation?.element
      .querySelector("[data-confirmation-close]")
      .addEventListener("click", confirmation.close);
  } catch (error) {
    button.disabled = false;
    button.innerHTML = 'Request Photographer <span aria-hidden="true">→</span>';
    showToast(error.message || "We couldn't send your request. Please try again.");
  }
}
