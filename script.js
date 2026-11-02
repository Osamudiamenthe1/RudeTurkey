/* =============================================================
   RUDE TURKEY — FINAL (only button toggles stamp)
   ============================================================= */

/* -------------------------------------------------------------
   1. EDIT ME: your real WhatsApp number, digits only,
   country code first, no "+", no spaces, no dashes.
   Example for a Nigerian number 0803 123 4567 -> "2348031234567"
   ------------------------------------------------------------- */
let WHATSAPP_NUMBER = window.RT_DATA?.whatsappNumber || "2348134600671";

/* If site.js is still fetching when this module runs, pick up the
   admin-configured number as soon as it arrives. */
window.addEventListener("rt:data-ready", (e) => {
  const fresh = e.detail?.whatsappNumber;
  if (fresh) WHATSAPP_NUMBER = fresh;
});
window.addEventListener("load", () => {
  const fresh = window.RT_DATA?.whatsappNumber;
  if (fresh) WHATSAPP_NUMBER = fresh;
});
/* ---- Price formatter: Supabase stores prices in kobo ---- */
function formatNaira(kobo) {
  const n = Number(kobo) || 0;
  if (n <= 0) return "₦----";
  return "₦" + (n / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

document.getElementById("year").textContent = new Date().getFullYear();

/* -------------------------------------------------------------
   2. Scroll reveal animations
   ------------------------------------------------------------- */
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

function observeReveal(el) {
  if (el.classList.contains("is-visible")) return;
  revealObserver.observe(el);
}

/* Observe everything currently in the DOM */
document.querySelectorAll(".reveal").forEach(observeReveal);

/* And anything added later (site.js-created cards, etc.) */
const revealMutationObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.classList.contains("reveal")) observeReveal(node);
      node.querySelectorAll?.(".reveal").forEach(observeReveal);
    }
  }
});
revealMutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

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
const mainsGrid = document.querySelector(".mains__grid");
const mainsSection = document.querySelector(".mains");
const mainsProgress = document.getElementById("mainsProgress");
/* (the thumb element has been replaced by dynamically-built pills) */

if (mainsGrid && mainsSection) {
  let progressHideTimer = null;
  let lastScrollLeft = 0;
  let directionTimer = null;

  function updateMainsFade() {
    const atEnd =
      mainsGrid.scrollLeft + mainsGrid.clientWidth >= mainsGrid.scrollWidth - 4;
    const atStart = mainsGrid.scrollLeft <= 4;
    mainsSection.classList.toggle("is-end", atEnd);
    mainsSection.classList.toggle("is-scrolled", !atStart);
  }

  /* ---- Build one pill per scroll position ----
     Positions = cards - 1 (mobile shows 2 cards per view, so the
     number of snap stops is one less than the number of cards).
     Extremes are dots; middle pills are slightly wider. */
  function buildProgressPills() {
    if (!mainsProgress) return;

    const cardEls = mainsGrid.querySelectorAll(".main-card");
    const cardCount = cardEls.length;
    if (!cardCount) return;

    /* Derive visible count from layout — adapts to 2-per-view
       (mobile/tablet) and 3-per-view (desktop) automatically. */
    const cardW = cardEls[0].getBoundingClientRect().width || 1;
    const visible = Math.max(1, Math.round(mainsGrid.clientWidth / cardW));

    const positions = Math.max(1, cardCount - visible + 1);

    /* Single position = no scroll possible → hide the rail. */
    if (positions < 2) {
      mainsProgress.style.display = "none";
      return;
    }
    mainsProgress.style.display = "";

    mainsProgress.innerHTML = "";

    for (let i = 0; i < positions; i++) {
      const pill = document.createElement("span");
      pill.className = "mains__progress-pill";
      if (i > 0 && i < positions - 1) {
        pill.classList.add("mains__progress-pill--wide");
      }
      mainsProgress.appendChild(pill);
    }
  }

  /* ---- Direction-aware drop lean ----
     Called each time the scroll delta is meaningful. The class
     sticks for 500ms after motion stops, then the pill settles
     back into a symmetric shape. */
  function setSwipeDirection(dir) {
    mainsProgress.classList.remove("is-swipe-left", "is-swipe-right");
    if (dir === "left") mainsProgress.classList.add("is-swipe-left");
    if (dir === "right") mainsProgress.classList.add("is-swipe-right");
    clearTimeout(directionTimer);
    directionTimer = setTimeout(() => {
      mainsProgress.classList.remove("is-swipe-left", "is-swipe-right");
    }, 500);
  }

  function updateMainsProgress() {
    if (!mainsProgress) return;

    const pills = mainsProgress.querySelectorAll(".mains__progress-pill");
    if (!pills.length) return;

    /* Direction: compare against last known scrollLeft. */
    const dx = mainsGrid.scrollLeft - lastScrollLeft;
    if (Math.abs(dx) > 2) {
      setSwipeDirection(dx > 0 ? "right" : "left");
    }
    lastScrollLeft = mainsGrid.scrollLeft;

    /* Active pill index from continuous scroll ratio. */
    const maxScroll = mainsGrid.scrollWidth - mainsGrid.clientWidth;
    const scrollRatio = maxScroll > 0 ? mainsGrid.scrollLeft / maxScroll : 0;
    const activeIdx = Math.round(scrollRatio * (pills.length - 1));

    pills.forEach((p, i) => p.classList.toggle("is-active", i === activeIdx));

    mainsProgress.classList.add("is-visible");
    clearTimeout(progressHideTimer);
    progressHideTimer = setTimeout(() => {
      mainsProgress.classList.remove("is-visible");
    }, 1400);
  }

  /* ---- Rebuild pills whenever the grid's children change ----
     site.js replaces the skeleton cards with real ones after it
     fetches from Supabase. This observer catches that swap and
     also any future adds/removes of cards. */
  const progressPillObserver = new MutationObserver(() => {
    buildProgressPills();
    updateMainsProgress();
  });
  progressPillObserver.observe(mainsGrid, { childList: true });

  mainsGrid.addEventListener(
    "scroll",
    () => {
      updateMainsFade();
      updateMainsProgress();
    },
    { passive: true },
  );

  window.addEventListener(
    "resize",
    () => {
      updateMainsFade();
      updateMainsProgress();
    },
    { passive: true },
  );

  buildProgressPills();
  updateMainsFade();
  updateMainsProgress();
}

/* -------------------------------------------------------------
   6c. Mobile scroll hint — vertical follow
   -------------------------------------------------------------
   The hint (arrow + line) starts at its natural "ceiling" just
   below the card image. As the page scrolls down and the hint's
   ceiling crosses the middle of the viewport, the hint locks to
   that mid-viewport line and slides DOWN through the card body
   in lockstep with the scroll. It stops when its bottom edge is
   ~8px above the first card's "Add to Tray" button. Scrolling
   back up releases it in reverse.

   All motion is expressed as an offset from the CSS `top` value,
   so the ceiling position (and any future tweak to it) stays the
   single source of truth in the stylesheet.
   ------------------------------------------------------------- */
const scrollHint = document.getElementById("mainsScrollHint");
const mainsGridWrap = document.querySelector(".mains__grid-wrap");

if (scrollHint && mainsGridWrap && mainsGrid) {
  // Mobile + tablet: hint is active wherever the carousel is edge-to-edge
  const MOBILE_MQ = window.matchMedia("(max-width: 899px)");

  /* Anchor point — fraction of viewport height where the hint
     "grabs" on and stops tracking. 0.5 = exact middle. */
  const HINT_ANCHOR_RATIO = 0.5;

  /* Gap between the hint's bottom and the Add-to-Tray button. */
  const HINT_BOTTOM_GAP = 8;

  let hintCeiling = 0; // hint's centre, in grid-wrap coords, at rest
  let hintBottom = 0; // hint's centre, in grid-wrap coords, at full travel
  let hintTravel = 0; // hintBottom - hintCeiling (always >= 0)

  function measureHintTravel() {
    if (!MOBILE_MQ.matches) return;

    const wrapRect = mainsGridWrap.getBoundingClientRect();

    /* ---- Ceiling: gap between image and body of the first card ----
       Measured from card geometry so it adapts to any image
       height, any gap, any viewport. */
    const firstCard = mainsGridWrap.querySelector(".main-card");
    let ceiling;

    if (firstCard) {
      const img = firstCard.querySelector(".main-card__img");
      const body = firstCard.querySelector(".main-card__body");
      if (img && body) {
        const imgBottom = img.getBoundingClientRect().bottom - wrapRect.top;
        const bodyTop = body.getBoundingClientRect().top - wrapRect.top;
        ceiling = (imgBottom + bodyTop) / 2;
      }
    }

    if (ceiling === undefined) {
      /* Fallback — read whatever the stylesheet produced. */
      const prevTop = scrollHint.style.top;
      scrollHint.style.top = "";
      const r = scrollHint.getBoundingClientRect();
      ceiling = r.top + r.height / 2 - wrapRect.top;
      scrollHint.style.top = prevTop;
    }

    hintCeiling = ceiling;

    /* Set `top` directly — because the transform is
       translateY(calc(-50% + Xpx)), the hint's centre lands at
       whatever `top` we write. */
    scrollHint.style.top = `${ceiling}px`;

    const hintHalf = scrollHint.getBoundingClientRect().height / 2;

    /* Bottom limit — just above the first card's foot. */
    const firstFoot = mainsGridWrap.querySelector(".main-card__foot");
    if (firstFoot) {
      const footRect = firstFoot.getBoundingClientRect();
      hintBottom = footRect.top - wrapRect.top - HINT_BOTTOM_GAP - hintHalf;
    } else {
      /* Fallback if the menu hasn't rendered. */
      const firstImg = mainsGridWrap.querySelector(".main-card__img");
      const imgH = firstImg ? firstImg.getBoundingClientRect().height : 200;
      hintBottom = imgH + 60;
    }

    hintTravel = Math.max(0, hintBottom - hintCeiling);

    /* Reveal now that positioning is done. */
    scrollHint.classList.add("is-measured");
  }

  function updateHintPosition() {
    if (!MOBILE_MQ.matches) {
      scrollHint.style.transform = "";
      return;
    }

    const wrapRect = mainsGridWrap.getBoundingClientRect();
    const anchorY = window.innerHeight * HINT_ANCHOR_RATIO;

    const ceilingViewportY = wrapRect.top + hintCeiling;
    const overshoot = anchorY - ceilingViewportY;

    let offset = 0;
    if (overshoot > 0) {
      offset = Math.min(overshoot, hintTravel);
    }

    scrollHint.style.transform = `translateY(calc(-50% + ${offset}px))`;
  }

  /* rAF throttle so we only compute once per frame. */
  let hintRaf = null;
  function scheduleHintUpdate() {
    if (hintRaf) return;
    hintRaf = requestAnimationFrame(() => {
      hintRaf = null;
      updateHintPosition();
    });
  }

  /* Initial paint */
  measureHintTravel();
  updateHintPosition();

  /* Page scroll — the sole trigger for vertical motion. */
  window.addEventListener("scroll", scheduleHintUpdate, { passive: true });

  /* Viewport resize — recompute geometry then reposition. */
  window.addEventListener(
    "resize",
    () => {
      measureHintTravel();
      scheduleHintUpdate();
    },
    { passive: true },
  );

  /* Breakpoint flips — e.g. tablet ↔ phone orientation. */
  MOBILE_MQ.addEventListener("change", () => {
    measureHintTravel();
    scheduleHintUpdate();
  });

  /* Card heights can shift when menu items render, images load,
     descriptions reflow, etc. Re-measure on every size change. */
  const hintResizeObserver = new ResizeObserver(() => {
    measureHintTravel();
    scheduleHintUpdate();
  });
  hintResizeObserver.observe(mainsGridWrap);

  /* Belt-and-braces: re-measure once the site data has landed. */
  window.addEventListener("rt:data-ready", () => {
    requestAnimationFrame(() => {
      measureHintTravel();
      scheduleHintUpdate();
    });
  });
}

/* -------------------------------------------------------------
   6d. Protein carousel — same mechanics as the mains carousel,
   applied to the "Choose your protein" option grid.
   Mobile only. 4 cards per view (adapts to any viewport).
   ------------------------------------------------------------- */
const proteinGrid = document.getElementById("proteinOptions");
const proteinStep = document.getElementById("proteinStep");
const proteinProgress = document.getElementById("proteinProgress");

if (proteinGrid && proteinStep && proteinProgress) {
  let proteinProgressHideTimer = null;
  let proteinLastScrollLeft = 0;
  let proteinDirectionTimer = null;

  function updateProteinFade() {
    const atEnd =
      proteinGrid.scrollLeft + proteinGrid.clientWidth >=
      proteinGrid.scrollWidth - 4;
    const atStart = proteinGrid.scrollLeft <= 4;
    proteinStep.classList.toggle("is-end", atEnd);
    proteinStep.classList.toggle("is-scrolled", !atStart);
  }

  /* Positions = cards - visible + 1. The visible count is derived
     from card width vs grid width, so this auto-adjusts if you
     later change the per-view card count in CSS. Extremes are
     dots; middles are wide pills. */
  function buildProteinPills() {
    const cardCount = proteinGrid.querySelectorAll(".option-card").length;
    if (!cardCount) return;

    const isMobile = window.matchMedia("(max-width: 599px)").matches;
    const isDesktop = window.matchMedia("(min-width: 900px)").matches;

    /* Desktop has no carousel — hide the rail entirely. */
    if (isDesktop) {
      proteinProgress.innerHTML = "";
      proteinProgress.style.display = "none";
      return;
    }

    /* Cards per swipe-page.
     Mobile  <600px : 2 cols × 2 rows = 4
     Tablet 600–899 : 2 cols × 3 rows = 6 */
    const CARDS_PER_SLIDE = isMobile ? 4 : 6;
    const positions = Math.max(1, Math.ceil(cardCount / CARDS_PER_SLIDE));

    if (positions < 2) {
      proteinProgress.style.display = "none";
      return;
    }
    proteinProgress.style.display = "";

    proteinProgress.innerHTML = "";
    for (let i = 0; i < positions; i++) {
      const pill = document.createElement("span");
      pill.className = "protein__progress-pill";
      if (i > 0 && i < positions - 1) {
        pill.classList.add("protein__progress-pill--wide");
      }
      proteinProgress.appendChild(pill);
    }
  }
  function setProteinSwipeDirection(dir) {
    proteinProgress.classList.remove("is-swipe-left", "is-swipe-right");
    if (dir === "left") proteinProgress.classList.add("is-swipe-left");
    if (dir === "right") proteinProgress.classList.add("is-swipe-right");
    clearTimeout(proteinDirectionTimer);
    proteinDirectionTimer = setTimeout(() => {
      proteinProgress.classList.remove("is-swipe-left", "is-swipe-right");
    }, 500);
  }

  function updateProteinProgress() {
    const pills = proteinProgress.querySelectorAll(".protein__progress-pill");
    if (!pills.length) return;

    const dx = proteinGrid.scrollLeft - proteinLastScrollLeft;
    if (Math.abs(dx) > 2) {
      setProteinSwipeDirection(dx > 0 ? "right" : "left");
    }
    proteinLastScrollLeft = proteinGrid.scrollLeft;

    const maxScroll = proteinGrid.scrollWidth - proteinGrid.clientWidth;
    const scrollRatio = maxScroll > 0 ? proteinGrid.scrollLeft / maxScroll : 0;
    const activeIdx = Math.round(scrollRatio * (pills.length - 1));

    pills.forEach((p, i) => p.classList.toggle("is-active", i === activeIdx));

    proteinProgress.classList.add("is-visible");
    clearTimeout(proteinProgressHideTimer);
    proteinProgressHideTimer = setTimeout(() => {
      proteinProgress.classList.remove("is-visible");
    }, 1400);
  }

  /* Rebuild pills when site.js swaps skeletons for real items,
     or if the admin later adds/removes proteins. */
  const proteinPillObserver = new MutationObserver(() => {
    buildProteinPills();
    updateProteinProgress();
  });
  proteinPillObserver.observe(proteinGrid, { childList: true });

  proteinGrid.addEventListener(
    "scroll",
    () => {
      updateProteinFade();
      updateProteinProgress();
    },
    { passive: true },
  );

  window.addEventListener(
    "resize",
    () => {
      buildProteinPills();
      updateProteinFade();
      updateProteinProgress();
    },
    { passive: true },
  );

  buildProteinPills();
  updateProteinFade();
  updateProteinProgress();
}

/* -------------------------------------------------------------
   6e. Protein scroll hint — vertical follow
   -------------------------------------------------------------
   Ceiling: the gap between the two rows of protein cards
   (measured from the actual card geometry so it adapts to any
   viewport width). Floor: bottom of the whole 2-row grid, minus
   an 8px cushion. Scroll locks it to mid-viewport and slides it
   down through row 2, then releases at the floor. Reverse on
   scroll up.
   ------------------------------------------------------------- */
const proteinScrollHint = document.getElementById("proteinScrollHint");
const proteinGridWrap = document.querySelector(".protein__grid-wrap");

if (proteinScrollHint && proteinGridWrap && proteinGrid) {
  // Mobile + tablet: hint is active wherever the protein carousel runs
  const PROTEIN_MQ = window.matchMedia("(max-width: 899px)");

  const PROTEIN_ANCHOR_RATIO = 0.5; // mid-viewport
  const PROTEIN_BOTTOM_GAP = 8; // px above the grid's bottom edge

  let proteinHintCeiling = 0; // hint centre at rest, in wrap coords
  let proteinHintBottom = 0; // hint centre at max travel
  let proteinHintTravel = 0; // bottom - ceiling, always >= 0

  function measureProteinHintTravel() {
    if (!PROTEIN_MQ.matches) return;

    /* Clear the transform so rect measurements are clean
       (position doesn't depend on it, but tidier). */
    const prevTransform = proteinScrollHint.style.transform;
    proteinScrollHint.style.transform = "";

    const wrapRect = proteinGridWrap.getBoundingClientRect();

    /* ---- Ceiling: gap between row 1 and row 2 ----
       With `grid-auto-flow: column` and 2 template rows, cards
       fill column-by-column. So cards[0] and cards[1] are the
       top and bottom of the first column — their facing edges
       straddle the inter-row gap. */
    const cards = proteinGrid.querySelectorAll(".option-card");
    let ceiling;

    if (cards.length >= 2) {
      const firstBottom =
        cards[0].getBoundingClientRect().bottom - wrapRect.top;
      const secondTop = cards[1].getBoundingClientRect().top - wrapRect.top;
      ceiling = (firstBottom + secondTop) / 2;

      /* Nudge up 2px — matches where the eye reads the gap's
         centre once borders and antialiasing are factored in. */
      ceiling -= 2;
    } else {
      /* Fewer than 2 cards — fall back to whatever position the
         stylesheet produced, so the hint still lands somewhere
         reasonable instead of at 0. */
      const r = proteinScrollHint.getBoundingClientRect();
      ceiling = r.top + r.height / 2 - wrapRect.top;
    }

    proteinHintCeiling = ceiling;

    /* Because the transform is translateY(calc(-50% + Xpx)),
       the hint's CENTRE sits exactly at the CSS `top` value.
       So we set `top` to the ceiling directly. */
    proteinScrollHint.style.top = `${ceiling}px`;

    /* ---- Floor: bottom of the LAST CARD, not the scroller ----
       The scroller has extra vertical padding for glow room, so
       its own bottom sits lower than the visible content. Using
       the last card's bottom measures the actual content edge. */
    const hintHalf = proteinScrollHint.getBoundingClientRect().height / 2;

    const cardsForFloor = proteinGrid.querySelectorAll(".option-card");
    const lastCard = cardsForFloor[cardsForFloor.length - 1];
    const gridBottom = lastCard
      ? lastCard.getBoundingClientRect().bottom - wrapRect.top
      : proteinGrid.getBoundingClientRect().bottom - wrapRect.top;

    proteinHintBottom = gridBottom - PROTEIN_BOTTOM_GAP - hintHalf;
    proteinHintTravel = Math.max(0, proteinHintBottom - proteinHintCeiling);

    if (prevTransform) proteinScrollHint.style.transform = prevTransform;

    /* Reveal now that positioning is done. */
    proteinScrollHint.classList.add("is-measured");
  }

  function updateProteinHintPosition() {
    if (!PROTEIN_MQ.matches) {
      proteinScrollHint.style.transform = "";
      return;
    }

    const wrapRect = proteinGridWrap.getBoundingClientRect();
    const anchorY = window.innerHeight * PROTEIN_ANCHOR_RATIO;

    const ceilingViewportY = wrapRect.top + proteinHintCeiling;
    const overshoot = anchorY - ceilingViewportY;

    let offset = 0;
    if (overshoot > 0) {
      offset = Math.min(overshoot, proteinHintTravel);
    }

    proteinScrollHint.style.transform = `translateY(calc(-50% + ${offset}px))`;
  }

  let proteinHintRaf = null;
  function scheduleProteinHintUpdate() {
    if (proteinHintRaf) return;
    proteinHintRaf = requestAnimationFrame(() => {
      proteinHintRaf = null;
      updateProteinHintPosition();
    });
  }

  /* Initial paint */
  measureProteinHintTravel();
  updateProteinHintPosition();

  /* Page scroll */
  window.addEventListener("scroll", scheduleProteinHintUpdate, {
    passive: true,
  });

  /* Viewport resize */
  window.addEventListener(
    "resize",
    () => {
      measureProteinHintTravel();
      scheduleProteinHintUpdate();
    },
    { passive: true },
  );

  /* Breakpoint flips (tablet ↔ phone orientation) */
  PROTEIN_MQ.addEventListener("change", () => {
    measureProteinHintTravel();
    scheduleProteinHintUpdate();
  });

  /* Grid size changes — menu items render, images load, admin
     adds/removes proteins. */
  const proteinHintRO = new ResizeObserver(() => {
    measureProteinHintTravel();
    scheduleProteinHintUpdate();
  });
  proteinHintRO.observe(proteinGridWrap);

  /* Belt-and-braces — re-measure once site data lands. */
  window.addEventListener("rt:data-ready", () => {
    requestAnimationFrame(() => {
      measureProteinHintTravel();
      scheduleProteinHintUpdate();
    });
  });
}

/* -------------------------------------------------------------
   7. Plate builder state – Multiple bases, proteins, extras
   ------------------------------------------------------------- */
const state = {
  bases: [],
  proteins: [],
  extras: [],
  combos: [],
};

function getTotalItems() {
  let count = 0;
  state.bases.forEach((b) => (count += b.quantity || 1));
  state.proteins.forEach((p) => (count += p.quantity || 1));
  state.extras.forEach((e) => (count += e.quantity || 1));
  state.combos.forEach((c) => (count += c.quantity || 1));
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

document.addEventListener("click", (e) => {
  const card = e.target.closest(".option-card");
  if (!card) return;
  if (card.classList.contains("option-card--soon")) return;
  selectOption(card);
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
  state.combos.forEach((c) => items.push({ ...c, type: "combo", ref: c }));

  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = '<li class="ticket__empty">Nothing on plate yet.</li>';
  } else {
    items.forEach((item) => {
      const li = document.createElement("li");

      /* ---- Combo branch: own layout with contents sub-list ---- */
      if (item.type === "combo") {
        li.className = "ticket__item ticket__item--combo";

        const row = document.createElement("div");
        row.className = "ticket__item-row";

        const nameSpan = document.createElement("span");
        nameSpan.className = "ticket__item-name";
        nameSpan.textContent = item.name;
        row.appendChild(nameSpan);

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
        row.appendChild(controls);

        const priceSpan = document.createElement("span");
        priceSpan.className = "ticket__item-price";
        priceSpan.textContent = formatNaira(
          Number(item.price) * (item.quantity || 1),
        );
        row.appendChild(priceSpan);

        li.appendChild(row);

        /* Contents sub-list, scaled by combo quantity */
        const contents = item.ref.contents || [];
        if (contents.length) {
          const sublist = document.createElement("ul");
          sublist.className = "ticket__item-contents";
          contents.forEach((c) => {
            const subLi = document.createElement("li");
            const scaledQty = (Number(c.qty) || 1) * (item.quantity || 1);
            subLi.textContent = `${c.name} ×${scaledQty}`;
            sublist.appendChild(subLi);
          });
          li.appendChild(sublist);
        }

        plusBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          item.ref.quantity = (item.ref.quantity || 1) + 1;
          renderTicket();
        });

        minusBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const currentQty = item.ref.quantity || 1;
          if (currentQty <= 1) {
            const idx = state.combos.indexOf(item.ref);
            if (idx > -1) state.combos.splice(idx, 1);
            const card = document.querySelector(
              `.main-card--combo[data-combo-id="${item.ref.id}"]`,
            );
            if (card) {
              card.classList.remove("has-added");
              const stamp = card.querySelector(".main-card__stamp");
              if (stamp) stamp.classList.remove("is-visible");
            }
          } else {
            item.ref.quantity = currentQty - 1;
          }
          renderTicket();
        });

        list.appendChild(li);
        return;
      }

      /* ---- Standard branch: bases, proteins, extras ---- */
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
      priceSpan.className = "ticket__item-price";
      priceSpan.textContent = formatNaira(
        Number(item.price) * (item.quantity || 1),
      );

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
    allItems.push({ ...b, type: "base", quantity: b.quantity || 1 }),
  );
  state.proteins.forEach((p) =>
    allItems.push({ ...p, type: "protein", quantity: p.quantity || 1 }),
  );
  state.extras.forEach((e) =>
    allItems.push({ ...e, type: "extra", quantity: e.quantity || 1 }),
  );
  state.combos.forEach((c) =>
    allItems.push({ ...c, type: "combo", quantity: c.quantity || 1 }),
  );

  const total = allItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0,
  );
  totalEl.textContent = formatNaira(total);

  const hasCombos = state.combos.length > 0;
  const ready =
    (state.bases.length > 0 && state.proteins.length > 0) || hasCombos;

  noteEl.textContent = ready
    ? "Fill in your details above, then send it in."
    : "Pick a combo or build your plate to get started.";

  updateCartVisibility();
  updateMainCardStamps();
  updateAlignmentErrorUI(); // <-- add this
}

/* -------------------------------------------------------------
   9. Main card stamp updater
   ------------------------------------------------------------- */
function updateMainCardStamps() {
  document.querySelectorAll(".main-card").forEach((card) => {
    const stamp = card.querySelector(".main-card__stamp");
    if (!stamp) return;

    /* Combo cards key off data-combo-id */
    if (card.classList.contains("main-card--combo")) {
      const comboId = card.dataset.comboId;
      const isAdded = state.combos.some((c) => c.id === comboId);
      stamp.classList.toggle("is-visible", isAdded);
      card.classList.toggle("has-added", isAdded);
      return;
    }

    /* Mains cards key off data-base (existing behavior) */
    const baseName = card.dataset.base;
    const isAdded = state.bases.some((b) => b.name === baseName);
    stamp.classList.toggle("is-visible", isAdded);
    card.classList.toggle("has-added", isAdded);
  });
}

/* -------------------------------------------------------------
   10. Main card "Add to Plate" button handler (only button toggles)
   ------------------------------------------------------------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn--add");
  if (!btn || btn.disabled) return;
  e.stopPropagation();
  const baseName = btn.dataset.base;
  const matchingCard = document.querySelector(
    `#baseOptions .option-card[data-name="${baseName}"]`,
  );
  if (!matchingCard) return;

  /* Capture the state BEFORE the toggle. If the card is already
     selected, this tap will deselect it — in that case we do NOT
     want to scroll the page. If it's unselected, this tap will
     select it — then we scroll to the builder. */
  const wasSelected = matchingCard.classList.contains("is-selected");

  selectOption(matchingCard);

  if (!wasSelected) {
    document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
  }
});

/* -------------------------------------------------------------
   Combo "Add" handler — toggles the combo in the cart.
   ------------------------------------------------------------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn--add-combo");
  if (!btn || btn.disabled) return;
  e.stopPropagation();

  const comboId = btn.dataset.comboId;
  const card = document.querySelector(
    `.main-card--combo[data-combo-id="${comboId}"]`,
  );
  if (!card) return;

  const name = card.dataset.comboName;
  const price = Number(card.dataset.price) || 0;
  let contents = [];
  try {
    contents = JSON.parse(card.dataset.contents || "[]");
  } catch (_) {
    contents = [];
  }

  const existingIdx = state.combos.findIndex((c) => c.id === comboId);

  if (existingIdx > -1) {
    // It's already in the cart, so remove it
    state.combos.splice(existingIdx, 1);
  } else {
    // It's not in the cart, so add it
    state.combos.push({
      id: comboId,
      name,
      price,
      contents,
      quantity: 1,
    });

    // Only scroll to the builder when they ADD it, not when they remove it
    document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
  }

  /* renderTicket() automatically calls updateMainCardStamps(), 
     which handles adding/removing the "ADDED" stamp and the green border! */
  renderTicket();
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

/* ---- Base ↔ protein alignment helpers ---- */
function getOrderCounts() {
  let baseCount = state.bases.reduce((s, b) => s + (b.quantity || 1), 0);
  let proteinCount = state.proteins.reduce((s, p) => s + (p.quantity || 1), 0);

  /* Combos contribute their contents to the effective counts.
     A combo of 1 rice + 2 turkey adds 1 base + 2 proteins —
     so a customer who buys that combo + 1 standalone rice
     still has 2 base ≤ 2 protein and passes. */
  state.combos.forEach((combo) => {
    const comboQty = combo.quantity || 1;
    (combo.contents || []).forEach((item) => {
      const contentsQty = (Number(item.qty) || 1) * comboQty;
      if (item.type === "base") baseCount += contentsQty;
      else if (item.type === "protein") proteinCount += contentsQty;
    });
  });

  return { baseCount, proteinCount };
}
function checkAlignment() {
  const { baseCount, proteinCount } = getOrderCounts();
  if (baseCount > proteinCount) {
    const shortBy = baseCount - proteinCount;
    const basesWord = baseCount === 1 ? "base" : "bases";
    const protWord = proteinCount === 1 ? "protein" : "proteins";
    const addWord =
      shortBy === 1 ? "1 more protein" : `${shortBy} more proteins`;
    const removeWord = shortBy === 1 ? "1 base" : `${shortBy} bases`;
    return {
      valid: false,
      message:
        `Each base needs its own protein. You have ${baseCount} ${basesWord} ` +
        `but only ${proteinCount} ${protWord} — add ${addWord} or remove ${removeWord}.`,
    };
  }
  return { valid: true };
}

/* Called from renderTicket() — only touches the UI if the
   error was already visible, so it doesn't pop open while the
   user is still building their order. */
function updateAlignmentErrorUI() {
  const el = document.getElementById("ticketAlignError");
  if (!el || el.hidden) return;
  const a = checkAlignment();
  if (a.valid) {
    el.hidden = true;
    el.textContent = "";
  } else {
    el.textContent = "⚠ " + a.message;
  }
}

function validateOrder() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();

  const hasCombos = state.combos.length > 0;

  /* If they have a combo, they don't strictly need to pick a standalone base/protein. 
     The checkAlignment() function will still ensure totals match. */
  const baseMissing = !hasCombos && state.bases.length === 0;
  const proteinMissing = !hasCombos && state.proteins.length === 0;

  const nameMissing = !name;
  const phoneMissing = !phone;
  const addressMissing = !address;

  setStepError("baseStep", "baseStepError", baseMissing);
  setStepError("proteinStep", "proteinStepError", proteinMissing);
  setFieldError("custName", "custNameError", nameMissing);
  setFieldError("custPhone", "custPhoneError", phoneMissing);
  setFieldError("custAddress", "custAddressError", addressMissing);

  const noteEl = document.getElementById("ticketNote");

  /* 1. Missing base or protein — the most basic error */
  if (baseMissing || proteinMissing) {
    const target = baseMissing
      ? document.getElementById("baseStep")
      : document.getElementById("proteinStep");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    noteEl.textContent =
      "A few things are missing — check the highlighted sections above.";
    return { valid: false };
  }

  /* 2. Alignment — at least one protein per base */
  const alignment = checkAlignment();
  if (!alignment.valid) {
    const alignErr = document.getElementById("ticketAlignError");
    if (alignErr) {
      alignErr.textContent = "⚠ " + alignment.message;
      alignErr.hidden = false;
    }
    noteEl.textContent = "Fix your plate before sending.";
    document
      .getElementById("ticket")
      .scrollIntoView({ behavior: "smooth", block: "center" });
    return { valid: false };
  }

  /* 3. Contact details */
  if (nameMissing || phoneMissing || addressMissing) {
    const firstInvalid = nameMissing
      ? document.getElementById("custName")
      : phoneMissing
        ? document.getElementById("custPhone")
        : document.getElementById("custAddress");
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    noteEl.textContent =
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
    allItems.push({ ...b, type: "base", quantity: b.quantity || 1 }),
  );
  state.proteins.forEach((p) =>
    allItems.push({ ...p, type: "protein", quantity: p.quantity || 1 }),
  );
  state.extras.forEach((e) =>
    allItems.push({ ...e, type: "extra", quantity: e.quantity || 1 }),
  );
  state.combos.forEach((c) =>
    allItems.push({ ...c, type: "combo", quantity: c.quantity || 1 }),
  );

  const total = allItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  /* ---- Build the message as plain text with real newlines ----
     Do NOT pre-encode anything. We let encodeURIComponent()
     handle every special character at the end — & # = + % ? /
     spaces, quotes, emoji, all of it. That single call is what
     makes the URL safe against parameter smuggling. */
  let message = `*New order — Rude Turkey*\n\n`;
  message += `*Plate:*\n`;
  allItems.forEach((item) => {
    const qty = item.quantity || 1;
    const lineTotal = Number(item.price) * qty;
    const displayName = qty > 1 ? `${item.name} x${qty}` : item.name;
    message += `- ${displayName} — ${formatNaira(lineTotal)}\n`;

    /* Combo contents — indented under the parent line */
    if (
      item.type === "combo" &&
      Array.isArray(item.contents) &&
      item.contents.length
    ) {
      item.contents.forEach((c) => {
        const scaledQty = (Number(c.qty) || 1) * qty;
        message += `    • ${c.name} x${scaledQty}\n`;
      });
    }
  });
  message += `\n*Total: ${formatNaira(total)}*\n\n`;
  message += `*Name:* ${name}\n`;
  message += `*Phone:* ${phone}\n`;
  message += `*Delivery address:* ${address}\n`;
  if (notes) message += `*Notes:* ${notes}\n`;

  /* ---- Two defensive layers on the number ----
     1. Strip everything that isn't a digit — a phone number must
        never be able to smuggle "?x=1&y=2" into the URL.
     2. Fall back to the known-good default if stripping produced
        nothing (e.g. data was tampered with or empty). */
  const safeNumber =
    String(WHATSAPP_NUMBER || "").replace(/\D/g, "") || "2348134600671";

  const url = `https://wa.me/${safeNumber}?text=${encodeURIComponent(message)}`;
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

  /* ---- Live MOTD refresh — site.js fires this after its fetch ---- */
  window.addEventListener("rt:data-ready", (e) => {
    const fresh = e.detail?.phrases;
    if (!fresh?.length) return;
    PHRASES = fresh;
    phraseIndex = 0;
    lineIndex = 0;
    descentOffset = 0;
    buildDots();
    flowOffset = W;
    layoutDots();
  });

  /* ================================================================
     ✏️  EDIT YOUR PHRASES HERE

     They alternate forever in this order.
     Add as many as you want, make them as long as you want —
     every phrase renders at the same size, right → left, no clipping.
     ================================================================ */
  let PHRASES =
    window.RT_DATA?.phrases?.length > 0
      ? window.RT_DATA.phrases
      : ["RUDE TURKEY", "Patronize us lahor oo, we nor rude 🥺"];

  /* If site.js is still fetching, pick up the real phrases later */
  window.addEventListener("load", () => {
    const fresh = window.RT_DATA?.phrases;
    if (fresh?.length && fresh.join("|") !== PHRASES.join("|")) {
      PHRASES = fresh;
      phraseIndex = 0;
      if (typeof resize === "function") resize();
    }
  });

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

    /* Fixed reference — keeps the dot size identical to what the
       footer looked like when "RUDE TURKEY" was the first phrase.
       Long MOTD phrases scroll at this size instead of shrinking. */
    const REFERENCE_PHRASE = "RUDE TURKEY";
    const refWidth = mc.measureText(REFERENCE_PHRASE).width;

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

  let footerStarted = false;
  const footerCanvasObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !footerStarted) {
          footerStarted = true;
          resize();
          requestAnimationFrame(loop);
        }
      });
    },
    { threshold: 0 },
  );
  footerCanvasObserver.observe(footer);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (footerStarted) setTimeout(resize, 200);
    });
  }
})();
