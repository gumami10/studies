import { ref, onMounted, onUnmounted } from 'vue'
import { useHighlightsStore } from '@/stores/highlights'

interface TextNodeResult {
  node: Node
  offset: number
}

export function useHighlightToolbar() {
  const show = ref(false)
  const position = ref({ top: 0, left: 0 })
  const currentRange = ref<Range | null>(null)
  const currentText = ref('')
  const existingMark = ref<HTMLElement | null>(null)

  function getBlockParent(node: Node): HTMLElement | null {
    const blocks = ['P', 'LI', 'TD', 'TH', 'H2', 'H3', 'H4', 'DT', 'DD']
    let el: HTMLElement | null = node.nodeType === 3 ? node.parentElement : (node as HTMLElement)
    while (el) {
      if (blocks.includes(el.tagName)) return el
      if (el.id === 'content-area') return null
      el = el.parentElement
    }
    return null
  }

  function getElementPath(el: HTMLElement): string[] {
    const parts: string[] = []
    const contentArea = document.getElementById('content-area')
    let current: HTMLElement | null = el
    while (current && current !== contentArea) {
      if (current.id) {
        parts.unshift('#' + current.id)
        break
      }
      const parent: HTMLElement | null = current.parentElement
      if (!parent) break
      const tag = current.tagName.toLowerCase()
      const sameTag = Array.from(parent.children).filter(
        (c: Element) => c.tagName.toLowerCase() === tag,
      )
      const index = sameTag.indexOf(current)
      parts.unshift(`${tag}:${index}`)
      current = parent
    }
    return parts
  }

  function getTextOffset(el: HTMLElement, node: Node, offset: number): number {
    if (node.nodeType !== Node.TEXT_NODE) return 0
    let count = 0
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let n: Node | null
    while ((n = walker.nextNode())) {
      if (n === node) return count + offset
      count += n.textContent?.length ?? 0
    }
    return count
  }

  function findElementByPath(path: string[]): HTMLElement | null {
    const contentArea = document.getElementById('content-area')
    let el: HTMLElement | null = contentArea
    for (const part of path) {
      if (!el) return null
      if (part.startsWith('#')) {
        el = document.getElementById(part.substring(1))
      } else {
        const [tag, idx] = part.split(':')
        const children = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === tag)
        el = (children[parseInt(idx, 10)] as HTMLElement | undefined) ?? null
      }
    }
    return el
  }

  function _normalizeToText(container: Node, offset: number): TextNodeResult {
    if (container.nodeType === Node.TEXT_NODE) return { node: container, offset }
    const child = container.childNodes[offset]
    if (!child) {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
      let lastText: Node | null = null,
        n: Node | null
      while ((n = walker.nextNode())) lastText = n
      return lastText
        ? { node: lastText, offset: lastText.textContent?.length ?? 0 }
        : { node: container, offset: container.childNodes.length }
    }
    if (child.nodeType === Node.TEXT_NODE) return { node: child, offset: 0 }
    const walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT)
    const firstText = walker.nextNode()
    if (firstText) return { node: firstText, offset: 0 }
    let next: Node | null = child.nextSibling
    while (next) {
      if (next.nodeType === Node.TEXT_NODE) return { node: next, offset: 0 }
      const w = document.createTreeWalker(next, NodeFilter.SHOW_TEXT)
      const t = w.nextNode()
      if (t) return { node: t, offset: 0 }
      next = next.nextSibling
    }
    return { node: container, offset }
  }

  function getNodeAndOffset(el: HTMLElement, offset: number, skipMarks = false): TextNodeResult {
    let count = 0
    let lastText: Text | null = null
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let n: Node | null
    while ((n = walker.nextNode())) {
      if (skipMarks && (n as Text).parentElement?.closest('mark[data-highlight-id]')) continue
      lastText = n as Text
      if (count + (n.textContent?.length ?? 0) >= offset) return { node: n, offset: offset - count }
      count += n.textContent?.length ?? 0
    }
    return lastText
      ? { node: lastText, offset: lastText.length }
      : { node: el, offset: el.childNodes.length }
  }

  function makeHighlightId(): string {
    return `hl-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  function checkSelection() {
    const sel = window.getSelection()
    const text = (sel?.toString() || '').trim()
    const contentArea = document.getElementById('content-area')

    if (!text || !contentArea || !sel?.rangeCount) {
      show.value = false
      return
    }

    const range = sel.getRangeAt(0)
    if (!contentArea.contains(range.commonAncestorContainer)) {
      show.value = false
      return
    }

    currentRange.value = range
    currentText.value = text

    existingMark.value =
      range.commonAncestorContainer.nodeType === 3
        ? ((range.commonAncestorContainer.parentElement?.closest(
            'mark[data-highlight-id]',
          ) as HTMLElement | null) ?? null)
        : (((range.commonAncestorContainer as Element).closest(
            'mark[data-highlight-id]',
          ) as HTMLElement | null) ?? null)

    const rect = range.getBoundingClientRect()
    position.value = {
      top: rect.top - 40,
      left: rect.left + rect.width / 2,
    }
    show.value = true
  }

  function applyHighlight(color: string) {
    const store = useHighlightsStore()
    const range = currentRange.value
    if (!range || !currentText.value) return

    const startBlock = getBlockParent(range.startContainer)
    const endBlock = getBlockParent(range.endContainer)
    if (!startBlock || !endBlock) return

    const data = {
      id: makeHighlightId(),
      color,
      text: currentText.value,
      startPath: getElementPath(startBlock),
      startOffset: getTextOffset(startBlock, range.startContainer, range.startOffset),
      endPath: getElementPath(endBlock),
      endOffset: getTextOffset(endBlock, range.endContainer, range.endOffset),
    }

    const mark = document.createElement('mark')
    mark.className = `hl-${color}`
    mark.dataset.highlightId = data.id

    try {
      range.surroundContents(mark)
    } catch {
      const frag = range.extractContents()
      mark.appendChild(frag)
      range.insertNode(mark)
    }

    store.add(data)
    window.getSelection()?.removeAllRanges()
  }

  function removeFromSelection() {
    const store = useHighlightsStore()
    const mark = existingMark.value
    if (!mark) return
    store.remove(mark.dataset.highlightId!)
    const parent = mark.parentNode!
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
    parent.removeChild(mark)
    parent.normalize()
  }

  function removeMark(mark: HTMLElement) {
    const store = useHighlightsStore()
    const id = mark.dataset.highlightId
    if (id) store.remove(id)
    const parent = mark.parentNode!
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
    parent.removeChild(mark)
    parent.normalize()
  }

  function restoreHighlights() {
    const store = useHighlightsStore()
    const allItems = store.items
    if (!allItems.length) return

    const sorted = [...allItems].sort((a, b) => {
      const pathCmp = a.startPath.join('/').localeCompare(b.startPath.join('/'))
      return pathCmp !== 0 ? pathCmp : b.startOffset - a.startOffset
    })

    let _restored = 0
    sorted.forEach((item) => {
      try {
        const startEl = findElementByPath(item.startPath)
        const endEl = findElementByPath(item.endPath)
        if (!startEl || !endEl) return

        const start = getNodeAndOffset(startEl, item.startOffset, true)
        const end = getNodeAndOffset(endEl, item.endOffset, true)

        const range = document.createRange()
        range.setStart(start.node, start.offset)
        range.setEnd(end.node, end.offset)

        const mark = document.createElement('mark')
        mark.className = `hl-${item.color}`
        mark.dataset.highlightId = item.id

        try {
          range.surroundContents(mark)
        } catch {
          const frag = range.extractContents()
          mark.appendChild(frag)
          range.insertNode(mark)
        }
        _restored++
      } catch {
        // skip corrupted highlights silently
      }
    })
  }

  function onMouseUp(_e: MouseEvent) {
    setTimeout(() => checkSelection(), 0)
  }

  function onClick(e: MouseEvent) {
    const mark = (e.target as Element).closest('mark[data-highlight-id]') as HTMLElement | null
    if (mark) {
      removeMark(mark)
      show.value = false
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'h' && e.key !== 'H') return
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return

    const sel = window.getSelection()
    if (!sel?.rangeCount) return
    const text = sel.toString().trim()
    if (!text) return

    const range = sel.getRangeAt(0)
    const contentArea = document.getElementById('content-area')
    if (!contentArea || !contentArea.contains(range.commonAncestorContainer)) return

    e.preventDefault()

    const container = range.commonAncestorContainer
    const mark =
      container.nodeType === 3
        ? ((container.parentElement?.closest('mark[data-highlight-id]') as HTMLElement | null) ??
          null)
        : (((container as Element).closest('mark[data-highlight-id]') as HTMLElement | null) ??
          null)

    if (mark) {
      removeMark(mark)
    } else {
      currentRange.value = range
      currentText.value = text
      applyHighlight('yellow')
    }
    show.value = false
  }

  onMounted(() => {
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('click', onClick)
    document.removeEventListener('keydown', onKeyDown)
  })

  return {
    show,
    position,
    applyHighlight,
    removeFromSelection,
    restoreHighlights,
    checkSelection,
  }
}
