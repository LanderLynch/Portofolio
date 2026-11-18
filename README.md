# Portfolio Site — Jona Setiawan

A bilingual (`ID` / `EN`), Pure Light Mode (**Warm Editorial Parchment & Terracotta**) creative & multimedia portfolio website built with a zero-framework frontend, Google Drive asset hosting (`Portofolio-Backend`), and a Firebase serverless backend, hosted on Vercel with a custom Service Worker caching layer.

---

## 1. Tech Stack & Languages

### Frontend
- **HTML5**: Semantic multi-page static architecture (`index.html`, `certification.html`, `changelog.html`, and 9 project case-study pages in `project/pages/`).
- **CSS3**: Warm Editorial custom properties (`#F4EEE5` parchment, `#FAF6F0` cards, `#30221D` ink, `#983E2B` / `#B84F38` terracotta, `#DDCFC0` borders) + static `27px × 27px` (`23px` mobile) square-grid overlay (`body::after`), responsive layouts, custom cursors, and zoom scaling.
- **Typography**: `Cormorant Garamond` (display/headings), `Lora` (editorial body), and `DM Sans` (UI controls).
- **JavaScript (ES6+ & ES Modules)**:
  - Zero build step / no bundler required; runs natively in modern browsers.
  - Core UI, theme, language (`ID` / `EN`), zoom, and performance scripts use classic deferred `<script>` tags.
  - Firebase integration (`firebase-config.js`, `admin-panel.js`, `testimonials-guestbook.js`) is lazy-loaded as native ES Modules (`import(...)`) so initial page render stays fast.
- **Interactive Extras**:
  - `webmeji-main/`: Interactive desktop/web shimeji companion widget.
  - Google Fonts (`Inter` + system fallbacks).

### Backend & Cloud Services
- **Firebase Web SDK v10.12.2** (`https://www.gstatic.com/firebasejs/10.12.2/`):
  - **Firebase Authentication**:
    - Admin sign-in (Email/Password) for managing portfolio projects and moderating guestbook entries.
    - Guestbook visitor sign-in (Google OAuth & Email/Password) with profile/avatar support.
  - **Cloud Firestore** (`firestore.rules`):
    - `projects/{project}`: Public read (`allow read: if true`), admin-only write restricted to the verified admin UID.
    - `guestbookMessages/{message}`: Public read; authenticated users can create messages (validated as non-empty strings `<= 400` chars matching `request.auth.uid`); admin-only update/delete.
    - `users/{userId}`: Private per-user read/write (`request.auth.uid == userId`).
  - **Firebase Storage** (`storage.rules`):
    - `guestbook-avatars/{userId}/{fileName}`: Public read; authenticated owner upload/delete restricted to `image/*` files under `2 MB`.
    - `photography/{allPaths=**}`: Public read-only gallery assets.
- **Node.js Admin Template** (`server/firebase-admin.example.js`):
  - Optional server-side `firebase-admin` setup template using environment variables (`.env.example`) for privileged backend tasks. Never expose service account keys in browser code.
- **Hosting & Edge Config** (`vercel.json`):
  - Static deployment (`outputDirectory: "."`, `cleanUrls: true`).
  - Custom headers on `/performance-sw.js` (`Cache-Control: no-cache, no-store, must-revalidate` and `Service-Worker-Allowed: /`).

---

## 2. Folder Structure

```text
Portofolio/
├── index.html                  # Main portfolio landing page
├── certification.html          # Certifications & achievement archive
├── changelog.html              # Version history & release notes
├── performance-sw.js           # Root-scoped Service Worker (caching & offline support)
├── vercel.json                 # Vercel routing, cleanUrls, and SW headers
├── firestore.rules             # Cloud Firestore security rules
├── storage.rules               # Firebase Storage security rules
├── .env.example                # Safe environment variable template for server scripts
├── README.md                   # Project architecture & documentation
├── FIREBASE_SECURITY.md        # Firebase key & rule hardening guide
├── AGENTS.md                   # AI assistant workflow & skill routing
├── DESIGN.md                   # Design system tokens & accessibility standards
├── css/
│   ├── styles.css              # Main layout, hero, cards, guestbook, modals, responsive rules
│   ├── theme-palettes.css      # 3-theme CSS variables (Blue, Light, Galaxy) & overrides
│   └── zoom-controls.css       # Page zoom & theme switcher panel styling
├── js/
│   ├── theme-init.js           # Early <head> theme bootstrap (prevents flash of wrong theme)
│   ├── theme-controls.js       # Theme switcher, persistence, and cross-tab sync
│   ├── language-controls.js    # Full ID/EN bilingual dictionary & live DOM translator
│   ├── zoom-controls.js        # Accessibility zoom controls & persistence
│   ├── project-card-utils.js   # Shared project card template builder & category helpers
│   ├── performance-utils.js    # Image lazy-loading, priority hints & runtime helpers
│   ├── performance-main.js     # Service Worker registration & main page performance hooks
│   ├── firebase-config.js      # Browser Firebase App, Auth, Firestore & Storage init
│   ├── admin-panel.js          # Admin authentication & Firestore project CRUD logic
│   └── testimonials-guestbook.js # Guestbook auth, avatar upload, and real-time feed
├── project/
│   ├── assets/                 # Local logos, cursors, certification files & case-study media (ikm-project moved to Drive)
│   ├── pages/                  # 9 project case-study HTML pages (inherit Warm Editorial UI via theme-palettes.css)
│   └── scripts/
│       ├── photography-archive.js # Google Drive catalog for Photography (PortfolioPhotography)
│       └── ikm-drive-map.js       # Google Drive file-ID map for 163 IKM bag designs
├── server/
│   └── firebase-admin.example.js # Node.js firebase-admin example (server-side only)
└── webmeji-main/               # Interactive web shimeji companion (defaults to OFF)
```

---

## 3. Caching & Persistence Architecture

The site uses a **multi-layer caching strategy** across the Service Worker (`performance-sw.js`), Vercel HTTP headers, and browser `localStorage`.

### A. Service Worker (`performance-sw.js`)
Registered at root scope (`/`) with three dedicated Cache Storage buckets:
1. **`portfolio-static-v33` (Precache on `install`)**:
   - Precaches core shell files (`/`, `/index.html`, `/changelog.html`, `/css/*.css`, `/js/*.js`, `/project/scripts/photography-archive.js`) during Service Worker installation.
   - Calls `self.skipWaiting()` and cleans up outdated cache versions on `activate`.
2. **`portfolio-runtime-v33` (Dynamic & Asset Cache)**:
   - **Cross-origin requests** (`url.origin !== self.location.origin`, e.g., Google Drive / `lh3.googleusercontent.com`) are **bypassed** so the browser handles them natively without opaque-response issues.
   - **Navigation (`request.mode === "navigate"`) — `Network First`**: Always tries the network first so HTML updates appear immediately.
   - **Firebase Modules (`firebase-config`, `admin-panel`, `testimonials-guestbook`) — `Network First`**: Ensures auth/database logic is never served stale.
   - **Static CSS, JS, & Fonts — `Stale-While-Revalidate`**: Serves cached assets immediately while updating in the background.
3. **`portfolio-images-v1` (Media Cache)**:
   - **Same-origin Images (`destination === "image"`) — `Cache First with Background Refresh`**.

### B. HTTP Cache Headers (`vercel.json`)
- `/performance-sw.js` is explicitly served with `Cache-Control: no-cache, no-store, must-revalidate` and `Service-Worker-Allowed: /` so browsers always detect new Service Worker versions immediately.

### C. Browser `localStorage` Persistence
- **`portfolio-color-theme`**: Locked to `"light"` by `js/theme-init.js` and `js/theme-controls.js` (Blue and Galaxy modes removed).
- **`portfolio-desktop-nav-layout`**: Defaults to `"topbar"` (can be toggled to `"sidebar"`).
- **`portfolio-webmeji-enabled`**: Defaults to `"false"` (Mascot OFF by default).
- **Language & Zoom State**: Stores the visitor's selected language (`id` / `en`) and zoom percentage across page navigations.

---

## 4. How Frontend & Backend Connect

1. **Initial Page Load**:
   - `js/theme-init.js` runs in `<head>` to set `data-theme` on `<html>` before styles render.
   - `css/styles.css` and `css/theme-palettes.css` style the page using CSS custom properties.
   - `js/language-controls.js`, `js/theme-controls.js`, and `js/performance-main.js` hydrate interactive controls and register `performance-sw.js`.
2. **Lazy-Loaded Firebase Connection**:
   - `index.html` dynamically imports `./js/firebase-config.js`, `./js/admin-panel.js`, and `./js/testimonials-guestbook.js` when needed (or after initial idle/interaction), keeping Firebase SDK network overhead off the critical render path.
   - `js/firebase-config.js` initializes `app`, `auth`, `db` (Firestore), and `storage`, exposing them via ES exports and `window` globals.
3. **Data Flow**:
   - **Projects**: Read from Firestore `projects` collection; Admins can create/edit/delete entries via `js/admin-panel.js` (enforced by `firestore.rules`).
   - **Guestbook**: Visitors sign in with Google or Email/Password via Firebase Auth, optionally upload a `< 2 MB` avatar to Firebase Storage (`guestbook-avatars/{uid}/...`), and post messages (`<= 400` chars) to Firestore `guestbookMessages`.

---

## 5. Local Development & Security

### Running Locally
Serve the repository over HTTP (do not open `file://` directly, as ES Modules, Service Workers, and Firebase Auth require an HTTP origin):

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8080` in your browser.

### Security Notes
- The config in `js/firebase-config.js` is the public browser client config; security is enforced by `firestore.rules` and `storage.rules`.
- Never commit Firebase Service Account JSON keys or `.env` secrets to the repository.
- See `FIREBASE_SECURITY.md` for full security checklist and key rotation steps.

---

## 6. AI Handoff & Architecture Quick-Reference (Updated 2026-11-18)

### A. File Responsibility Map
| File / Folder | Responsibility | Non-Negotiable Rules |
| :--- | :--- | :--- |
| `css/theme-palettes.css` | Global Pure Light Mode tokens, `27px` (`23px` mobile) square-grid (`body::after`), and shared `.project-detail-page` Warm Editorial overrides | Keep `body`, `.hero`, `.case-page`, `.page-shell` backgrounds transparent so `body::after` grid stays visible behind cards |
| `js/theme-init.js` & `js/theme-controls.js` | Locks `data-theme="light"` (`supportedThemes: ["light"]`) and injects `#boot-loader` | Do not re-add dark/purple themes; keep `logoImg.src` root-relative (`/project/assets/logo-preview/logo-lemon.png`) |
| `js/performance-main.js` | Defaults desktop layout to `topbar`, handles zoom & scroll state | Keep `topbar` default (`storedDesktopNavLayout === 'sidebar' ? 'sidebar' : 'topbar'`) |
| `index.html` & `css/styles.css` | Main portfolio page: 2-column arched portrait hero, 4-column stats bar, 3×2 **Pohon Keahlian** grid, projects, experience, guestbook | Preserve `data-i18n-key` hooks & `#mobile-webmeji-toggle` inside `#mobile-menu-panel` |
| `certification.html` | Editorial certification archive (`25` / `8` / `3` stats, 3-column filter bar, 12 cards + TOEFL modal) | Keep `.hero` and `.filter-summary` opaque (`#F8F4ED`) so grid lines do not cross text |
| `changelog.html` | Versioned changelog (`v4.0` latest) | Add new entries as a new tab/panel at the top |
| `webmeji-main/webmeji.js` & `webmeji.css` | Roaming Furina mascot | Must default to **OFF** (`isWebmejiEnabled()`), mount top-left on desktop, and hide inline button on `<= 720px` |
| `performance-sw.js` | Root Service Worker (`v33`) | Must bypass cross-origin fetches (`url.origin !== self.location.origin`) |

### B. Google Drive Backend (`Portofolio-Backend`)
Root folder: `https://drive.google.com/drive/folders/1VgSPxRN9Rz-iDghYNxqGwSrvemaPr4qI?usp=sharing`

| Drive Subfolder | Folder ID | Wired Into | Notes |
| :--- | :--- | :--- | :--- |
| `PortfolioPhotography` | `11QlaOo-vYYHgZh9QWuJtIk34s3eGIk81` | `project/scripts/photography-archive.js` | `2024`, `2025`, `2026` shoots; shared `w960` cover/preview, `w2400` lightbox |
| `ikm-project` | `1u_qRl5HKyhtLWfPJt-vq4TRyGrbF-EXh` | `project/scripts/ikm-drive-map.js` | `163` bag designs (`251.1 MB` local folder removed); `PAGE_SIZE = 24`, `w600` grid / `w1600` lightbox; `Bear Brand` includes `Chinese Year Bear` |
| `website-previews` | `1Ux_N3k9X9Zte0-4htxWGF_s-_vORE7ZL` | `index.html` | `7` main project & experience preview images (`w1200`) |

### C. Drive Image Loading Rules (Do Not Break)
1. Always build Drive image URLs with **`https://lh3.googleusercontent.com/d/<FILE_ID>=w<SIZE>`** (avoid `drive.google.com/thumbnail?id=...` which triggers 429 burst throttling).
2. Always include `referrerpolicy="no-referrer"` and retry-on-error backoff on Drive-backed `<img>` elements.
3. Never call canvas `getImageData()` (`applyImageAura`) on cross-origin Drive URLs.
