# Rude Turkey — Ordering Page

A single-page site for Rude Turkey: two mains (Jollof Rice, Jollof Spaghetti), a
"Build Your Plate" protein + extras builder with a live order ticket, and a
one-click handoff to WhatsApp with the finished order pre-written.

## Files

```
rude-turkey/
├── index.html          the page structure and copy
├── style.css            all design/visual styling
├── script.js             scroll animations + builder + WhatsApp logic
└── images/
    ├── hero/             hero background photo
    ├── menu/              Jollof Rice / Jollof Spaghetti photos
    ├── protein/           small protein thumbnails used in the builder
    └── extras/            (unused by default — free folder if you add extra photos later)
```

Open `index.html` in a browser to preview. No build step, no server needed —
double-click the file, or drag it into a browser tab.

---

## Everything you need to edit before launch

### 1. Your WhatsApp number (required)
File: `script.js`, near the top.
```js
const WHATSAPP_NUMBER = "2348000000000";
```
Replace with your real number: country code + number, digits only, no `+`,
no spaces, no dashes. This is the number every order gets sent to.

There's a second, unrelated WhatsApp number shown in the footer as a
clickable link — edit that separately in `index.html` (search for `wa.me`).

### 2. Your photos (required — currently showing illustrated placeholders)
The site currently ships with custom illustrated artwork (hand-drawn SVGs in
the brand's own colors) standing in for real food photos, so it looks
finished and appetizing rather than broken while you gather your own photos.

Every spot needing a photo has a comment right above it in `index.html`
that says `IMAGE TO EDIT`, telling you the placeholder file currently in
use, the real filename to save your photo as, and the recommended size.
Once you add your photo, change the file extension referenced in that one
line from `.svg` to `.jpg` (or whatever format your photo is in):

| What | Current placeholder | Replace with your photo | Recommended size |
|---|---|---|---|
| Hero background | `images/hero/hero-bg.svg` | `images/hero/hero-bg.jpg` | 1920×1200, landscape |
| Jollof Rice | `images/menu/jollof-rice.svg` | `images/menu/jollof-rice.jpg` | 1000×1000, square |
| Jollof Spaghetti | `images/menu/jollof-spaghetti.svg` | `images/menu/jollof-spaghetti.jpg` | 1000×1000, square |
| Grilled Turkey | `images/protein/turkey-grilled.svg` | `images/protein/turkey-grilled.jpg` | 600×400 |
| Peppered Turkey | `images/protein/turkey-peppered.svg` | `images/protein/turkey-peppered.jpg` | 600×400 |
| Grilled Chicken | `images/protein/chicken.svg` | `images/protein/chicken.jpg` | 600×400 |
| Fried Beef | `images/protein/beef.svg` | `images/protein/beef.jpg` | 600×400 |
| Fried Fish | `images/protein/fish.svg` | `images/protein/fish.jpg` | 600×400 |
| Assorted Meat | `images/protein/assorted.svg` | `images/protein/assorted.jpg` | 600×400 |

Keep the photo filenames as listed (or use your own name — just update
both the filename and the matching `src=` / `background-image` reference
in `index.html` together). If a photo file ever goes missing after you've
switched over, the two main dish cards fall back to a subtle "add photo"
notice so the page never shows a broken image — but the protein
thumbnails will just show a dark tile, so double check those.

### 3. Menu items and prices (as needed)
File: `index.html`.
- The two main cards live inside `<section class="mains">` — edit the
  names, descriptions, and `data-price` values there, and again inside
  `#baseOptions` in the builder section (same base options, repeated so
  they can be selected in the builder).
- Protein options live inside `#proteinOptions`.
- Extras live inside `#extraOptions`.
Each option is a `<button class="option-card" data-name="..." data-price="...">`
— the name and price shown to the customer come straight from those two
attributes, and the WhatsApp message is built from the same data, so you
only ever need to edit it in one place per item.

### 4. Address and hours (required)
File: `index.html`, inside `<footer id="location">`. Search for the two
`<!-- EDIT -->` comments and replace with your real address and hours.

### 5. Colors and fonts (optional)
File: `style.css`, top of the file inside `:root`. All colors are named
CSS variables (`--jollof`, `--turmeric`, `--char`, `--bone`) — change a
value once and it updates everywhere it's used.

---

## Design notes

- **Palette**: charcoal (`#191310`) and parchment (`#F4E9D6`) as the base,
  with jollof-red (`#D8481F`) as the primary action color and a turmeric
  gold (`#E7A72E`) for prices and secondary accents.
- **Type**: Anton (bold condensed display, used for the stamped wordmark
  and headlines), Work Sans (body copy), Space Mono (prices and the order
  ticket, to read like a receipt).
- **Signature element**: the order ticket in the builder is styled like a
  torn receipt and fills in live as the customer picks a base, protein,
  and extras — the same data that gets written into the WhatsApp message.
- **Motion**: sections fade/rise into view on scroll, the nav condenses
  as you scroll past the hero, faint smoke rises behind the hero
  wordmark, and a "SENT" stamp flashes on the ticket when an order goes
  out. All motion is disabled automatically for visitors with "reduce
  motion" turned on at the OS level.
- Fonts load from Google Fonts via the `<link>` tags in `index.html` — an
  internet connection is needed the first time the page loads.
- **Placeholder artwork**: `images/` currently contains hand-drawn SVG
  illustrations (not photos) styled in the site's own palette — a jollof
  rice bowl, a jollof spaghetti swirl, and six protein thumbnails — so the
  page looks complete and appetizing before real food photography is
  ready. They're lightweight, scale perfectly on any screen, and are
  meant to be swapped for your real photos exactly as described above.

## Hosting it

This is a static site — it works dropped into any static host (Netlify,
Vercel, GitHub Pages, or your own server). Just upload the whole
`rude-turkey` folder, keeping the `images` folder alongside `index.html`.
