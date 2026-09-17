/* =============================================================
   RUDE TURKEY — ADMIN
   Stage 2: authentication + dashboard shell
   Stage 3: menu CRUD
   ============================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* -------------------------------------------------------------
   ⚠️  FILL THESE IN

   Paste your Project URL and publishable key between the quotes.
   The publishable key is safe to commit — it's designed to be
   public and RLS is what protects your data.
   ------------------------------------------------------------- */
const SUPABASE_URL = "https://zsuewjxuvrnsrxighgqy.supabase.co";
const SUPABASE_KEY = "sb_publishable_b0iLHOza4_ZOTEAaKcH-nA_t3nmSxV-";

const BUCKET = "menu-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; /* 5 MB */

/* -------------------------------------------------------------
   GUARD — catch unfilled placeholders early
   ------------------------------------------------------------- */
if (
  SUPABASE_URL.includes("PASTE_YOUR") ||
  SUPABASE_KEY.includes("PASTE_YOUR")
) {
  document.addEventListener("DOMContentLoaded", () => {
    const err = document.getElementById("login-error");
    if (err) {
      err.textContent =
        "Admin not configured yet. Open admin.js and paste your Supabase Project URL and publishable key.";
      err.classList.add("is-shown");
    }
    const btn = document.getElementById("login-btn");
    if (btn) btn.disabled = true;
  });
  throw new Error("Supabase credentials not configured");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* -------------------------------------------------------------
   DOM references
   ------------------------------------------------------------- */
const loginView = document.getElementById("login-view");
const dashView = document.getElementById("dashboard-view");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const userEmailEl = document.getElementById("user-email");

/* Stage 3 */
const menuList = document.getElementById("menu-list");
const newItemBtn = document.getElementById("new-item-btn");

const modal = document.getElementById("editor-modal");
const modalTitle = document.getElementById("editor-title");
const modalClose = document.getElementById("editor-close");
const editorForm = document.getElementById("editor-form");
const editorError = document.getElementById("editor-error");
const editorSave = document.getElementById("editor-save");
const editorCancel = document.getElementById("editor-cancel");

const imgPreview = document.getElementById("img-preview");
const imgPreviewText = document.getElementById("img-preview-text");
const imgInput = document.getElementById("img-input");

const fieldSection = document.getElementById("field-section");
const fieldOrder = document.getElementById("field-order");
const fieldName = document.getElementById("field-name");
const fieldDesc = document.getElementById("field-description");
const fieldPrice = document.getElementById("field-price");
const fieldCategory = document.getElementById("field-category");
const fieldAlt = document.getElementById("field-image-alt");
const fieldSpicy = document.getElementById("field-spicy");
const fieldAvailable = document.getElementById("field-available");
const fieldComingSoon = document.getElementById("field-coming-soon");
const fieldFeatured = document.getElementById("field-featured");

const toastEl = document.getElementById("toast");

/* -------------------------------------------------------------
   UI helpers
   ------------------------------------------------------------- */
function showError(message) {
  loginError.textContent = message;
  loginError.classList.add("is-shown");
}

function clearError() {
  loginError.textContent = "";
  loginError.classList.remove("is-shown");
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Signing in…" : "Sign in";
  emailInput.disabled = isLoading;
  passInput.disabled = isLoading;
}

function showLogin() {
  loginView.hidden = false;
  dashView.hidden = true;
  setLoading(false);
  clearError();
  passInput.value = "";
  setTimeout(() => emailInput.focus(), 50);
}

function showDashboard(email) {
  loginView.hidden = true;
  dashView.hidden = false;
  userEmailEl.textContent = email || "";
  loadMenuItems();
  loadSettings();
}

/* Map raw Supabase errors to human-friendly text */
function friendlyError(error) {
  if (!error) return "Something went wrong. Please try again.";
  const msg = (error.message || "").toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (msg.includes("email not confirmed")) {
    return "This email hasn't been confirmed yet. Check your inbox.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (msg.includes("network") || msg.includes("failed to fetch")) {
    return "Can't reach the server. Check your internet connection.";
  }
  if (msg.includes("row-level security") || msg.includes("permission")) {
    return "You don't have permission for that action.";
  }
  if (msg.includes("duplicate")) {
    return "That item already exists.";
  }
  return error.message || "Something went wrong.";
}

/* -------------------------------------------------------------
   LOGIN
   ------------------------------------------------------------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const email = emailInput.value.trim();
  const password = passInput.value;

  if (!email || !password) {
    showError("Enter your email and password.");
    return;
  }

  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setLoading(false);
    showError(friendlyError(error));
    passInput.value = "";
    passInput.focus();
    return;
  }

  /* Success — onAuthStateChange will swap the view. */
});

/* -------------------------------------------------------------
   LOGOUT
   ------------------------------------------------------------- */
logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;
  logoutBtn.textContent = "Signing out…";
  await supabase.auth.signOut();
  logoutBtn.disabled = false;
  logoutBtn.textContent = "Log out";
});

/* -------------------------------------------------------------
   AUTH STATE — the single source of truth
   ------------------------------------------------------------- */
supabase.auth.onAuthStateChange((event, session) => {
  if (session && session.user) {
    showDashboard(session.user.email);
  } else {
    showLogin();
  }
});

/* -------------------------------------------------------------
   SAFETY NET — clean state after a stale session
   ------------------------------------------------------------- */
window.addEventListener("pageshow", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) showLogin();
});

/* =============================================================
   STAGE 3 — MENU CRUD
   ============================================================= */

/* -------------------------------------------------------------
   STATE
   ------------------------------------------------------------- */
let menuItems = [];
let editingId = null; /* null = creating new */
let pendingFile = null; /* File object chosen but not uploaded */
let existingImageUrl = ""; /* current image_url for the item being edited */
let isSaving = false;

/* -------------------------------------------------------------
   UI HELPERS
   ------------------------------------------------------------- */
function showEditorError(message) {
  editorError.textContent = message;
  editorError.classList.add("is-shown");
}

function clearEditorError() {
  editorError.textContent = "";
  editorError.classList.remove("is-shown");
}

let toastTimer = null;
function showToast(message, kind = "") {
  toastEl.textContent = message;
  toastEl.className = "toast is-shown" + (kind ? ` toast--${kind}` : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("is-shown");
  }, 3200);
}

/* -------------------------------------------------------------
   LOAD + RENDER
   ------------------------------------------------------------- */
async function loadMenuItems() {
  menuList.innerHTML = '<p class="admin__placeholder">Loading…</p>';

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("section", { ascending: true })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    menuList.innerHTML =
      '<p class="admin__placeholder">Failed to load menu items.</p>';
    showToast(friendlyError(error), "error");
    return;
  }

  menuItems = data || [];
  renderMenuItems();
}

function renderMenuItems() {
  if (!menuItems.length) {
    menuList.innerHTML =
      '<p class="admin__placeholder">No menu items yet. Click "+ Add item" to create the first one.</p>';
    return;
  }

  const sections = ["mains", "base", "protein", "extra"];
  const labels = {
    mains: "Mains",
    base: "Base",
    protein: "Protein",
    extra: "Extras",
  };

  menuList.innerHTML = "";

  for (const section of sections) {
    const items = menuItems.filter((i) => i.section === section);
    if (!items.length) continue;

    const group = document.createElement("div");
    group.className = "menu-group";

    const heading = document.createElement("h3");
    heading.className = "menu-group__heading";
    heading.textContent = `${labels[section]} · ${items.length}`;
    group.appendChild(heading);

    for (const item of items) {
      group.appendChild(buildItemRow(item));
    }

    menuList.appendChild(group);
  }
}

function buildItemRow(item) {
  const row = document.createElement("div");
  row.className = "menu-row";

  const img = document.createElement("div");
  img.className = "menu-row__img";
  if (item.image_url) {
    img.style.backgroundImage = `url('${item.image_url}')`;
  } else {
    img.textContent = "No image";
  }
  row.appendChild(img);

  const info = document.createElement("div");
  info.className = "menu-row__info";

  const h4 = document.createElement("h4");
  h4.textContent = item.name;
  info.appendChild(h4);

  const p = document.createElement("p");
  p.textContent = item.description || "No description";
  info.appendChild(p);

  const meta = document.createElement("span");
  meta.className = "menu-row__meta";
  const naira = (item.price / 100).toLocaleString("en-NG");
  const flags = [];
  if (!item.is_available) flags.push("Hidden");
  else if (item.is_coming_soon) flags.push("Coming Soon");
  if (item.is_featured) flags.push("Featured");
  meta.textContent = `₦${naira} · Order ${item.display_order}${
    flags.length ? " · " + flags.join(" · ") : ""
  }`;
  info.appendChild(meta);

  row.appendChild(info);

  const actions = document.createElement("div");
  actions.className = "menu-row__actions";

  const editBtn = document.createElement("button");
  editBtn.className = "admin__btn";
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => openEditor(item.id));
  actions.appendChild(editBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "admin__btn admin__btn--danger";
  delBtn.type = "button";
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", () => handleDelete(item));
  actions.appendChild(delBtn);

  row.appendChild(actions);
  return row;
}

/* -------------------------------------------------------------
   EDITOR OPEN / CLOSE
   ------------------------------------------------------------- */
function resetEditorForm() {
  fieldSection.value = "mains";
  fieldOrder.value = 0;
  fieldName.value = "";
  fieldDesc.value = "";
  fieldPrice.value = "";
  fieldCategory.value = "";
  fieldAlt.value = "";
  fieldSpicy.value = 0;
  fieldAvailable.checked = true;
  fieldComingSoon.checked = false;
  fieldFeatured.checked = false;

  pendingFile = null;
  existingImageUrl = "";
  imgInput.value = "";
  imgPreview.style.backgroundImage = "";
  imgPreviewText.textContent = "Tap to upload";
  imgPreviewText.style.display = "";
  clearEditorError();
}

function openEditor(id = null) {
  editingId = id;
  resetEditorForm();

  if (id) {
    const item = menuItems.find((i) => i.id === id);
    if (!item) return;

    modalTitle.textContent = "Edit item";
    fieldSection.value = item.section;
    fieldOrder.value = item.display_order;
    fieldName.value = item.name;
    fieldDesc.value = item.description || "";
    fieldPrice.value = item.price / 100;
    fieldCategory.value = item.category || "";
    fieldAlt.value = item.image_alt || "";
    fieldSpicy.value = item.spicy_level || 0;
    fieldAvailable.checked = item.is_available;
    fieldComingSoon.checked = item.is_coming_soon || false;
    fieldFeatured.checked = item.is_featured;

    if (item.image_url) {
      existingImageUrl = item.image_url;
      imgPreview.style.backgroundImage = `url('${item.image_url}')`;
      imgPreviewText.style.display = "none";
    }
  } else {
    modalTitle.textContent = "New item";
  }

  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  setTimeout(() => fieldName.focus(), 50);
}

function closeEditor() {
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
  editingId = null;
  pendingFile = null;
  existingImageUrl = "";
  isSaving = false;
  editorSave.disabled = false;
  editorSave.textContent = "Save";
}

newItemBtn.addEventListener("click", () => openEditor(null));
modalClose.addEventListener("click", closeEditor);
editorCancel.addEventListener("click", closeEditor);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeEditor();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeEditor();
});

/* -------------------------------------------------------------
   IMAGE SELECTION
   ------------------------------------------------------------- */
imgInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showEditorError("Please pick an image file.");
    imgInput.value = "";
    return;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    showEditorError("Image is too large. Maximum 5 MB.");
    imgInput.value = "";
    return;
  }

  clearEditorError();
  pendingFile = file;

  const url = URL.createObjectURL(file);
  imgPreview.style.backgroundImage = `url('${url}')`;
  imgPreviewText.style.display = "none";
});

/* -------------------------------------------------------------
   IMAGE UPLOAD
   ------------------------------------------------------------- */
async function uploadImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/* -------------------------------------------------------------
   SAVE (create or update)
   ------------------------------------------------------------- */
editorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isSaving) return;
  clearEditorError();

  const name = fieldName.value.trim();
  const price = Number(fieldPrice.value);
  const section = fieldSection.value;

  if (!name) return showEditorError("Name is required.");
  if (!Number.isFinite(price) || price < 0)
    return showEditorError("Enter a valid price.");
  if (!["mains", "base", "protein", "extra"].includes(section)) {
    return showEditorError("Pick a valid section.");
  }

  isSaving = true;
  editorSave.disabled = true;
  editorSave.textContent = "Saving…";

  try {
    let imageUrl = existingImageUrl;

    if (pendingFile) {
      editorSave.textContent = "Uploading image…";
      imageUrl = await uploadImage(pendingFile);
    }

    const payload = {
      section,
      name,
      description: fieldDesc.value.trim() || null,
      price: Math.round(price * 100),
      image_url: imageUrl || null,
      image_alt: fieldAlt.value.trim() || null,
      category: fieldCategory.value.trim() || null,
      is_available: fieldAvailable.checked,
      is_coming_soon: fieldComingSoon.checked,
      is_featured: fieldFeatured.checked,
      display_order: Number(fieldOrder.value) || 0,
      spicy_level: Math.max(0, Math.min(3, Number(fieldSpicy.value) || 0)),
    };

    editorSave.textContent = "Saving…";

    if (editingId) {
      const { error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", editingId);
      if (error) throw error;
      showToast("Item updated", "success");
    } else {
      const { error } = await supabase.from("menu_items").insert(payload);
      if (error) throw error;
      showToast("Item created", "success");
    }

    closeEditor();
    await loadMenuItems();
  } catch (err) {
    editorSave.disabled = false;
    editorSave.textContent = "Save";
    isSaving = false;
    showEditorError(friendlyError(err));
  }
});

/* -------------------------------------------------------------
   DELETE
   ------------------------------------------------------------- */
async function handleDelete(item) {
  const confirmed = window.confirm(
    `Delete "${item.name}"? This cannot be undone.`,
  );
  if (!confirmed) return;

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", item.id);

  if (error) {
    showToast(friendlyError(error), "error");
    return;
  }

  showToast("Item deleted", "success");
  await loadMenuItems();
}

/* ============================================================
   IDLE LOGOUT
   - Auto sign-out after 30 minutes of no interaction
   - Also triggers if the tab was closed for longer than the limit
   - Uses localStorage so the timer survives a page close
   ============================================================ */
(function setupIdleLogout() {
  const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
  const STORAGE_KEY = "rt_admin_last_activity";
  const WRITE_THROTTLE_MS = 5000; // max localStorage writes per 5s
  const EVENT_THROTTLE_MS = 1000; // handle events at most once per second

  let idleTimer = null;
  let lastWrite = 0;
  let lastEventRun = 0;
  let isSignedIn = false;

  function stampActivity() {
    const now = Date.now();
    if (now - lastWrite < WRITE_THROTTLE_MS) return;
    lastWrite = now;
    try {
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch (_) {
      /* localStorage blocked (private mode etc.) — in-memory only */
    }
  }

  function readActivity() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const n = raw ? Number(raw) : NaN;
      return Number.isFinite(n) ? n : null;
    } catch (_) {
      return null;
    }
  }

  function clearActivity() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }

  function armTimer(remainingMs) {
    clearTimeout(idleTimer);
    if (!isSignedIn) return;
    const delay = typeof remainingMs === "number" ? remainingMs : IDLE_LIMIT_MS;
    idleTimer = setTimeout(
      () => {
        forceSignOut("Signed out after 30 minutes of inactivity.");
      },
      Math.max(0, delay),
    );
  }

  async function forceSignOut(reason) {
    if (!isSignedIn) return;
    isSignedIn = false;
    clearTimeout(idleTimer);
    idleTimer = null;
    clearActivity();
    await supabase.auth.signOut();
    if (typeof showToast === "function") showToast(reason, "error");
  }

  function handleActivity() {
    if (!isSignedIn) return;
    const now = Date.now();
    if (now - lastEventRun < EVENT_THROTTLE_MS) return;
    lastEventRun = now;
    stampActivity();
    armTimer();
  }

  ["click", "keydown", "mousemove", "scroll", "touchstart"].forEach((evt) => {
    document.addEventListener(evt, handleActivity, { passive: true });
  });

  function evaluateSession() {
    if (!isSignedIn) return;
    const last = readActivity();
    if (last === null) {
      stampActivity();
      armTimer();
      return;
    }
    const elapsed = Date.now() - last;
    if (elapsed >= IDLE_LIMIT_MS) {
      forceSignOut("Signed out after 30 minutes of inactivity.");
    } else {
      armTimer(IDLE_LIMIT_MS - elapsed);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") evaluateSession();
  });
  window.addEventListener("pageshow", evaluateSession);

  supabase.auth.onAuthStateChange((event, session) => {
    const signedIn = !!(session && session.user);

    if (signedIn && !isSignedIn) {
      isSignedIn = true;
      if (event === "INITIAL_SESSION") {
        // Page loaded with an existing session — check how long it's been
        evaluateSession();
      } else {
        // Fresh login — start the clock from now
        lastWrite = 0;
        stampActivity();
        armTimer();
      }
      return;
    }

    if (!signedIn && isSignedIn) {
      // Signed out (manual or forced)
      isSignedIn = false;
      clearTimeout(idleTimer);
      idleTimer = null;
      clearActivity();
    }
  });
})();

/* =============================================================
   STAGE 4 — SITE SETTINGS
   ============================================================= */

const SETTINGS_FIELDS = [
  {
    key: "whatsapp_number",
    elId: "setting-whatsapp",
    label: "WhatsApp number",
  },
  { key: "tagline", elId: "setting-tagline", label: "Tagline" },
  { key: "opening_hours", elId: "setting-hours", label: "Opening hours" },
  { key: "location", elId: "setting-location", label: "Location" },
  { key: "footer_motd", elId: "setting-footer-motd", label: "Footer MOTD" },
];

let settingsCache = {};

async function loadSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    showToast(friendlyError(error), "error");
    return;
  }

  settingsCache = {};
  for (const row of data || []) {
    settingsCache[row.key] = row.value ?? "";
  }

  for (const field of SETTINGS_FIELDS) {
    const el = document.getElementById(field.elId);
    if (!el) continue;
    el.value = settingsCache[field.key] ?? "";
  }

  setSettingsEditable(false);
}

async function saveSettings(e) {
  e.preventDefault();

  const btn = document.getElementById("save-settings-btn");
  if (!btn || btn.disabled) return;

  const updates = [];

  for (const field of SETTINGS_FIELDS) {
    const el = document.getElementById(field.elId);
    if (!el) continue;

    let value = el.value.trim();

    if (field.key === "whatsapp_number") {
      value = value.replace(/\D/g, "");
      if (!value) {
        showToast("WhatsApp number can't be empty.", "error");
        el.focus();
        return;
      }
      if (value.length < 10) {
        showToast("WhatsApp number looks too short.", "error");
        el.focus();
        return;
      }
      el.value = value;
    }

    if (field.key === "footer_motd") {
      const phrases = value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!phrases.length) {
        showToast("Footer MOTD can't be empty.", "error");
        el.focus();
        return;
      }
      value = phrases.join("\n");
      el.value = value;
    }

    updates.push({ key: field.key, value });
  }

  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "Saving…";

  try {
    const { error } = await supabase
      .from("site_settings")
      .upsert(updates, { onConflict: "key" });

    if (error) throw error;

    for (const u of updates) settingsCache[u.key] = u.value;
    showToast("Settings saved", "success");
    setSettingsEditable(false);
  } catch (err) {
    showToast(friendlyError(err), "error");
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

document
  .getElementById("settings-form")
  ?.addEventListener("submit", saveSettings);

/* ---- Edit-lock: fields start disabled until Edit is clicked ---- */
const editSettingsBtn = document.getElementById("edit-settings-btn");
const cancelSettingsBtn = document.getElementById("cancel-settings-btn");
const saveSettingsBtn = document.getElementById("save-settings-btn");

function setSettingsEditable(isEditable) {
  for (const field of SETTINGS_FIELDS) {
    const el = document.getElementById(field.elId);
    if (!el) continue;
    el.disabled = !isEditable;
  }
  if (editSettingsBtn) editSettingsBtn.hidden = isEditable;
  if (cancelSettingsBtn) cancelSettingsBtn.hidden = !isEditable;
  if (saveSettingsBtn) saveSettingsBtn.hidden = !isEditable;
}

editSettingsBtn?.addEventListener("click", () => {
  setSettingsEditable(true);
  document
    .getElementById("settings-section")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  const first = document.getElementById(SETTINGS_FIELDS[0].elId);
  first?.focus({ preventScroll: true });
});

cancelSettingsBtn?.addEventListener("click", () => {
  // If the settings haven't loaded yet, just refetch instead of
  // blanking out fields with an empty cache.
  if (!Object.keys(settingsCache).length) {
    loadSettings();
    return;
  }
  for (const field of SETTINGS_FIELDS) {
    const el = document.getElementById(field.elId);
    if (!el) continue;
    el.value = settingsCache[field.key] ?? "";
  }
  setSettingsEditable(false);
});
