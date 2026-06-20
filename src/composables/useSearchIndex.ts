import Fuse, { type IFuseOptions, type FuseResult, type FuseResultMatch } from 'fuse.js'
import { useContentCatalog } from './useContentCatalog'
import type { ChapterWithManifest, ContentBlock, SearchResult, SearchTier } from '@/types'

const STRIP_HTML = /<[^>]+>/g
const COLLAPSE_WS = /\s+/g

const FUSE_OPTIONS: IFuseOptions<IndexRecord> = {
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
}

const TIER_LIMITS: Record<SearchTier, number> = {
  chapter: 3,
  section: 5,
  content: 5,
}

export interface IndexRecord {
  id: string
  knowledgeId: string
  knowledgePath: string
  knowledgeTitle: string
  knowledgeNavLabel: string
  chapterId: string
  chapterTitle: string
  sectionId: string | null
  sectionTitle: string | null
  body: string
}

export function stripHtml(html: string): string {
  return html.replace(STRIP_HTML, ' ').replace(COLLAPSE_WS, ' ').trim()
}

type SearchableBlock = ContentBlock & Record<string, unknown>

export function blockText(block: SearchableBlock): string {
  const type = block.type
  if (type === 'meta' || type === 'footer-text') return ''
  if (type === 'paragraph') return stripHtml(String(block.html ?? ''))
  if (type === 'heading' || type === 'h2' || type === 'h3' || type === 'h4' || type === 'title') {
    return stripHtml(String(block.text ?? ''))
  }
  if (type === 'list' && Array.isArray(block.items)) {
    return (block.items as Array<{ html?: string }>).map((i) => stripHtml(i.html ?? '')).join(' ')
  }
  if (type === 'table' && Array.isArray(block.rows)) {
    return (block.rows as Array<{ cells: Array<{ html?: string; text?: string }> }>)
      .flatMap((r) => r.cells)
      .map((c) => stripHtml(c.html ?? c.text ?? ''))
      .join(' ')
  }
  if (type === 'glossary') {
    const terms = (block.terms as Array<{ text: string }> | undefined)?.map((t) => t.text).join(' ')
    const defs = (block.definitions as Array<{ text: string }> | undefined)
      ?.map((d) => d.text)
      .join(' ')
    return `${terms ?? ''} ${defs ?? ''}`.trim()
  }
  if (type === 'section' && Array.isArray(block.content)) {
    return (block.content as SearchableBlock[]).map(blockText).join(' ')
  }
  if (type === 'key-box' && Array.isArray(block.content)) {
    return (block.content as SearchableBlock[]).map(blockText).join(' ')
  }
  if (type === 'compare' && Array.isArray(block.cards)) {
    return (block.cards as Array<{ content: SearchableBlock[] }>)
      .map((c) => c.content.map(blockText).join(' '))
      .join(' ')
  }
  return ''
}

export function buildRecords(entries: ChapterWithManifest[]): IndexRecord[] {
  const records: IndexRecord[] = []
  for (const { manifest, data } of entries) {
    for (const chapter of data.chapters) {
      const chapterTitle = chapter.title || chapter.id
      records.push({
        id: `ch:${manifest.id}:${chapter.id}`,
        knowledgeId: manifest.id,
        knowledgePath: manifest.path,
        knowledgeTitle: manifest.title,
        knowledgeNavLabel: manifest.navLabel,
        chapterId: chapter.id,
        chapterTitle,
        sectionId: null,
        sectionTitle: null,
        body: '',
      })

      for (const block of chapter.content) {
        if (block.type !== 'section' || !block.id) continue
        const sectionContent = (block.content as SearchableBlock[] | undefined) ?? []
        const heading = sectionContent.find(
          (b) =>
            b.type === 'h2' ||
            b.type === 'h3' ||
            b.type === 'h4' ||
            b.type === 'heading' ||
            b.type === 'title',
        )
        const sectionTitle = heading ? stripHtml(String(heading.text ?? '')) : ''
        const body = sectionContent.map(blockText).join(' ')
        if (!sectionTitle && !body) continue
        records.push({
          id: `sec:${manifest.id}:${chapter.id}:${block.id}`,
          knowledgeId: manifest.id,
          knowledgePath: manifest.path,
          knowledgeTitle: manifest.title,
          knowledgeNavLabel: manifest.navLabel,
          chapterId: chapter.id,
          chapterTitle,
          sectionId: block.id,
          sectionTitle,
          body,
        })
      }
    }
  }
  return records
}

function tierForRecord(
  record: IndexRecord,
  matches: readonly FuseResultMatch[] | undefined,
): SearchTier {
  if (record.sectionId === null) return 'chapter'
  const keys = new Set((matches ?? []).map((m) => m.key).filter(Boolean))
  if (keys.has('sectionTitle')) return 'section'
  return 'content'
}

function makeSnippet(body: string, indices: readonly [number, number][] | undefined): string {
  if (!body) return ''
  if (!indices || indices.length === 0) {
    return body.length > 80 ? `${body.slice(0, 80)}…` : body
  }
  const [start, end] = indices[0]
  const radius = 40
  const from = Math.max(0, start - radius)
  const to = Math.min(body.length, end + radius + 1)
  const prefix = from > 0 ? '…' : ''
  const suffix = to < body.length ? '…' : ''
  return prefix + body.slice(from, to) + suffix
}

export function toResult(record: IndexRecord, raw: FuseResult<IndexRecord>): SearchResult {
  const tier = tierForRecord(record, raw.matches)
  const bodyMatch = raw.matches?.find((m) => m.key === 'body')
  return {
    id: record.id,
    knowledgeId: record.knowledgeId,
    knowledgePath: record.knowledgePath,
    knowledgeTitle: record.knowledgeTitle,
    chapterId: record.chapterId,
    chapterTitle: record.chapterTitle,
    sectionId: record.sectionId,
    sectionTitle: record.sectionTitle,
    tier,
    snippet: makeSnippet(record.body, bodyMatch?.indices),
    score: raw.score ?? 1,
  }
}

export function searchIndex(
  fuse: Fuse<IndexRecord>,
  query: string,
  limitPerTier: Partial<Record<SearchTier, number>> = {},
): SearchResult[] {
  const trimmed = query.trim()
  if (!trimmed) return []
  const limits = { ...TIER_LIMITS, ...limitPerTier }
  const raws = fuse.search(trimmed, { limit: 200 })

  const buckets: Record<SearchTier, SearchResult[]> = {
    chapter: [],
    section: [],
    content: [],
  }
  for (const raw of raws) {
    const result = toResult(raw.item, raw)
    if (buckets[result.tier].length < limits[result.tier]) {
      buckets[result.tier].push(result)
    }
  }

  return [...buckets.chapter, ...buckets.section, ...buckets.content]
}

let fuseSingleton: Fuse<IndexRecord> | null = null

function getFuse(): Fuse<IndexRecord> {
  if (fuseSingleton) return fuseSingleton
  const records = buildRecords(useContentCatalog().getAllChapters())
  fuseSingleton = new Fuse(records, FUSE_OPTIONS)
  return fuseSingleton
}

export function resetSearchIndex(): void {
  fuseSingleton = null
}

export function useSearchIndex() {
  return {
    search(query: string, limitPerTier?: Partial<Record<SearchTier, number>>): SearchResult[] {
      return searchIndex(getFuse(), query, limitPerTier)
    },
    reset: resetSearchIndex,
  }
}

export function _recordsForTest(): IndexRecord[] {
  return buildRecords(useContentCatalog().getAllChapters())
}
