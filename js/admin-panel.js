import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const projectCollection = collection(db, "projects");
const projectCardUtils = window.portfolioProjectCardUtils;

function createFirebaseProjectCard(project, isAdmin) {
  return projectCardUtils.createProjectCard(project, {
    cardClassName: "project-card project-card-dynamic",
    isAdmin,
    projectSource: "firebase"
  });
}

function initAdminPanel() {
  const adminPopout = document.getElementById("admin-popout");
  const adminPanel = document.getElementById("admin-panel");
  const adminTrigger = document.getElementById("footer-admin-trigger");
  const closeAdminPopoutBtn = document.getElementById("close-admin-popout");
  const adminLoginForm = document.getElementById("admin-login-form");
  const adminStatus = document.getElementById("admin-status");
  const adminUser = document.getElementById("admin-user");
  const adminActions = document.getElementById("admin-actions");
  const adminEmail = document.getElementById("admin-email");
  const adminPassword = document.getElementById("admin-password");
  const adminLogoutBtn = document.getElementById("admin-logout-btn");
  const projectForm = document.getElementById("project-form");
  const projectsContainer = document.getElementById("projects-container");
  let latestProjectSnapshot = null;

  if (!adminPopout || !adminPanel || !adminTrigger || !adminLoginForm || !projectForm || !projectsContainer) {
    return;
  }

  projectForm.dataset.mode = "firebase";

  function setPopoutState(isOpen) {
    adminPopout.classList.toggle("is-open", isOpen);
    adminPopout.setAttribute("aria-hidden", String(!isOpen));
    adminTrigger.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      (auth.currentUser ? adminPanel : adminEmail)?.focus();
    } else {
      adminTrigger.focus();
    }
  }

  function setStatus(message, tone = "info") {
    adminStatus.textContent = message;
    adminStatus.dataset.tone = tone;
  }

  adminTrigger.addEventListener("click", () => {
    setPopoutState(true);
  });

  closeAdminPopoutBtn?.addEventListener("click", () => {
    setPopoutState(false);
  });

  adminPopout.addEventListener("click", (event) => {
    if (event.target === adminPopout) {
      setPopoutState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && adminPopout.classList.contains("is-open")) {
      setPopoutState(false);
    }
  });

  function syncProjectGrid() {
    if (window.portfolioProjectHelpers) {
      window.portfolioProjectHelpers.refreshProjectRegistry();
      window.portfolioProjectHelpers.filterProjects(window.portfolioProjectHelpers.getActiveProjectFilter());
    }
  }

  function rerenderFirebaseCards(snapshot) {
    latestProjectSnapshot = snapshot;
    projectsContainer
      .querySelectorAll('[data-project-source="firebase"]')
      .forEach((element) => element.remove());

    snapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }))
      .sort((left, right) => (right.createdAt?.seconds || 0) - (left.createdAt?.seconds || 0))
      .forEach((project) => {
        projectsContainer.appendChild(createFirebaseProjectCard(project, Boolean(auth.currentUser)));
      });

    syncProjectGrid();
  }

  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      setStatus("Signing in...", "info");
      await signInWithEmailAndPassword(auth, adminEmail.value.trim(), adminPassword.value);
      adminLoginForm.reset();
    } catch (error) {
      setStatus(error.message || "Login failed.", "error");
    }
  });

  adminLogoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setStatus(error.message || "Logout failed.", "error");
    }
  });

  projectForm.addEventListener("submit", async (event) => {
    if (projectForm.dataset.mode !== "firebase") {
      return;
    }

    event.preventDefault();

    if (!auth.currentUser) {
      setStatus("Sign in as the admin before adding projects.", "error");
      return;
    }

    const techStack = Array.from(document.querySelectorAll("#tech-stack-container .tech-tag-input span:first-child"))
      .map((element) => element.textContent.trim())
      .filter(Boolean);

    const payload = {
      title: document.getElementById("project-title").value.trim(),
      category: document.getElementById("project-category").value,
      status: document.getElementById("project-status").value,
      description: document.getElementById("project-description").value.trim(),
      imageUrl: document.getElementById("project-image").value.trim(),
      projectLink: document.getElementById("project-link").value.trim(),
      dateLabel: document.getElementById("project-date-label").value.trim(),
      projectType: document.getElementById("project-type").value,
      techStack,
      createdAt: serverTimestamp()
    };

    try {
      setStatus("Saving project to Firestore...", "info");
      await addDoc(projectCollection, payload);

      if (window.portfolioProjectHelpers) {
        window.portfolioProjectHelpers.closeProjectModal();
        window.portfolioProjectHelpers.resetProjectForm();
        window.portfolioProjectHelpers.showSuccessMessage("Project saved to Firestore.");
      }

      setStatus("Project saved. It is now publicly readable.", "success");
    } catch (error) {
      setStatus(error.message || "Project save failed.", "error");
    }
  });

  projectsContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-project]");
    if (!button) {
      return;
    }

    if (!auth.currentUser) {
      setStatus("Sign in as the admin before deleting projects.", "error");
      return;
    }

    try {
      setStatus("Deleting project...", "info");
      await deleteDoc(doc(db, "projects", button.dataset.deleteProject));

      if (window.portfolioProjectHelpers) {
        window.portfolioProjectHelpers.showSuccessMessage("Project deleted from Firestore.");
      }

      setStatus("Project deleted.", "success");
    } catch (error) {
      setStatus(error.message || "Project delete failed.", "error");
    }
  });

  onAuthStateChanged(auth, (user) => {
    const isSignedIn = Boolean(user);
    adminPanel.classList.toggle("is-authenticated", isSignedIn);
    adminActions.hidden = !isSignedIn;
    adminLoginForm.hidden = isSignedIn;
    adminUser.textContent = isSignedIn ? (user.email || user.uid) : "Public mode";
    setStatus(
      isSignedIn
        ? `Admin signed in as ${user.email || user.uid}.`
        : "Public portfolio mode. Sign in to manage projects.",
      isSignedIn ? "success" : "info"
    );

    if (latestProjectSnapshot) {
      rerenderFirebaseCards(latestProjectSnapshot);
    }
  });

  onSnapshot(
    projectCollection,
    (snapshot) => rerenderFirebaseCards(snapshot),
    (error) => setStatus(error.message || "Could not load Firestore projects.", "error")
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPanel, { once: true });
} else {
  initAdminPanel();
}
