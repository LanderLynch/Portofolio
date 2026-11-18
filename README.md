# Portfolio Site — Jona Setiawan

A bilingual (`ID` / `EN`), multi-theme (`Blue`, `Light`, `Galaxy`) creative & multimedia portfolio website built with a zero-framework frontend and a Firebase serverless backend, hosted on Vercel with a custom Service Worker caching layer.

---

## 1. Tech Stack & Languages

### Frontend
- **HTML5**: Semantic multi-page static architecture (`index.html`, `certification.html`, `changelog.html`, and project case-study pages in `project/pages/`).
- **CSS3**: Custom properties (`--bg`, `--surface`, `--accent`, etc.) powering 3 switchable palettes (`Blue` default, `Light`, `Galaxy`), responsive layouts, custom cursors, and zoom scaling.
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
│   ├── assets/                 # Logos, thumbnails, cursors, photography & case-study media
│   ├── pages/                  # Detailed project case-study HTML pages
│   └── scripts/                # Project-specific helper scripts
├── server/
│   └── firebase-admin.example.js # Node.js firebase-admin example (server-side only)
└── webmeji-main/               # Interactive web shimeji companion assets & scripts
```

---

## 3. Caching & Persistence Architecture

The site uses a **multi-layer caching strategy** across the Service Worker (`performance-sw.js`), Vercel HTTP headers, and browser `localStorage`.

### A. Service Worker (`performance-sw.js`)
Registered at root scope (`/`) with three dedicated Cache Storage buckets:
1. **`portfolio-static-v30` (Precache on `install`)**:
   - Precaches core shell files (`/`, `/index.html`, `/changelog.html`, `/css/*.css`, `/js/*.js`) during Service Worker installation (`cache.addAll(CORE_ASSETS)`).
   - Calls `self.skipWaiting()` and cleans up outdated cache versions on `activate`.
2. **`portfolio-runtime-v30` (Dynamic & Asset Cache)**:
   - **Navigation (`request.mode === "navigate"`) — `Network First`**: Always tries the network first so HTML updates appear immediately, falling back to `portfolio-runtime-v30` if offline.
   - **Firebase Modules (`firebase-config`, `admin-panel`, `testimonials-guestbook`) — `Network First`**: Ensures auth/database logic is never served stale.
   - **Static CSS, JS, & Fonts — `Stale-While-Revalidate`**: Serves the cached asset immediately for instant rendering while fetching and updating the cache in the background.
3. **`portfolio-images-v1` (Media Cache)**:
   - **Images (`destination === "image"`) — `Cache First with Background Refresh`**: Returns cached project thumbnails, logos, and cursors instantly while silently refreshing the cached copy from the network in the background.

### B. HTTP Cache Headers (`vercel.json`)
- `/performance-sw.js` is explicitly served with `Cache-Control: no-cache, no-store, must-revalidate` and `Service-Worker-Allowed: /` so browsers always detect new Service Worker versions immediately.

### C. Browser `localStorage` Persistence
- **`portfolio-color-theme`**: Stores the active palette (`blue`, `light`, or `galaxy`). Applied synchronously by `js/theme-init.js` before CSS paints and synchronized across tabs via `window.addEventListener("storage", ...)`.
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
