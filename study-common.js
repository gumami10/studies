(function() {
  'use strict';

  var CHAPTERS = [
    { title: 'Chapters 1–6: Syllabus', file: 'CTAL-AT-Chapter1.html' },
    { title: 'Quality Metrics', file: 'quality-metrics.html' }
  ];

  var STORAGE_KEY = 'ctal_at_starred';

  var DANGEROUS_TAGS = ['script','iframe','object','embed','applet','form','input','button','select','textarea','link','meta','base'];
  var DANGEROUS_ATTRS = /^on/i;

  function getStarred() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveStarred(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function sanitizeHtml(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var all = doc.body.querySelectorAll('*');
    all.forEach(function(el) {
      if (DANGEROUS_TAGS.indexOf(el.tagName.toLowerCase()) !== -1) {
        el.remove();
        return;
      }
      var attrs = Array.from(el.attributes);
      attrs.forEach(function(attr) {
        if (DANGEROUS_ATTRS.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML;
  }

  function extractTitle(section) {
    var h = section.querySelector('h2, h3, h4');
    return h ? h.textContent.trim() : (section.id || 'Untitled');
  }

  function createStarButton(isStarred) {
    var btn = document.createElement('button');
    btn.className = 'star-btn' + (isStarred ? ' starred' : '');
    btn.innerHTML = isStarred ? '&#9733;' : '&#9734;';
    btn.title = isStarred ? 'Unstar this section' : 'Star this section';
    btn.setAttribute('aria-label', btn.title);
    btn.type = 'button';
    return btn;
  }

  function initStarButtons() {
    var starred = getStarred();
    var sections = document.querySelectorAll('section[id]');

    sections.forEach(function(section) {
      if (section.querySelector('.star-btn')) return;

      var id = section.id;
      var title = extractTitle(section);
      var isStarred = !!starred[id];
      var btn = createStarButton(isStarred);

      btn.addEventListener('click', function() {
        var current = getStarred();
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
          var clone = section.cloneNode(true);
          var existingBtn = clone.querySelector('.star-btn');
          if (existingBtn) existingBtn.remove();
          current[id] = {
            id: id,
            title: title,
            source: location.pathname.split('/').pop() || 'index.html',
            html: sanitizeHtml(clone.outerHTML)
          };
          btn.classList.add('starred');
          btn.innerHTML = '&#9733;';
          btn.title = 'Unstar this section';
          btn.setAttribute('aria-label', 'Unstar this section');
        }
        saveStarred(current);
      });

      var heading = section.querySelector('h2, h3, h4');
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
    var container = document.querySelector('.container');
    var header = document.querySelector('header');
    if (!container) return;

    var nav = document.createElement('nav');
    nav.id = 'study-nav';
    nav.className = 'top-nav';

    var currentPage = location.pathname.split('/').pop() || 'index.html';
    var isStarredPage = currentPage === 'starred.html';
    var isIndexPage = currentPage === 'index.html' || currentPage === '';

    var links = [];

    if (!isIndexPage) {
      links.push({ href: 'index.html', label: 'Home' });
    }
    if (!isStarredPage) {
      links.push({ href: 'starred.html', label: 'Starred Sections' });
    }

    CHAPTERS.forEach(function(ch) {
      if (ch.file !== currentPage) {
        links.push({ href: ch.file, label: ch.title });
      }
    });

    links.forEach(function(link, i) {
      if (i > 0) nav.appendChild(document.createTextNode(' · '));
      var a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.label;
      nav.appendChild(a);
    });

    if (header) {
      header.appendChild(nav);
    } else {
      container.insertBefore(nav, container.firstChild);
    }
  }

  function initToTop() {
    if (document.getElementById('to-top-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'to-top-btn';
    btn.className = 'to-top-btn';
    btn.innerHTML = '&#8593;';
    btn.title = 'Back to top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.type = 'button';
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          if (window.scrollY > 400) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  window.StarStudy = {
    getStarred: getStarred,
    saveStarred: saveStarred,
    sanitizeHtml: sanitizeHtml,
    initStarButtons: initStarButtons,
    initNav: initNav,
    initToTop: initToTop,
    CHAPTERS: CHAPTERS
  };

  if (!document.body.dataset.noAutoInit) {
    document.addEventListener('DOMContentLoaded', function() {
      initNav();
      initStarButtons();
      initToTop();
    });
    if (document.readyState !== 'loading') {
      initNav();
      initStarButtons();
      initToTop();
    }
  } else {
    initToTop();
  }
})();