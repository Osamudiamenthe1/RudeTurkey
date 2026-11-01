/* =============================================================
   RUDE TURKEY — site behaviour
   Sections below:
     1. WhatsApp number  <-- EDIT THIS
     2. Scroll reveal animations
     3. Sticky nav condense
     4. Plate builder (selection state + live ticket)
     5. Send order to WhatsApp
   ============================================================= */

/* -------------------------------------------------------------
   1. EDIT ME: your real WhatsApp number, digits only,
   country code first, no "+", no spaces, no dashes.
   Example for a Nigerian number 0803 123 4567 -> "2348031234567"
   ------------------------------------------------------------- */
const WHATSAPP_NUMBER = "2348000000000";

document.getElementById('year').textContent = new Date().getFullYear();

/* -------------------------------------------------------------
   2. Scroll reveal animations
   ------------------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // slight stagger for elements revealing together
      setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* -------------------------------------------------------------
   3. Sticky nav condense on scroll
   ------------------------------------------------------------- */
const nav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-condensed', window.scrollY > 40);
}, { passive: true });

/* -------------------------------------------------------------
   3b. Mobile burger menu (shown under 760px, see style.css)
   ------------------------------------------------------------- */
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu() {
  burger.classList.remove('is-open');
  mobileMenu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}

burger.addEventListener('click', () => {
  const opening = !mobileMenu.classList.contains('is-open');
  burger.classList.toggle('is-open', opening);
  mobileMenu.classList.toggle('is-open', opening);
  burger.setAttribute('aria-expanded', String(opening));
});

// close the panel once a link inside it is tapped
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

/* -------------------------------------------------------------
   4. Plate builder state
   ------------------------------------------------------------- */
const state = {
  base: null,     // { name, price }  — single choice
  protein: null,  // { name, price }  — single choice
  extras: []      // [{ name, price }] — multiple choice
};

function formatNaira(n) {
  return '₦' + n.toLocaleString('en-NG');
}

function selectOption(button) {
  const group = button.dataset.group;
  const name = button.dataset.name;
  const price = Number(button.dataset.price);

  if (group === 'extra') {
    // multi-select: toggle
    const idx = state.extras.findIndex(e => e.name === name);
    if (idx > -1) {
      state.extras.splice(idx, 1);
      button.classList.remove('is-selected');
    } else {
      state.extras.push({ name, price });
      button.classList.add('is-selected');
    }
  } else {
    // single-select: clear siblings in the same group
    document.querySelectorAll(`.option-card[data-group="${group}"]`).forEach(b => b.classList.remove('is-selected'));
    button.classList.add('is-selected');
    state[group] = { name, price };
  }

  renderTicket();
}

document.querySelectorAll('.option-card').forEach(btn => {
  btn.addEventListener('click', () => selectOption(btn));
});

// "Add to Plate" buttons on the main menu cards pre-select the base
// and scroll straight down to the builder.
document.querySelectorAll('.btn--add').forEach(btn => {
  btn.addEventListener('click', () => {
    const baseName = btn.dataset.base;
    const matchingCard = document.querySelector(`#baseOptions .option-card[data-name="${baseName}"]`);
    if (matchingCard) selectOption(matchingCard);
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
  });
});

/* -------------------------------------------------------------
   Render the live order ticket
   ------------------------------------------------------------- */
function renderTicket() {
  const list = document.getElementById('ticketList');
  const totalEl = document.getElementById('ticketTotal');
  const noteEl = document.getElementById('ticketNote');
  const sendBtn = document.getElementById('sendOrder');

  const items = [];
  if (state.base) items.push(state.base);
  if (state.protein) items.push(state.protein);
  items.push(...state.extras);

  list.innerHTML = '';

  if (items.length === 0) {
    list.innerHTML = '<li class="ticket__empty">Nothing on the plate yet.</li>';
  } else {
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.name}</span><span>${formatNaira(item.price)}</span>`;
      list.appendChild(li);
    });
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);
  totalEl.textContent = formatNaira(total);

  const ready = Boolean(state.base && state.protein);
  sendBtn.disabled = !ready;
  noteEl.textContent = ready
    ? 'Fill in your details above, then send it in.'
    : 'Pick a base and a protein to get started.';
}

renderTicket();

/* -------------------------------------------------------------
   5. Send order to WhatsApp
   ------------------------------------------------------------- */
document.getElementById('sendOrder').addEventListener('click', () => {
  if (!state.base || !state.protein) return;

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const notes = document.getElementById('custNotes').value.trim();

  const items = [state.base, state.protein, ...state.extras];
  const total = items.reduce((sum, item) => sum + item.price, 0);

  let message = `*New order — Rude Turkey*%0A%0A`;
  message += `*Plate:*%0A`;
  items.forEach(item => {
    message += `- ${item.name} (${formatNaira(item.price)})%0A`;
  });
  message += `%0A*Total: ${formatNaira(total)}*%0A%0A`;
  message += `*Name:* ${name || '(not provided)'}%0A`;
  message += `*Phone:* ${phone || '(not provided)'}%0A`;
  message += `*Delivery address:* ${address || '(not provided)'}%0A`;
  if (notes) message += `*Notes:* ${notes}%0A`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  // little "SENT" stamp flourish before handing off to WhatsApp
  const stamp = document.getElementById('ticketStamp');
  stamp.classList.add('is-shown');
  setTimeout(() => stamp.classList.remove('is-shown'), 1400);

  window.open(url, '_blank');
});
