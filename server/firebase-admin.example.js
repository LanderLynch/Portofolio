const admin = require("firebase-admin");

// Keep the service account JSON outside the frontend project and outside Git.
// Point this to a secure local path or load the credentials from environment variables.
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
