(function() {
  'use strict';

  var defaultKey = 'ctal-at-highlights-ch1';

  function storageAvailable() {
    try {
      var storage = window.localStorage;
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getStorageKey() {
    return document.body.dataset.highlightKey || defaultKey;
  }

  function storageGet() {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
    } catch (e) {
      console.error('[Highlight] Failed to read localStorage:', e);
      return [];
    }
  }

  function storageSet(items) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
    } catch (e) {
      console.error('[Highlight] Failed to write localStorage:', e);
      alert('Could not save highlight. localStorage may be disabled in your browser (e.g. file:// protocol or private mode).');
    }
  }

  function getHighlightId() {
    return 'hl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
  }

  function getBlockParent(node) {
    var blocks = ['P','LI','TD','TH','H2','H3','H4','DT','DD'];
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el) {
      if (blocks.indexOf(el.tagName) !== -1) return el;
      if (el.id === 'content-area') return null;
      el = el.parentElement;
    }
    return null;
  }

  function getElementPath(el) {
    var parts = [];
    var contentArea = document.getElementById('content-area');
    var current = el;
    while (current && current !== contentArea) {
      if (current.id) {
        parts.unshift('#' + current.id);
        break;
      }
      var parent = current.parentElement;
      if (!parent) break;
      var tag = current.tagName.toLowerCase();
      var sameTag = Array.from(parent.children).filter(function(c) { return c.tagName.toLowerCase() === tag; });
      var index = sameTag.indexOf(current);
      parts.unshift(tag + ':' + index);
      current = parent;
    }
    return parts;
  }

  function findElementByPath(path) {
    var contentArea = document.getElementById('content-area');
    var el = contentArea;
    for (var i = 0; i < path.length; i++) {
      if (!el) return null;
      var part = path[i];
      if (part.charAt(0) === '#') {
        el = document.getElementById(part.substring(1));
      } else {
        var pieces = part.split(':');
        var tag = pieces[0];
        var idx = parseInt(pieces[1], 10);
        var children = Array.from(el.children).filter(function(c) { return c.tagName.toLowerCase() === tag; });
        el = children[idx];
      }
    }
    return el;
  }

  function normalizeToText(container, offset) {
    if (container.nodeType === Node.TEXT_NODE) {
      return { node: container, offset: offset };
    }
    var child = container.childNodes[offset];
    if (!child) {
      var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
      var lastText = null, n;
      while (n = walker.nextNode()) lastText = n;
      if (lastText) return { node: lastText, offset: lastText.length };
      return { node: container, offset: container.childNodes.length };
    }
    if (child.nodeType === Node.TEXT_NODE) {
      return { node: child, offset: 0 };
    }
    var walker2 = document.createTreeWalker(child, NodeFilter.SHOW_TEXT, null, false);
    var firstText = walker2.nextNode();
    if (firstText) return { node: firstText, offset: 0 };
    var next = child.nextSibling;
    while (next) {
      if (next.nodeType === Node.TEXT_NODE) return { node: next, offset: 0 };
      var w = document.createTreeWalker(next, NodeFilter.SHOW_TEXT, null, false);
      var t = w.nextNode();
      if (t) return { node: t, offset: 0 };
      next = next.nextSibling;
    }
    return { node: container, offset: offset };
  }

  function getTextOffset(el, node, offset) {
    var normalized = normalizeToText(node, offset);
    node = normalized.node;
    offset = normalized.offset;
    if (node.nodeType !== Node.TEXT_NODE) return 0;

    var count = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while (n = walker.nextNode()) {
      if (n === node) return count + offset;
      count += n.length;
    }
    return count;
  }

  function getNodeAndOffset(el, offset, skipInsideMarks) {
    var count = 0;
    var lastText = null;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while (n = walker.nextNode()) {
      if (skipInsideMarks && n.parentElement && n.parentElement.closest('mark[data-highlight-id]')) continue;
      lastText = n;
      if (count + n.length >= offset) {
        return { node: n, offset: offset - count };
      }
      count += n.length;
    }
    if (lastText) {
      return { node: lastText, offset: lastText.length };
    }
    return { node: el, offset: el.childNodes.length };
  }

  function saveHighlight(data) {
    var items = storageGet();
    items.push(data);
    storageSet(items);
    console.log('[Highlight] Saved', data.id, 'Total:', items.length);
  }

  function deleteHighlight(id) {
    var items = storageGet().filter(function(h) { return h.id !== id; });
    storageSet(items);
    console.log('[Highlight] Deleted', id, 'Remaining:', items.length);
  }

  var toolbar = null;

  function createToolbar() {
    if (toolbar) return;
    toolbar = document.createElement('div');
    toolbar.id = 'highlight-toolbar';
    toolbar.innerHTML =
      '<button class="hl-btn" data-color="yellow" style="background:#ffe066" title="Yellow"></button>' +
      '<button class="hl-btn" data-color="green"  style="background:#90ee90" title="Green"></button>' +
      '<button class="hl-btn" data-color="blue"   style="background:#87ceeb" title="Blue"></button>' +
      '<button class="hl-btn" data-color="pink"   style="background:#ffb6c1" title="Pink"></button>' +
      '<button class="hl-btn-remove" title="Remove highlight">X</button>';
    document.body.appendChild(toolbar);

    toolbar.addEventListener('click', function(e) {
      var btn = e.target.closest('.hl-btn');
      var removeBtn = e.target.closest('.hl-btn-remove');
      if (btn) {
        applyHighlight(btn.dataset.color);
        hideToolbar();
      } else if (removeBtn) {
        removeFromSelection();
        hideToolbar();
      }
    });
  }

  function showToolbar(rect) {
    if (!toolbar) createToolbar();
    toolbar.style.display = 'flex';
    requestAnimationFrame(function() {
      var top = rect.top - toolbar.offsetHeight - 8;
      var left = rect.left + rect.width / 2 - toolbar.offsetWidth / 2;
      if (top < 8) top = rect.bottom + 8;
      if (left < 8) left = 8;
      toolbar.style.top = top + 'px';
      toolbar.style.left = left + 'px';
    });
  }

  function hideToolbar() {
    if (toolbar) toolbar.style.display = 'none';
  }

  function applyHighlight(color) {
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    var text = sel.toString();
    if (!text.trim()) return;

    var startBlock = getBlockParent(range.startContainer);
    var endBlock = getBlockParent(range.endContainer);
    if (!startBlock || !endBlock) return;

    var data = {
      id: getHighlightId(),
      color: color,
      text: text,
      startPath: getElementPath(startBlock),
      startOffset: getTextOffset(startBlock, range.startContainer, range.startOffset),
      endPath: getElementPath(endBlock),
      endOffset: getTextOffset(endBlock, range.endContainer, range.endOffset)
    };

    var mark = document.createElement('mark');
    mark.className = 'hl-' + data.color;
    mark.dataset.highlightId = data.id;

    try {
      range.surroundContents(mark);
    } catch (e) {
      var frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
    }

    saveHighlight(data);
    sel.removeAllRanges();
  }

  function removeFromSelection() {
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var node = sel.getRangeAt(0).commonAncestorContainer;
    var mark = node.nodeType === 3 ? node.parentElement.closest('mark[data-highlight-id]') : node.closest('mark[data-highlight-id]');
    if (mark) removeHighlight(mark);
  }

  function removeHighlight(mark) {
    var id = mark.dataset.highlightId;
    if (id) deleteHighlight(id);
    var parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
    parent.normalize();
  }

  function restoreHighlights() {
    var items = storageGet();
    if (!items.length) {
      console.log('[Highlight] No saved highlights to restore');
      return;
    }

    console.log('[Highlight] Restoring', items.length, 'highlights');

    items.sort(function(a, b) {
      var pathCmp = a.startPath.join('/').localeCompare(b.startPath.join('/'));
      if (pathCmp !== 0) return pathCmp;
      return b.startOffset - a.startOffset;
    });

    var restored = 0;
    items.forEach(function(item) {
      try {
        var startEl = findElementByPath(item.startPath);
        var endEl = findElementByPath(item.endPath);
        if (!startEl || !endEl) {
          console.warn('[Highlight] Could not find element for', item.id);
          return;
        }

        var start = getNodeAndOffset(startEl, item.startOffset, true);
        var end = getNodeAndOffset(endEl, item.endOffset, true);

        var range = document.createRange();
        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);

        var mark = document.createElement('mark');
        mark.className = 'hl-' + item.color;
        mark.dataset.highlightId = item.id;

        try {
          range.surroundContents(mark);
        } catch (e) {
          var frag = range.extractContents();
          mark.appendChild(frag);
          range.insertNode(mark);
        }
        restored++;
      } catch (e) {
        console.warn('[Highlight] Failed to restore', item.id, e);
      }
    });
    console.log('[Highlight] Restored', restored, 'of', items.length);
  }

  document.addEventListener('mouseup', function(e) {
    if (toolbar && toolbar.contains(e.target)) return;
    var sel = window.getSelection();
    var text = sel.toString().trim();
    var contentArea = document.getElementById('content-area');
    if (text.length > 0 && contentArea) {
      var range = sel.getRangeAt(0);
      if (!contentArea.contains(range.commonAncestorContainer)) {
        hideToolbar();
        return;
      }
      var rect = range.getBoundingClientRect();
      showToolbar(rect);
    } else {
      hideToolbar();
    }
  });

  document.addEventListener('click', function(e) {
    var mark = e.target.closest('mark[data-highlight-id]');
    if (mark) {
      removeHighlight(mark);
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'h' && e.key !== 'H') return;
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;

    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var text = sel.toString().trim();
    if (!text) return;

    var range = sel.getRangeAt(0);
    var contentArea = document.getElementById('content-area');
    if (!contentArea || !contentArea.contains(range.commonAncestorContainer)) return;

    e.preventDefault();

    var container = range.commonAncestorContainer;
    var existingMark = container.nodeType === 3
      ? container.parentElement.closest('mark[data-highlight-id]')
      : container.closest('mark[data-highlight-id]');

    if (existingMark) {
      removeHighlight(existingMark);
    } else {
      applyHighlight('yellow');
    }
    hideToolbar();
  });

  window.HighlightTool = {
    init: function() {
      if (!storageAvailable()) {
        console.warn('[Highlight] localStorage is not available. Highlights will not persist after refresh.');
      }
      createToolbar();
      restoreHighlights();
    }
  };
})();