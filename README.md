# Portfolio Site

This repository is a static portfolio site built with HTML, CSS, JavaScript, and Firebase.

## Project Structure

- `index.html`: main portfolio page
- `certification.html`: certification archive page
- `styles.css`: shared site styling
- `theme-palettes.css`: shared theme tokens, palette UI styling, and cross-page theme overrides
- `theme-controls.js`: centralized theme controller and persistence helper
- `zoom-controls.js`: zoom controls
- `firebase-config.js`: browser Firebase setup
- `admin-panel.js`: Firebase Auth and Firestore admin panel logic
- `firestore.rules`: Firestore security rule template
- `.env.example`: safe environment variable template

## Theme System

- The selected palette is stored in `localStorage` under `portfolio-color-theme`.
- Every theme-enabled page sets `data-theme` on `document.documentElement` before styles load so the saved palette is restored immediately on navigation.
- `theme-controls.js` is the single source of truth for applying themes, updating the theme buttons, syncing `html` and `body`, and responding to `storage` changes across tabs.
- Shared palette selectors now target `:root[data-theme="..."]` so page-level styles can inherit the active theme without waiting for late body updates.
- New pages that need palette support should include the early theme bootstrap snippet in the `<head>`, load `theme-palettes.css`, and include `theme-controls.js`.

## Firebase Notes

- The Firebase web config in `firebase-config.js` is for browser use.
- Do not place a Firebase service account JSON key in this repo or in browser code.
- Replace `REPLACE_WITH_YOUR_ADMIN_UID` in `firestore.rules` with your real Firebase Auth UID.
- See `FIREBASE_SECURITY.md` for security guidance.

## Local Development

Open the HTML files with a local web server rather than `file://` if you want Firebase features like Auth and Firestore to work properly.

## Security

If a service account key was exposed, revoke it immediately in Firebase / Google Cloud and generate a new one.
