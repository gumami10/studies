(function() {
  'use strict';
  const STORAGE_KEY = 'ctal_at_starred';

  function getStarred() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveStarred(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function extractTitle(section) {
    const h = section.querySelector('h2, h3, h4');
    return h ? h.textContent.trim() : (section.id || 'Untitled');
  }

  function createStarButton(isStarred) {
    const btn = document.createElement('button');
    btn.className = 'star-btn' + (isStarred ? ' starred' : '');
    btn.innerHTML = isStarred ? '&#9733;' : '&#9734;';
    btn.title = isStarred ? 'Unstar this section' : 'Star this section';
    btn.setAttribute('aria-label', btn.title);
    btn.type = 'button';
    return btn;
  }

  function initStarButtons() {
    const starred = getStarred();
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(function(section) {
      if (section.querySelector('.star-btn')) return;

      const id = section.id;
      const title = extractTitle(section);
      const isStarred = !!starred[id];
      const btn = createStarButton(isStarred);

      btn.addEventListener('click', function() {
        const current = getStarred();
        if (current[id]) {
          delete current[id];
          btn.classList.remove('starred');
          btn.innerHTML = '&#9734;';
          btn.title = 'Star this section';
          btn.setAttribute('aria-label', 'Star this section');
          if (location.pathname.includes('starred')) {
            section.style.transition = 'opacity .35s ease, transform .35s ease';
            section.style.opacity = '0';
            section.style.transform = 'scale(.98)';
            setTimeout(function() { section.remove(); }, 350);
          }
        } else {
          const clone = section.cloneNode(true);
          const existingBtn = clone.querySelector('.star-btn');
          if (existingBtn) existingBtn.remove();
          current[id] = {
            id: id,
            title: title,
            source: location.pathname.split('/').pop() || 'index.html',
            html: clone.outerHTML
          };
          btn.classList.add('starred');
          btn.innerHTML = '&#9733;';
          btn.title = 'Unstar this section';
          btn.setAttribute('aria-label', 'Unstar this section');
        }
        saveStarred(current);
      });

      const heading = section.querySelector('h2, h3, h4');
      if (heading) {
        heading.style.overflow = 'hidden';
        heading.appendChild(btn);
      } else {
        section.insertBefore(btn, section.firstChild);
      }
    });
  }

  function initNav() {
    if (document.getElementById('study-nav')) return;
    const container = document.querySelector('.container');
    const header = document.querySelector('header');
    if (!container) return;

    const nav = document.createElement('div');
    nav.id = 'study-nav';
    nav.className = 'top-nav';

    const isStarredPage = location.pathname.includes('starred');
    if (isStarredPage) {
      nav.innerHTML = '<a href="CTAL-AT-Chapter1.html">Back to Study Guide</a>';
    } else {
      nav.innerHTML = '<a href="starred.html">View Starred Sections</a>';
    }

    if (header) {
      header.appendChild(nav);
    } else {
      container.insertBefore(nav, container.firstChild);
    }
  }

  window.StarStudy = {
    getStarred: getStarred,
    saveStarred: saveStarred,
    initStarButtons: initStarButtons,
    initNav: initNav
  };

  if (!document.body.dataset.noAutoInit) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initNav();
        initStarButtons();
      });
    } else {
      initNav();
      initStarButtons();
    }
  }
})();
