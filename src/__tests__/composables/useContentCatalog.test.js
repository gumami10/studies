import { describe, it, expect } from 'vitest'
import { useContentCatalog } from '../../../src/composables/useContentCatalog'

describe('useContentCatalog', () => {
  it('exposes a list sorted by homeOrder ascending', () => {
    const { list } = useContentCatalog()
    expect(list.length).toBeGreaterThan(0)
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].homeOrder).toBeLessThanOrEqual(list[i].homeOrder)
    }
  })

  it('every list entry has all required manifest fields', () => {
    const { list } = useContentCatalog()
    for (const k of list) {
      expect(k.id).toBeTruthy()
      expect(k.path).toMatch(/^\//)
      expect(k.name).toBeTruthy()
      expect(k.navLabel).toBeTruthy()
      expect(k.title).toBeTruthy()
      expect(k.subtitle).toBeTruthy()
      expect(k.tocTitle).toBeTruthy()
      expect(k.homeDescription).toBeTruthy()
      expect(typeof k.homeOrder).toBe('number')
      expect(k.highlightKey).toBeTruthy()
      expect(['istqb', 'crispin-gregory', 'none']).toContain(k.footerAttribution)
    }
  })

  it('paths are unique across the catalog', () => {
    const { list } = useContentCatalog()
    const paths = list.map((k) => k.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('ids are unique across the catalog', () => {
    const { list } = useContentCatalog()
    const ids = list.map((k) => k.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('findById returns the matching manifest', () => {
    const { list, findById } = useContentCatalog()
    const sample = list[0]
    expect(findById(sample.id)).toEqual(sample)
  })

  it('findById returns undefined for an unknown id', () => {
    const { findById } = useContentCatalog()
    expect(findById('not-a-real-knowledge-id')).toBeUndefined()
  })

  it('getChapterData returns chapter data for a known knowledge', () => {
    const { list, getChapterData } = useContentCatalog()
    const sample = list[0]
    const data = getChapterData(sample.id)
    expect(data).toBeDefined()
    expect(data.chapters.length).toBeGreaterThan(0)
    expect(data.toc.length).toBeGreaterThan(0)
  })

  it('getChapterData returns undefined for an unknown id', () => {
    const { getChapterData } = useContentCatalog()
    expect(getChapterData('not-a-real-knowledge-id')).toBeUndefined()
  })

  it('byId is keyed by manifest id', () => {
    const { list, byId } = useContentCatalog()
    for (const k of list) {
      expect(byId[k.id]).toEqual(k)
    }
  })
})
