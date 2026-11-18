import { auth, db, storage } from "./firebase-config.js";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
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
import {
  getDownloadURL,
  listAll,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const ADMIN_UID = "SGqCpB7UmfeO1I8BiWug6EH8W1N2";
const AUTHOR_NAME = "Jona Setiawan";
const AUTHOR_PHOTO = "https://i.pinimg.com/736x/51/6b/3d/516b3dfcab87be8bbf46c9ed05184eeb.jpg";
const AUTHOR_AVATAR_POSITION = "center 24%";
const CUSTOM_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const CUSTOM_AVATAR_ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
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

  if (providerId === "guest-username" || providerId === "anonymous") {
    return "Username";
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
  if (code.includes("operation-not-allowed")) {
    return "Enable Anonymous sign-in in Firebase Authentication first.";
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

function getProviderId(user, fallback = "") {
  if (user?.isAnonymous) {
    return "guest-username";
  }

  return user?.providerData?.[0]?.providerId || fallback || "guest-username";
}

function isGoogleUser(user, profile) {
  return getProviderId(user, profile?.provider) === "google.com";
}

function createFallbackAvatar(name) {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#8aa0af"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="34" font-weight="700">${getInitials(name)}</text></svg>`
    )
  );
}

function isPresetAvatar(photoURL, position) {
  return AVATAR_OPTIONS.some((option) => option.url === photoURL && option.position === position);
}

function getAvatarFileExtension(file) {
  const nameExtension = String(file?.name || "")
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (nameExtension) {
    return nameExtension === "jpeg" ? "jpg" : nameExtension;
  }

  const typeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  return typeMap[file?.type] || "jpg";
}

function initGuestbook() {
  const guestbookFeed = document.getElementById("guestbook-feed");
  const guestbookEmpty = document.getElementById("guestbook-empty");
  const guestbookAuthBar = document.getElementById("guestbook-auth-bar");
  const guestbookAuthCopy = document.getElementById("guestbook-auth-copy");
  const guestbookProviderActions = document.getElementById("guestbook-provider-actions");
  const guestbookGoogleBtn = document.getElementById("guestbook-google-btn");
  const emailAuthForm = document.getElementById("email-auth-form");
  const guestbookUsername = document.getElementById("guestbook-username");
  const guestbookUserBar = document.getElementById("guestbook-user-bar");
  const guestbookUserAvatar = document.getElementById("guestbook-user-avatar");
  const guestbookUserName = document.getElementById("guestbook-user-name");
  const guestbookUserProvider = document.getElementById("guestbook-user-provider");
  const guestbookAvatarTrigger = document.getElementById("guestbook-avatar-trigger");
  const guestbookAvatarPicker = document.getElementById("guestbook-avatar-picker");
  const guestbookAvatarOptions = document.getElementById("guestbook-avatar-options");
  const guestbookAvatarUploadInput = document.getElementById("guestbook-avatar-upload-input");
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
    !guestbookUserBar ||
    !guestbookUserAvatar ||
    !guestbookUserName ||
    !guestbookUserProvider ||
    !guestbookAvatarTrigger ||
    !guestbookAvatarPicker ||
    !guestbookAvatarOptions ||
    !guestbookAvatarUploadInput ||
    !guestbookSignoutBtn ||
    !guestbookForm ||
    !guestbookMessage ||
    !guestbookStatus ||
    !guestbookSubmitBtn
  ) {
    return;
  }

  guestbookUserBar.hidden = false;
  guestbookAvatarPicker.hidden = true;

  const guestbookToastRegion = document.createElement("div");
  guestbookToastRegion.className = "guestbook-toast-region";
  guestbookToastRegion.setAttribute("aria-live", "polite");
  guestbookToastRegion.setAttribute("aria-atomic", "false");
  document.body.appendChild(guestbookToastRegion);

  let latestGuestbookSnapshot = null;
  let currentProfileData = null;
  let customAvatarOptions = [];

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
    guestbookAuthBar.classList.toggle("is-signed-in", isSignedIn);
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

  async function loadCustomAvatarOptions(user) {
    if (!user || user.uid === ADMIN_UID || isGoogleUser(user, currentProfileData)) {
      customAvatarOptions = [];
      return customAvatarOptions;
    }

    try {
      const folderRef = ref(storage, `guestbook-avatars/${user.uid}`);
      const listed = await listAll(folderRef);
      const sortedItems = [...listed.items].sort((a, b) => b.name.localeCompare(a.name));

      customAvatarOptions = await Promise.all(
        sortedItems.map(async (item) => ({
          url: await getDownloadURL(item),
          position: "center",
          storagePath: item.fullPath
        }))
      );
    } catch (error) {
      customAvatarOptions = [];
      showToast(`Could not load saved avatars. ${getFriendlyAuthError(error)}`, "warning");
    }

    return customAvatarOptions;
  }

  function renderAvatarOptions(activeUrl, activePosition) {
    const presetOptions = AVATAR_OPTIONS.map((option) => {
      const isActive = option.url === activeUrl && option.position === activePosition;
      return `
        <button type="button" class="guestbook-avatar-option${isActive ? " is-active" : ""}" data-avatar-url="${escapeHtml(option.url)}" data-avatar-position="${escapeHtml(option.position)}" aria-label="Use selected avatar">
          <img src="${escapeHtml(option.url)}" alt="" style="object-position:${escapeHtml(option.position)}">
        </button>
      `;
    }).join("");
    const customOptionsMarkup = customAvatarOptions.map((option) => {
      const isActive = option.url === activeUrl && option.position === activePosition;
      return `
        <button type="button" class="guestbook-avatar-option${isActive ? " is-active" : ""}" data-avatar-url="${escapeHtml(option.url)}" data-avatar-position="${escapeHtml(option.position)}" data-avatar-storage-path="${escapeHtml(option.storagePath)}" aria-label="Use your uploaded avatar">
          <img src="${escapeHtml(option.url)}" alt="" style="object-position:${escapeHtml(option.position)}">
        </button>
      `;
    }).join("");
    const hasActiveCustomOption = customAvatarOptions.some((option) => option.url === activeUrl && option.position === activePosition);
    const activeCustomFallback =
      Boolean(activeUrl) && !isPresetAvatar(activeUrl, activePosition) && !hasActiveCustomOption
        ? `
          <button type="button" class="guestbook-avatar-option is-active" data-avatar-url="${escapeHtml(activeUrl)}" data-avatar-position="${escapeHtml(activePosition || "center")}" data-avatar-storage-path="${escapeHtml(currentProfileData?.avatarStoragePath || "")}" aria-label="Use your current uploaded avatar">
            <img src="${escapeHtml(activeUrl)}" alt="" style="object-position:${escapeHtml(activePosition || "center")}">
          </button>
        `
        : "";

    guestbookAvatarOptions.innerHTML = `
      ${presetOptions}
      ${customOptionsMarkup}
      ${activeCustomFallback}
      <button type="button" class="guestbook-avatar-option guestbook-avatar-option-upload" data-avatar-upload="true" aria-label="Upload custom avatar">
        <span class="guestbook-avatar-upload-plus" aria-hidden="true">+</span>
        <span class="guestbook-avatar-upload-label">Custom</span>
      </button>
    `;
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

    if (isGoogleUser(user)) {
      return user.photoURL || currentProfileData?.photoURL || "";
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

    if (isGoogleUser(user)) {
      return "center";
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
    const currentUsernameKey = normalizeUsername(currentProfileData?.username || currentProfileData?.displayName || "");
    const isOwnUsername =
      currentUsernameKey &&
      message.provider === "guest-username" &&
      message.usernameKey &&
      currentUsernameKey === message.usernameKey;
    const isOwn = !isAuthor && ((currentUserId && currentUserId === message.uid) || isOwnUsername);
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

  async function persistAvatarSelection(avatarUrl, avatarPosition, avatarStoragePath = "") {
    await updateProfile(auth.currentUser, { photoURL: avatarUrl });
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      photoURL: avatarUrl,
      avatarPosition,
      avatarStoragePath,
      updatedAt: serverTimestamp()
    }, { merge: true });

    currentProfileData = {
      ...(currentProfileData || {}),
      photoURL: avatarUrl,
      avatarPosition,
      avatarStoragePath
    };

    applyUserAvatar(avatarUrl, getCurrentDisplayName(auth.currentUser), avatarPosition);
    renderAvatarOptions(avatarUrl, avatarPosition);
    closeAvatarPicker();
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
      usernameKey: data.usernameKey || normalizeUsername(data.displayName || ""),
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
    const providerId = isAdmin ? "author" : getProviderId(user, existing.provider);
    const isGoogle = providerId === "google.com";
    const usernameFallback = existing.username || user.displayName || (user.email ? user.email.split("@")[0] : "guest");
    const profile = {
      username: isAdmin ? "jona" : usernameFallback,
      usernameKey: isAdmin ? "jona" : normalizeUsername(existing.username || existing.displayName || user.displayName || usernameFallback),
      displayName: isAdmin ? AUTHOR_NAME : (isGoogle ? (user.displayName || existing.displayName || usernameFallback) : (existing.displayName || user.displayName || usernameFallback)),
      photoURL: isAdmin ? AUTHOR_PHOTO : (isGoogle ? (user.photoURL || existing.photoURL || "") : (existing.photoURL || user.photoURL || AVATAR_OPTIONS[0].url)),
      avatarPosition: isAdmin ? AUTHOR_AVATAR_POSITION : (isGoogle ? "center" : (existing.avatarPosition || AVATAR_OPTIONS[0].position)),
      avatarStoragePath: isAdmin ? "" : (existing.avatarStoragePath || ""),
      provider: providerId
    };

    if (
      !snapshot.exists() ||
      existing.username !== profile.username ||
      existing.usernameKey !== profile.usernameKey ||
      existing.displayName !== profile.displayName ||
      existing.photoURL !== profile.photoURL ||
      existing.avatarPosition !== profile.avatarPosition ||
      existing.avatarStoragePath !== profile.avatarStoragePath ||
      existing.provider !== profile.provider
    ) {
      await setDoc(userRef, {
        ...profile,
        ...(!snapshot.exists() ? { createdAt: serverTimestamp() } : {}),
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
    const usernameValue = guestbookUsername.value.trim();
    const normalizedUsername = normalizeUsername(usernameValue);

    if (!usernameValue) {
      const message = "Enter a username first.";
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
      setGuestbookStatus("Starting username session...");
      showToast("Starting username session...", "info");
      const credential = auth.currentUser || (await signInAnonymously(auth)).user;
      const userRef = doc(db, "users", credential.uid);
      const userSnapshot = await getDoc(userRef);
      const existingProfile = currentProfileData || {};
      const avatarUrl = existingProfile.photoURL || AVATAR_OPTIONS[0].url;
      const avatarPosition = existingProfile.avatarPosition || AVATAR_OPTIONS[0].position;
      const avatarStoragePath = existingProfile.avatarStoragePath || "";

      await updateProfile(credential, {
        displayName: usernameValue,
        photoURL: avatarUrl
      });

      await setDoc(userRef, {
        username: usernameValue,
        usernameKey: normalizedUsername,
        displayName: usernameValue,
        photoURL: avatarUrl,
        avatarPosition,
        avatarStoragePath,
        provider: "guest-username",
        ...(!userSnapshot.exists() ? { createdAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp()
      }, { merge: true });

      currentProfileData = {
        username: usernameValue,
        usernameKey: normalizedUsername,
        displayName: usernameValue,
        photoURL: avatarUrl,
        avatarPosition,
        avatarStoragePath,
        provider: "guest-username"
      };

      setGuestbookStatus("Signed in with username. You can post your message now.");
      showToast("Username session ready.", "success");
    } catch (error) {
      const message = getFriendlyAuthError(error);
      setGuestbookStatus(message);
      showToast(`Username sign-in failed. ${message}`, "error");
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

  guestbookAvatarTrigger.addEventListener("click", async () => {
    if (!auth.currentUser) {
      return;
    }

    if (auth.currentUser.uid === ADMIN_UID) {
      showToast("The author profile photo is fixed for this account.", "info");
      return;
    }

    if (isGoogleUser(auth.currentUser)) {
      showToast("Google accounts use the synced Google profile picture here.", "info");
      return;
    }

    const isOpen = guestbookAvatarPicker.hidden === false;

    if (isOpen) {
      closeAvatarPicker();
      return;
    }

    await loadCustomAvatarOptions(auth.currentUser);
    renderAvatarOptions(currentProfileData?.photoURL || "", currentProfileData?.avatarPosition || "center");
    guestbookAvatarPicker.hidden = false;
    guestbookAvatarTrigger.setAttribute("aria-expanded", "true");
  });

  guestbookAvatarOptions.addEventListener("click", async (event) => {
    const uploadTrigger = event.target.closest("[data-avatar-upload]");

    if (uploadTrigger) {
      guestbookAvatarUploadInput.click();
      return;
    }

    const option = event.target.closest(".guestbook-avatar-option");

    if (!option || !auth.currentUser || auth.currentUser.uid === ADMIN_UID) {
      return;
    }

    const avatarUrl = option.dataset.avatarUrl || "";
    const avatarPosition = option.dataset.avatarPosition || "center";
    const avatarStoragePath = option.dataset.avatarStoragePath || "";

    try {
      await persistAvatarSelection(avatarUrl, avatarPosition, avatarStoragePath);
      showToast("Profile picture updated.", "success");
    } catch (error) {
      showToast(`Avatar update failed. ${getFriendlyAuthError(error)}`, "error");
    }
  });

  guestbookAvatarUploadInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !auth.currentUser || auth.currentUser.uid === ADMIN_UID) {
      return;
    }

    if (!CUSTOM_AVATAR_ACCEPTED_TYPES.has(file.type)) {
      showToast("Use PNG, JPG, WEBP, or GIF for your avatar.", "warning");
      return;
    }

    if (file.size > CUSTOM_AVATAR_MAX_BYTES) {
      showToast("Custom avatar must be 2 MB or smaller.", "warning");
      return;
    }

    const extension = getAvatarFileExtension(file);
    const avatarPath = `guestbook-avatars/${auth.currentUser.uid}/${Date.now()}.${extension}`;

    try {
      setGuestbookStatus("Uploading custom avatar...");
      showToast("Uploading custom avatar...", "info");

      const avatarRef = ref(storage, avatarPath);
      await uploadBytes(avatarRef, file, {
        contentType: file.type,
        cacheControl: "public,max-age=604800"
      });

      const avatarUrl = await getDownloadURL(avatarRef);
      customAvatarOptions = [
        {
          url: avatarUrl,
          position: "center",
          storagePath: avatarPath
        },
        ...customAvatarOptions.filter((option) => option.storagePath !== avatarPath)
      ];
      await persistAvatarSelection(avatarUrl, "center", avatarPath);
      setGuestbookStatus("Custom avatar uploaded.");
      showToast("Custom avatar uploaded.", "success");
    } catch (error) {
      showToast(`Custom avatar upload failed. ${getFriendlyAuthError(error)}`, "error");
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
        provider: isAdmin ? "author" : getProviderId(auth.currentUser, currentProfileData?.provider),
        usernameKey: isAdmin ? "jona" : normalizeUsername(getCurrentDisplayName(auth.currentUser)),
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
        const providerId = isAdmin ? "author" : getProviderId(user, profile.provider);

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
        guestbookAvatarTrigger.disabled = isAdmin || providerId === "google.com";
        await loadCustomAvatarOptions(user);
        applyUserAvatar(getCurrentPhoto(user), displayName, getCurrentAvatarPosition(user));
        renderAvatarOptions(profile.photoURL || "", profile.avatarPosition || "center");
        setGuestbookStatus("Signed in. You can post your message now.");
      } catch (error) {
        currentProfileData = null;
        customAvatarOptions = [];
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
      customAvatarOptions = [];
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGuestbook, { once: true });
} else {
  initGuestbook();
}
