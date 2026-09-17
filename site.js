/* =============================================================
   RUDE TURKEY — PUBLIC SITE DATA
   Fetches settings + menu items from Supabase and populates
   the public DOM. Runs before script.js (module order).
   ============================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* -------------------------------------------------------------
   Same credentials as admin.js — publishable key is public by
   design; RLS protects the data.
   ------------------------------------------------------------- */
const SUPABASE_URL = "https://zsuewjxuvrnsrxighgqy.supabase.co";
const SUPABASE_KEY = "sb_publishable_b0iLHOza4_ZOTEAaKcH-nA_t3nmSxV-";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* -------------------------------------------------------------
   Fallbacks — used if the network is down or the fetch fails.
   Keeps the site functional even when Supabase is unreachable.
   ------------------------------------------------------------- */
const FALLBACKS = {
  whatsapp_number: "2348134600671",
  tagline: "Bold flavours. Wicked Turks.",
  opening_hours: "Tue & Thu, 11am – 2:30pm",
  location: "Uniben/Ugbowo axis, Benin City, Edo State.",
  footer_motd: "RUDE TURKEY\nPatronize us lahor oo, we nor rude 🥺",
};

/* -------------------------------------------------------------
   Small helpers
   ------------------------------------------------------------- */
function nairaFromKobo(kobo) {
  const n = Number(kobo) || 0;
  if (n <= 0) return "₦----";
  return "₦" + (n / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function escapeAttr(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* -------------------------------------------------------------
   1. FETCH — settings + menu items in parallel
   ------------------------------------------------------------- */
let settings = {};
let menuItems = [];

/* ---- Settings fetch (independent) ---- */
try {
  const res = await supabase.from("site_settings").select("key, value");
  if (res.error) throw res.error;
  for (const row of res.data || []) {
    settings[row.key] = row.value ?? "";
  }
  console.info(`[site] loaded ${Object.keys(settings).length} settings`);
} catch (err) {
  console.error("[site] settings fetch failed:", err);
}

/* ---- Menu fetch (independent) ---- */
try {
  const res = await supabase
    .from("menu_items")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (res.error) throw res.error;
  menuItems = (res.data || []).filter((i) => i.is_available);
  console.info(`[site] loaded ${menuItems.length} menu items`);
} catch (err) {
  console.error("[site] menu fetch failed:", err);
}

function getSetting(key) {
  const v = settings[key];
  if (v === undefined || v === null || v === "") return FALLBACKS[key] ?? "";
  return v;
}

/* -------------------------------------------------------------
   2. APPLY SIMPLE TEXT SETTINGS
   ------------------------------------------------------------- */

/* Hero tagline */
const taglineEl = document.querySelector(".hero__tagline");
if (taglineEl) taglineEl.textContent = getSetting("tagline");

/* Footer "Find us" column — locate by the h4 label */
document.querySelectorAll(".footer h4").forEach((h4) => {
  if (h4.textContent.trim().toLowerCase() !== "find us") return;
  const block = h4.parentElement;
  const ps = block.querySelectorAll("p");
  const locLines = getSetting("location")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ps[0]) ps[0].innerHTML = locLines.map(escapeAttr).join("<br>");
  if (ps[1]) ps[1].textContent = getSetting("opening_hours");
});

/* WhatsApp link + displayed number in footer */
const rawWhatsapp = String(getSetting("whatsapp_number")).trim();
let whatsappNumber = rawWhatsapp.replace(/\D/g, "");

/* Local Nigerian format (0803...) → international (234803...).
   Makes the link work even if the admin forgets the country code. */
if (whatsappNumber.startsWith("0") && whatsappNumber.length === 11) {
  whatsappNumber = "234" + whatsappNumber.slice(1);
}

const whatsappLink = `https://wa.me/${whatsappNumber}`;

document.querySelectorAll(".rude_contact a").forEach((a) => {
  a.href = whatsappLink;
  const span = a.querySelector("span");
  if (span) span.textContent = "+" + whatsappNumber;
});

/* -------------------------------------------------------------
   3. RENDER MENU SECTIONS
   ------------------------------------------------------------- */

function renderMains(items) {
  const grid = document.querySelector(".mains__grid");
  if (!grid) return;
  grid.innerHTML = "";

  for (const item of items) {
    const article = document.createElement("article");
    article.className = "main-card reveal";
    if (item.is_coming_soon) article.classList.add("main-card--soon");
    article.dataset.base = item.name;
    article.dataset.price = String(item.price || 0);

    const imgWrap = document.createElement("div");
    imgWrap.className = "main-card__img";
    imgWrap.dataset.label = (item.name || "item") + ".jpg";

    const img = document.createElement("img");
    img.src = item.image_url || "";
    img.alt = item.image_alt || item.name;
    img.loading = "lazy";
    img.onerror = function () {
      this.parentElement.classList.add("img-missing");
    };
    imgWrap.appendChild(img);

    const stamp = document.createElement("div");
    stamp.className = "main-card__stamp";
    stamp.textContent = "ADDED";
    imgWrap.appendChild(stamp);

    if (item.is_coming_soon) {
      const cs = document.createElement("div");
      cs.className = "coming-soon-stamp";
      cs.innerHTML = "Coming<br>Soon";
      imgWrap.appendChild(cs);
    }

    article.appendChild(imgWrap);

    const body = document.createElement("div");
    body.className = "main-card__body";

    const h3 = document.createElement("h3");
    h3.textContent = item.name;
    body.appendChild(h3);

    const p = document.createElement("p");
    p.textContent = item.description || "";
    body.appendChild(p);

    const foot = document.createElement("div");
    foot.className = "main-card__foot";

    const priceEl = document.createElement("span");
    priceEl.className = "price";
    priceEl.textContent = nairaFromKobo(item.price);
    foot.appendChild(priceEl);

    const btn = document.createElement("button");
    btn.className = "btn btn--ghost btn--add";
    btn.dataset.base = item.name;
    btn.textContent = "Add to Tray";
    if (item.is_coming_soon) btn.disabled = true;
    foot.appendChild(btn);

    body.appendChild(foot);
    article.appendChild(body);
    grid.appendChild(article);
  }
}

function renderOptionCard(item, group) {
  const btn = document.createElement("button");
  btn.className = "option-card";
  if (group === "protein") btn.classList.add("option-card--protein");
  if (group === "extra") btn.classList.add("option-card--multi");
  if (item.is_coming_soon) btn.classList.add("option-card--soon");
  btn.dataset.group = group;
  btn.dataset.name = item.name;
  btn.dataset.price = String(item.price || 0);

  if (item.is_coming_soon) {
    btn.disabled = true;
    btn.setAttribute("aria-disabled", "true");
  }

  if (group === "protein" && item.image_url) {
    const thumb = document.createElement("span");
    thumb.className = "option-card__thumb";
    thumb.style.backgroundImage = `url('${item.image_url}')`;
    btn.appendChild(thumb);
  }

  const nameSpan = document.createElement("span");
  nameSpan.className = "option-card__name";
  nameSpan.textContent = item.name;
  btn.appendChild(nameSpan);

  const priceSpan = document.createElement("span");
  priceSpan.className = "option-card__price";
  priceSpan.textContent = nairaFromKobo(item.price);
  btn.appendChild(priceSpan);

  if (item.is_coming_soon) {
    const stamp = document.createElement("span");
    stamp.className = "coming-soon-stamp";
    stamp.innerHTML = "Coming<br>Soon";
    btn.appendChild(stamp);
  }

  return btn;
}

function renderOptions(containerId, group, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  for (const item of items) {
    container.appendChild(renderOptionCard(item, group));
  }
}

const bySection = (section) => menuItems.filter((i) => i.section === section);

renderMains(bySection("mains"));
renderOptions("baseOptions", "base", bySection("base"));
renderOptions("proteinOptions", "protein", bySection("protein"));
renderOptions("extraOptions", "extra", bySection("extra"));

/* -------------------------------------------------------------
   4. EXPOSE DATA FOR script.js
   ------------------------------------------------------------- */

/* MOTD — split into phrases, one per line */
const motdRaw = getSetting("footer_motd");
const phrases = motdRaw
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);
if (!phrases.length) phrases.push("RUDE TURKEY");

window.RT_DATA = {
  whatsappNumber,
  phrases,
};

/* Tell script.js the data has landed, in case it already ran */
window.dispatchEvent(
  new CustomEvent("rt:data-ready", { detail: window.RT_DATA }),
);

console.info(
  `[site] loaded ${menuItems.length} menu items, ${phrases.length} MOTD phrases`,
);
