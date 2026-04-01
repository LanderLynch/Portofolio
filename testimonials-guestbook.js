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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const guestbookCollection = collection(db, "guestbookMessages");
const guestbookQuery = query(guestbookCollection, orderBy("createdAt", "asc"));
const ADMIN_UID = "SGqCpB7UmfeO1I8BiWug6EH8W1N2";
const AUTHOR_NAME = "Jona Setiawan";
const AUTHOR_PHOTO = "https://i.pinimg.com/736x/51/6b/3d/516b3dfcab87be8bbf46c9ed05184eeb.jpg";
const signedInFallbackAvatar = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Twitter_default_profile_400x400.png/400px-Twitter_default_profile_400x400.png";
const USERNAME_EMAIL_DOMAIN = "portofolio-jsfolio.local";

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

function normalizeMessage(message) {
  const isAdminMessage = message.uid === ADMIN_UID;

  if (isAdminMessage) {
    return {
      ...message,
      displayName: AUTHOR_NAME,
      photoURL: AUTHOR_PHOTO,
      provider: "author",
      isAuthor: true
    };
  }

  return message;
}

function createMessageMarkup(message, currentUserId, currentIsAdmin) {
  const isAuthor = message.isAuthor === true;
  const isOwn = !isAuthor && currentUserId && currentUserId === message.uid;
  const alignRight = isAuthor || isOwn;
  const badge = isAuthor
    ? '<span class="guestbook-role-badge">Author</span>'
    : isOwn
      ? '<span class="guestbook-role-badge">You</span>'
      : "";
  const deleteButton = currentIsAdmin && message.id && !message.isSeeded
    ? `<button type="button" class="guestbook-delete-btn" data-message-id="${escapeHtml(message.id)}" aria-label="Delete comment">Delete</button>`
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
          ${deleteButton}
        </div>
        <div class="guestbook-bubble">${escapeHtml(message.text)}</div>
      </div>
    </article>
  `;
}

function getFriendlyAuthError(error) {
  const errorCode = String(error?.code || "");

  if (errorCode.includes("popup-closed-by-user")) {
    return "The sign-in popup was closed before finishing.";
  }

  if (errorCode.includes("cancelled-popup-request")) {
    return "Another sign-in popup is already open.";
  }

  if (errorCode.includes("account-exists-with-different-credential")) {
    return "This account already exists with a different sign-in method.";
  }

  if (errorCode.includes("invalid-credential")) {
    return "The login credential is invalid. Please try again.";
  }

  if (errorCode.includes("invalid-email")) {
    return "That username format is not valid.";
  }

  if (errorCode.includes("missing-password")) {
    return "Please enter your password first.";
  }

  if (errorCode.includes("weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }

  if (errorCode.includes("email-already-in-use")) {
    return "That username is already being used by another account.";
  }

  if (errorCode.includes("user-not-found") || errorCode.includes("wrong-password") || errorCode.includes("invalid-login-credentials")) {
    return "Username or password is incorrect.";
  }

  if (errorCode.includes("too-many-requests")) {
    return "Too many attempts. Please wait a bit and try again.";
  }

  if (errorCode.includes("network-request-failed")) {
    return "Network error. Check your connection and try again.";
  }

  if (errorCode.includes("permission-denied")) {
    return "Permission denied by Firestore rules.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

function getUsernameLoginEmail(username) {
  return `${username}@${USERNAME_EMAIL_DOMAIN}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const guestbookFeed = document.getElementById("guestbook-feed");
  const guestbookEmpty = document.getElementById("guestbook-empty");
  const guestbookForm = document.getElementById("guestbook-form");
  const guestbookMessage = document.getElementById("guestbook-message");
  const guestbookStatus = document.getElementById("guestbook-status");
  const guestbookSubmitBtn = document.getElementById("guestbook-submit-btn");
  const guestbookGoogleBtn = document.getElementById("guestbook-google-btn");
  const guestbookAuthBar = document.getElementById("guestbook-auth-bar");
  const guestbookAuthCopy = document.getElementById("guestbook-auth-copy");
  const guestbookUserBar = document.getElementById("guestbook-user-bar");
  const guestbookUserAvatar = document.getElementById("guestbook-user-avatar");
  const guestbookUserName = document.getElementById("guestbook-user-name");
  const guestbookUserProvider = document.getElementById("guestbook-user-provider");
  const guestbookProviderActions = document.getElementById("guestbook-provider-actions");
  const guestbookSignoutBtn = document.getElementById("guestbook-signout-btn");
  const emailAuthForm = document.getElementById("email-auth-form");
  const guestbookRecoveryForm = document.getElementById("guestbook-recovery-form");
  const guestbookRecoveryEmail = document.getElementById("guestbook-recovery-email");
  const guestbookRecoveryBackBtn = document.getElementById("guestbook-recovery-back-btn");
  const guestbookUsername = document.getElementById("guestbook-username");
  const guestbookPassword = document.getElementById("guestbook-password");
  const guestbookEmailSignupBtn = document.getElementById("guestbook-email-signup-btn");
  const guestbookForgotLink = document.getElementById("guestbook-forgot-link");
  let latestGuestbookSnapshot = null;

  if (
    !guestbookFeed ||
    !guestbookForm ||
    !guestbookMessage ||
    !guestbookStatus ||
    !guestbookSubmitBtn ||
    !guestbookGoogleBtn ||
    !guestbookAuthBar ||
    !emailAuthForm ||
    !guestbookRecoveryForm ||
    !guestbookRecoveryEmail ||
    !guestbookRecoveryBackBtn ||
    !guestbookUsername ||
    !guestbookPassword ||
    !guestbookEmailSignupBtn ||
    !guestbookForgotLink
  ) {
    return;
  }

  const guestbookToastRegion = document.createElement("div");
  guestbookToastRegion.className = "guestbook-toast-region";
  guestbookToastRegion.setAttribute("aria-live", "polite");
  guestbookToastRegion.setAttribute("aria-atomic", "false");
  document.body.appendChild(guestbookToastRegion);

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

  function renderMessages(snapshot) {
    latestGuestbookSnapshot = snapshot;
    const currentUserId = auth.currentUser?.uid || "";
    const currentIsAdmin = currentUserId === ADMIN_UID;
    const firestoreMessages = snapshot.docs.map((entry) =>
      normalizeMessage({
        ...entry.data(),
        id: entry.id
      })
    );
    const messages = firestoreMessages;

    if (!messages.length) {
      guestbookEmpty.hidden = false;
      guestbookFeed.innerHTML = "";
      guestbookFeed.appendChild(guestbookEmpty);
      return;
    }

    guestbookEmpty.hidden = true;
    guestbookFeed.innerHTML = messages.map((message) => createMessageMarkup(message, currentUserId, currentIsAdmin)).join("");
    guestbookFeed.querySelectorAll(".guestbook-delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const messageId = button.getAttribute("data-message-id");

        if (!messageId) {
          return;
        }

        try {
          button.disabled = true;
          setGuestbookStatus("Deleting message...");
          showToast("Deleting message...", "info");
          await deleteDoc(doc(db, "guestbookMessages", messageId));
          setGuestbookStatus("Comment deleted.");
          showToast("Comment deleted.", "success");
        } catch (error) {
          const friendlyMessage = getFriendlyAuthError(error);
          setGuestbookStatus(friendlyMessage);
          showToast(`Failed to delete comment. ${friendlyMessage}`, "error");
          button.disabled = false;
        }
      });
    });
    guestbookFeed.scrollTop = guestbookFeed.scrollHeight;
  }

  function setGuestbookStatus(message) {
    guestbookStatus.textContent = message;
  }

  function setComposerState(isEnabled) {
    guestbookMessage.disabled = !isEnabled;
    guestbookSubmitBtn.disabled = !isEnabled;
  }

  function setForgotMode(isForgotMode) {
    guestbookAuthBar.classList.toggle("is-forgot-mode", isForgotMode);
    guestbookRecoveryForm.hidden = false;
  }

  function setAuthPanelState(isSignedIn) {
    if (isSignedIn) {
      guestbookAuthBar.classList.add("is-signed-in");
      guestbookAuthBar.classList.remove("is-forgot-mode");
      guestbookUserBar.hidden = false;
      window.requestAnimationFrame(() => {
        guestbookUserBar.classList.add("is-visible");
      });
      return;
    }

    guestbookAuthBar.classList.remove("is-signed-in");
    guestbookUserBar.classList.remove("is-visible");
    guestbookUserBar.hidden = true;
  }

  async function signInWithProvider(provider) {
    const providerName = "Google";

    try {
      setGuestbookStatus(`Opening ${providerName} sign-in...`);
      showToast(`Opening ${providerName} login...`, "info");
      await signInWithPopup(auth, provider);
      setGuestbookStatus(`Signed in with ${providerName}. You can post your message now.`);
      showToast(`${providerName} login successful.`, "success");
    } catch (error) {
      const friendlyMessage = getFriendlyAuthError(error);
      setGuestbookStatus(friendlyMessage);
      showToast(`${providerName} login failed. ${friendlyMessage}`, "error");
    }
  }

  guestbookGoogleBtn.addEventListener("click", () => {
    signInWithProvider(new GoogleAuthProvider());
  });

  emailAuthForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const usernameValue = normalizeUsername(guestbookUsername.value);
    const passwordValue = guestbookPassword.value;

    if (!usernameValue || !passwordValue) {
      const message = "Enter both username and password before signing in.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    if (usernameValue.length < 3) {
      const message = "Username should be at least 3 characters.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    try {
      setGuestbookStatus("Signing in with username...");
      showToast("Signing in with username...", "info");
      await signInWithEmailAndPassword(auth, getUsernameLoginEmail(usernameValue), passwordValue);
      setGuestbookStatus("Signed in with username. You can post your message now.");
      showToast("Username login successful.", "success");
      emailAuthForm.reset();
    } catch (error) {
      const friendlyMessage = getFriendlyAuthError(error);
      setGuestbookStatus(friendlyMessage);
      showToast(`Username login failed. ${friendlyMessage}`, "error");
    }
  });

  guestbookEmailSignupBtn.addEventListener("click", async () => {
    const usernameValue = normalizeUsername(guestbookUsername.value);
    const passwordValue = guestbookPassword.value;

    if (!usernameValue || !passwordValue) {
      const message = "Enter username and password before creating an account.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    if (usernameValue.length < 3) {
      const message = "Username should be at least 3 characters.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    try {
      setGuestbookStatus("Creating account...");
      showToast("Creating account...", "info");
      const syntheticEmail = getUsernameLoginEmail(usernameValue);
      const credential = await createUserWithEmailAndPassword(auth, syntheticEmail, passwordValue);
      await updateProfile(credential.user, {
        displayName: usernameValue
      });

      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          uid: credential.user.uid,
          email: credential.user.email || syntheticEmail,
          username: usernameValue,
          displayName: usernameValue,
          photoURL: credential.user.photoURL || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      setGuestbookStatus("Account created. You are now signed in.");
      showToast("Account created successfully.", "success");
      emailAuthForm.reset();
    } catch (error) {
      const friendlyMessage = getFriendlyAuthError(error);
      setGuestbookStatus(friendlyMessage);
      showToast(`Account creation failed. ${friendlyMessage}`, "error");
    }
  });

  guestbookForgotLink.addEventListener("click", () => {
    setForgotMode(true);
    guestbookRecoveryEmail.value = "";
    guestbookRecoveryEmail.focus();
  });

  guestbookRecoveryBackBtn.addEventListener("click", () => {
    setForgotMode(false);
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

    const recoveryEmail = recoveryValue.includes("@")
      ? recoveryValue
      : getUsernameLoginEmail(normalizeUsername(recoveryValue));

    try {
      setGuestbookStatus("Sending password reset email...");
      showToast("Sending password reset email...", "info");
      await sendPasswordResetEmail(auth, recoveryEmail);
      setGuestbookStatus("Password reset email sent. Please check your inbox.");
      showToast("Password reset email sent.", "success");
      setForgotMode(false);
      guestbookRecoveryForm.reset();
    } catch (error) {
      const friendlyMessage = getFriendlyAuthError(error);
      setGuestbookStatus(friendlyMessage);
      showToast(`Password reset failed. ${friendlyMessage}`, "error");
    }
  });

  guestbookSignoutBtn?.addEventListener("click", async () => {
    try {
      setGuestbookStatus("Signing out...");
      showToast("Signing out...", "info");
      await signOut(auth);
      setGuestbookStatus("Signed out. Sign in to send a message.");
      showToast("Signed out successfully.", "success");
    } catch (error) {
      const friendlyMessage = getFriendlyAuthError(error);
      setGuestbookStatus(friendlyMessage);
      showToast(`Sign-out failed. ${friendlyMessage}`, "error");
    }
  });

  guestbookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!auth.currentUser) {
      const message = "Sign in with Google, Facebook, or email before sending a message.";
      setGuestbookStatus(message);
      showToast(message, "warning");
      return;
    }

    const text = guestbookMessage.value.trim();
    if (!text) {
      showToast("Write a message before sending it.", "warning");
      return;
    }

    const providerId = auth.currentUser.providerData?.[0]?.providerId || "member";
    const isAdminUser = auth.currentUser.uid === ADMIN_UID;

    try {
      guestbookSubmitBtn.disabled = true;
      setGuestbookStatus("Sending your message...");
      showToast("Sending your message...", "info");

      await addDoc(guestbookCollection, {
        uid: auth.currentUser.uid,
        displayName: isAdminUser ? AUTHOR_NAME : auth.currentUser.displayName || "Guest",
        photoURL: isAdminUser ? AUTHOR_PHOTO : auth.currentUser.photoURL || "",
        provider: isAdminUser ? "author" : providerId,
        isAuthor: isAdminUser,
        text,
        createdAt: serverTimestamp()
      });

      guestbookForm.reset();
      setGuestbookStatus("Message sent successfully.");
      showToast("Message sent successfully.", "success");
    } catch (error) {
      const friendlyMessage = getFriendlyAuthError(error);
      setGuestbookStatus(friendlyMessage);
      showToast(`Failed to send the message. ${friendlyMessage}`, "error");
    } finally {
      guestbookSubmitBtn.disabled = !auth.currentUser;
    }
  });

  onAuthStateChanged(auth, (user) => {
    const isSignedIn = Boolean(user);
    const isAdminUser = user?.uid === ADMIN_UID;
    setAuthPanelState(isSignedIn);
    setComposerState(isSignedIn);

    if (isSignedIn) {
      const providerId = user.providerData?.[0]?.providerId || "member";
      guestbookAuthCopy.textContent = isAdminUser
        ? "You are signed in as Jona. Your messages will appear as the author."
        : "You are signed in. Your profile will be attached to your guestbook message.";
      guestbookUserName.textContent = isAdminUser ? AUTHOR_NAME : user.displayName || "Guest";
      guestbookUserProvider.textContent =
        isAdminUser
          ? "Signed in as Author Admin"
          : providerId === "google.com"
            ? "Signed in with Google"
            : providerId === "password"
              ? "Signed in with Username"
              : "Signed in member";

      if (isAdminUser) {
        guestbookUserAvatar.src = AUTHOR_PHOTO;
        guestbookUserAvatar.alt = AUTHOR_NAME;
      } else if (user.photoURL) {
        guestbookUserAvatar.src = user.photoURL;
        guestbookUserAvatar.alt = user.displayName || "Guest";
      } else {
        guestbookUserAvatar.src = signedInFallbackAvatar;
        guestbookUserAvatar.alt = user.displayName || "Guest";
      }

      setGuestbookStatus("Signed in. You can post your message now.");
    } else {
      guestbookAuthCopy.textContent = "Please sign in with Google or username to join the conversation. Your data stays within Firebase Authentication.";
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
      const friendlyMessage = getFriendlyAuthError(error);
      setGuestbookStatus(friendlyMessage || "Could not load guestbook messages.");
      showToast(`Could not load guestbook messages. ${friendlyMessage}`, "error");
    }
  );
});
