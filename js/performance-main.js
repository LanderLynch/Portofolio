(function () {
  const projectCardUtils = window.portfolioProjectCardUtils;
  const hamburgerBtn = document.querySelector('.hamburger-menu');
  const navLinkItems = document.querySelectorAll('.nav-link-item');
  const portfolioTitleLink = document.querySelector('.portfolio-title-link');
  const portfolioText = document.querySelector('.portfolio-text');
  const mobileCurrentChip = document.getElementById('mobile-current-chip');
  const mobileMenuPanel = document.getElementById('mobile-menu-panel');
  const mobileMenuSurface = mobileMenuPanel ? mobileMenuPanel.querySelector('.mobile-menu-surface') : null;
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
  const mobileThemeLabel = document.getElementById('mobile-theme-label');
  const zoomControl = document.getElementById('zoom-control');
  const zoomToggleBtn = document.getElementById('zoom-toggle-btn');
  const zoomPanel = document.getElementById('zoom-panel');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomValueBtn = document.getElementById('zoom-value-btn');
  const trackedSections = Array.from(document.querySelectorAll('[data-section-label]'));
  const projectPageLinks = document.querySelectorAll('a[href^="project/pages/"]');
  const returnScrollKey = 'portfolio-return-scroll';
  const returnScrollPendingKey = 'portfolio-return-pending';
  const zoomStorageKey = 'portfolio-page-zoom';
  var defaultZoom = 80;
  var minZoom = 60;
  var maxZoom = 120;
  var zoomStep = 10;

  function clampZoom(value) {
    return Math.min(maxZoom, Math.max(minZoom, value));
  }

  function applyZoom(value) {
    var zoomValue = clampZoom(value);
    document.body.classList.add('zoom-ready');
    document.body.style.setProperty('--page-zoom', String(zoomValue / 100));

    if (zoomValueBtn) {
      zoomValueBtn.textContent = zoomValue + '%';
    }

    localStorage.setItem(zoomStorageKey, String(zoomValue));
    return zoomValue;
  }

  var currentZoom = applyZoom(defaultZoom);

  function setZoomPanelState(isOpen) {
    if (!zoomControl || !zoomToggleBtn || !zoomPanel) {
      return;
    }

    zoomControl.classList.toggle('open', isOpen);
    zoomToggleBtn.setAttribute('aria-expanded', String(isOpen));
    zoomPanel.setAttribute('aria-hidden', String(!isOpen));
  }

  if (zoomToggleBtn) {
    zoomToggleBtn.addEventListener('click', function () {
      var shouldOpen = !zoomControl.classList.contains('open');
      setZoomPanelState(shouldOpen);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function () {
      currentZoom = applyZoom(currentZoom - zoomStep);
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function () {
      currentZoom = applyZoom(currentZoom + zoomStep);
    });
  }

  if (zoomValueBtn) {
    zoomValueBtn.addEventListener('click', function () {
      currentZoom = applyZoom(defaultZoom);
    });
  }

  function formatThemeName(theme) {
    var currentLanguage = window.portfolioLanguage && window.portfolioLanguage.getCurrentLanguage ? window.portfolioLanguage.getCurrentLanguage() : 'id';

    switch (theme) {
      case 'blue':
        return currentLanguage === 'id' ? 'BIRU' : 'BLUE';
      case 'galaxy':
        return 'GALAXY';
      default:
        return currentLanguage === 'id' ? 'TERANG' : 'LIGHT';
    }
  }

  function syncMobileThemeLabel(themeName) {
    if (!mobileThemeLabel) {
      return;
    }

    var activeTheme = window.portfolioTheme && window.portfolioTheme.normalizeTheme ? window.portfolioTheme.normalizeTheme(themeName) : 'light';
    var currentLanguage = window.portfolioLanguage && window.portfolioLanguage.getCurrentLanguage ? window.portfolioLanguage.getCurrentLanguage() : 'id';
    var labelPrefix = currentLanguage === 'id' ? 'TEMA' : 'THEME';
    mobileThemeLabel.textContent = labelPrefix + ': ' + formatThemeName(activeTheme);
  }

  document.body.classList.add('desktop-nav-topbar');

  function setMobileMenuState(isOpen) {
    if (!hamburgerBtn || !mobileMenuPanel) {
      return;
    }

    setZoomPanelState(false);
    mobileMenuPanel.classList.toggle('active', isOpen);
    mobileMenuPanel.setAttribute('aria-hidden', String(!isOpen));
    hamburgerBtn.classList.toggle('active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('mobile-menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen) {
      window.setTimeout(function () {
        if (mobileMenuCloseBtn) mobileMenuCloseBtn.focus();
      }, 50);
    }
  }

  syncMobileThemeLabel(window.portfolioTheme && window.portfolioTheme.getStoredTheme ? window.portfolioTheme.getStoredTheme() : undefined);

  if (mobileThemeToggleBtn) {
    mobileThemeToggleBtn.addEventListener('click', function () {
      var supportedThemes = window.portfolioTheme && window.portfolioTheme.supportedThemes ? window.portfolioTheme.supportedThemes : ['blue', 'light', 'galaxy'];
      var currentTheme = window.portfolioTheme && window.portfolioTheme.getStoredTheme ? window.portfolioTheme.getStoredTheme() : 'light';
      var activeIndex = supportedThemes.indexOf(currentTheme);
      var nextTheme = supportedThemes[(activeIndex + 1 + supportedThemes.length) % supportedThemes.length];

      if (window.portfolioTheme && window.portfolioTheme.applyTheme) {
        window.portfolioTheme.applyTheme(nextTheme);
      }

      syncMobileThemeLabel(nextTheme);
    });
  }

  document.addEventListener('portfolio-theme-change', function (event) {
    syncMobileThemeLabel(event.detail && event.detail.theme);
  });

  document.addEventListener('portfolio-language-change', function () {
    syncMobileThemeLabel(window.portfolioTheme && window.portfolioTheme.getStoredTheme ? window.portfolioTheme.getStoredTheme() : undefined);
    updateActiveSection();
  });

  document.addEventListener('click', function (event) {
    if (zoomControl && !zoomControl.contains(event.target)) {
      setZoomPanelState(false);
    }
  });

  if (hamburgerBtn && mobileMenuPanel) {
    hamburgerBtn.addEventListener('click', function () {
      var shouldOpen = !mobileMenuPanel.classList.contains('active');
      setMobileMenuState(shouldOpen);
    });

    if (mobileMenuCloseBtn) {
      mobileMenuCloseBtn.addEventListener('click', function () {
        setMobileMenuState(false);
      });
    }

    mobileMenuPanel.addEventListener('click', function (event) {
      if (event.target === mobileMenuPanel) {
        setMobileMenuState(false);
      }
    });

    navLinkItems.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          setMobileMenuState(false);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 768 &&
          !hamburgerBtn.contains(e.target) &&
          !(mobileMenuSurface && mobileMenuSurface.contains(e.target)) &&
          mobileMenuPanel.classList.contains('active')) {
        setMobileMenuState(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        setMobileMenuState(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mobileMenuPanel.classList.contains('active')) {
        setMobileMenuState(false);
      }
    });
  }

  var skills = window.portfolioLanguage && window.portfolioLanguage.getSkillWords ? window.portfolioLanguage.getSkillWords() : ["DESAINER MULTIMEDIA", "DESAIN GRAFIS", "DESAINER GFX", "DESAIN UI/UX"];
  var skillIndex = 0;
  var typingText = document.getElementById("typing-text");

  function typeSkill() {
    if (typingText) {
      typingText.textContent = skills[skillIndex];
      skillIndex = (skillIndex + 1) % skills.length;
    }
  }

  setInterval(typeSkill, 3000);

  document.addEventListener('portfolio-language-change', function () {
    skills = window.portfolioLanguage && window.portfolioLanguage.getSkillWords ? window.portfolioLanguage.getSkillWords() : skills;
    skillIndex = 0;
    typeSkill();
  });

  function setActiveSection(sectionId) {
    var currentSection = trackedSections.find(function (section) { return section.id === sectionId; });
    if (!currentSection) {
      return;
    }

    var currentLabel = (window.portfolioLanguage && window.portfolioLanguage.getSectionLabel ? window.portfolioLanguage.getSectionLabel(sectionId) : undefined)
      || currentSection.dataset.sectionLabel
      || currentSection.id;

    navLinkItems.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + sectionId;
      link.classList.toggle('active', isActive);
    });

    if (portfolioText) {
      portfolioText.textContent = currentLabel;
    }

    if (mobileCurrentChip) {
      mobileCurrentChip.textContent = currentLabel;
    }

    if (portfolioTitleLink) {
      portfolioTitleLink.setAttribute('href', '#' + sectionId);
      portfolioTitleLink.setAttribute('aria-label', 'Jump to ' + currentLabel);
    }
  }

  var scrollTicking = false;

  function updateActiveSection() {
    if (!trackedSections.length) {
      return;
    }

    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(function () {
      var viewportAnchor = window.innerHeight * 0.35;
      var currentSection = trackedSections[0];
      var closestDistance = Number.POSITIVE_INFINITY;

      for (var i = 0; i < trackedSections.length; i++) {
        var section = trackedSections[i];
        var rect = section.getBoundingClientRect();
        var isAnchorInsideSection = rect.top <= viewportAnchor && rect.bottom >= viewportAnchor;

        if (isAnchorInsideSection) {
          currentSection = section;
          closestDistance = -1;
          break;
        }

        if (closestDistance === -1) continue;

        var distanceToAnchor = Math.abs(rect.top - viewportAnchor);
        if (distanceToAnchor < closestDistance) {
          closestDistance = distanceToAnchor;
          currentSection = section;
        }
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        currentSection = trackedSections[trackedSections.length - 1];
      }

      setActiveSection(currentSection.id);
      scrollTicking = false;
    });
  }

  function rememberMainPageScroll() {
    sessionStorage.setItem(returnScrollKey, String(window.scrollY));
    sessionStorage.setItem(returnScrollPendingKey, 'true');
  }

  function restoreMainPageScroll() {
    if (window.location.hash) {
      sessionStorage.removeItem(returnScrollPendingKey);
      sessionStorage.removeItem(returnScrollKey);
      updateActiveSection();
      return;
    }

    if (sessionStorage.getItem(returnScrollPendingKey) !== 'true') {
      updateActiveSection();
      return;
    }

    var savedScroll = Number(sessionStorage.getItem(returnScrollKey));

    if (!Number.isFinite(savedScroll)) {
      sessionStorage.removeItem(returnScrollPendingKey);
      sessionStorage.removeItem(returnScrollKey);
      updateActiveSection();
      return;
    }

    requestAnimationFrame(function () {
      window.scrollTo({ top: savedScroll, left: 0, behavior: 'auto' });
      window.setTimeout(function () {
        window.scrollTo({ top: savedScroll, left: 0, behavior: 'auto' });
        updateActiveSection();
      }, 120);
    });

    sessionStorage.removeItem(returnScrollPendingKey);
    sessionStorage.removeItem(returnScrollKey);
  }

  projectPageLinks.forEach(function (link) {
    link.addEventListener('click', rememberMainPageScroll);
  });

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection);
  window.addEventListener('pageshow', restoreMainPageScroll);
  updateActiveSection();

  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = [];
  var hiddenProjects = [];
  var activeProjectFilter = 'all';

  function refreshProjectRegistry() {
    projectCards = Array.from(document.querySelectorAll('.project-card'));
    hiddenProjects = Array.from(document.querySelectorAll('.project-card.hidden'));
  }

  refreshProjectRegistry();
  hiddenProjects.forEach(function (card) {
    if (card.dataset.projectSource !== 'firebase') {
      card.dataset.extraProject = 'true';
    }
  });

  var expanded = false;

  function filterProjects(category) {
    refreshProjectRegistry();
    activeProjectFilter = category;

    projectCards.forEach(function (card) {
      var matchesCategory = category === 'all' || card.getAttribute('data-category') === category;
      var isExtraProject = card.dataset.extraProject === 'true';
      var shouldHideForLoadMore = category === 'all' && isExtraProject && !expanded;
      card.classList.toggle('hidden', !matchesCategory || shouldHideForLoadMore);
    });

    if (moreBtn) {
      var hasMatchingExtraProjects = hiddenProjects.some(function (card) { return category === 'all' || card.getAttribute('data-category') === category; });
      moreBtn.style.display = category === 'all' && hasMatchingExtraProjects ? 'inline-flex' : 'none';
      moreBtn.textContent = expanded ? 'Show Less Projects' : 'Load More Projects';
    }

    if (projectsContainer) {
      var visibleCards = projectCards.filter(function (card) { return !card.classList.contains('hidden'); });
      var shouldUseSingleCardLayout = visibleCards.length === 1 && !visibleCards[0].classList.contains('featured-project');
      projectsContainer.classList.toggle('single-card-view', shouldUseSingleCardLayout);
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filterValue = btn.getAttribute('data-filter');
      expanded = false;
      filterProjects(filterValue);
    });
  });

  var moreBtn = document.getElementById('more-btn');
  var projectsContainer = document.getElementById('projects-container');

  if (moreBtn && projectsContainer) {
    moreBtn.addEventListener('click', function () {
      expanded = !expanded;
      filterProjects(activeProjectFilter);
    });
  }

  window.addEventListener('load', function () {
    var filtersContainer = document.querySelector('.project-filters');
    if (filtersContainer) {
      filtersContainer.style.display = 'flex';
      filtersContainer.style.visibility = 'visible';
      filtersContainer.style.opacity = '1';
    }

    var allFilterBtns = document.querySelectorAll('.filter-btn');
    allFilterBtns.forEach(function (btn) {
      btn.style.display = 'inline-block';
    });

    filterProjects(activeProjectFilter);
    restoreMainPageScroll();
    updateActiveSection();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var filtersContainer = document.querySelector('.project-filters');
    if (filtersContainer) {
      filtersContainer.style.display = 'flex';
      filtersContainer.style.visibility = 'visible';
      filtersContainer.style.opacity = '1';
    }
  });

  var addTestimonialBtn = document.getElementById('add-testimonial-btn');
  var testimonialModal = document.getElementById('testimonial-modal');
  var closeModal = document.getElementById('close-modal');
  var testimonialForm = document.getElementById('testimonial-form');
  var testimonialsGrid = document.getElementById('testimonials-grid');
  var scrollContainer = document.getElementById('testimonials-scroll');
  var scrollLeftBtn = document.getElementById('scroll-left');
  var scrollRightBtn = document.getElementById('scroll-right');

  if (addTestimonialBtn && testimonialModal) {
    addTestimonialBtn.addEventListener('click', function () {
      testimonialModal.style.display = 'flex';
    });
  }

  if (closeModal && testimonialModal) {
    closeModal.addEventListener('click', function () {
      testimonialModal.style.display = 'none';
    });
  }

  window.addEventListener('click', function (e) {
    if (e.target === testimonialModal) {
      testimonialModal.style.display = 'none';
    }
  });

  if (testimonialForm) {
    testimonialForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('testimonial-name').value;
      var role = document.getElementById('testimonial-role').value || 'Client';
      var rating = parseInt(document.getElementById('testimonial-rating').value);
      var text = document.getElementById('testimonial-text').value;
      var newTestimonial = createTestimonial(name, role, rating, text);
      if (testimonialsGrid) testimonialsGrid.appendChild(newTestimonial);
      testimonialForm.reset();
      testimonialModal.style.display = 'none';
      newTestimonial.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function createTestimonial(name, role, rating, text) {
    var card = document.createElement('div');
    card.className = 'testimonial-card';
    var initials = name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase();
    var stars = '\u2605'.repeat(rating);
    var date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    card.innerHTML =
      '<div class="testimonial-header">' +
      '<div class="testimonial-avatar">' + initials + '</div>' +
      '<div class="testimonial-info">' +
      '<h4 class="testimonial-name">' + name + '</h4>' +
      '<p class="testimonial-role">' + role + '</p>' +
      '</div>' +
      '<div class="testimonial-rating">' + stars + '</div>' +
      '</div>' +
      '<p class="testimonial-text">"' + text + '"</p>' +
      '<div class="testimonial-date">' + date + '</div>';
    return card;
  }

  if (scrollLeftBtn && scrollContainer) {
    scrollLeftBtn.addEventListener('click', function () {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }

  if (scrollRightBtn && scrollContainer) {
    scrollRightBtn.addEventListener('click', function () {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var timelineItems = document.querySelectorAll('.timeline-item');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    timelineItems.forEach(function (item) {
      observer.observe(item);
    });
  });

  var addProjectBtn = document.getElementById('add-project-btn');
  var projectModal = document.getElementById('project-modal');
  var closeProjectModal = document.getElementById('close-project-modal');
  var projectForm = document.getElementById('project-form');
  var techStackContainer = document.getElementById('tech-stack-container');
  var techInput = document.getElementById('tech-input');
  var addTechBtn = document.getElementById('add-tech-btn');
  var techStack = [];

  if (addProjectBtn && projectModal) {
    addProjectBtn.addEventListener('click', function () {
      projectModal.style.display = 'flex';
    });
  }

  if (closeProjectModal && projectModal) {
    closeProjectModal.addEventListener('click', function () {
      projectModal.style.display = 'none';
      resetProjectForm();
    });
  }

  window.addEventListener('click', function (e) {
    if (e.target === projectModal) {
      projectModal.style.display = 'none';
      resetProjectForm();
    }
  });

  if (addTechBtn && techInput) {
    addTechBtn.addEventListener('click', function () {
      var tech = techInput.value.trim();
      if (tech && techStack.indexOf(tech) === -1) {
        techStack.push(tech);
        renderTechStack();
        techInput.value = '';
      }
    });

    techInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (addTechBtn) addTechBtn.click();
      }
    });
  }

  function renderTechStack() {
    if (techStackContainer) {
      techStackContainer.innerHTML = '';
      techStack.forEach(function (tech, index) {
        var techTag = document.createElement('div');
        techTag.className = 'tech-tag-input';
        var techLabel = document.createElement('span');
        techLabel.textContent = tech;
        var removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-tech';
        removeButton.setAttribute('aria-label', 'Remove ' + tech);
        removeButton.innerHTML = '&times;';
        removeButton.addEventListener('click', function () { removeTech(index); });
        techTag.appendChild(techLabel);
        techTag.appendChild(removeButton);
        techStackContainer.appendChild(techTag);
      });
    }
  }

  function removeTech(index) {
    techStack.splice(index, 1);
    renderTechStack();
  }

  function resetProjectForm() {
    if (projectForm) {
      projectForm.reset();
      techStack = [];
      renderTechStack();
    }
  }

  if (projectForm) {
    projectForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (projectForm.dataset.mode === 'firebase') return;

      var title = document.getElementById('project-title').value;
      var category = document.getElementById('project-category').value;
      var status = document.getElementById('project-status').value;
      var description = document.getElementById('project-description').value;
      var imageUrl = document.getElementById('project-image').value || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop';
      var projectLink = document.getElementById('project-link').value || '#';
      var dateLabel = document.getElementById('project-date-label').value || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      var projectType = document.getElementById('project-type').value;

      var newProject = createProjectCard({
        category: category,
        dateLabel: dateLabel,
        description: description,
        imageUrl: imageUrl,
        projectLink: projectLink,
        projectType: projectType,
        status: status,
        techStack: techStack,
        title: title
      });

      var projectsContainerEl = document.getElementById('projects-container');
      if (projectsContainerEl) {
        projectsContainerEl.appendChild(newProject);
      }

      projectModal.style.display = 'none';
      resetProjectForm();
      newProject.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showSuccessMessage('Project added successfully!');
    });
  }

  function createProjectCard(project) {
    return projectCardUtils.createProjectCard(project);
  }

  function closeProjectModalPanel() {
    if (projectModal) {
      projectModal.style.display = 'none';
    }
  }

  function showSuccessMessage(message) {
    var successDiv = document.createElement('div');
    successDiv.style.cssText =
      'position:fixed;top:20px;right:20px;background:linear-gradient(45deg,#22c55e,#16a34a);color:white;padding:1rem 2rem;border-radius:0.5rem;box-shadow:0 4px 15px rgba(34,197,94,0.3);z-index:3000;font-weight:600;animation:slideIn 0.3s ease-out;';
    successDiv.textContent = message;

    if (!document.querySelector('#success-animation-style')) {
      var style = document.createElement('style');
      style.id = 'success-animation-style';
      style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
      document.head.appendChild(style);
    }

    document.body.appendChild(successDiv);
    setTimeout(function () { successDiv.remove(); }, 3000);
  }

  function scrollToAnchorTarget(target) {
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    var scrollMargin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    var corrected = false;
    var alignIfNeeded = function () {
      if (corrected) return;
      corrected = true;
      var rect = target.getBoundingClientRect();
      if (Math.abs(rect.top - scrollMargin) > 36) {
        window.scrollTo({
          top: Math.max(0, window.scrollY + rect.top - scrollMargin),
          left: 0,
          behavior: 'smooth'
        });
      }
    };

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', alignIfNeeded, { once: true });
    }
    setTimeout(alignIfNeeded, 750);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      scrollToAnchorTarget(target);
    });
  });

  window.portfolioProjectHelpers = {
    closeProjectModal: closeProjectModalPanel,
    filterProjects: filterProjects,
    getActiveProjectFilter: function () { return activeProjectFilter; },
    refreshProjectRegistry: refreshProjectRegistry,
    resetProjectForm: resetProjectForm,
    showSuccessMessage: showSuccessMessage
  };
})();
