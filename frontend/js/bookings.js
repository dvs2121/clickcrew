function estimateBookingPrice(hourlyRate, hours) {
  return Math.max(1, Number(hourlyRate) || 0) * Math.max(1, Number(hours) || 1);
}

function openBookingRequest(person) {
  const minimumDate = new Date().toISOString().slice(0, 10);
  const content = `<p class="eyebrow">A good plan starts here</p><h2 id="modal-title">Request ${escapeHTML(person.name)}</h2><p class="card-meta">No payment is taken now. The photographer will confirm availability and final details.</p><form class="booking-form" data-booking-form data-photographer-id="${escapeHTML(person.id)}"><div class="form-field"><label class="form-label" for="booking-event">What are you celebrating?</label><select class="form-control" id="booking-event" name="eventType" required><option value="">Choose an event</option>${["Wedding", "Birthday", "Couple", "Travel", "Party", "College Events", "Personal Shoot", "Other"].map((item) => `<option>${item}</option>`).join("")}</select></div><div class="booking-form-grid"><div class="form-field"><label class="form-label" for="booking-date">Date</label><input class="form-control" id="booking-date" type="date" name="date" min="${minimumDate}" required></div><div class="form-field"><label class="form-label" for="booking-time">Start time</label><input class="form-control" id="booking-time" type="time" name="time" required></div><div class="form-field"><label class="form-label" for="booking-hours">Hours</label><input class="form-control" id="booking-hours" type="number" name="hours" value="2" min="1" max="16" required></div><div class="form-field"><label class="form-label" for="booking-photos">Approx. photos</label><input class="form-control" id="booking-photos" type="number" name="photoCount" value="50" min="1" step="10"></div></div><div class="form-field"><label class="form-label" for="booking-location">Location</label><input class="form-control" id="booking-location" name="location" placeholder="City, venue or area" required></div><div class="form-field"><label class="form-label" for="booking-equipment">Camera or equipment preference</label><select class="form-control" id="booking-equipment" name="equipment"><option value="">Photographer's recommendation</option>${person.equipment.map((item) => `<option>${escapeHTML(item)}</option>`).join("")}</select></div><div class="form-field"><label class="form-label" for="booking-notes">Anything else? <span class="muted">(optional)</span></label><textarea class="form-control" id="booking-notes" name="notes" placeholder="A few details to help the photographer understand your day"></textarea></div><div class="booking-summary"><div class="booking-summary-row"><span>Starting rate</span><span>₹${Number(person.price).toLocaleString("en-IN")} / hour</span></div><div class="booking-summary-row booking-summary-total"><span>Estimated total</span><strong data-estimate>₹${estimateBookingPrice(person.price, 2).toLocaleString("en-IN")}</strong></div><p class="form-hint">Estimate only. Final pricing and availability are confirmed by the photographer.</p></div><button class="button button-primary" type="submit">Request Photographer <span aria-hidden="true">→</span></button></form>`;
  const modal = openModal(content);
  const form = modal?.element.querySelector("[data-booking-form]");
  form?.querySelector("[name=photoCount]").setAttribute("step", "1");
  if (Number(person.photoRate) > 0) {
    const pricingField = document.createElement("div");
    pricingField.className = "form-field";
    pricingField.innerHTML = '<label class="form-label" for="booking-pricing-model">Pricing option</label><select class="form-control" id="booking-pricing-model" name="pricingModel"><option value="hourly">By the hour</option><option value="photos">By number of photos</option></select>';
    form.querySelector(".booking-form-grid").before(pricingField);
  }
  const updateEstimate = () => {
    const model = form.elements.pricingModel?.value || "hourly";
    const total =
      model === "photos"
        ? Number(person.photoRate) * Number(form.elements.photoCount.value || 1)
        : estimateBookingPrice(person.price ?? person.hourlyRate, form.elements.hours.value);
    modal.element.querySelector("[data-estimate]").textContent =
      `₹${total.toLocaleString("en-IN")}`;
  };
  ["hours", "photoCount", "pricingModel"].forEach((name) =>
    form?.elements[name]?.addEventListener("input", updateEstimate),
  );
  form?.elements.pricingModel?.addEventListener("change", updateEstimate);
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
  payload.hours = Number(payload.hours);
  payload.photoCount = Number(payload.photoCount) || null;
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
