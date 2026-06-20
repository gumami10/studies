import { describe, expect, it } from 'vitest'
import Fuse from 'fuse.js'
import {
  buildRecords,
  searchIndex,
  blockText,
  stripHtml,
  type IndexRecord,
} from '@/composables/useSearchIndex'
import type { ChapterData, ChapterWithManifest, KnowledgeManifest } from '@/types'

function manifest(over: Partial<KnowledgeManifest> = {}): KnowledgeManifest {
  return {
    id: 'k1',
    path: '/k1',
    name: 'Test Knowledge',
    navLabel: 'Test',
    title: 'Test Knowledge',
    subtitle: 'A test module',
    tocTitle: 'Contents',
    homeDescription: 'A test',
    homeOrder: 1,
    highlightKey: 'k1',
    footerAttribution: 'none',
    category: 'qa',
    ...over,
  }
}

function chapterData(): ChapterData {
  return {
    chapters: [
      {
        id: 'ch-risk',
        meta: { type: 'meta', badges: [{ text: 'Foundation' }] },
        title: 'Risk-Based Testing',
        content: [
          {
            type: 'section',
            id: 'sec-intro',
            content: [
              { type: 'h2', text: 'Introduction' },
              {
                type: 'paragraph',
                html: 'Risk based testing prioritises test cases by <strong>likelihood</strong> of failure.',
              },
            ],
          },
          {
            type: 'section',
            id: 'sec-probability',
            content: [
              { type: 'h2', text: 'Probability Matrix' },
              {
                type: 'paragraph',
                html: 'Compute the probability of each risk before scheduling tests.',
              },
              {
                type: 'list',
                listType: 'ul',
                items: [{ html: 'Identify risks' }, { html: 'Assess impact' }],
              },
            ],
          },
        ],
      },
      {
        id: 'ch-design',
        meta: { type: 'meta', badges: [{ text: 'Techniques' }] },
        title: 'Test Design Techniques',
        content: [
          {
            type: 'section',
            id: 'sec-dt',
            content: [
              { type: 'h3', text: 'Decision Tables' },
              {
                type: 'paragraph',
                html: 'Decision tables capture complex business rules in a compact form.',
              },
            ],
          },
        ],
      },
    ],
    toc: [],
    footerText: '',
  }
}

function secondEntry(): ChapterWithManifest {
  return {
    manifest: manifest({ id: 'k2', path: '/k2', title: 'Agile', navLabel: 'Agile' }),
    data: {
      chapters: [
        {
          id: 'ch-standup',
          meta: { type: 'meta', badges: [] },
          title: 'Daily Standup',
          content: [
            {
              type: 'section',
              id: 'sec-format',
              content: [
                { type: 'h2', text: 'Meeting Format' },
                { type: 'paragraph', html: 'Standups are short daily meetings.' },
              ],
            },
          ],
        },
      ],
      toc: [],
      footerText: '',
    },
  }
}

function fixture(): ChapterWithManifest[] {
  return [{ manifest: manifest(), data: chapterData() }, secondEntry()]
}

function buildIndex(records: IndexRecord[]): Fuse<IndexRecord> {
  return new Fuse(records, {
    includeMatches: true,
    includeScore: true,
    threshold: 0.4,
    minMatchCharLength: 2,
    ignoreLocation: true,
    keys: [
      { name: 'chapterTitle', weight: 1.0 },
      { name: 'sectionTitle', weight: 0.7 },
      { name: 'body', weight: 0.4 },
    ],
  })
}

describe('stripHtml', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripHtml('  <strong>hello</strong>  <em>world</em>  ')).toBe('hello world')
  })

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })
})

describe('blockText', () => {
  it('extracts paragraph text', () => {
    expect(blockText({ type: 'paragraph', html: 'a <em>b</em> c' } as never)).toBe('a b c')
  })

  it('extracts heading text', () => {
    expect(blockText({ type: 'h2', text: '<strong>Title</strong>' } as never)).toBe('Title')
  })

  it('extracts list items', () => {
    expect(
      blockText({
        type: 'list',
        listType: 'ul',
        items: [{ html: 'one' }, { html: 'two' }],
      } as never),
    ).toBe('one two')
  })

  it('extracts table cells', () => {
    expect(
      blockText({
        type: 'table',
        rows: [{ cells: [{ html: 'A' }, { html: 'B' }] }],
      } as never),
    ).toBe('A B')
  })

  it('recurses into section blocks', () => {
    expect(
      blockText({
        type: 'section',
        id: 's',
        content: [
          { type: 'h2', text: 'Heading' },
          { type: 'paragraph', html: 'body' },
        ],
      } as never),
    ).toBe('Heading body')
  })

  it('skips meta and footer-text', () => {
    expect(blockText({ type: 'meta', badges: [{ text: 'x' }] } as never)).toBe('')
    expect(blockText({ type: 'footer-text', text: 'footer' } as never)).toBe('')
  })
})

describe('buildRecords', () => {
  it('emits one chapter record and one section record per <section> block', () => {
    const records = buildRecords(fixture())
    const chapterRecords = records.filter((r) => r.sectionId === null)
    const sectionRecords = records.filter((r) => r.sectionId !== null)

    expect(chapterRecords).toHaveLength(3)
    expect(sectionRecords).toHaveLength(4)
  })

  it('extracts section title from the first heading inside the section', () => {
    const records = buildRecords(fixture())
    const sec = records.find((r) => r.sectionId === 'sec-dt')
    expect(sec?.sectionTitle).toBe('Decision Tables')
  })

  it('concatenates body text across blocks within a section', () => {
    const records = buildRecords(fixture())
    const sec = records.find((r) => r.sectionId === 'sec-probability')
    expect(sec?.body).toContain('Compute the probability')
    expect(sec?.body).toContain('Identify risks')
    expect(sec?.body).toContain('Assess impact')
  })

  it('chapter record has empty body and the chapter title', () => {
    const records = buildRecords(fixture())
    const ch = records.find((r) => r.chapterId === 'ch-risk' && r.sectionId === null)
    expect(ch?.chapterTitle).toBe('Risk-Based Testing')
    expect(ch?.body).toBe('')
  })

  it('skips empty sections (no heading and no body)', () => {
    const records = buildRecords([
      {
        manifest: manifest(),
        data: {
          chapters: [
            {
              id: 'ch-empty',
              meta: { type: 'meta', badges: [] },
              title: 'Empty Chapter',
              content: [{ type: 'section', id: 'sec-empty', content: [] }],
            },
          ],
          toc: [],
          footerText: '',
        },
      },
    ])
    expect(records.filter((r) => r.sectionId === 'sec-empty')).toHaveLength(0)
  })
})

describe('searchIndex', () => {
  const records = buildRecords(fixture())
  const fuse = buildIndex(records)

  it('returns empty array for empty query', () => {
    expect(searchIndex(fuse, '')).toEqual([])
  })

  it('returns empty array for whitespace-only query', () => {
    expect(searchIndex(fuse, '   ')).toEqual([])
  })

  it('finds chapter title match and tags it as tier=chapter', () => {
    const results = searchIndex(fuse, 'Risk-Based')
    const top = results[0]
    expect(top).toBeDefined()
    expect(top?.tier).toBe('chapter')
    expect(top?.sectionId).toBeNull()
    expect(top?.chapterId).toBe('ch-risk')
  })

  it('finds section title match and tags it as tier=section', () => {
    const results = searchIndex(fuse, 'Decision Tables')
    const sec = results.find((r) => r.tier === 'section')
    expect(sec).toBeDefined()
    expect(sec?.sectionId).toBe('sec-dt')
  })

  it('finds body mention and tags it as tier=content with a snippet', () => {
    const results = searchIndex(fuse, 'likelihood')
    const content = results.find((r) => r.tier === 'content')
    expect(content).toBeDefined()
    expect(content?.snippet).toContain('likelihood')
    expect(content?.sectionId).toBe('sec-intro')
  })

  it('orders results chapter > section > content', () => {
    const results = searchIndex(fuse, 'test')
    const tiers = results.map((r) => r.tier)
    const firstContent = tiers.indexOf('content')
    const firstChapter = tiers.indexOf('chapter')
    if (firstChapter !== -1 && firstContent !== -1) {
      expect(firstChapter).toBeLessThan(firstContent)
    }
  })

  it('tolerates typos (fuzzy match)', () => {
    const results = searchIndex(fuse, 'decesion') // typo for "decision"
    const sec = results.find((r) => r.tier === 'section')
    expect(sec).toBeDefined()
    expect(sec?.sectionId).toBe('sec-dt')
  })

  it('respects per-tier limits', () => {
    const results = searchIndex(fuse, 'test', { chapter: 1, section: 1, content: 1 })
    expect(results.filter((r) => r.tier === 'chapter').length).toBeLessThanOrEqual(1)
    expect(results.filter((r) => r.tier === 'section').length).toBeLessThanOrEqual(1)
    expect(results.filter((r) => r.tier === 'content').length).toBeLessThanOrEqual(1)
  })

  it('returns no more than 13 results with default limits (3+5+5)', () => {
    const results = searchIndex(fuse, 'test')
    expect(results.length).toBeLessThanOrEqual(13)
  })
})
