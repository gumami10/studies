import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const XML_DIR = resolve('knowledge/xml')
const DATA_DIR = resolve('data')

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

export function convertFile(filepath) {
  const root = parseXml(readFileSync(filepath, 'utf-8'))
  const syllabus = root.children.find((c) => c.type === 'element' && c.tag === 'syllabus')
  if (!syllabus) throw new Error(`No <syllabus> root found in ${filepath}`)

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

  return { chapters, toc, footerText }
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^.*[\\/]/, ''))

if (isMain) {
  mkdirSync(DATA_DIR, { recursive: true })

  const chaptersData = convertFile(resolve(XML_DIR, 'ctal-at.xml'))
  writeFileSync(
    resolve(DATA_DIR, 'ctal-at.js'),
    `export default ${JSON.stringify(chaptersData, null, 2)}\n`,
  )

  const metricsData = convertFile(resolve(XML_DIR, 'quality-metrics.xml'))
  writeFileSync(
    resolve(DATA_DIR, 'quality-metrics.js'),
    `export default ${JSON.stringify(metricsData, null, 2)}\n`,
  )

  const taeData = convertFile(resolve(XML_DIR, 'ctal-tae.xml'))
  writeFileSync(
    resolve(DATA_DIR, 'ctal-tae.js'),
    `export default ${JSON.stringify(taeData, null, 2)}\n`,
  )

  const codeReviewData = convertFile(resolve(XML_DIR, 'code-review.xml'))
  writeFileSync(
    resolve(DATA_DIR, 'code-review.js'),
    `export default ${JSON.stringify(codeReviewData, null, 2)}\n`,
  )

  const taData = convertFile(resolve(XML_DIR, 'ctal-ta-chapters-1-5.xml'))
  writeFileSync(
    resolve(DATA_DIR, 'ctal-ta.js'),
    `export default ${JSON.stringify(taData, null, 2)}\n`,
  )

  const agileTestingData = convertFile(resolve(XML_DIR, 'agile-testing.xml'))
  writeFileSync(
    resolve(DATA_DIR, 'agile-testing.js'),
    `export default ${JSON.stringify(agileTestingData, null, 2)}\n`,
  )

  const moreAgileTestingData = convertFile(resolve(XML_DIR, 'more-agile-testing.xml'))
  writeFileSync(
    resolve(DATA_DIR, 'more-agile-testing.js'),
    `export default ${JSON.stringify(moreAgileTestingData, null, 2)}\n`,
  )

  console.log('Conversion complete!')
  console.log(
    `  data/ctal-at.js (${chaptersData.chapters.length} chapters, ${chaptersData.toc.length} toc items)`,
  )
  console.log(
    `  data/quality-metrics.js (${metricsData.chapters.length} chapters, ${metricsData.toc.length} toc items)`,
  )
  console.log(
    `  data/ctal-tae.js (${taeData.chapters.length} chapters, ${taeData.toc.length} toc items)`,
  )
  console.log(
    `  data/code-review.js (${codeReviewData.chapters.length} chapters, ${codeReviewData.toc.length} toc items)`,
  )
  console.log(
    `  data/ctal-ta.js (${taData.chapters.length} chapters, ${taData.toc.length} toc items)`,
  )
  console.log(
    `  data/agile-testing.js (${agileTestingData.chapters.length} chapters, ${agileTestingData.toc.length} toc items)`,
  )
  console.log(
    `  data/more-agile-testing.js (${moreAgileTestingData.chapters.length} chapters, ${moreAgileTestingData.toc.length} toc items)`,
  )
}
