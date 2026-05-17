(function() {
  'use strict';

  function getXmlUrl() {
    var el = document.getElementById('content-area') || document.body;
    return el.dataset.xml || '';
  }

  async function loadContent() {
    var xmlUrl = getXmlUrl();
    if (!xmlUrl) {
      console.error('[Loader] No data-xml attribute found');
      return;
    }

    var container = document.getElementById('content-area');
    try {
      var response = await fetch(xmlUrl);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var text = await response.text();
      var parser = new DOMParser();
      var xml = parser.parseFromString(text, 'application/xml');
      var parserError = xml.querySelector('parsererror');
      if (parserError) throw new Error('XML parse error');

      render(xml);
      if (window.StarStudy && window.StarStudy.initStarButtons) {
        window.StarStudy.initStarButtons();
      }
      if (window.HighlightTool && window.HighlightTool.init) {
        window.HighlightTool.init();
      }
    } catch (err) {
      container.innerHTML = '<p class="error">Failed to load content: ' + err.message + '</p>';
      console.error(err);
    }
  }

  function render(xml) {
    var chaptersRoot = xml.querySelector('chapters');
    var tocRoot = xml.querySelector('toc');
    var footerText = xml.querySelector('footer-text') ? xml.querySelector('footer-text').textContent : '';

    var tocOl = document.getElementById('toc-list');
    if (tocOl) {
      tocOl.innerHTML = '';
      if (tocRoot) {
        tocRoot.querySelectorAll('item').forEach(function(item) {
          var li = document.createElement('li');
          li.className = item.getAttribute('status') || '';
          var id = item.getAttribute('id');
          if (id && li.className === 'active') {
            var a = document.createElement('a');
            a.href = '#' + id;
            a.textContent = item.textContent;
            li.appendChild(a);
          } else {
            li.textContent = item.textContent;
          }
          tocOl.appendChild(li);
        });
      }
    }

    var contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '';
    if (chaptersRoot) {
      chaptersRoot.querySelectorAll('chapter').forEach(function(ch) {
        var article = document.createElement('article');
        article.id = ch.getAttribute('id') || '';

        ch.childNodes.forEach(function(node) {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          var el = renderNode(node);
          if (el) article.appendChild(el);
        });

        contentArea.appendChild(article);
      });
    }

    var pageFooter = document.getElementById('page-footer');
    if (pageFooter) pageFooter.textContent = footerText;
  }

  function renderNode(node) {
    var tag = node.tagName;

    if (tag === 'meta') {
      var div = document.createElement('div');
      div.className = 'meta';
      node.querySelectorAll('badge').forEach(function(b) {
        var span = document.createElement('span');
        span.className = 'badge';
        span.textContent = b.textContent;
        div.appendChild(span);
      });
      return div;
    }

    if (tag === 'title') {
      var h2 = document.createElement('h2');
      h2.textContent = node.textContent;
      return h2;
    }

    if (tag === 'section') {
      var section = document.createElement('section');
      section.id = node.getAttribute('id') || '';
      node.childNodes.forEach(function(child) {
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        var el = renderNode(child);
        if (el) section.appendChild(el);
      });
      return section;
    }

    if (tag === 'paragraph') {
      var p = document.createElement('p');
      p.innerHTML = innerHtmlFromNode(node);
      return p;
    }

    if (tag === 'h3') {
      var h3 = document.createElement('h3');
      h3.textContent = node.textContent;
      return h3;
    }

    if (tag === 'h4') {
      var h4 = document.createElement('h4');
      h4.textContent = node.textContent;
      return h4;
    }

    if (tag === 'h2') {
      var h2b = document.createElement('h2');
      h2b.textContent = node.textContent;
      return h2b;
    }

    if (tag === 'heading') {
      var h4h = document.createElement('h4');
      h4h.textContent = node.textContent;
      return h4h;
    }

    if (tag === 'list') {
      var type = node.getAttribute('type') || 'ul';
      var list = document.createElement(type === 'ol' ? 'ol' : 'ul');
      if (type === 'check') list.className = 'check';
      node.querySelectorAll(':scope > item').forEach(function(item) {
        var li = document.createElement('li');
        li.innerHTML = innerHtmlFromNode(item);
        if (item.getAttribute('span')) {
          li.setAttribute('colspan', item.getAttribute('span'));
        }
        list.appendChild(li);
      });
      return list;
    }

    if (tag === 'table') {
      var table = document.createElement('table');
      node.querySelectorAll(':scope > row').forEach(function(row, idx) {
        var tr = document.createElement('tr');
        row.querySelectorAll(':scope > cell').forEach(function(cell) {
          var cellEl = document.createElement(idx === 0 ? 'th' : 'td');
          var span = cell.getAttribute('span');
          if (span) cellEl.setAttribute('colspan', span);
          cellEl.innerHTML = innerHtmlFromNode(cell);
          tr.appendChild(cellEl);
        });
        table.appendChild(tr);
      });
      return table;
    }

    if (tag === 'key-box') {
      var kdiv = document.createElement('div');
      kdiv.className = 'key-box';
      node.childNodes.forEach(function(child) {
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        var el = renderNode(child);
        if (el) kdiv.appendChild(el);
      });
      var kp = kdiv.querySelector('p');
      if (kp) kp.style.margin = '0';
      return kdiv;
    }

    if (tag === 'compare') {
      var cdiv = document.createElement('div');
      cdiv.className = 'compare';
      node.querySelectorAll(':scope > card').forEach(function(card) {
        var cardDiv = document.createElement('div');
        cardDiv.className = 'compare-card ' + (card.getAttribute('type') || '');
        card.childNodes.forEach(function(child) {
          if (child.nodeType !== Node.ELEMENT_NODE) return;
          var el = renderNode(child);
          if (el) cardDiv.appendChild(el);
        });
        cdiv.appendChild(cardDiv);
      });
      return cdiv;
    }

    if (tag === 'glossary') {
      var dl = document.createElement('dl');
      dl.className = 'glossary';
      var terms = node.querySelectorAll(':scope > term');
      var defs = node.querySelectorAll(':scope > definition');
      terms.forEach(function(term, i) {
        var dt = document.createElement('dt');
        dt.textContent = term.textContent;
        dl.appendChild(dt);
        if (defs[i]) {
          var dd = document.createElement('dd');
          dd.textContent = defs[i].textContent;
          dl.appendChild(dd);
        }
      });
      return dl;
    }

    if (['div','span','strong','em','p','ul','ol','li','dl','dt','dd'].indexOf(tag) !== -1) {
      var el = document.createElement(tag);
      el.innerHTML = innerHtmlFromNode(node);
      return el;
    }

    var fallback = document.createElement('div');
    node.childNodes.forEach(function(child) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        var cel = renderNode(child);
        if (cel) fallback.appendChild(cel);
      } else if (child.nodeType === Node.TEXT_NODE) {
        fallback.appendChild(document.createTextNode(child.textContent));
      }
    });
    return fallback;
  }

  function innerHtmlFromNode(node) {
    var wrapper = document.createElement('div');
    node.childNodes.forEach(function(child) {
      if (child.nodeType === Node.TEXT_NODE) {
        wrapper.appendChild(document.createTextNode(child.textContent));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        var tag = child.tagName.toLowerCase();
        if (['strong','em','b','i','code','a','span','br'].indexOf(tag) !== -1) {
          var clone = child.cloneNode(true);
          wrapper.appendChild(clone);
        } else {
          var converted = renderNode(child);
          if (converted) wrapper.appendChild(converted);
        }
      }
    });
    return wrapper.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();