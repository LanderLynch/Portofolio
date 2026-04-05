# Firebase Security Notes

## Important

Do not put a Firebase service account JSON key in this frontend project.

- `firebase-config.js` is browser code and should only use the Firebase web app config.
- A service account key is an admin secret and must only be used on a trusted server, Cloud Function, or local admin script.
- If a service account key has been pasted into chat, committed, or shared, revoke it in Firebase / Google Cloud and create a new one.

## Frontend vs server

Use in frontend:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId`

Use only on server:

- `private_key`
- `client_email`
- full service account JSON
- Firebase Admin SDK initialization, for example `admin.initializeApp({ credential: admin.credential.cert(...) })`

## Firestore rules

Replace `REPLACE_WITH_YOUR_ADMIN_UID` in `firestore.rules` with your real Firebase Auth user UID.

## Storage rules

`storage.rules` is a separate ruleset for Firebase Storage.

- Use `firestore.rules` for Firestore documents and collections.
- Use `storage.rules` for uploaded files in Firebase Storage buckets.
- Do not paste Storage rules into `firestore.rules`, and do not paste Firestore rules into `storage.rules`.

## Current project note

This repository is a static HTML/CSS/JS portfolio. A `.env` file can keep local values out of Git, but it does not make browser-side values secret after deployment.

## Example server usage

If you need Firebase Admin SDK code, keep it in a server-only file such as [server/firebase-admin.example.js](/c:/Users/Jona/Documents/GitHub/Portofolio/server/firebase-admin.example.js). Do not import that file from `index.html`, `admin-panel.js`, or any other browser script.
