function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function appUrl(path) {
  const isNestedPage = /\/(pages|dashboard)\//.test(window.location.pathname);
  return `${isNestedPage ? "../" : ""}${path.replace(/^\//, "")}`;
}

function showToast(message) {
  const root = document.querySelector("[data-ui-root]");
  if (!root) return;
  root.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  root.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function renderSiteHeader() {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;
  target.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="${appUrl("index.html")}" aria-label="ClickCrew home"><span class="brand-mark" aria-hidden="true"><i></i></span>ClickCrew</a>
        <nav class="primary-nav" id="primary-navigation" aria-label="Main navigation">
          <a href="${appUrl("pages/photographers.html")}">Find a Photographer</a>
          <a href="${appUrl("pages/how-it-works.html")}">How It Works</a>
          <a href="${appUrl("index.html#categories")}">Categories</a>
          <a href="${appUrl("pages/photographer-register.html")}">Become a Photographer</a>
          <a href="${appUrl("pages/about.html")}">About</a>
        </nav>
        <div class="header-actions">
          <a class="header-search" href="${appUrl("pages/photographers.html")}" aria-label="Search photographers">⌕</a>
          <a href="${appUrl("pages/login.html")}">Log in</a>
          <a class="signup-link" href="${appUrl("pages/register.html")}">Sign up</a>
        </div>
        <button class="mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="primary-navigation"><span></span></button>
      </div>
    </header>`;

  const menuButton = target.querySelector(".mobile-menu-button");
  const navigation = target.querySelector(".primary-nav");
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation",
    );
    navigation.classList.toggle("is-open", !isOpen);
  });
}

function renderSiteFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  const groups = [
    {
      title: "Explore",
      links: [
        ["Find Photographers", "pages/photographers.html"],
        ["Categories", "index.html#categories"],
        ["How It Works", "pages/how-it-works.html"],
      ],
    },
    {
      title: "For Photographers",
      links: [
        ["Become a Photographer", "pages/photographer-register.html"],
        ["Photographer Login", "pages/photographer-login.html"],
        ["Photographer Dashboard", "dashboard/photographer.html"],
      ],
    },
    {
      title: "Company",
      links: [
        ["About", "pages/about.html"],
        ["Contact", "pages/contact.html"],
        ["Careers", "pages/contact.html"],
      ],
    },
    {
      title: "Support",
      links: [
        ["Help Center", "pages/contact.html"],
        ["Cancellation Policy", "pages/how-it-works.html"],
        ["Terms & Privacy", "pages/contact.html"],
      ],
    },
  ];
  target.innerHTML = `<footer class="site-footer"><div class="footer-main"><div class="footer-brand"><a class="brand" href="${appUrl("index.html")}"><span class="brand-mark" aria-hidden="true"><i></i></span>ClickCrew</a><p>Capture the moment.<br>We'll handle the rest.</p></div>${groups.map((group) => `<div class="footer-group"><h3>${group.title}</h3>${group.links.map(([label, path]) => `<a href="${appUrl(path)}">${label}</a>`).join("")}</div>`).join("")}</div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ClickCrew. Made for moments that matter.</span><div class="social-links" aria-label="Social media"><a href="#instagram" aria-label="Instagram">ig</a><a href="#facebook" aria-label="Facebook">f</a><a href="#pinterest" aria-label="Pinterest">p</a></div></div></footer>`;
}

function renderDeveloperBranding() {
  const target = document.querySelector("[data-developer-branding]");
  if (!target) return;
  const portfolioUrl = "https://deveshpratap.vercel.app";
  target.innerHTML = `
    <aside class="developer-signature">
      <button
        class="developer-orb"
        type="button"
        aria-label="Meet the Developer"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="developer-profile"
      >
        <span class="developer-orb__letter" aria-hidden="true">d</span>
        <span class="developer-orb__spark" aria-hidden="true">✳</span>
      </button>
    </aside>
    <div class="developer-backdrop" id="developer-profile" hidden>
      <section
        class="developer-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="developer-title"
        aria-describedby="developer-intro"
        tabindex="-1"
      >
        <span class="developer-dialog__corner developer-dialog__corner--top" aria-hidden="true">✳</span>
        <button class="developer-dialog__close" type="button" aria-label="Close developer profile">×</button>
        <div class="developer-dialog__content">
          <header class="developer-dialog__header">
            <p class="developer-dialog__eyebrow"><span aria-hidden="true"></span> Crafted by</p>
            <h2 id="developer-title">Devesh Pratap</h2>
            <p class="developer-dialog__role">Web Developer · AI/ML Engineer · Data &amp; Analytics</p>
            <p class="developer-dialog__intro" id="developer-intro">
              I build digital experiences where technology, creativity, and thoughtful design meet.
            </p>
          </header>
          <div class="developer-dialog__details">
            <section class="developer-about" aria-labelledby="developer-about-title">
              <p class="developer-dialog__section-label">About</p>
              <h3 id="developer-about-title">Ideas, made tangible.</h3>
              <p>
                From web development and AI/ML to data &amp; analytics, I enjoy shaping
                creative digital products into thoughtful, useful experiences.
              </p>
            </section>
            <div class="developer-dialog__side">
              <p class="developer-dialog__section-label">Find me around</p>
              <nav class="developer-socials" aria-label="Devesh Pratap’s social links">
                <a href="https://github.com/dvs2121" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.8a5.3 5.3 0 0 0-1.4-3.7 4.9 4.9 0 0 0-.1-3.7S17.6.9 14 3.3a13.5 13.5 0 0 0-7 0C3.4.9 2.2 1.2 2.2 1.2a4.9 4.9 0 0 0-.1 3.7A5.3 5.3 0 0 0 .7 8.6c0 5.3 3.2 6.5 6.2 6.8A3.4 3.4 0 0 0 6 18.1V22"/></svg>
                  <span>GitHub</span>
                </a>
                <a href="https://www.instagram.com/devesh.prajapati_2128/" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile, @devesh.prajapati_2128">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>
                  <span>Instagram</span>
                </a>
                <a href="${portfolioUrl}" target="_blank" rel="noopener noreferrer" aria-label="Portfolio website">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7m-1-6L10 14"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                  <span>Portfolio</span>
                </a>
              </nav>
              <p class="developer-instagram-handle">@devesh.prajapati_2128</p>
            </div>
          </div>
          <footer class="developer-dialog__footer">
            <span class="developer-signoff">— Devesh</span>
            <a class="developer-portfolio-cta" href="${portfolioUrl}" target="_blank" rel="noopener noreferrer">
              Explore my work <span aria-hidden="true">↗</span>
            </a>
          </footer>
        </div>
        <span class="developer-dialog__stamp" aria-hidden="true">made<br>with intent</span>
      </section>
    </div>`;
  document.body.classList.add("has-developer-orb");

  const card = target.querySelector(".developer-orb");
  const backdrop = target.querySelector(".developer-backdrop");
  const dialog = target.querySelector(".developer-dialog");
  const closeButton = target.querySelector(".developer-dialog__close");
  let isClosing = false;
  let closeTimer;
  let previousBodyStyle;
  let lockedScrollY = 0;
  let inertedSiblings = [];

  const focusableSelector =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const lockPage = () => {
    lockedScrollY = window.scrollY;
    previousBodyStyle = document.body.getAttribute("style");
    inertedSiblings = [...document.body.children]
      .filter((element) => element !== target)
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute("aria-hidden"),
      }));
    inertedSiblings.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.classList.add("developer-dialog-open");
  };

  const unlockPage = () => {
    inertedSiblings.forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    });
    inertedSiblings = [];
    if (previousBodyStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", previousBodyStyle);
    document.body.classList.remove("developer-dialog-open");
    window.scrollTo(0, lockedScrollY);
  };

  const closeDialog = () => {
    if (backdrop.hidden || isClosing) return;
    isClosing = true;
    backdrop.classList.remove("is-open");
    backdrop.classList.add("is-closing");
    card.setAttribute("aria-expanded", "false");
    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      backdrop.hidden = true;
      backdrop.classList.remove("is-closing");
      unlockPage();
      card.focus();
      isClosing = false;
    }, 360);
  };

  card.addEventListener("click", () => {
    if (!backdrop.hidden || isClosing) return;
    const cardBounds = card.getBoundingClientRect();
    backdrop.style.setProperty(
      "--developer-origin-x",
      `${cardBounds.left + cardBounds.width / 2 - window.innerWidth / 2}px`,
    );
    backdrop.style.setProperty(
      "--developer-origin-y",
      `${cardBounds.top + cardBounds.height / 2 - window.innerHeight / 2}px`,
    );
    lockPage();
    backdrop.hidden = false;
    backdrop.classList.remove("is-closing");
    card.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => backdrop.classList.add("is-open"));
    closeButton.focus();
  });

  closeButton.addEventListener("click", closeDialog);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeDialog();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll(focusableSelector)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function openModal(content, options = {}) {
  const root = document.querySelector("[data-ui-root]");
  if (!root) return;
  const previousFocus = document.activeElement;
  root.innerHTML = `<div class="modal-backdrop" role="presentation"><section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" type="button" aria-label="Close dialog">×</button>${content}</section></div>`;
  const backdrop = root.querySelector(".modal-backdrop");
  backdrop.classList.add("is-open");
  const close = () => {
    root.innerHTML = "";
    document.removeEventListener("keydown", onKeydown);
    previousFocus?.focus?.();
    options.onClose?.();
  };
  const onKeydown = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...root.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      ),
    ];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  root.querySelector(".modal-close").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener("keydown", onKeydown);
  root.querySelector(".modal-close").focus();
  return { close, element: root.querySelector(".modal-dialog") };
}

function openLightbox(imageUrl, caption) {
  const content = `<img class="lightbox-image" src="${escapeHTML(imageUrl)}" alt="${escapeHTML(caption)}"><p class="lightbox-caption">${escapeHTML(caption)}</p>`;
  const modal = openModal(content);
  modal?.element.classList.add("lightbox-dialog");
}
