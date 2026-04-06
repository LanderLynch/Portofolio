(function () {
  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop";
  const DEFAULT_ICON =
    '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M13.5 6H19.5V12"></path><path d="m10.5 13.5 9-9"></path><path d="M19.5 14.25v3A2.25 2.25 0 0 1 17.25 19.5h-10.5A2.25 2.25 0 0 1 4.5 17.25v-10.5A2.25 2.25 0 0 1 6.75 4.5h3"></path></svg>';

  function escapeHtml(value, fallback) {
    return String(value || fallback || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeQuickAction(action) {
    return {
      href: action?.href || "#",
      title: action?.title || "Open Project",
      ariaLabel: action?.ariaLabel || action?.title || "Open Project",
      icon: action?.icon || DEFAULT_ICON
    };
  }

  function createProjectCard(project, options) {
    const settings = {
      cardClassName: "project-card",
      deleteButtonLabel: "Delete",
      isAdmin: false,
      projectSource: "",
      quickActions: null,
      showViewButton: true,
      viewButtonLabel: "View Project &rarr;",
      ...options
    };

    const normalizedProject = {
      category: project?.category || "graphic",
      dateLabel: project?.dateLabel || "Recent",
      description: project?.description || "",
      imageSizes: project?.imageSizes || "",
      imageSrcSet: project?.imageSrcSet || "",
      id: project?.id || "",
      imageUrl: project?.imageUrl || DEFAULT_IMAGE,
      projectLink: project?.projectLink || "#",
      projectType: project?.projectType || "Portfolio",
      status: project?.status || "concept",
      techStack: Array.isArray(project?.techStack) ? project.techStack : [],
      title: project?.title || "Untitled Project"
    };

    const quickActions = (settings.quickActions || [
      {
        href: normalizedProject.projectLink,
        title: "Open Project"
      }
    ]).map(normalizeQuickAction);

    const card = document.createElement("div");
    card.className = settings.cardClassName;
    card.dataset.category = normalizedProject.category;

    if (settings.projectSource) {
      card.dataset.projectSource = settings.projectSource;
    }

    if (normalizedProject.id) {
      card.dataset.docId = normalizedProject.id;
    }

    const statusClass = escapeHtml(normalizedProject.status).replace(/\s+/g, "-");
    const statusLabel = escapeHtml(normalizedProject.status.replace(/-/g, " "));
    const imageSrcSetAttr = normalizedProject.imageSrcSet
      ? ` data-srcset="${escapeHtml(normalizedProject.imageSrcSet)}"`
      : "";
    const imageSizesAttr = normalizedProject.imageSizes
      ? ` data-sizes="${escapeHtml(normalizedProject.imageSizes)}"`
      : "";
    const deleteAction =
      settings.isAdmin && normalizedProject.id
        ? `
      <div class="project-admin-actions">
        <button type="button" class="project-delete-btn" data-delete-project="${escapeHtml(normalizedProject.id)}">${escapeHtml(settings.deleteButtonLabel)}</button>
      </div>
    `
        : "";

    const viewButton = settings.showViewButton
      ? `<a href="${escapeHtml(normalizedProject.projectLink)}" class="view-project-btn">${settings.viewButtonLabel}</a>`
      : "";

    card.innerHTML = `
      <div class="project-image">
        <img src="${escapeHtml(normalizedProject.imageUrl)}" alt="${escapeHtml(normalizedProject.title)}" loading="lazy" decoding="async" fetchpriority="low"${imageSrcSetAttr}${imageSizesAttr} />
        <div class="project-overlay">
          <div class="project-quick-actions">
            ${quickActions
              .map(
                (action) => `
              <a href="${escapeHtml(action.href)}" class="quick-action-btn" title="${escapeHtml(action.title)}" aria-label="${escapeHtml(action.ariaLabel)}">${action.icon}</a>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
      <div class="project-content">
        <div class="project-header">
          <h3 class="project-title">${escapeHtml(normalizedProject.title)}</h3>
          <span class="project-status ${statusClass}">${statusLabel}</span>
        </div>
        <p class="project-description">${escapeHtml(normalizedProject.description)}</p>
        <div class="project-tech-stack">
          ${normalizedProject.techStack.map((item) => `<span class="tech-tag">${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="project-meta">
          <div class="project-date">
            <span aria-hidden="true"><svg class="icon-svg" viewBox="0 0 24 24"><path d="M8.25 2.25v3"></path><path d="M15.75 2.25v3"></path><path d="M3.75 8.25h16.5"></path><path d="M4.5 4.5h15A2.25 2.25 0 0 1 21.75 6.75v12A2.25 2.25 0 0 1 19.5 21h-15a2.25 2.25 0 0 1-2.25-2.25v-12A2.25 2.25 0 0 1 4.5 4.5Z"></path></svg></span>
            <span>${escapeHtml(normalizedProject.dateLabel)}</span>
          </div>
          <div class="project-type">${escapeHtml(normalizedProject.projectType)}</div>
        </div>
        ${viewButton}
        ${deleteAction}
      </div>
    `;

    return card;
  }

  window.portfolioProjectCardUtils = {
    createProjectCard,
    escapeHtml
  };
})();
