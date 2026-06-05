import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookmarksStore } from '@/stores/bookmarks'

describe('useBookmarksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes empty', () => {
    const store = useBookmarksStore()
    expect(store.items).toEqual({})
    expect(store.count).toBe(0)
  })

  it('set stores a bookmark for a knowledgeId', () => {
    const store = useBookmarksStore()
    store.set('study-a', 'chapter-1', 'Chapter 1')
    expect(store.count).toBe(1)
    expect(store.get('study-a')).toMatchObject({
      knowledgeId: 'study-a',
      sectionId: 'chapter-1',
      title: 'Chapter 1',
    })
  })

  it('set replaces existing bookmark for the same knowledgeId', () => {
    const store = useBookmarksStore()
    store.set('study-a', 'chapter-1', 'Chapter 1')
    store.set('study-a', 'chapter-2', 'Chapter 2')

    expect(store.count).toBe(1)
    expect(store.get('study-a')?.sectionId).toBe('chapter-2')
    expect(store.get('study-a')?.title).toBe('Chapter 2')
  })

  it('keeps bookmarks across different knowledgeIds', () => {
    const store = useBookmarksStore()
    store.set('study-a', 'chapter-1', 'A1')
    store.set('study-b', 'chapter-5', 'B5')

    expect(store.count).toBe(2)
    expect(store.get('study-a')?.sectionId).toBe('chapter-1')
    expect(store.get('study-b')?.sectionId).toBe('chapter-5')
  })

  it('isBookmarked returns true only for matching sectionId', () => {
    const store = useBookmarksStore()
    store.set('study-a', 'chapter-1', 'A1')
    expect(store.isBookmarked('study-a', 'chapter-1')).toBe(true)
    expect(store.isBookmarked('study-a', 'chapter-2')).toBe(false)
    expect(store.isBookmarked('study-b', 'chapter-1')).toBe(false)
  })

  it('clear removes a bookmark', () => {
    const store = useBookmarksStore()
    store.set('study-a', 'chapter-1', 'A1')
    store.clear('study-a')
    expect(store.count).toBe(0)
    expect(store.get('study-a')).toBeUndefined()
  })

  it('clear is a no-op for unknown knowledgeId', () => {
    const store = useBookmarksStore()
    expect(() => store.clear('unknown')).not.toThrow()
    expect(store.count).toBe(0)
  })

  it('toggle adds when no bookmark exists for the knowledgeId', () => {
    const store = useBookmarksStore()
    store.toggle('study-a', 'chapter-1', 'A1')
    expect(store.isBookmarked('study-a', 'chapter-1')).toBe(true)
  })

  it('toggle replaces when bookmark exists for a different chapter', () => {
    const store = useBookmarksStore()
    store.toggle('study-a', 'chapter-1', 'A1')
    store.toggle('study-a', 'chapter-2', 'A2')

    expect(store.count).toBe(1)
    expect(store.get('study-a')?.sectionId).toBe('chapter-2')
  })

  it('toggle removes when clicking the same chapter again', () => {
    const store = useBookmarksStore()
    store.toggle('study-a', 'chapter-1', 'A1')
    store.toggle('study-a', 'chapter-1', 'A1')

    expect(store.count).toBe(0)
    expect(store.get('study-a')).toBeUndefined()
  })

  it('persists to localStorage', () => {
    const store = useBookmarksStore()
    store.set('study-a', 'chapter-1', 'A1')
    const saved = JSON.parse(localStorage.getItem('ctal_at_bookmarks') ?? '{}')
    expect(saved['study-a']?.sectionId).toBe('chapter-1')
  })

  it('load reads existing localStorage data', () => {
    const data = {
      'study-a': {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        title: 'A1',
        timestamp: 1,
      },
    }
    localStorage.setItem('ctal_at_bookmarks', JSON.stringify(data))

    const store = useBookmarksStore()
    store.load()
    expect(store.count).toBe(1)
    expect(store.get('study-a')?.title).toBe('A1')
  })

  it('records a timestamp on set', () => {
    const store = useBookmarksStore()
    const before = Date.now()
    store.set('study-a', 'chapter-1', 'A1')
    const after = Date.now()

    const ts = store.get('study-a')?.timestamp ?? 0
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })
})
