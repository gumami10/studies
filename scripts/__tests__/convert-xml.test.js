import { describe, it, expect } from 'vitest'
import {
  parseXml,
  getTextContent,
  renderInlineHtml,
  transformNode,
  convertFile,
  extractManifest,
} from '../../scripts/convert-xml.mjs'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const validManifest = `
  <manifest>
    <id>test</id>
    <path>/test</path>
    <name>test</name>
    <nav-label>Test</nav-label>
    <title>Test Title</title>
    <subtitle>Test subtitle</subtitle>
    <toc-title>Test TOC</toc-title>
    <home-description>Test blurb</home-description>
    <home-order>1</home-order>
    <highlight-key>test-highlights</highlight-key>
    <footer-attribution>none</footer-attribution>
  </manifest>`

describe('parseXml', () => {
  it('parses simple XML', () => {
    const tree = parseXml('<child>text</child>')
    expect(tree.tag).toBe('root')
    expect(tree.children).toHaveLength(1)
    expect(tree.children[0].tag).toBe('child')
    expect(tree.children[0].children).toHaveLength(1)
    expect(tree.children[0].children[0].value).toBe('text')
  })

  it('parses self-closing tags', () => {
    const tree = parseXml('<br/><hr/>')
    expect(tree.children).toHaveLength(2)
    expect(tree.children[0].tag).toBe('br')
    expect(tree.children[1].tag).toBe('hr')
  })

  it('parses attributes', () => {
    const tree = parseXml('<section id="sec-1" class="main"></section>')
    const section = tree.children[0]
    expect(section.attrs.id).toBe('sec-1')
    expect(section.attrs.class).toBe('main')
  })

  it('handles nested structures', () => {
    const tree = parseXml('<div><p>Outer</p><div><p>Inner</p></div></div>')
    const outer = tree.children[0]
    expect(outer.tag).toBe('div')
    expect(outer.children.filter((c) => c.type === 'element')[0].tag).toBe('p')
    const innerDiv = outer.children.filter((c) => c.type === 'element')[1]
    expect(innerDiv.tag).toBe('div')
    expect(innerDiv.children.filter((c) => c.type === 'element')[0].tag).toBe('p')
  })

  it('handles empty input', () => {
    const tree = parseXml('')
    expect(tree.tag).toBe('root')
    expect(tree.children).toHaveLength(0)
  })

  it('parses text-only input', () => {
    const tree = parseXml('plain text')
    expect(tree.children).toHaveLength(1)
    expect(tree.children[0].type).toBe('text')
    expect(tree.children[0].value).toBe('plain text')
  })
})

describe('getTextContent', () => {
  it('extracts text from node', () => {
    const tree = parseXml('<title>Chapter One</title>')
    const title = tree.children[0]
    expect(getTextContent(title)).toBe('Chapter One')
  })

  it('extracts text from nested inline tags', () => {
    const tree = parseXml('<title>Chapter <strong>One</strong></title>')
    const title = tree.children[0]
    expect(getTextContent(title)).toBe('Chapter One')
  })

  it('returns empty string for no text', () => {
    const tree = parseXml('<empty></empty>')
    expect(getTextContent(tree.children[0])).toBe('')
  })
})

describe('renderInlineHtml', () => {
  it('renders plain text', () => {
    const tree = parseXml('<p>Hello World</p>')
    const p = tree.children[0]
    const result = renderInlineHtml(p.children)
    expect(result).toBe('Hello World')
  })

  it('renders inline tags as HTML', () => {
    const tree = parseXml('<p>Hello <strong>bold</strong> world</p>')
    const p = tree.children[0]
    const result = renderInlineHtml(p.children)
    expect(result).toContain('<strong>bold</strong>')
  })

  it('strips unknown inline tags but keeps text', () => {
    const tree = parseXml('<p>Text <unknown>inner</unknown> more</p>')
    const p = tree.children[0]
    const result = renderInlineHtml(p.children)
    expect(result).toContain('inner')
    expect(result).not.toContain('<unknown>')
  })

  it('collapses whitespace', () => {
    const tree = parseXml('<p>  Hello    World  </p>')
    const p = tree.children[0]
    const result = renderInlineHtml(p.children)
    expect(result).toBe('Hello World')
  })

  it('preserves span tags', () => {
    const tree = parseXml('<p>Before <span class="x">inside</span> after</p>')
    const p = tree.children[0]
    const result = renderInlineHtml(p.children)
    expect(result).toContain('<span>inside</span>')
  })
})

describe('transformNode', () => {
  function parseFirst(xml) {
    const tree = parseXml(xml)
    return tree.children[0]
  }

  it('transforms paragraph', () => {
    const result = transformNode(parseFirst('<paragraph>Example text</paragraph>'))
    expect(result.type).toBe('paragraph')
    expect(result.html).toBe('Example text')
  })

  it('transforms heading nodes', () => {
    const result = transformNode(parseFirst('<h2>Main Title</h2>'))
    expect(result.type).toBe('h2')
    expect(result.text).toBe('Main Title')
  })

  it('transforms section', () => {
    const result = transformNode(
      parseFirst('<section id="s1"><h2>Title</h2><paragraph>Body</paragraph></section>'),
    )
    expect(result.type).toBe('section')
    expect(result.id).toBe('s1')
    expect(result.content).toHaveLength(2)
    expect(result.content[0].type).toBe('h2')
    expect(result.content[1].type).toBe('paragraph')
  })

  it('transforms list', () => {
    const result = transformNode(
      parseFirst('<list type="ol"><item>First</item><item>Second</item></list>'),
    )
    expect(result.type).toBe('list')
    expect(result.listType).toBe('ol')
    expect(result.items).toHaveLength(2)
    expect(result.items[0].html).toBe('First')
  })

  it('transforms list with span attribute', () => {
    const result = transformNode(parseFirst('<list><item span="2">Spanned item</item></list>'))
    expect(result.items[0].span).toBe('2')
  })

  it('transforms table', () => {
    const result = transformNode(
      parseFirst('<table><row><cell>Cell 1</cell><cell>Cell 2</cell></row></table>'),
    )
    expect(result.type).toBe('table')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].cells).toHaveLength(2)
    expect(result.rows[0].cells[0].html).toBe('Cell 1')
  })

  it('transforms key-box', () => {
    const result = transformNode(
      parseFirst('<key-box><heading>Key Point</heading><paragraph>Details</paragraph></key-box>'),
    )
    expect(result.type).toBe('key-box')
    expect(result.heading).toBe('Key Point')
    expect(result.content).toHaveLength(1)
  })

  it('transforms compare cards', () => {
    const result = transformNode(
      parseFirst(
        '<compare><card type="pos"><paragraph>Good</paragraph></card><card type="neg"><paragraph>Bad</paragraph></card></compare>',
      ),
    )
    expect(result.type).toBe('compare')
    expect(result.cards).toHaveLength(2)
    expect(result.cards[0].cardType).toBe('pos')
    expect(result.cards[1].cardType).toBe('neg')
  })

  it('transforms glossary', () => {
    const result = transformNode(
      parseFirst(
        '<glossary><term>TDD</term><definition>Test-Driven Development</definition></glossary>',
      ),
    )
    expect(result.type).toBe('glossary')
    expect(result.terms).toHaveLength(1)
    expect(result.definitions).toHaveLength(1)
  })

  it('transforms meta/badge', () => {
    const result = transformNode(parseFirst('<meta><badge>K1</badge><badge>K2</badge></meta>'))
    expect(result.type).toBe('meta')
    expect(result.badges).toHaveLength(2)
    expect(result.badges[0].text).toBe('K1')
  })

  it('returns null for unknown tags', () => {
    const result = transformNode(parseFirst('<unknown>content</unknown>'))
    expect(result).toBeNull()
  })

  it('returns text for text nodes', () => {
    const tree = parseXml('plain text')
    const textNode = tree.children[0]
    expect(transformNode(textNode)).toBe('plain text')
  })
})

describe('extractManifest', () => {
  function withManifest(extra = '') {
    return parseXml(`<syllabus>${validManifest}${extra}</syllabus>`)
  }

  it('extracts a valid manifest', () => {
    const m = extractManifest(withManifest())
    expect(m).toEqual({
      id: 'test',
      path: '/test',
      name: 'test',
      navLabel: 'Test',
      title: 'Test Title',
      subtitle: 'Test subtitle',
      tocTitle: 'Test TOC',
      homeDescription: 'Test blurb',
      homeOrder: 1,
      highlightKey: 'test-highlights',
      footerAttribution: 'none',
    })
  })

  it('parses home-order as a number', () => {
    const m = extractManifest(withManifest())
    expect(m.homeOrder).toBe(1)
    expect(typeof m.homeOrder).toBe('number')
  })

  it('throws when <syllabus> is missing', () => {
    const root = parseXml('<not-syllabus></not-syllabus>')
    expect(() => extractManifest(root)).toThrow('No <syllabus> root found')
  })

  it('throws when <manifest> is missing', () => {
    const root = parseXml('<syllabus><chapters></chapters></syllabus>')
    expect(() => extractManifest(root)).toThrow('Missing <manifest> element')
  })

  it('throws on a missing required field', () => {
    const root = parseXml(`
      <syllabus>
        <manifest>
          <id>x</id>
          <path>/x</path>
          <name>x</name>
          <nav-label>X</nav-label>
          <title>X</title>
          <subtitle>X</subtitle>
          <toc-title>X</toc-title>
          <home-description>X</home-description>
          <highlight-key>x-highlights</highlight-key>
          <footer-attribution>none</footer-attribution>
        </manifest>
      </syllabus>
    `)
    expect(() => extractManifest(root)).toThrow('Missing required <home-order>')
  })

  it('throws on an empty field', () => {
    const root = parseXml(`
      <syllabus>
        <manifest>
          <id></id>
          <path>/x</path>
          <name>x</name>
          <nav-label>X</nav-label>
          <title>X</title>
          <subtitle>X</subtitle>
          <toc-title>X</toc-title>
          <home-description>X</home-description>
          <home-order>1</home-order>
          <highlight-key>x-highlights</highlight-key>
          <footer-attribution>none</footer-attribution>
        </manifest>
      </syllabus>
    `)
    expect(() => extractManifest(root)).toThrow('Empty <id>')
  })

  it('throws on an unknown footer-attribution', () => {
    const root = parseXml(`
      <syllabus>
        <manifest>
          <id>x</id><path>/x</path><name>x</name><nav-label>X</nav-label>
          <title>X</title><subtitle>X</subtitle><toc-title>X</toc-title>
          <home-description>X</home-description><home-order>1</home-order>
          <highlight-key>x-highlights</highlight-key>
          <footer-attribution>banana</footer-attribution>
        </manifest>
      </syllabus>
    `)
    expect(() => extractManifest(root)).toThrow('<footer-attribution> must be one of')
  })

  it('throws on a non-numeric home-order', () => {
    const root = parseXml(`
      <syllabus>
        <manifest>
          <id>x</id><path>/x</path><name>x</name><nav-label>X</nav-label>
          <title>X</title><subtitle>X</subtitle><toc-title>X</toc-title>
          <home-description>X</home-description><home-order>abc</home-order>
          <highlight-key>x-highlights</highlight-key>
          <footer-attribution>none</footer-attribution>
        </manifest>
      </syllabus>
    `)
    expect(() => extractManifest(root)).toThrow('<home-order> must be a number')
  })

  it('throws on a duplicate field', () => {
    const root = parseXml(`
      <syllabus>
        <manifest>
          <id>x</id><id>y</id>
          <path>/x</path><name>x</name><nav-label>X</nav-label>
          <title>X</title><subtitle>X</subtitle><toc-title>X</toc-title>
          <home-description>X</home-description><home-order>1</home-order>
          <highlight-key>x-highlights</highlight-key>
          <footer-attribution>none</footer-attribution>
        </manifest>
      </syllabus>
    `)
    expect(() => extractManifest(root)).toThrow('Duplicate <id>')
  })

  it('throws on an unknown manifest child tag', () => {
    const root = parseXml(`
      <syllabus>
        <manifest>
          <id>x</id><path>/x</path><name>x</name><nav-label>X</nav-label>
          <title>X</title><subtitle>X</subtitle><toc-title>X</toc-title>
          <home-description>X</home-description><home-order>1</home-order>
          <highlight-key>x-highlights</highlight-key>
          <footer-attribution>none</footer-attribution>
          <bogus>oops</bogus>
        </manifest>
      </syllabus>
    `)
    expect(() => extractManifest(root)).toThrow('Unknown <bogus>')
  })
})

describe('convertFile', () => {
  it('converts a full syllabus XML with manifest', () => {
    const tmpFile = resolve(__dirname, '__test_syllabus.xml')
    const xml = `<syllabus>
${validManifest}
      <chapters>
        <chapter id="ch1">
          <meta><badge>K1</badge></meta>
          <title>Chapter One</title>
          <section id="sec-1">
            <h2>Section Title</h2>
            <paragraph>Body text here</paragraph>
          </section>
        </chapter>
      </chapters>
      <toc>
        <item id="sec-1" status="active">Section Title</item>
      </toc>
      <footer-text>Footer content</footer-text>
    </syllabus>`
    writeFileSync(tmpFile, xml)

    const result = convertFile(tmpFile)

    expect(result.chapters).toHaveLength(1)
    expect(result.chapters[0].id).toBe('ch1')
    expect(result.chapters[0].title).toBe('Chapter One')
    expect(result.chapters[0].meta.badges).toHaveLength(1)
    expect(result.chapters[0].content).toHaveLength(1)

    expect(result.toc).toHaveLength(1)
    expect(result.toc[0].id).toBe('sec-1')
    expect(result.toc[0].status).toBe('active')

    expect(result.footerText).toBe('Footer content')

    expect(result.manifest.id).toBe('test')
    expect(result.manifest.path).toBe('/test')
    expect(result.manifest.homeOrder).toBe(1)
  })

  it('handles missing toc and footer', () => {
    const tmpFile = resolve(__dirname, '__test_minimal.xml')
    const xml = `<syllabus>${validManifest}<chapters></chapters></syllabus>`
    writeFileSync(tmpFile, xml)
    const result = convertFile(tmpFile)
    expect(result.chapters).toHaveLength(0)
    expect(result.toc).toHaveLength(0)
    expect(result.footerText).toBe('')
    expect(result.manifest.id).toBe('test')
  })

  it('throws on missing syllabus root', () => {
    const tmpFile = resolve(__dirname, '__test_bad.xml')
    writeFileSync(tmpFile, '<not-syllabus></not-syllabus>')
    expect(() => convertFile(tmpFile)).toThrow('No <syllabus> root found')
  })

  it('parses chapter with implicit empty meta', () => {
    const tmpFile = resolve(__dirname, '__test_nometa.xml')
    const xml = `<syllabus>${validManifest}<chapters><chapter id="ch"><title>No Meta</title></chapter></chapters></syllabus>`
    writeFileSync(tmpFile, xml)
    const result = convertFile(tmpFile)
    expect(result.chapters[0].meta).toEqual({ type: 'meta', badges: [] })
  })
})
