const CONTENT_TARGET_SELECTOR = 'article.chapter, section.content-section'
const HEADING_TAGS = new Set(['H2', 'H3', 'H4'])

function findHeadingTarget(el: HTMLElement): HTMLElement | undefined {
  for (const child of Array.from(el.children)) {
    if (child instanceof HTMLElement && HEADING_TAGS.has(child.tagName)) return child
  }

  return el.querySelector<HTMLElement>('h2, h3, h4') ?? undefined
}

export function getScrollTarget(el: HTMLElement): HTMLElement {
  if (!el.matches(CONTENT_TARGET_SELECTOR)) return el
  return findHeadingTarget(el) ?? el
}

export function centerScrollTopForElement(el: HTMLElement): number {
  const target = getScrollTarget(el)
  const rect = target.getBoundingClientRect()
  const targetHeight = rect.height || target.offsetHeight

  return Math.max(0, rect.top + window.scrollY - window.innerHeight / 2 + targetHeight / 2)
}

export function scrollToTopForElement(el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  const offset = 24
  return Math.max(0, rect.top + window.scrollY - offset)
}
