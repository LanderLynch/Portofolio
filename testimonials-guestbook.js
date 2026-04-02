import { auth, db } from "./firebase-config.js";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ADMIN_UID = "SGqCpB7UmfeO1I8BiWug6EH8W1N2";
const AUTHOR_NAME = "Jona Setiawan";
const AUTHOR_PHOTO = "https://i.pinimg.com/736x/51/6b/3d/516b3dfcab87be8bbf46c9ed05184eeb.jpg";
const AUTHOR_AVATAR_POSITION = "center 24%";
const guestbookCollection = collection(db, "guestbookMessages");
const guestbookQuery = query(guestbookCollection, orderBy("createdAt", "asc"));

const AVATAR_OPTIONS = [
  { url: "https://i.pinimg.com/736x/77/19/00/77190088c8605dde08fdd0b3ab1a5441.jpg", position: "center" },
  { url: "https://i.pinimg.com/736x/81/63/78/81637861f1566bb718979b454ce94eed.jpg", position: "center" },
  { url: "https://i.pinimg.com/736x/42/03/37/42033722deefe4f5e249107f56e26cbe.jpg", position: "center" },
  { url: "https://i.pinimg.com/1200x/9c/b1/ad/9cb1ad3542e560f3124542afe63eeb4e.jpg", position: "center" },
  { url: "https://i.pinimg.com/736x/d7/d8/77/d7d877d6dec1ae4c58837c07bc9f5e2e.jpg", position: "center" },
  { url: "https://i.pinimg.com/736x/90/8d/f3/908df3a1a6fcd8526186db3039f42c6e.jpg", position: "center 32%" },
  { url: "https://i.pinimg.com/736x/20/72/2d/20722ded05ba48b6c2dbcbc34d5eb76c.jpg", position: "center 28%" },
  { url: "https://i.pinimg.com/1200x/3a/3b/ce/3a3bce0d8120f80469c8107f7e816495.jpg", position: "center" },
  { url: "https://i.pinimg.com/736x/2c/e8/77/2ce877520dcd8995360a6c38eaa85815.jpg", position: "center 64%" }
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

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function resolveAuthEmail(value) {
  const input = String(value || "").trim();

  if (!input) {
    return "";
  }

  if (input.includes("@")) {
    return input.toLowerCase();
  }

  const username = normalizeUsername(input);
  return username ? `${username}@portofolio-jsfolio.local` : "";
}

function formatMessageDateParts(timestamp) {
  if (!timestamp?.toDate) {
    return { date: "Today", time: "Now" };
  }

  const date = timestamp.toDate();

  return {
    date: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date)
  };
}

function getGuestRoleLabel(providerId) {
  if (providerId === "google.com") {
    return "Google";
  }

  return "Guest";
}

function getFriendlyAuthError(error) {
  const code = String(error?.code || "");

  if (code.includes("popup-closed-by-user")) {
    return "The Google popup was closed before finishing.";
  }
  if (code.includes("cancelled-popup-request")) {
    return "Another sign-in popup is already open.";
  }
  if (code.includes("account-exists-with-different-credential")) {
    return "This account already exists with a different login method.";
  }
  if (code.includes("invalid-email")) {
    return "That email or username format is not valid.";
  }
  if (code.includes("missing-password")) {
    return "Please enter your password first.";
  }
  if (code.includes("weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (code.includes("email-already-in-use")) {
    return "That username is already being used.";
  }
  if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-login-credentials")) {
    return "Username or password is incorrect.";
  }
  if (code.includes("too-many-requests")) {
    return "Too many attempts. Please wait a bit and try again.";
  }
  if (code.includes("network-request-failed")) {
    return "Network error. Check your connection and try again.";
  }
  if (code.includes("permission-denied")) {
    return "Permission denied by Firestore rules.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

function createFallbackAvatar(name) {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#8aa0af"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="34" font-weight="700">${getInitials(name)}</text></svg>`
    )
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const guestbookFeed = document.getElementById("guestbook-feed");
  const guestbookEmpty = document.getElementById("guestbook-empty");
  const guestbookAuthBar = document.getElementById("guestbook-auth-bar");
  const guestbookAuthCopy = document.getElementById("guestbook-auth-copy");
  const guestbookProviderActions = document.getElementById("guestbook-provider-actions");
  const guestbookGoogleBtn = document.getElementById("guestbook-google-btn");
  const emailAuthForm = document.getElementById("email-auth-form");
  const guestbookUsername = document.getElementById("guestbook-username");
  const guestbookPassword = document.getElementById("guestbook-password");
  const guestbookEmailSignupBtn = document.getElementById("guestbook-email-signup-btn");
  const guestbookForgotLink = document.getElementById("guestbook-forgot-link");
  const guestbookRecoveryForm = document.getElementById("guestbook-recovery-form");
  const guestbookRecoveryEmail = document.getElementById("guestbook-recovery-email");
  const guestbookRecoveryBackBtn = document.getElementById("guestbook-recovery-back-btn");
  const guestbookUserBar = document.getElementById("guestbook-user-bar");
  const guestbookUserAvatar = document.getElementById("guestbook-user-avatar");
  const guestbookUserName = document.getElementById("guestbook-user-name");
  const guestbookUserProvider = document.getElementById("guestbook-user-provider");
  const guestbookAvatarTrigger = document.getElementById("guestbook-avatar-trigger");
  const guestbookAvatarPicker = document.getElementById("guestbook-avatar-picker");
  const guestbookAvatarOptions = document.getElementById("guestbook-avatar-options");
  const guestbookSignoutBtn = document.getElementById("guestbook-signout-btn");
  const guestbookForm = document.getElementById("guestbook-form");
  const guestbookMessage = document.getElementById("guestbook-message");
  const guestbookStatus = document.getElementById("guestbook-status");
  const guestbookSubmitBtn = document.getElementById("guestbook-submit-btn");

  if (
    !guestbookFeed ||
    !guestbookEmpty ||
    !guestbookAuthBar ||
    !guestbookAuthCopy ||
    !guestbookProviderActions ||
    !guestbookGoogleBtn ||
    !emailAuthForm ||
    !guestbookUsername ||
    !guestbookPassword ||
    !guestbookEmailSignupBtn ||
    !guestbookForgotLink ||
    !guestbookRecoveryForm ||
    !guestbookRecoveryEmail ||
    !guestbookRecoveryBackBtn ||
    !guestbookUserBar ||
    !guestbookUserAvatar ||
    !guestbookUserName ||
    !guestbookUserProvider ||
    !guestbookAvatarTrigger ||
    !guestbookAvatarPicker ||
    !guestbookAvatarOptions ||
    !guestbookSignoutBtn ||
    !guestbookForm ||
    !guestbookMessage ||
    !guestbookStatus ||
    !guestbookSubmitBtn
  ) {
    return;
  }

  guestbookRecoveryForm.hidden = false;
  guestbookUserBar.hidden = false;
  guestbookAvatarPicker.hidden = true;

  const guestbookToastRegion = document.createElement("div");
  guestbookToastRegion.className = "guestbook-toast-region";
  guestbookToastRegion.setAttribute("aria-live", "polite");
  guestbookToastRegion.setAttribute("aria-atomic", "false");
  document.body.appendChild(guestbookToastRegion);

  let latestGuestbookSnapshot = null;
  let currentProfileData = null;

  function showToast(message, tone = "info") {
    const toast = document.createElement("div");
    toast.className = `guestbook-toast guestbook-toast-${tone}`;
    toast.innerHTML = `
      <div class="guestbook-toast-dot" aria-hidden="true"></div>
      <div class="guestbook-toast-copy">${escapeHtml(message)}</div>
      <button class="guestbook-toast-close" type="button" aria-label="Dismiss notification">&times;</button>
    `;

    const dismiss = () => {
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 220);
    };

    toast.querySelector(".guestbook-toast-close")?.addEventListener("click", dismiss);
    guestbookToastRegion.appendChild(toast);
    window.setTimeout(() => toast.classList.add("is-visible"), 20);
    window.setTimeout(dismiss, 3800);
  }

  function setGuestbookStatus(message) {
    guestbookStatus.textContent = message;
  }

  function setComposerState(isEnabled) {
    guestbookMessage.disabled = !isEnabled;
    guestbookSubmitBtn.disabled = !isEnabled;
  }

  function closeAvatarPicker() {
    guestbookAvatarPicker.hidden = true;
    guestbookAvatarTrigger.setAttribute("aria-expanded", "false");
  }

  function updateAuthLayout(mode) {
    const isSignedIn = mode === "signed-in";
    const isForgotMode = mode === "forgot";
    guestbookAuthBar.classList.toggle("is-signed-in", isSignedIn);
    guestbookAuthBar.classList.toggle("is-forgot-mode", isForgotMode);
    guestbookUserBar.classList.toggle("is-visible", isSignedIn);

    if (!isSignedIn) {
      guestbookUserName.textContent = "Signed in";
      guestbookUserProvider.textContent = "Ready to post a message";
    }
  }

  function applyUserAvatar(photoURL, displayName, position = "center") {
    guestbookUserAvatar.src = photoURL || createFallbackAvatar(displayName);
    guestbookUserAvatar.alt = displayName || "Guest";
    guestbookUserAvatar.style.objectPosition = position;
  }

  function renderAvatarOptions(activeUrl, activePosition) {
    guestbookAvatarOptions.innerHTML = AVATAR_OPTIONS.map((option) => {
      const isActive = option.url === activeUrl && option.position === activePosition;
      return `
        <button type="button" class="guestbook-avatar-option${isActive ? " is-active" : ""}" data-avatar-url="${escapeHtml(option.url)}" data-avatar-position="${escapeHtml(option.position)}" aria-label="Use selected avatar">
          <img src="${escapeHtml(option.url)}" alt="" style="object-position:${escapeHtml(option.position)}">
        </button>
      `;
    }).join("");
  }

  function getCurrentDisplayName(user) {
    if (!user) {
      return "Guest";
    }

    if (user.uid === ADMIN_UID) {
      return AUTHOR_NAME;
    }

    return currentProfileData?.displayName || currentProfileData?.username || user.displayName || "Guest";
  }

  function getCurrentPhoto(user) {
    if (!user) {
      return "";
    }

    if (user.uid === ADMIN_UID) {
      return AUTHOR_PHOTO;
    }

    return currentProfileData?.photoURL || user.photoURL || "";
  }

  function getCurrentAvatarPosition(user) {
    if (!user) {
      return "center";
    }

    if (user.uid === ADMIN_UID) {
      return AUTHOR_AVATAR_POSITION;
    }

    return currentProfileData?.avatarPosition || "center";
  }

  function createAvatarMarkup(photoURL, displayName, position) {
    if (photoURL) {
      return `<img src="${escapeHtml(photoURL)}" alt="${escapeHtml(displayName)}" class="guestbook-avatar" style="object-position:${escapeHtml(position || "center")}">`;
    }

    return `<div class="guestbook-avatar guestbook-avatar-fallback">${escapeHtml(getInitials(displayName))}</div>`;
  }

  function createMessageMarkup(message, currentUserId, isAdminViewer) {
    const isAuthor = message.uid === ADMIN_UID || message.provider === "author" || message.isAuthor === true;
    const isOwn = !isAuthor && currentUserId && currentUserId === message.uid;
    const alignRight = isAuthor || isOwn;
    const parts = formatMessageDateParts(message.createdAt);
    const displayName = isAuthor ? AUTHOR_NAME : (message.displayName || "Guest");
    const roleLabel = isAuthor ? "Author" : (isOwn ? "You" : getGuestRoleLabel(message.provider));
    const metaHtml = alignRight
      ? [
          `<span>${escapeHtml(parts.date)}</span>`,
          `<span>${escapeHtml(parts.time)}</span>`,
          `<span class="guestbook-role-badge">${escapeHtml(roleLabel)}</span>`,
          `<span class="guestbook-name">${escapeHtml(displayName)}</span>`
        ]
      : [
          `<span class="guestbook-name">${escapeHtml(displayName)}</span>`,
          `<span class="guestbook-provider-tag">${escapeHtml(roleLabel)}</span>`,
          `<span>${escapeHtml(parts.time)}</span>`,
          `<span>${escapeHtml(parts.date)}</span>`
        ];

    if (isAdminViewer && message.id) {
      metaHtml.push(`<button type="button" class="guestbook-delete-btn" data-message-id="${escapeHtml(message.id)}">Delete</button>`);
    }

    return `
      <article class="guestbook-message${alignRight ? " is-own" : ""}" data-message-id="${escapeHtml(message.id || "")}">
        ${createAvatarMarkup(isAuthor ? AUTHOR_PHOTO : message.photoURL, displayName, isAuthor ? AUTHOR_AVATAR_POSITION : message.avatarPosition)}
        <div class="guestbook-bubble-wrap">
          <div class="guestbook-meta">${metaHtml.join("")}</div>
          <div class="guestbook-bubble">${escapeHtml(message.text)}</div>
        </div>
      </article>
    `;
  }

  function normalizeSnapshotMessage(entry) {
    const data = entry.data();
    const isAuthor = data.uid === ADMIN_UID || data.provider === "author" || data.isAuthor === true;

    return {
      id: entry.id,
      uid: data.uid || "",
      displayName: isAuthor ? AUTHOR_NAME : (data.displayName || "Guest"),
      photoURL: isAuthor ? AUTHOR_PHOTO : (data.photoURL || ""),
      avatarPosition: isAuthor ? AUTHOR_AVATAR_POSITION : (data.avatarPosition || "center"),
      provider: isAuthor ? "author" : (data.provider || "guest"),
      text: data.text || "",
      createdAt: data.createdAt || null
    };
  }

  function renderMessages(snapshot) {
    latestGuestbookSnapshot = snapshot;
    const currentUserId = auth.currentUser?.uid || "";
    const isAdminViewer = currentUserId === ADMIN_UID;
    const messages = snapshot.docs.map(normalizeSnapshotMessage);

    if (!messages.length) {
      guestbookFeed.innerHTML = "";
      guestbookFeed.appendChild(guestbookEmpty);
      guestbookEmpty.hidden = false;
      return;
    }

    guestbookEmpty.hidden = true;
    guestbookFeed.innerHTML = messages.map((message) => createMessageMarkup(message, currentUserId, isAdminViewer)).join("");
    guestbookFeed.scrollTop = guestbookFeed.scrollHeight;
  }

  async function ensureProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    const existing = snapshot.exists() ? snapshot.data() : {};
    const isAdmin = user.uid === ADMIN_UID;
    const usernameFallback = existing.username || user.displayName || (user.email ? user.email.split("@")[0] : "guest");
    const profile = {
      username: isAdmin ? "jona" : usernameFallback,
      displayName: isAdmin ? AUTHOR_NAME : (existing.displayName || usernameFallback),
      photoURL: isAdmin ? AUTHOR_PHOTO : (existing.photoURL || user.photoURL || ""),
      avatarPosition: isAdmin ? AUTHOR_AVATAR_POSITION : (existing.avatarPosition || "center"),
      provider: isAdmin ? "author" : (existing.provider || user.providerData?.[0]?.providerId || "password")
    };

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    currentProfileData = profile;
    return profile;
  }

  async function signInWithGoogle() {
    try {
      setGuestbookStatus("Opening Google sign-in...");
      showToast("Opening Google login...", "info");
      await signInWithPopup(auth, new GoogleAuthProvider());
      setGuestbookStatus("Signed in with Google. You can post your message now.");
      showToast("Google login successful.", "success");
    } catch (error) {
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message);
      showToast(`Google login failed. ${message}`, "error");
    }
  }

  guestbookGoogleBtn.addEventListener("click", signInWithGoogle);

  emailAuthForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const loginValue = guestbookUsername.value.trim();
    const passwordValue = guestbookPassword.value;

    if (!loginValue || !passwordValue) {
      const message = "Enter both username and password before signing in.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    try {
      setGuestbookStatus("Signing in...");
      showToast("Signing in...", "info");
      await signInWithEmailAndPassword(auth, resolveAuthEmail(loginValue), passwordValue);
      setGuestbookStatus("Signed in successfully. You can post your message now.");
      showToast("Username login successful.", "success");
    } catch (error) {
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message);
      showToast(`Login failed. ${message}`, "error");
    }
  });

  guestbookEmailSignupBtn.addEventListener("click", async () => {
    const usernameValue = guestbookUsername.value.trim();
    const passwordValue = guestbookPassword.value;
    const normalizedUsername = normalizeUsername(usernameValue);

    if (!usernameValue || !passwordValue) {
      const message = "Enter username and password before creating an account.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    if (normalizedUsername.length < 3) {
      const message = "Use a username with at least 3 valid characters.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    try {
      setGuestbookStatus("Creating account...");
      showToast("Creating account...", "info");
      const credential = await createUserWithEmailAndPassword(auth, resolveAuthEmail(normalizedUsername), passwordValue);
      const avatar = AVATAR_OPTIONS[0];

      await updateProfile(credential.user, {
        displayName: usernameValue,
        photoURL: avatar.url
      });

      await setDoc(doc(db, "users", credential.user.uid), {
        username: usernameValue,
        displayName: usernameValue,
        photoURL: avatar.url,
        avatarPosition: avatar.position,
        provider: "password",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      setGuestbookStatus("Account created. You are now signed in.");
      showToast("Account created successfully.", "success");
    } catch (error) {
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message);
      showToast(`Account creation failed. ${message}`, "error");
    }
  });

  guestbookForgotLink.addEventListener("click", () => {
    guestbookRecoveryEmail.value = guestbookUsername.value.trim();
    updateAuthLayout("forgot");
    setGuestbookStatus("Enter your email or username to reset your password.");
  });

  guestbookRecoveryBackBtn.addEventListener("click", () => {
    updateAuthLayout(auth.currentUser ? "signed-in" : "signed-out");
    setGuestbookStatus(auth.currentUser ? "Signed in. You can post your message now." : "Sign in to send a message.");
  });

  guestbookRecoveryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const recoveryValue = guestbookRecoveryEmail.value.trim();

    if (!recoveryValue) {
      const message = "Enter your email or username first.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    try {
      setGuestbookStatus("Sending reset email...");
      showToast("Sending reset email...", "info");
      await sendPasswordResetEmail(auth, resolveAuthEmail(recoveryValue));
      setGuestbookStatus("Password reset email sent.");
      showToast("Password reset email sent.", "success");
    } catch (error) {
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message);
      showToast(`Password reset failed. ${message}`, "error");
    }
  });

  guestbookSignoutBtn.addEventListener("click", async () => {
    try {
      setGuestbookStatus("Signing out...");
      showToast("Signing out...", "info");
      await signOut(auth);
      setGuestbookStatus("Signed out. Sign in to send a message.");
      showToast("Signed out successfully.", "success");
    } catch (error) {
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message);
      showToast(`Sign-out failed. ${message}`, "error");
    }
  });

  guestbookAvatarTrigger.addEventListener("click", () => {
    if (!auth.currentUser || auth.currentUser.uid === ADMIN_UID) {
      showToast("The author profile photo is fixed for this account.", "info");
      return;
    }

    const isOpen = guestbookAvatarPicker.hidden === false;

    if (isOpen) {
      closeAvatarPicker();
      return;
    }

    renderAvatarOptions(currentProfileData?.photoURL || "", currentProfileData?.avatarPosition || "center");
    guestbookAvatarPicker.hidden = false;
    guestbookAvatarTrigger.setAttribute("aria-expanded", "true");
  });

  guestbookAvatarOptions.addEventListener("click", async (event) => {
    const option = event.target.closest(".guestbook-avatar-option");

    if (!option || !auth.currentUser || auth.currentUser.uid === ADMIN_UID) {
      return;
    }

    const avatarUrl = option.dataset.avatarUrl || "";
    const avatarPosition = option.dataset.avatarPosition || "center";

    try {
      await updateProfile(auth.currentUser, { photoURL: avatarUrl });
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        photoURL: avatarUrl,
        avatarPosition,
        updatedAt: serverTimestamp()
      }, { merge: true });

      currentProfileData = {
        ...(currentProfileData || {}),
        photoURL: avatarUrl,
        avatarPosition
      };

      applyUserAvatar(avatarUrl, getCurrentDisplayName(auth.currentUser), avatarPosition);
      renderAvatarOptions(avatarUrl, avatarPosition);
      closeAvatarPicker();
      showToast("Profile picture updated.", "success");
    } catch (error) {
      showToast(`Avatar update failed. ${getFriendlyAuthError(error)}`, "error");
    }
  });

  guestbookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!auth.currentUser) {
      const message = "Sign in first to send a message.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    const text = guestbookMessage.value.trim();

    if (!text) {
      showToast("Write a message before sending it.", "warning");
      return;
    }

    const isAdmin = auth.currentUser.uid === ADMIN_UID;

    try {
      guestbookSubmitBtn.disabled = true;
      setGuestbookStatus("Sending your message...");
      showToast("Sending your message...", "info");

      await addDoc(guestbookCollection, {
        uid: auth.currentUser.uid,
        displayName: isAdmin ? AUTHOR_NAME : getCurrentDisplayName(auth.currentUser),
        photoURL: isAdmin ? AUTHOR_PHOTO : getCurrentPhoto(auth.currentUser),
        avatarPosition: isAdmin ? AUTHOR_AVATAR_POSITION : getCurrentAvatarPosition(auth.currentUser),
        provider: isAdmin ? "author" : (auth.currentUser.providerData?.[0]?.providerId || "password"),
        text,
        createdAt: serverTimestamp()
      });

      guestbookForm.reset();
      setGuestbookStatus("Message sent successfully.");
      showToast("Message sent successfully.", "success");
    } catch (error) {
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message);
      showToast(`Failed to send the message. ${message}`, "error");
    } finally {
      setComposerState(Boolean(auth.currentUser));
    }
  });

  guestbookFeed.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".guestbook-delete-btn");

    if (!deleteButton || auth.currentUser?.uid !== ADMIN_UID) {
      return;
    }

    const messageId = deleteButton.dataset.messageId;

    if (!messageId) {
      return;
    }

    try {
      deleteButton.disabled = true;
      await deleteDoc(doc(db, "guestbookMessages", messageId));
      showToast("Comment deleted.", "success");
    } catch (error) {
      deleteButton.disabled = false;
      showToast(`Delete failed. ${getFriendlyAuthError(error)}`, "error");
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !guestbookAvatarPicker.hidden &&
      !event.target.closest("#guestbook-avatar-picker") &&
      !event.target.closest("#guestbook-avatar-trigger")
    ) {
      closeAvatarPicker();
    }
  });

  onAuthStateChanged(auth, async (user) => {
    closeAvatarPicker();

    if (user) {
      try {
        const profile = await ensureProfile(user);
        const isAdmin = user.uid === ADMIN_UID;
        const displayName = isAdmin ? AUTHOR_NAME : (profile.displayName || profile.username || user.displayName || "Guest");
        const providerId = isAdmin ? "author" : (user.providerData?.[0]?.providerId || profile.provider || "password");

        updateAuthLayout("signed-in");
        setComposerState(true);
        guestbookAuthCopy.textContent = "You are signed in. Your profile will be attached to your guestbook message.";
        guestbookUserName.textContent = displayName;
        guestbookUserProvider.textContent =
          isAdmin
            ? "Signed in as Author Admin"
            : providerId === "google.com"
              ? "Signed in with Google"
              : "Signed in with Username";
        guestbookAvatarTrigger.disabled = isAdmin;
        applyUserAvatar(getCurrentPhoto(user), displayName, getCurrentAvatarPosition(user));
        renderAvatarOptions(profile.photoURL || "", profile.avatarPosition || "center");
        setGuestbookStatus("Signed in. You can post your message now.");
      } catch (error) {
        currentProfileData = null;
        updateAuthLayout("signed-in");
        setComposerState(true);
        guestbookAvatarTrigger.disabled = user.uid === ADMIN_UID;
        guestbookUserName.textContent = user.uid === ADMIN_UID ? AUTHOR_NAME : (user.displayName || "Guest");
        guestbookUserProvider.textContent = user.uid === ADMIN_UID ? "Signed in as Author Admin" : "Signed in";
        applyUserAvatar(user.uid === ADMIN_UID ? AUTHOR_PHOTO : user.photoURL, guestbookUserName.textContent, user.uid === ADMIN_UID ? AUTHOR_AVATAR_POSITION : "center");
        setGuestbookStatus("Signed in. You can post your message now.");
        showToast(`Profile sync warning. ${getFriendlyAuthError(error)}`, "warning");
      }
    } else {
      currentProfileData = null;
      updateAuthLayout("signed-out");
      setComposerState(false);
      guestbookAuthCopy.textContent = "Please sign in to join the conversation. Don't worry, your data is safe with us.";
      guestbookAvatarTrigger.disabled = false;
      applyUserAvatar("", "Guest", "center");
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
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message || "Could not load guestbook messages.");
      showToast(`Could not load guestbook messages. ${message}`, "error");
    }
  );
});
