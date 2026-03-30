import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDS-gB4Aaqf7i__kOF8aINMOPyhBJtX6YQ",
  authDomain: "portofolio-jsfolio.firebaseapp.com",
  projectId: "portofolio-jsfolio",
  storageBucket: "portofolio-jsfolio.firebasestorage.app",
  messagingSenderId: "992494176616",
  appId: "1:992494176616:web:0722afe576666a6cfeeedd",
  measurementId: "G-KTNWXQNVLF"
};

// This is the public Firebase web app config for browser use.
// Do not place service account keys or admin credentials in this file.
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

// Expose Firebase instances for the existing non-module scripts on the page.
window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebaseAuth = auth;
window.db = db;

export { app, analytics, auth, db };
