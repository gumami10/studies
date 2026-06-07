import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlacemarksStore } from '@/stores/placemarks'

describe('usePlacemarksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('stars', () => {
    it('initializes with empty stars', () => {
      const store = usePlacemarksStore()
      expect(store.stars).toEqual({})
      expect(store.starredCount).toBe(0)
    })

    it('isStarred returns false for unknown id', () => {
      const store = usePlacemarksStore()
      expect(store.isStarred('unknown')).toBe(false)
    })

    it('toggleStar adds a star', () => {
      const store = usePlacemarksStore()
      store.toggleStar('sec-1', 'chapters', 'sec-1', 'My Section', 'CTAL-AT', '<h2>My Section</h2>')
      expect(store.starredCount).toBe(1)
      expect(store.isStarred('sec-1')).toBe(true)
      expect(store.stars['sec-1']).toMatchObject({
        id: 'sec-1',
        knowledgeId: 'chapters',
        sectionId: 'sec-1',
        title: 'My Section',
        source: 'CTAL-AT',
        html: '<h2>My Section</h2>',
      })
    })

    it('toggleStar removes a star when already starred', () => {
      const store = usePlacemarksStore()
      store.toggleStar('sec-1', 'chapters', 'sec-1', 'Title', 'CTAL-AT', '<p>html</p>')
      expect(store.starredCount).toBe(1)

      store.toggleStar('sec-1', 'chapters', 'sec-1', 'Title', 'CTAL-AT')
      expect(store.starredCount).toBe(0)
      expect(store.isStarred('sec-1')).toBe(false)
    })

    it('persists stars to localStorage', () => {
      const store = usePlacemarksStore()
      store.toggleStar('sec-1', 'chapters', 'sec-1', 'Title', 'CTAL-AT', '<p>content</p>')
      const saved = JSON.parse(localStorage.getItem('ctal_at_placemarks'))
      expect(saved['sec-1']).toBeDefined()
      expect(saved['sec-1'].title).toBe('Title')
    })

    it('load reads stars from localStorage', () => {
      const data = {
        'sec-a': {
          id: 'sec-a',
          knowledgeId: 'chapters',
          sectionId: 'sec-a',
          title: 'A',
          source: 'CTAL-AT',
          html: '<p>A</p>',
          timestamp: 1,
        },
      }
      localStorage.setItem('ctal_at_placemarks', JSON.stringify(data))

      const store = usePlacemarksStore()
      store.load()
      expect(store.starredCount).toBe(1)
      expect(store.stars['sec-a'].title).toBe('A')
    })

    it('bySource groups items by source', () => {
      const store = usePlacemarksStore()
      store.toggleStar('1', 'chapters', '1', 'One', 'CTAL-AT', '<p>1</p>')
      store.toggleStar('2', 'chapters', '2', 'Two', 'CTAL-AT', '<p>2</p>')
      store.toggleStar('3', 'metrics', '3', 'Three', 'Quality Metrics', '<p>3</p>')
      store.toggleStar('4', 'unknown', '4', 'Four', '', '<p>4</p>')

      const grouped = store.bySource
      expect(Object.keys(grouped)).toHaveLength(3)
      expect(grouped['CTAL-AT']).toHaveLength(2)
      expect(grouped['Quality Metrics']).toHaveLength(1)
      expect(grouped['Unknown']).toHaveLength(1)
    })

    it('starredCount updates reactively', () => {
      const store = usePlacemarksStore()
      expect(store.starredCount).toBe(0)
      store.toggleStar('a', 'x', 'a', 'A', 'X', '<p>x</p>')
      expect(store.starredCount).toBe(1)
      store.toggleStar('b', 'y', 'b', 'B', 'Y', '<p>y</p>')
      expect(store.starredCount).toBe(2)
      store.toggleStar('a', 'x', 'a', 'A', 'X')
      expect(store.starredCount).toBe(1)
    })
  })

  describe('legacy migration', () => {
    it('migrates legacy ctal_at_starred data on load', () => {
      const legacy = {
        'sec-1': { id: 'sec-1', title: 'Legacy Section', source: 'CTAL-AT', html: '<p>old</p>' },
      }
      localStorage.setItem('ctal_at_starred', JSON.stringify(legacy))

      const store = usePlacemarksStore()
      store.load()

      expect(store.starredCount).toBe(1)
      expect(store.stars['sec-1']).toMatchObject({
        id: 'sec-1',
        title: 'Legacy Section',
        source: 'CTAL-AT',
        html: '<p>old</p>',
      })
      expect(localStorage.getItem('ctal_at_starred')).toBeNull()
    })

    it('does not overwrite existing stars during migration', () => {
      const existing = {
        'sec-new': {
          id: 'sec-new',
          knowledgeId: 'chapters',
          sectionId: 'sec-new',
          title: 'New',
          source: 'CTAL-AT',
          html: '<p>new</p>',
          timestamp: 1,
        },
      }
      localStorage.setItem('ctal_at_placemarks', JSON.stringify(existing))
      localStorage.setItem(
        'ctal_at_starred',
        JSON.stringify({
          'sec-old': { id: 'sec-old', title: 'Old', source: 'X', html: '<p>old</p>' },
        }),
      )

      const store = usePlacemarksStore()
      store.load()

      expect(store.starredCount).toBe(1)
      expect(store.stars['sec-new']).toBeDefined()
      expect(store.stars['sec-old']).toBeUndefined()
      expect(localStorage.getItem('ctal_at_starred')).not.toBeNull()
    })
  })

  describe('bookmarks', () => {
    it('initializes empty', () => {
      const store = usePlacemarksStore()
      expect(store.bookmarks).toEqual([])
      expect(store.bookmarkCount).toBe(0)
    })

    it('setBookmark stores a bookmark', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'Chapter 1')
      expect(store.bookmarkCount).toBe(1)
      expect(store.getLatestBookmark('study-a')).toMatchObject({
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        title: 'Chapter 1',
      })
    })

    it('setBookmark replaces existing bookmarks for the same knowledgeId', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'Chapter 1')
      store.setBookmark('study-a', 'chapter-2', 'Chapter 2')

      expect(store.bookmarkCount).toBe(1)
      expect(store.isBookmarked('study-a', 'chapter-1')).toBe(false)
      expect(store.isBookmarked('study-a', 'chapter-2')).toBe(true)
    })

    it('isBookmarked returns true only for matching sectionId', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'A1')
      expect(store.isBookmarked('study-a', 'chapter-1')).toBe(true)
      expect(store.isBookmarked('study-a', 'chapter-2')).toBe(false)
      expect(store.isBookmarked('study-b', 'chapter-1')).toBe(false)
    })

    it('clearBookmark removes only the matching bookmark', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'A1')
      store.setBookmark('study-b', 'chapter-1', 'B1')
      store.clearBookmark('study-a', 'chapter-1')

      expect(store.bookmarkCount).toBe(1)
      expect(store.isBookmarked('study-a', 'chapter-1')).toBe(false)
      expect(store.isBookmarked('study-b', 'chapter-1')).toBe(true)
    })

    it('clearBookmark is a no-op for unknown section', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'A1')
      expect(() => store.clearBookmark('study-a', 'unknown')).not.toThrow()
      expect(store.bookmarkCount).toBe(1)
    })

    it('toggleBookmark adds when no bookmark exists', () => {
      const store = usePlacemarksStore()
      store.toggleBookmark('study-a', 'chapter-1', 'A1')
      expect(store.isBookmarked('study-a', 'chapter-1')).toBe(true)
    })

    it('toggleBookmark replaces an existing bookmark for the same knowledgeId', () => {
      const store = usePlacemarksStore()
      store.toggleBookmark('study-a', 'chapter-1', 'A1')
      store.toggleBookmark('study-a', 'chapter-2', 'A2')

      expect(store.bookmarkCount).toBe(1)
      expect(store.isBookmarked('study-a', 'chapter-1')).toBe(false)
      expect(store.isBookmarked('study-a', 'chapter-2')).toBe(true)
    })

    it('toggleBookmark removes when same section clicked again', () => {
      const store = usePlacemarksStore()
      store.toggleBookmark('study-a', 'chapter-1', 'A1')
      store.toggleBookmark('study-a', 'chapter-1', 'A1')

      expect(store.bookmarkCount).toBe(0)
      expect(store.isBookmarked('study-a', 'chapter-1')).toBe(false)
    })

    it('persists bookmarks as an array', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'A1')
      const saved = JSON.parse(localStorage.getItem('ctal_at_bookmarks') ?? '[]')
      expect(Array.isArray(saved)).toBe(true)
      expect(saved[0]?.sectionId).toBe('chapter-1')
    })

    it('load reads existing bookmarks from an array', () => {
      const data = [
        {
          id: 'study-a:chapter-1',
          knowledgeId: 'study-a',
          sectionId: 'chapter-1',
          title: 'A1',
          source: '',
          timestamp: 1,
        },
      ]
      localStorage.setItem('ctal_at_bookmarks', JSON.stringify(data))

      const store = usePlacemarksStore()
      store.load()
      expect(store.bookmarkCount).toBe(1)
      expect(store.getLatestBookmark('study-a')?.title).toBe('A1')
    })

    it('getLatestBookmark returns the bookmark for a knowledgeId', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'A1')

      const latest = store.getLatestBookmark('study-a')
      expect(latest?.sectionId).toBe('chapter-1')
    })
  })

  describe('auto-bookmarks', () => {
    it('setAutoBookmark stores an auto-bookmark', () => {
      const store = usePlacemarksStore()
      store.setAutoBookmark('study-a', 'chapter-3', 'Chapter 3')
      expect(store.getAutoBookmark('study-a')).toMatchObject({
        knowledgeId: 'study-a',
        sectionId: 'chapter-3',
        title: 'Chapter 3',
      })
    })

    it('isAutoBookmarked returns true for matching section', () => {
      const store = usePlacemarksStore()
      store.setAutoBookmark('study-a', 'chapter-3', 'Ch3')
      expect(store.isAutoBookmarked('study-a', 'chapter-3')).toBe(true)
      expect(store.isAutoBookmarked('study-a', 'chapter-4')).toBe(false)
    })

    it('persists auto-bookmarks separately', () => {
      const store = usePlacemarksStore()
      store.setAutoBookmark('study-a', 'chapter-3', 'Ch3')
      const saved = JSON.parse(localStorage.getItem('ctal_at_auto_bookmarks') ?? '{}')
      expect(saved['study-a']?.sectionId).toBe('chapter-3')
    })

    it('setAutoBookmark does nothing when a manual bookmark exists for the same knowledgeId', () => {
      const store = usePlacemarksStore()
      store.setBookmark('study-a', 'chapter-1', 'Chapter 1')
      store.setAutoBookmark('study-a', 'chapter-2', 'Chapter 2')

      expect(store.getAutoBookmark('study-a')).toBeUndefined()
    })

    it('setBookmark clears the auto-bookmark for the same knowledgeId', () => {
      const store = usePlacemarksStore()
      store.setAutoBookmark('study-a', 'chapter-1', 'Chapter 1')
      store.setBookmark('study-a', 'chapter-2', 'Chapter 2')

      expect(store.getAutoBookmark('study-a')).toBeUndefined()
      expect(store.isBookmarked('study-a', 'chapter-2')).toBe(true)
    })
  })
})
