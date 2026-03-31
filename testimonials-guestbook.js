import { auth, db } from "./firebase-config.js";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const guestbookCollection = collection(db, "guestbookMessages");
const guestbookQuery = query(guestbookCollection, orderBy("createdAt", "asc"));
const seededGuestbookMessages = [
  {
    displayName: "John Doe",
    provider: "guest",
    photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Wow, this portfolio is awesome. The presentation feels polished and very professional.",
    createdAtLabel: "31/03/2026, 09:18"
  },
  {
    displayName: "Jona Setiawan",
    provider: "author",
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    text: "Thank you so much, John. I really appreciate you taking the time to stop by and leave a message.",
    createdAtLabel: "31/03/2026, 09:22",
    isAuthor: true
  },
  {
    displayName: "Jane Doe",
    provider: "guest",
    photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "I really like the visual direction here. It feels thoughtful, clean, and easy to explore.",
    createdAtLabel: "31/03/2026, 09:26"
  },
  {
    displayName: "Jona Setiawan",
    provider: "author",
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    text: "That means a lot, Jane. I wanted the portfolio to feel simple, clear, and still a bit memorable.",
    createdAtLabel: "31/03/2026, 09:30",
    isAuthor: true
  },
  {
    displayName: "Fulan",
    provider: "guest",
    photoURL: "https://randomuser.me/api/portraits/men/67.jpg",
    text: "Keren banget portofolionya. Bikin saya makin semangat belajar design dan web.",
    createdAtLabel: "31/03/2026, 09:34"
  },
  {
    displayName: "Jona Setiawan",
    provider: "author",
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    text: "Makasih banyak, Fulan. Senang banget kalau karya dan website ini bisa ikut kasih inspirasi.",
    createdAtLabel: "31/03/2026, 09:42",
    isAuthor: true
  }
];

function escapeHtml(value, fallback = "") {
  return String(value || fallback)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getInitials(name) {
  return String(name || "G")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatTimestamp(timestamp) {
  if (!timestamp?.toDate) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp.toDate());
}

function getProviderLabel(message) {
  if (message.provider === "author") {
    return "Portfolio";
  }

  if (message.provider === "guest") {
    return "Guest";
  }

  if (message.provider === "facebook.com") {
    return "Facebook";
  }

  if (message.provider === "google.com") {
    return "Google";
  }

  return "Member";
}

function createAvatarMarkup(message) {
  if (message.photoURL) {
    return `<img src="${escapeHtml(message.photoURL)}" alt="${escapeHtml(message.displayName, "Guest")}" class="guestbook-avatar">`;
  }

  return `<div class="guestbook-avatar guestbook-avatar-fallback">${escapeHtml(getInitials(message.displayName))}</div>`;
}

function createMessageMarkup(message, currentUserId) {
  const isAuthor = message.isAuthor === true;
  const isOwn = !isAuthor && currentUserId && currentUserId === message.uid;
  const alignRight = isAuthor || isOwn;
  const badge = isAuthor
    ? '<span class="guestbook-role-badge">Author</span>'
    : isOwn
      ? '<span class="guestbook-role-badge">You</span>'
      : "";

  return `
    <article class="guestbook-message${alignRight ? " is-own" : ""}">
      ${createAvatarMarkup(message)}
      <div class="guestbook-bubble-wrap">
        <div class="guestbook-meta">
          <span>${escapeHtml(message.createdAtLabel || formatTimestamp(message.createdAt))}</span>
          ${badge}
          <span class="guestbook-name">${escapeHtml(message.displayName, "Guest")}</span>
          <span class="guestbook-provider-tag">${escapeHtml(getProviderLabel(message))}</span>
        </div>
        <div class="guestbook-bubble">${escapeHtml(message.text)}</div>
      </div>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const guestbookFeed = document.getElementById("guestbook-feed");
  const guestbookEmpty = document.getElementById("guestbook-empty");
  const guestbookForm = document.getElementById("guestbook-form");
  const guestbookMessage = document.getElementById("guestbook-message");
  const guestbookStatus = document.getElementById("guestbook-status");
  const guestbookSubmitBtn = document.getElementById("guestbook-submit-btn");
  const guestbookGoogleBtn = document.getElementById("guestbook-google-btn");
  const guestbookFacebookBtn = document.getElementById("guestbook-facebook-btn");
  const guestbookAuthCopy = document.getElementById("guestbook-auth-copy");
  const guestbookUserBar = document.getElementById("guestbook-user-bar");
  const guestbookUserAvatar = document.getElementById("guestbook-user-avatar");
  const guestbookUserName = document.getElementById("guestbook-user-name");
  const guestbookUserProvider = document.getElementById("guestbook-user-provider");
  const guestbookProviderActions = document.getElementById("guestbook-provider-actions");
  const guestbookSignoutBtn = document.getElementById("guestbook-signout-btn");
  const emailAuthForm = document.getElementById("email-auth-form");
  const guestbookEmail = document.getElementById("guestbook-email");
  const guestbookPassword = document.getElementById("guestbook-password");
  const guestbookEmailSignupBtn = document.getElementById("guestbook-email-signup-btn");
  let latestGuestbookSnapshot = null;

  if (
    !guestbookFeed ||
    !guestbookForm ||
    !guestbookMessage ||
    !guestbookStatus ||
    !guestbookSubmitBtn ||
    !guestbookGoogleBtn ||
    !guestbookFacebookBtn ||
    !emailAuthForm ||
    !guestbookEmail ||
    !guestbookPassword ||
    !guestbookEmailSignupBtn
  ) {
    return;
  }

  function renderMessages(snapshot) {
    latestGuestbookSnapshot = snapshot;
    const currentUserId = auth.currentUser?.uid || "";
    const firestoreMessages = snapshot.docs.map((entry) => entry.data());
    const messages = [...seededGuestbookMessages, ...firestoreMessages];

    if (!messages.length) {
      guestbookEmpty.hidden = false;
      guestbookFeed.innerHTML = "";
      guestbookFeed.appendChild(guestbookEmpty);
      return;
    }

    guestbookEmpty.hidden = true;
    guestbookFeed.innerHTML = messages.map((message) => createMessageMarkup(message, currentUserId)).join("");
    guestbookFeed.scrollTop = guestbookFeed.scrollHeight;
  }

  function setGuestbookStatus(message) {
    guestbookStatus.textContent = message;
  }

  function setComposerState(isEnabled) {
    guestbookMessage.disabled = !isEnabled;
    guestbookSubmitBtn.disabled = !isEnabled;
  }

  async function signInWithProvider(provider) {
    try {
      await signInWithPopup(auth, provider);
      setGuestbookStatus("Signed in. You can post your message now.");
    } catch (error) {
      setGuestbookStatus(error.message || "Sign-in failed. Please try again.");
    }
  }

  guestbookGoogleBtn.addEventListener("click", () => {
    signInWithProvider(new GoogleAuthProvider());
  });

  guestbookFacebookBtn.addEventListener("click", () => {
    signInWithProvider(new FacebookAuthProvider());
  });

  emailAuthForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, guestbookEmail.value.trim(), guestbookPassword.value);
      setGuestbookStatus("Signed in with email. You can post your message now.");
      emailAuthForm.reset();
    } catch (error) {
      setGuestbookStatus(error.message || "Email sign-in failed.");
    }
  });

  guestbookEmailSignupBtn.addEventListener("click", async () => {
    try {
      await createUserWithEmailAndPassword(auth, guestbookEmail.value.trim(), guestbookPassword.value);
      setGuestbookStatus("Account created. You are now signed in.");
      emailAuthForm.reset();
    } catch (error) {
      setGuestbookStatus(error.message || "Account creation failed.");
    }
  });

  guestbookSignoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      setGuestbookStatus("Signed out. Sign in to send a message.");
    } catch (error) {
      setGuestbookStatus(error.message || "Sign-out failed.");
    }
  });

  guestbookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!auth.currentUser) {
      setGuestbookStatus("Sign in with Google, Facebook, or email before sending a message.");
      return;
    }

    const text = guestbookMessage.value.trim();
    if (!text) {
      return;
    }

    const providerId = auth.currentUser.providerData?.[0]?.providerId || "member";

    try {
      guestbookSubmitBtn.disabled = true;
      setGuestbookStatus("Sending your message...");

      await addDoc(guestbookCollection, {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || "Guest",
        photoURL: auth.currentUser.photoURL || "",
        provider: providerId,
        text,
        createdAt: serverTimestamp()
      });

      guestbookForm.reset();
      setGuestbookStatus("Message sent successfully.");
    } catch (error) {
      setGuestbookStatus(error.message || "Failed to send the message.");
    } finally {
      guestbookSubmitBtn.disabled = !auth.currentUser;
    }
  });

  onAuthStateChanged(auth, (user) => {
    const isSignedIn = Boolean(user);
    guestbookProviderActions.hidden = isSignedIn;
    emailAuthForm.hidden = isSignedIn;
    guestbookUserBar.hidden = !isSignedIn;
    setComposerState(isSignedIn);

    if (isSignedIn) {
      const providerId = user.providerData?.[0]?.providerId || "member";
      guestbookAuthCopy.textContent = "You are signed in. Your profile will be attached to your guestbook message.";
      guestbookUserName.textContent = user.displayName || "Guest";
      guestbookUserProvider.textContent =
        providerId === "facebook.com"
          ? "Signed in with Facebook"
          : providerId === "google.com"
            ? "Signed in with Google"
            : providerId === "password"
              ? "Signed in with Email"
            : "Signed in member";

      if (user.photoURL) {
        guestbookUserAvatar.src = user.photoURL;
        guestbookUserAvatar.alt = user.displayName || "Guest";
      } else {
        guestbookUserAvatar.src =
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#64748b"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="34" font-weight="700">${getInitials(user.displayName)}</text></svg>`
          );
        guestbookUserAvatar.alt = user.displayName || "Guest";
      }

      setGuestbookStatus("Signed in. You can post your message now.");
    } else {
      guestbookAuthCopy.textContent = "Please sign in with Google, Facebook, or email to join the conversation. Your data stays within Firebase Authentication.";
      setGuestbookStatus("Sign in to send a message.");
    }

    if (latestGuestbookSnapshot) {
      renderMessages(latestGuestbookSnapshot);
    }
  });

  onSnapshot(
    guestbookQuery,
    (snapshot) => renderMessages(snapshot),
    (error) => {
      setGuestbookStatus(error.message || "Could not load guestbook messages.");
    }
  );
});
