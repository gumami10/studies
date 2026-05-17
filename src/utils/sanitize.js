const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'button', 'select', 'textarea', 'link', 'meta', 'base']
const DANGEROUS_ATTRS = /^on/i

export function sanitizeHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const all = doc.body.querySelectorAll('*')
  all.forEach(el => {
    if (DANGEROUS_TAGS.includes(el.tagName.toLowerCase())) {
      el.remove()
      return
    }
    Array.from(el.attributes).forEach(attr => {
      if (DANGEROUS_ATTRS.test(attr.name)) {
        el.removeAttribute(attr.name)
      }
    })
  })
  return doc.body.innerHTML
}
