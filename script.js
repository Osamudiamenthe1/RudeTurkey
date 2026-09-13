/* =============================================================
   RUDE TURKEY — FINAL (only button toggles stamp)
   ============================================================= */

/* -------------------------------------------------------------
   1. EDIT ME: your real WhatsApp number, digits only,
   country code first, no "+", no spaces, no dashes.
   Example for a Nigerian number 0803 123 4567 -> "2348031234567"
   ------------------------------------------------------------- */
const WHATSAPP_NUMBER = "2347069159473";

document.getElementById("year").textContent = new Date().getFullYear();

/* -------------------------------------------------------------
   2. Scroll reveal animations
   ------------------------------------------------------------- */
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);
revealEls.forEach((el) => revealObserver.observe(el));

/* -------------------------------------------------------------
   3. Sticky nav condense on scroll
   ------------------------------------------------------------- */
const nav = document.getElementById("siteNav");
window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("is-condensed", window.scrollY > 40);
  },
  { passive: true },
);

/* -------------------------------------------------------------
   4. Mobile burger menu – close on outside tap + escape key
   ------------------------------------------------------------- */
const burger = document.getElementById("navBurger");
const mobileMenu = document.getElementById("mobileMenu");

function closeMobileMenu() {
  burger.classList.remove("is-open");
  mobileMenu.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
}

function openMobileMenu() {
  burger.classList.add("is-open");
  mobileMenu.classList.add("is-open");
  burger.setAttribute("aria-expanded", "true");
}

burger.addEventListener("click", () => {
  if (mobileMenu.classList.contains("is-open")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

// Close when tapping outside
document.addEventListener("click", (e) => {
  if (mobileMenu.classList.contains("is-open")) {
    const isClickInside =
      mobileMenu.contains(e.target) || burger.contains(e.target);
    if (!isClickInside) {
      closeMobileMenu();
    }
  }
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
    closeMobileMenu();
  }
});

/* -------------------------------------------------------------
   5. Active nav section highlighting (includes footer)
   ------------------------------------------------------------- */
const sections = document.querySelectorAll("section[id], footer[id]");
const navLinks = document.querySelectorAll(
  ".nav__links a, .mobile-menu a:not(.btn)",
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.remove("is-active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("is-active");
          }
        });
      }
    });
  },
  { threshold: 0.3 },
);

sections.forEach((section) => sectionObserver.observe(section));

// Hero highlight
const heroSection = document.querySelector(".hero");
if (heroSection) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("is-active");
            if (link.getAttribute("href") === "#top") {
              link.classList.add("is-active");
            }
          });
        }
      });
    },
    { threshold: 0.5 },
  );
  heroObserver.observe(heroSection);
}

/* -------------------------------------------------------------
   6. Cart button (floating CTA) – badge + hides at footer
   ------------------------------------------------------------- */
const cartCta = document.getElementById("cartCta");
const cartBadge = document.getElementById("cartBadge");
let hasScrolledPastHero = false;
let isFooterVisible = false;

const heroEl = document.querySelector(".hero");
if (heroEl) {
  const heroObserver2 = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        hasScrolledPastHero = !entry.isIntersecting;
        updateCartVisibility();
      });
    },
    { threshold: 0.2 },
  );
  heroObserver2.observe(heroEl);
}

const footerEl = document.querySelector("footer");
if (footerEl) {
  const footerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isFooterVisible = entry.isIntersecting;
        updateCartVisibility();
      });
    },
    { threshold: 0.05 },
  );
  footerObserver.observe(footerEl);
}

function updateCartVisibility() {
  const totalItems = getTotalItems();

  const wrap = document.querySelector(".float-cta-wrap");
  if (totalItems > 0) {
    wrap.classList.add("has-items");
  } else {
    wrap.classList.remove("has-items");
  }

  if (totalItems === 0) {
    cartBadge.style.display = "none";
  } else {
    cartBadge.style.display = "flex";
    cartBadge.textContent = totalItems;
  }

  const shouldShow =
    (totalItems > 0 || hasScrolledPastHero) && !isFooterVisible;
  cartCta.classList.toggle("is-visible", shouldShow);
}

/* -------------------------------------------------------------
   6b. Mains horizontal carousel — edge fades + progress indicator
   ------------------------------------------------------------- */
const mainsGrid = document.querySelector('.mains__grid');
const mainsSection = document.querySelector('.mains');
const mainsProgress = document.getElementById('mainsProgress');
const mainsProgressThumb = document.getElementById('mainsProgressThumb');

if (mainsGrid && mainsSection) {
  let progressHideTimer = null;

  function updateMainsFade() {
    const atEnd = mainsGrid.scrollLeft + mainsGrid.clientWidth >= mainsGrid.scrollWidth - 4;
    const atStart = mainsGrid.scrollLeft <= 4;
    mainsSection.classList.toggle('is-end', atEnd);
    mainsSection.classList.toggle('is-scrolled', !atStart);
  }

  function updateMainsProgress() {
    if (!mainsProgress || !mainsProgressThumb) return;

    const trackWidth = mainsProgress.clientWidth;
    const visibleRatio = mainsGrid.clientWidth / mainsGrid.scrollWidth;
    const thumbWidth = Math.max(trackWidth * visibleRatio, 18);

    const maxScroll = mainsGrid.scrollWidth - mainsGrid.clientWidth;
    const scrollRatio = maxScroll > 0 ? mainsGrid.scrollLeft / maxScroll : 0;
    const maxThumbTravel = trackWidth - thumbWidth;

    mainsProgressThumb.style.width = `${thumbWidth}px`;
    mainsProgressThumb.style.transform = `translateX(${scrollRatio * maxThumbTravel}px)`;

    mainsProgress.classList.add('is-visible');
    clearTimeout(progressHideTimer);
    progressHideTimer = setTimeout(() => {
      mainsProgress.classList.remove('is-visible');
    }, 1400);
  }

  mainsGrid.addEventListener('scroll', () => {
    updateMainsFade();
    updateMainsProgress();
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateMainsFade();
    updateMainsProgress();
  }, { passive: true });

  updateMainsFade();
  updateMainsProgress();
}

/* -------------------------------------------------------------
   7. Plate builder state – Multiple bases, proteins, extras
   ------------------------------------------------------------- */
const state = {
  bases: [],
  proteins: [],
  extras: [],
};

function getTotalItems() {
  let count = 0;
  state.bases.forEach((b) => (count += b.quantity || 1));
  state.proteins.forEach((p) => (count += p.quantity || 1));
  state.extras.forEach((e) => (count += e.quantity || 1));
  return count;
}

function toggleArrayItem(arr, name, price, button) {
  const existing = arr.find((item) => item.name === name);
  if (existing) {
    const idx = arr.indexOf(existing);
    arr.splice(idx, 1);
    button.classList.remove("is-selected");
  } else {
    arr.push({ name, price, quantity: 1 });
    button.classList.add("is-selected");
  }
}

function selectOption(button) {
  const group = button.dataset.group;
  const name = button.dataset.name;
  const price = Number(button.dataset.price);

  if (group === "extra") {
    toggleArrayItem(state.extras, name, price, button);
  } else if (group === "base") {
    toggleArrayItem(state.bases, name, price, button);
  } else if (group === "protein") {
    toggleArrayItem(state.proteins, name, price, button);
  }

  if (group === "base" || group === "protein") {
    setStepError("baseStep", "baseStepError", state.bases.length === 0);
    setStepError(
      "proteinStep",
      "proteinStepError",
      state.proteins.length === 0,
    );
  }

  renderTicket();
}

document.querySelectorAll(".option-card").forEach((btn) => {
  btn.addEventListener("click", () => selectOption(btn));
});

/* -------------------------------------------------------------
   8. Render the live order ticket + main card stamps
   ------------------------------------------------------------- */
function renderTicket() {
  const list = document.getElementById("ticketList");
  const totalEl = document.getElementById("ticketTotal");
  const noteEl = document.getElementById("ticketNote");

  const items = [];
  state.bases.forEach((b) => items.push({ ...b, type: "base", ref: b }));
  state.proteins.forEach((p) => items.push({ ...p, type: "protein", ref: p }));
  state.extras.forEach((e) => items.push({ ...e, type: "extra", ref: e }));

  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = '<li class="ticket__empty">Nothing on plate yet.</li>';
  } else {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "ticket__item";

      const nameSpan = document.createElement("span");
      nameSpan.className = "ticket__item-name";
      nameSpan.textContent = item.name;

      const controls = document.createElement("div");
      controls.className = "ticket__item-controls";

      const minusBtn = document.createElement("button");
      minusBtn.className = "ticket__qty-btn ticket__qty-btn--minus";
      minusBtn.textContent = "−";

      const qtySpan = document.createElement("span");
      qtySpan.className = "ticket__qty";
      qtySpan.textContent = item.quantity || 1;

      const plusBtn = document.createElement("button");
      plusBtn.className = "ticket__qty-btn";
      plusBtn.textContent = "+";

      controls.appendChild(minusBtn);
      controls.appendChild(qtySpan);
      controls.appendChild(plusBtn);

      const priceSpan = document.createElement("span");
      priceSpan.style.display = "none";
      priceSpan.textContent = "----";

      li.appendChild(nameSpan);
      li.appendChild(controls);
      li.appendChild(priceSpan);

      plusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const ref = item.ref;
        if (ref) {
          ref.quantity = (ref.quantity || 1) + 1;
          renderTicket();
        }
      });

      minusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const ref = item.ref;
        if (!ref) return;
        const currentQty = ref.quantity || 1;
        if (currentQty <= 1) {
          const group = item.type;
          if (group === "base") {
            const idx = state.bases.indexOf(ref);
            if (idx > -1) state.bases.splice(idx, 1);
            document
              .querySelector(
                `#baseOptions .option-card[data-name="${item.name}"]`,
              )
              ?.classList.remove("is-selected");
          } else if (group === "protein") {
            const idx = state.proteins.indexOf(ref);
            if (idx > -1) state.proteins.splice(idx, 1);
            document
              .querySelector(
                `#proteinOptions .option-card[data-name="${item.name}"]`,
              )
              ?.classList.remove("is-selected");
          } else if (group === "extra") {
            const idx = state.extras.indexOf(ref);
            if (idx > -1) state.extras.splice(idx, 1);
            document
              .querySelector(
                `#extraOptions .option-card[data-name="${item.name}"]`,
              )
              ?.classList.remove("is-selected");
          }
          if (group === "base" || group === "protein") {
            setStepError("baseStep", "baseStepError", state.bases.length === 0);
            setStepError(
              "proteinStep",
              "proteinStepError",
              state.proteins.length === 0,
            );
          }
        } else {
          ref.quantity = currentQty - 1;
        }
        renderTicket();
      });

      list.appendChild(li);
    });
  }

  const allItems = [];
  state.bases.forEach((b) =>
    allItems.push({ ...b, quantity: b.quantity || 1 }),
  );
  state.proteins.forEach((p) =>
    allItems.push({ ...p, quantity: p.quantity || 1 }),
  );
  state.extras.forEach((e) =>
    allItems.push({ ...e, quantity: e.quantity || 1 }),
  );

  const total = allItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );
  totalEl.textContent = "----";

  const ready = state.bases.length > 0 && state.proteins.length > 0;
  noteEl.textContent = ready
    ? "Fill in your details above, then send it in."
    : "Pick at least one base and one protein to get started.";

  updateCartVisibility();
  updateMainCardStamps(); // sync stamps with cart
}

/* -------------------------------------------------------------
   9. Main card stamp updater
   ------------------------------------------------------------- */
function updateMainCardStamps() {
  document.querySelectorAll(".main-card").forEach((card) => {
    const baseName = card.dataset.base;
    const stamp = card.querySelector(".main-card__stamp");
    const isAdded = state.bases.some((b) => b.name === baseName);

    if (stamp) {
      stamp.classList.toggle("is-visible", isAdded);
    }
    card.classList.toggle("has-added", isAdded);
  });
}

/* -------------------------------------------------------------
   10. Main card "Add to Plate" button handler (only button toggles)
   ------------------------------------------------------------- */
document.querySelectorAll(".btn--add").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent any parent click (none)
    const baseName = btn.dataset.base;
    const matchingCard = document.querySelector(
      `#baseOptions .option-card[data-name="${baseName}"]`,
    );
    if (matchingCard) {
      selectOption(matchingCard);
    }
    document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
  });
});

// There is NO card click handler – only the button triggers selection

// Initial render
renderTicket();
updateMainCardStamps();

/* -------------------------------------------------------------
   11. Validation
   ------------------------------------------------------------- */
function setStepError(stepId, errorId, hasError) {
  const grid = document.getElementById(stepId);
  const msg = document.getElementById(errorId);
  if (grid) grid.classList.toggle("is-error", hasError);
  if (msg) msg.classList.toggle("is-shown", hasError);
}

function setFieldError(inputId, errorId, hasError) {
  const input = document.getElementById(inputId);
  const msg = document.getElementById(errorId);
  if (input) input.classList.toggle("is-error", hasError);
  if (msg) msg.classList.toggle("is-shown", hasError);
}

function validateOrder() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();

  const baseMissing = state.bases.length === 0;
  const proteinMissing = state.proteins.length === 0;
  const nameMissing = !name;
  const phoneMissing = !phone;
  const addressMissing = !address;

  setStepError("baseStep", "baseStepError", baseMissing);
  setStepError("proteinStep", "proteinStepError", proteinMissing);
  setFieldError("custName", "custNameError", nameMissing);
  setFieldError("custPhone", "custPhoneError", phoneMissing);
  setFieldError("custAddress", "custAddressError", addressMissing);

  const firstInvalid = baseMissing
    ? document.getElementById("baseStep")
    : proteinMissing
      ? document.getElementById("proteinStep")
      : nameMissing
        ? document.getElementById("custName")
        : phoneMissing
          ? document.getElementById("custPhone")
          : addressMissing
            ? document.getElementById("custAddress")
            : null;

  if (firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("ticketNote").textContent =
      "A few things are missing — check the highlighted sections above.";
    return { valid: false };
  }

  return { valid: true, name, phone, address };
}

document.getElementById("custName").addEventListener("input", (e) => {
  setFieldError("custName", "custNameError", !e.target.value.trim());
});
document.getElementById("custPhone").addEventListener("input", (e) => {
  setFieldError("custPhone", "custPhoneError", !e.target.value.trim());
});
document.getElementById("custAddress").addEventListener("input", (e) => {
  setFieldError("custAddress", "custAddressError", !e.target.value.trim());
});

/* -------------------------------------------------------------
   12. Send order to WhatsApp
   ------------------------------------------------------------- */
document.getElementById("sendOrder").addEventListener("click", () => {
  const result = validateOrder();
  if (!result.valid) return;

  const { name, phone, address } = result;
  const notes = document.getElementById("custNotes").value.trim();

  const allItems = [];
  state.bases.forEach((b) =>
    allItems.push({ ...b, quantity: b.quantity || 1 }),
  );
  state.proteins.forEach((p) =>
    allItems.push({ ...p, quantity: p.quantity || 1 }),
  );
  state.extras.forEach((e) =>
    allItems.push({ ...e, quantity: e.quantity || 1 }),
  );

  const total = allItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  let message = `*New order — Rude Turkey*%0A%0A`;
  message += `*Plate:*%0A`;
  allItems.forEach((item) => {
    const qty = item.quantity || 1;
    const displayName = qty > 1 ? `${item.name} x${qty}` : item.name;
    message += `- ${displayName} (----)%0A`;
  });
  message += `%0A*Total: ----*%0A%0A`;
  message += `*Name:* ${name}%0A`;
  message += `*Phone:* ${phone}%0A`;
  message += `*Delivery address:* ${address}%0A`;
  if (notes) message += `*Notes:* ${notes}%0A`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  const stamp = document.getElementById("ticketStamp");
  stamp.classList.add("is-shown");
  setTimeout(() => stamp.classList.remove("is-shown"), 1400);

  window.open(url, "_blank");
});

/* -------------------------------------------------------------
   13. Scroll ticket to center when CTA is clicked
   ------------------------------------------------------------- */
document.getElementById("cartCta")?.addEventListener("click", (e) => {
  e.preventDefault();
  const ticket = document.getElementById("ticket");
  if (ticket) {
    ticket.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

/* ---- Scroll ticket to center when "Order Now" buttons are clicked ---- */
const orderNowButtons = document.querySelectorAll(
  ".nav__cta, .mobile-menu .btn--primary",
);
orderNowButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // prevent the default "#builder" anchor jump
    const ticket = document.getElementById("ticket");
    if (ticket) {
      ticket.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});

/* -------------------------------------------------------------
   14. Hero background — pinned "glass pane" effect
   Uses a scroll-linked transform instead of background-attachment:
   fixed, because iOS Safari ignores that property entirely.
   This works identically across all browsers.
   ------------------------------------------------------------- */
const heroBg = document.querySelector(".hero__bg");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (heroBg && heroSection && !prefersReducedMotion) {
  let ticking = false;

  function pinHeroBg() {
    const rect = heroSection.getBoundingClientRect();
    // Only touch the transform while the hero is actually on screen
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      heroBg.style.transform = `translate3d(0, ${-rect.top}px, 0)`;
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(pinHeroBg);
        ticking = true;
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", pinHeroBg, { passive: true });

  pinHeroBg();
}

/* ---- Scroll to mains when hero scroll indicator is clicked ---- */
const heroScroll = document.querySelector(".hero__scroll");
if (heroScroll) {
  heroScroll.addEventListener("click", (e) => {
    e.preventDefault();
    const mains = document.getElementById("mains");
    if (mains) {
      mains.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/* =============================================================
   FOOTER POOL TEXT — alternating phrases + colored emoji overlay
   ============================================================= */
(function () {
  const canvas = document.getElementById("footerCanvas");
  if (!canvas) return;
  const footer = canvas.closest(".footer");
  if (!footer) return;
  const ctx = canvas.getContext("2d");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* ================================================================
     ✏️  EDIT YOUR PHRASES HERE

     They alternate forever in this order.
     Add as many as you want, make them as long as you want —
     every phrase renders at the same size, right → left, no clipping.
     ================================================================ */
  const PHRASES = ["RUDE TURKEY", "Patronize us lahor oo, we nor rude 🥺"];

  const SAMPLE_THRESHOLD = 128;
  const CURSOR_RADIUS = 85;
  const PULSE_AMPLITUDE = 0.35;
  const COL_JOLLOF = "#D8481F";
  const COL_TURMERIC = "#E7A72E";

  const EMOJI_FONT =
    '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

  let W = 0,
    H = 0;
  let DOT_RADIUS = 2.0;
  let DOT_SPACING = 8;
  let FLOW_SPEED = 60;
  let FONT_SIZE = 100;
  let cullMargin = 20;

  let phraseIndex = 0;
  let phraseWidth = 0;
  let LINE_STEP = 0;
  let maxLines = 1;
  let lineIndex = 0;
  let flowOffset = 0;
  let descentOffset = 0;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let dots = [];
  let emojis = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let lastTime = performance.now();

  /* ============================================================
     EMOJI DETECTION
     ============================================================ */
  const EMOJI_REGEX =
    /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})\p{Emoji_Modifier}?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})\p{Emoji_Modifier}?)*/gu;

  function findEmojiRanges(text) {
    const ranges = [];
    EMOJI_REGEX.lastIndex = 0;
    let m;
    while ((m = EMOJI_REGEX.exec(text)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, char: m[0] });
    }
    return ranges;
  }

  /* ============================================================
     TWINKLE SPRITE
     ============================================================ */
  const twinkleSprite = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 96;
    const cx = c.getContext("2d");
    const g = cx.createRadialGradient(48, 48, 0, 48, 48, 48);
    g.addColorStop(0, "rgba(255, 252, 245, 1)");
    g.addColorStop(0.1, "rgba(235, 232, 225, 0.92)");
    g.addColorStop(0.28, "rgba(231, 167, 46, 0.55)");
    g.addColorStop(0.55, "rgba(200, 198, 205, 0.20)");
    g.addColorStop(1, "rgba(180, 178, 190, 0)");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 96, 96);
    return c;
  })();

  /* ============================================================
     FONT SIZE — reference size computed from PHRASES[0]
     ============================================================ */
  function computeFontSize() {
    const isMobile = W < 600;
    const widthFraction = isMobile ? 1.98 : 0.98;
    const heightFraction = isMobile ? 0.38 : 0.8;

    const BASE = 200;
    const mc = document.createElement("canvas").getContext("2d");
    mc.font = `900 ${BASE}px Anton, "Work Sans", sans-serif`;
    const refWidth = mc.measureText(PHRASES[0]).width;

    const byWidth = ((W * widthFraction) / refWidth) * BASE;
    const byHeight = H * heightFraction;
    FONT_SIZE = Math.min(byWidth, byHeight);
  }

  /* ============================================================
     LINE STEP
     ============================================================ */
  function computeMetrics() {
    const mc = document.createElement("canvas").getContext("2d");
    mc.font = `900 ${FONT_SIZE}px Anton, "Work Sans", sans-serif`;

    let maxH = 0;
    for (const p of PHRASES) {
      const m = mc.measureText(p);
      const asc = m.actualBoundingBoxAscent || FONT_SIZE * 0.8;
      const desc = m.actualBoundingBoxDescent || FONT_SIZE * 0.2;
      maxH = Math.max(maxH, asc + desc);
    }
    LINE_STEP = Math.ceil(maxH) + 12;
    maxLines = Math.max(1, Math.floor((H - 8) / LINE_STEP));
  }

  /* ============================================================
     BUILD DOTS + EMOJI POSITIONS
     ============================================================ */
  function buildDots() {
    dots = [];
    emojis = [];
    const isMobile = W < 600;

    DOT_SPACING = isMobile ? 6 : 7;
    FLOW_SPEED = isMobile ? 90 : 120;
    DOT_RADIUS = isMobile ? 2.8 : 2.0;

    const phrase = PHRASES[phraseIndex];

    const measure = document.createElement("canvas").getContext("2d");
    measure.font = `900 ${FONT_SIZE}px Anton, "Work Sans", sans-serif`;
    const naturalWidth = measure.measureText(phrase).width;

    const localFontSize = FONT_SIZE;
    const phrasePxWidth = Math.ceil(naturalWidth) + 40;

    const off = document.createElement("canvas");
    off.width = phrasePxWidth;
    off.height = H;
    const octx = off.getContext("2d");

    octx.font = `900 ${localFontSize}px Anton, "Work Sans", sans-serif`;
    octx.textAlign = "left";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(phrase, 20, H / 2);

    /* detect emoji and store their positions */
    const emojiRanges = findEmojiRanges(phrase);
    for (const r of emojiRanges) {
      const prefixW = octx.measureText(phrase.slice(0, r.start)).width;
      emojis.push({
        baseX: 20 + prefixW,
        baseY: H / 2,
        char: r.char,
        size: localFontSize,
      });
    }

    const img = octx.getImageData(0, 0, off.width, H).data;

    const sampled = [];
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (let y = 0; y < H; y += DOT_SPACING) {
      for (let x = 0; x < off.width; x += DOT_SPACING) {
        const i = (y * off.width + x) * 4;
        if (img[i + 3] > SAMPLE_THRESHOLD) {
          sampled.push({ x, y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (!sampled.length) return;

    phraseWidth = maxX - minX + DOT_SPACING;

    /* offset emoji positions by minX */
    for (const e of emojis) {
      e.baseX -= minX;
      e.baseY = 4 + (e.baseY - minY);
    }

    for (const s of sampled) {
      const bx = s.x - minX;
      const by = s.y - minY + 4;
      dots.push({
        baseX: bx,
        baseY: by,
        x: bx,
        y: by,
        homeX: bx,
        homeY: by,
        hoverX: 0,
        hoverY: 0,
        r: DOT_RADIUS,
        homeR: DOT_RADIUS,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.18 ? COL_TURMERIC : COL_JOLLOF,
        hoverIntensity: 0,
      });
    }
  }

  function layoutDots() {
    for (const d of dots) {
      d.homeX = d.baseX + flowOffset;
      d.homeY = d.baseY + descentOffset;
      d.x = d.homeX;
      d.y = d.homeY;
      d.hoverX = 0;
      d.hoverY = 0;
    }
  }

  function resize() {
    const rect = footer.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    if (!W || !H) return;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    computeFontSize();
    computeMetrics();

    lineIndex = 0;
    descentOffset = 0;
    buildDots();
    flowOffset = W;
    layoutDots();
  }

  /* ============================================================
     UPDATE
     ============================================================ */
  function update(dt) {
    const t = performance.now() / 1000;

    for (const d of dots) {
      d.hoverIntensity *= Math.pow(0.82, dt * 60);
      d.hoverX *= Math.pow(0.88, dt * 60);
      d.hoverY *= Math.pow(0.88, dt * 60);
    }

    flowOffset -= FLOW_SPEED * dt;

    if (flowOffset + phraseWidth < -20) {
      /* fully exited left — advance to next line, then next phrase */
      lineIndex = (lineIndex + 1) % maxLines;
      phraseIndex = (phraseIndex + 1) % PHRASES.length;
      descentOffset = lineIndex * LINE_STEP;

      buildDots();
      flowOffset = W;
      layoutDots();
    } else {
      for (const d of dots) {
        d.homeX = d.baseX + flowOffset;
        d.homeY = d.baseY + descentOffset;

        d.r = d.homeR + Math.sin(t * 1.8 + d.phase) * PULSE_AMPLITUDE;

        if (mouse.active) {
          const px = d.homeX + d.hoverX;
          const py = d.homeY + d.hoverY;
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_RADIUS && dist > 0.5) {
            const force = 1 - dist / CURSOR_RADIUS;
            const ang = Math.atan2(dy, dx);
            d.hoverX += Math.cos(ang) * force * 110 * dt;
            d.hoverY += Math.sin(ang) * force * 110 * dt;
            d.hoverIntensity = Math.max(d.hoverIntensity, force);
          }
        }

        d.x = d.homeX + d.hoverX;
        d.y = d.homeY + d.hoverY;
      }
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function render() {
    ctx.clearRect(0, 0, W, H);
    const t = performance.now() / 1000;

    /* main dots — batched by color */
    ctx.fillStyle = COL_JOLLOF;
    ctx.beginPath();
    for (const d of dots) {
      if (d.color !== COL_JOLLOF) continue;
      if (d.x < -cullMargin || d.x > W + cullMargin) continue;
      if (d.y < -cullMargin || d.y > H + cullMargin) continue;
      ctx.moveTo(d.x + d.r, d.y);
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = COL_TURMERIC;
    ctx.beginPath();
    for (const d of dots) {
      if (d.color !== COL_TURMERIC) continue;
      if (d.x < -cullMargin || d.x > W + cullMargin) continue;
      if (d.y < -cullMargin || d.y > H + cullMargin) continue;
      ctx.moveTo(d.x + d.r, d.y);
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    }
    ctx.fill();

    /* twinkle hover */
    for (const d of dots) {
      const hi = d.hoverIntensity;
      if (hi < 0.18) continue;
      if (d.x < -cullMargin || d.x > W + cullMargin) continue;
      if (d.y < -cullMargin || d.y > H + cullMargin) continue;
      const twinkle = 0.35 + Math.abs(Math.sin(t * 6 + d.phase * 2.7)) * 0.65;
      const size = d.r * (8 + twinkle * 6) * hi;
      const alpha = hi * twinkle;
      ctx.globalAlpha = alpha;
      ctx.drawImage(twinkleSprite, d.x - size / 2, d.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    /* colored emoji overlay */
    if (emojis.length) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      for (const e of emojis) {
        const ex = e.baseX + flowOffset;
        const ey = e.baseY + descentOffset;
        if (ex < -cullMargin - e.size || ex > W + cullMargin) continue;
        ctx.font = `${e.size}px ${EMOJI_FONT}`;
        ctx.fillText(e.char, ex, ey);
      }
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  /* ============================================================
     HOVER (mouse only — no click handlers)
     ============================================================ */
  footer.addEventListener("mousemove", (e) => {
    const r = footer.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  footer.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* ============================================================
     INIT
     ============================================================ */
  const ro = new ResizeObserver(resize);
  ro.observe(footer);
  resize();
  requestAnimationFrame(loop);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(resize, 200));
  }
})();
