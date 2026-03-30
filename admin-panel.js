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

function escapeHtml(value, fallback = "") {
  return String(value || fallback)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createFirebaseProjectCard(project, isAdmin) {
  const card = document.createElement("div");
  const category = project.category || "graphic";
  const status = project.status || "concept";
  const label = status.replace(/-/g, " ");
  const imageUrl =
    project.imageUrl ||
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop";
  const projectLink = project.projectLink || "#";
  const projectType = project.projectType || "Portfolio";
  const projectDate = project.dateLabel || "Recent";
  const techStack = Array.isArray(project.techStack) ? project.techStack : [];

  card.className = "project-card project-card-dynamic";
  card.dataset.category = category;
  card.dataset.projectSource = "firebase";
  card.dataset.docId = project.id;

  const deleteAction = isAdmin
    ? `
      <div class="project-admin-actions">
        <button type="button" class="project-delete-btn" data-delete-project="${escapeHtml(project.id)}">Delete</button>
      </div>
    `
    : "";

  card.innerHTML = `
    <div class="project-image">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(project.title, "Untitled Project")}" />
      <div class="project-overlay">
        <div class="project-quick-actions">
          <a href="${escapeHtml(projectLink)}" class="quick-action-btn" title="Open Project" aria-label="Open Project">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M13.5 6H19.5V12"></path><path d="m10.5 13.5 9-9"></path><path d="M19.5 14.25v3A2.25 2.25 0 0 1 17.25 19.5h-10.5A2.25 2.25 0 0 1 4.5 17.25v-10.5A2.25 2.25 0 0 1 6.75 4.5h3"></path></svg>
          </a>
        </div>
      </div>
    </div>
    <div class="project-content">
      <div class="project-header">
        <h3 class="project-title">${escapeHtml(project.title, "Untitled Project")}</h3>
        <span class="project-status ${escapeHtml(status)}">${escapeHtml(label)}</span>
      </div>
      <p class="project-description">${escapeHtml(project.description)}</p>
      <div class="project-tech-stack">
        ${techStack.map((item) => `<span class="tech-tag">${escapeHtml(item)}</span>`).join("")}
      </div>
      <div class="project-meta">
        <div class="project-date">
          <span aria-hidden="true"><svg class="icon-svg" viewBox="0 0 24 24"><path d="M8.25 2.25v3"></path><path d="M15.75 2.25v3"></path><path d="M3.75 8.25h16.5"></path><path d="M4.5 4.5h15A2.25 2.25 0 0 1 21.75 6.75v12A2.25 2.25 0 0 1 19.5 21h-15a2.25 2.25 0 0 1-2.25-2.25v-12A2.25 2.25 0 0 1 4.5 4.5Z"></path></svg></span>
          <span>${escapeHtml(projectDate)}</span>
        </div>
        <div class="project-type">${escapeHtml(projectType)}</div>
      </div>
      <a href="${escapeHtml(projectLink)}" class="view-project-btn">View Project &rarr;</a>
      ${deleteAction}
    </div>
  `;

  return card;
}

document.addEventListener("DOMContentLoaded", () => {
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
});
