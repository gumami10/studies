import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { resolve } from 'path'

const XML_DIR = resolve('knowledge/xml')
const DATA_DIR = resolve('data')

const MANIFEST_FIELDS = [
  'id',
  'path',
  'name',
  'navLabel',
  'title',
  'subtitle',
  'tocTitle',
  'homeDescription',
  'homeOrder',
  'highlightKey',
  'footerAttribution',
  'category',
]

const MANIFEST_TAG_TO_KEY = {
  id: 'id',
  path: 'path',
  name: 'name',
  'nav-label': 'navLabel',
  title: 'title',
  subtitle: 'subtitle',
  'toc-title': 'tocTitle',
  'home-description': 'homeDescription',
  'home-order': 'homeOrder',
  'highlight-key': 'highlightKey',
  'footer-attribution': 'footerAttribution',
  category: 'category',
}

const FOOTER_ATTRIBUTIONS = new Set(['istqb', 'crispin-gregory', 'none'])
const CATEGORIES = new Set(['personal', 'qa'])

export function parseXml(xml) {
  const tagRegex = /<(\/?)(\w[\w-]*)((?:\s+[^>]*?)?)\s*(\/?)>/g
  const attrRegex = /([\w-]+)="([^"]*)"/g
  const tokens = []
  let lastIndex = 0
  let match

  while ((match = tagRegex.exec(xml)) !== null) {
    if (match.index > lastIndex) {
      const text = xml.slice(lastIndex, match.index)
      tokens.push({ type: 'text', value: text })
    }
    const isClosing = match[1] === '/'
    const isSelfClosing = match[4] === '/'
    const tagName = match[2]
    const attrs = {}
    if (match[3]) {
      let attrMatch
      while ((attrMatch = attrRegex.exec(match[3])) !== null) {
        attrs[attrMatch[1]] = attrMatch[2]
      }
    }
    if (isSelfClosing) {
      tokens.push({ type: 'element', tag: tagName, attrs, children: [], selfClosing: true })
    } else if (isClosing) {
      tokens.push({ type: 'close', tag: tagName })
    } else {
      tokens.push({ type: 'element', tag: tagName, attrs, children: [], selfClosing: false })
    }
    lastIndex = tagRegex.lastIndex
  }

  if (lastIndex < xml.length) {
    const text = xml.slice(lastIndex)
    tokens.push({ type: 'text', value: text })
  }

  const root = { type: 'element', tag: 'root', attrs: {}, children: [] }
  const stack = [root]

  for (const token of tokens) {
    if (token.type === 'text') {
      const current = stack[stack.length - 1]
      if (current) current.children.push(token)
    } else if (token.type === 'element') {
      const el = { type: 'element', tag: token.tag, attrs: token.attrs, children: [] }
      const current = stack[stack.length - 1]
      if (current) current.children.push(el)
      if (!token.selfClosing) stack.push(el)
    } else if (token.type === 'close') {
      const top = stack[stack.length - 1]
      if (top && top.tag === token.tag) stack.pop()
    }
  }

  return root
}

export function getTextContent(node) {
  return node.children
    .map((ch) => (ch.type === 'text' ? ch.value : getTextContent(ch)))
    .join('')
    .trim()
}

export function renderInlineHtml(children) {
  const parts = children.map((ch) => {
    if (ch.type === 'text') return ch.value
    const tag = ch.tag
    if (['strong', 'em', 'b', 'i', 'code', 'br', 'span'].includes(tag)) {
      return `<${tag}>${renderInlineHtml(ch.children)}</${tag}>`
    }
    return getTextContent(ch)
  })

  const html = parts.join('')
  return html
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const INLINE_TAGS = ['strong', 'em', 'b', 'i', 'code', 'span', 'br']

export function transformNode(node) {
  if (node.type === 'text') {
    return node.value
  }

  const tag = node.tag
  const attrs = node.attrs || {}

  if (INLINE_TAGS.includes(tag)) {
    return `<${tag}>${node.children.map(transformNode).join('')}</${tag}>`
  }

  if (tag === 'badge') return { text: getTextContent(node) }
  if (tag === 'title') return { type: 'title', text: getTextContent(node) }
  if (tag === 'paragraph') return { type: 'paragraph', html: renderInlineHtml(node.children) }
  if (tag === 'heading') return { type: 'heading', text: renderInlineHtml(node.children) }
  if (tag === 'h2') return { type: 'h2', text: renderInlineHtml(node.children) }
  if (tag === 'h3') return { type: 'h3', text: renderInlineHtml(node.children) }
  if (tag === 'h4') return { type: 'h4', text: renderInlineHtml(node.children) }
  if (tag === 'meta')
    return {
      type: 'meta',
      badges: node.children
        .filter((c) => c.type === 'element' && c.tag === 'badge')
        .map(transformNode)
        .filter(Boolean),
    }

  if (tag === 'section') {
    const content = node.children
      .filter((c) => c.type === 'element')
      .map(transformNode)
      .filter(Boolean)
    return { type: 'section', id: attrs.id || '', content }
  }

  if (tag === 'list') {
    const items = node.children
      .filter((c) => c.type === 'element' && c.tag === 'item')
      .map((c) => {
        const html = renderInlineHtml(c.children)
        const span = c.attrs?.span
        return span ? { html, span } : { html }
      })
    return { type: 'list', listType: attrs.type || 'ul', items }
  }

  if (tag === 'table') {
    const rows = node.children
      .filter((c) => c.type === 'element' && c.tag === 'row')
      .map((row) => ({
        cells: row.children
          .filter((c) => c.type === 'element' && c.tag === 'cell')
          .map((cell) => {
            const html = renderInlineHtml(cell.children)
            const span = cell.attrs?.span
            return span ? { html, span } : { html }
          }),
      }))
    return { type: 'table', rows }
  }

  if (tag === 'key-box') {
    const parts = node.children
      .filter((c) => c.type === 'element')
      .map(transformNode)
      .filter(Boolean)
    const heading = parts.find((p) => p.type === 'heading')
    return {
      type: 'key-box',
      heading: heading?.text,
      content: heading ? parts.filter((p) => p !== heading) : parts,
    }
  }

  if (tag === 'compare') {
    const cards = node.children
      .filter((c) => c.type === 'element' && c.tag === 'card')
      .map((card) => ({
        cardType: card.attrs.type || '',
        content: card.children
          .filter((ch) => ch.type === 'element')
          .map(transformNode)
          .filter(Boolean),
      }))
    return { type: 'compare', cards }
  }

  if (tag === 'glossary') {
    const terms = node.children
      .filter((c) => c.type === 'element' && c.tag === 'term')
      .map((c) => ({ text: getTextContent(c) }))
    const definitions = node.children
      .filter((c) => c.type === 'element' && c.tag === 'definition')
      .map((c) => ({ text: getTextContent(c) }))
    return { type: 'glossary', terms, definitions }
  }

  if (tag === 'footer-text')
    return { type: 'footer-text', text: node.children.map(transformNode).join('').trim() }

  return null
}

export function extractManifest(root) {
  const syllabus = root.children.find((c) => c.type === 'element' && c.tag === 'syllabus')
  if (!syllabus) throw new Error('No <syllabus> root found')

  const manifestEl = syllabus.children.find((c) => c.type === 'element' && c.tag === 'manifest')
  if (!manifestEl) {
    throw new Error('Missing <manifest> element. Every knowledge XML must declare one.')
  }

  const result = {}
  const present = new Set()
  for (const child of manifestEl.children) {
    if (child.type !== 'element') continue
    const key = MANIFEST_TAG_TO_KEY[child.tag]
    if (!key) {
      throw new Error(`Unknown <${child.tag}> inside <manifest>`)
    }
    if (present.has(key)) {
      throw new Error(`Duplicate <${child.tag}> inside <manifest>`)
    }
    const text = getTextContent(child)
    if (text === '') {
      throw new Error(`Empty <${child.tag}> inside <manifest>`)
    }
    result[key] = key === 'homeOrder' ? Number(text) : text
    present.add(key)
  }

  for (const field of MANIFEST_FIELDS) {
    if (!present.has(field)) {
      throw new Error(`Missing required <${manifestFieldToTag(field)}> in <manifest>`)
    }
  }

  if (!FOOTER_ATTRIBUTIONS.has(result.footerAttribution)) {
    throw new Error(
      `<footer-attribution> must be one of ${[...FOOTER_ATTRIBUTIONS].join(', ')}, got '${result.footerAttribution}'`,
    )
  }

  if (!CATEGORIES.has(result.category)) {
    throw new Error(
      `<category> must be one of ${[...CATEGORIES].join(', ')}, got '${result.category}'`,
    )
  }

  if (!Number.isFinite(result.homeOrder)) {
    throw new Error(`<home-order> must be a number, got '${result.homeOrder}'`)
  }

  return result
}

function manifestFieldToTag(field) {
  const entry = Object.entries(MANIFEST_TAG_TO_KEY).find(([, k]) => k === field)
  return entry ? entry[0] : field
}

export function convertFile(filepath) {
  const xml = readFileSync(filepath, 'utf-8')
  const root = parseXml(xml)
  const manifest = extractManifest(root)

  const syllabus = root.children.find((c) => c.type === 'element' && c.tag === 'syllabus')
  const chaptersEl = syllabus.children.find((c) => c.type === 'element' && c.tag === 'chapters')
  const tocEl = syllabus.children.find((c) => c.type === 'element' && c.tag === 'toc')
  const footerEl = syllabus.children.find((c) => c.type === 'element' && c.tag === 'footer-text')

  const chapters = chaptersEl
    ? chaptersEl.children
        .filter((c) => c.type === 'element' && c.tag === 'chapter')
        .map((ch) => {
          const id = ch.attrs.id || ''
          const children = ch.children.filter((c) => c.type === 'element')
          const meta = children.find((c) => c.tag === 'meta')
          const titleEl = children.find((c) => c.tag === 'title')
          const contentBlocks = children
            .filter((c) => c.tag !== 'meta' && c.tag !== 'title')
            .map(transformNode)
            .filter(Boolean)

          return {
            id,
            meta: meta ? transformNode(meta) : { type: 'meta', badges: [] },
            title: titleEl ? getTextContent(titleEl) : '',
            content: contentBlocks,
          }
        })
    : []

  const toc = tocEl
    ? tocEl.children
        .filter((c) => c.type === 'element' && c.tag === 'item')
        .map((item) => ({
          id: item.attrs.id || '',
          label: getTextContent(item),
          status: item.attrs.status || 'active',
        }))
    : []

  const footerText = footerEl ? getTextContent(footerEl) : ''

  return { chapters, toc, footerText, manifest }
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^.*[\\/]/, ''))

if (isMain) {
  mkdirSync(DATA_DIR, { recursive: true })

  const xmlFiles = readdirSync(XML_DIR).filter((f) => f.endsWith('.xml'))
  const catalog = {}

  for (const xml of xmlFiles) {
    const name = xml.replace(/\.xml$/, '')
    const data = convertFile(resolve(XML_DIR, xml))
    writeFileSync(
      resolve(DATA_DIR, `${name}.js`),
      `export default ${JSON.stringify({ chapters: data.chapters, toc: data.toc, footerText: data.footerText }, null, 2)}\n`,
    )
    catalog[data.manifest.id] = data.manifest
    console.log(
      `  data/${name}.js (${data.chapters.length} chapters, ${data.toc.length} toc items)`,
    )
  }

  writeFileSync(
    resolve(DATA_DIR, 'manifest.js'),
    `export default ${JSON.stringify(catalog, null, 2)}\n`,
  )
  writeFileSync(
    resolve(DATA_DIR, 'manifest.d.ts'),
    `import type { KnowledgeCatalog } from '../src/types'\ndeclare const _default: KnowledgeCatalog\nexport default _default\n`,
  )
  console.log(`  data/manifest.js (${Object.keys(catalog).length} knowledge modules)`)
  console.log('Conversion complete!')
}
