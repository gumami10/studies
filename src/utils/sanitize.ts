const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'link',
  'meta',
  'base',
]
const DANGEROUS_ATTRS = /^on/i

const VOID_TAGS = new Set(['embed', 'input', 'link', 'meta', 'base'])

export function sanitizeHtml(html: string): string {
  // Pre-strip dangerous tags (and their contents) to avoid parser side-effects
  // (e.g. happy-dom iframe navigation during tests).
  let cleaned = html
  DANGEROUS_TAGS.forEach((tag) => {
    if (VOID_TAGS.has(tag)) {
      cleaned = cleaned.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '')
    } else {
      cleaned = cleaned.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'gi'), '')
    }
  })

  const parser = new DOMParser()
  const doc = parser.parseFromString(cleaned, 'text/html')
  const all = doc.body.querySelectorAll('*')
  all.forEach((el) => {
    if (DANGEROUS_TAGS.includes(el.tagName.toLowerCase())) {
      el.remove()
      return
    }
    Array.from(el.attributes).forEach((attr) => {
      if (DANGEROUS_ATTRS.test(attr.name)) {
        el.removeAttribute(attr.name)
      }
    })
  })
  return doc.body.innerHTML
}
