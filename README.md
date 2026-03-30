# Portfolio Site

This repository is a static portfolio site built with HTML, CSS, JavaScript, and Firebase.

## Project Structure

- `index.html`: main portfolio page
- `certification.html`: certification archive page
- `styles.css`: shared site styling
- `theme-controls.js`: theme switcher
- `zoom-controls.js`: zoom controls
- `firebase-config.js`: browser Firebase setup
- `admin-panel.js`: Firebase Auth and Firestore admin panel logic
- `firestore.rules`: Firestore security rule template
- `.env.example`: safe environment variable template

## Firebase Notes

- The Firebase web config in `firebase-config.js` is for browser use.
- Do not place a Firebase service account JSON key in this repo or in browser code.
- Replace `REPLACE_WITH_YOUR_ADMIN_UID` in `firestore.rules` with your real Firebase Auth UID.
- See `FIREBASE_SECURITY.md` for security guidance.

## Local Development

Open the HTML files with a local web server rather than `file://` if you want Firebase features like Auth and Firestore to work properly.

## Security

If a service account key was exposed, revoke it immediately in Firebase / Google Cloud and generate a new one.
