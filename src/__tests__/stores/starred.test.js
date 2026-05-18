import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStarredStore } from '@/stores/starred'

describe('useStarredStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with empty items', () => {
    const store = useStarredStore()
    expect(store.items).toEqual({})
  })

  it('starredCount is 0 initially', () => {
    const store = useStarredStore()
    expect(store.starredCount).toBe(0)
  })

  it('isStarred returns false for unknown id', () => {
    const store = useStarredStore()
    expect(store.isStarred('unknown')).toBe(false)
  })

  it('toggle adds a starred item', () => {
    const store = useStarredStore()
    store.toggle('sec-1', 'My Section', 'Chapters 1-6', '<h2>My Section</h2>')
    expect(store.starredCount).toBe(1)
    expect(store.isStarred('sec-1')).toBe(true)
    expect(store.items['sec-1']).toEqual({
      id: 'sec-1',
      title: 'My Section',
      source: 'Chapters 1-6',
      html: '<h2>My Section</h2>'
    })
  })

  it('toggle removes a starred item when already starred', () => {
    const store = useStarredStore()
    store.toggle('sec-1', 'Title', 'Source', '<p>html</p>')
    expect(store.starredCount).toBe(1)

    store.toggle('sec-1')
    expect(store.starredCount).toBe(0)
    expect(store.isStarred('sec-1')).toBe(false)
    expect(store.items['sec-1']).toBeUndefined()
  })

  it('persists to localStorage on toggle', () => {
    const store = useStarredStore()
    store.toggle('sec-1', 'Title', 'Chapters', '<p>content</p>')
    const saved = JSON.parse(localStorage.getItem('ctal_at_starred'))
    expect(saved['sec-1']).toBeDefined()
    expect(saved['sec-1'].title).toBe('Title')
  })

  it('load reads from localStorage', () => {
    const data = {
      'sec-a': { id: 'sec-a', title: 'A', source: 'S', html: '<p>A</p>' }
    }
    localStorage.setItem('ctal_at_starred', JSON.stringify(data))

    const store = useStarredStore()
    store.load()
    expect(store.starredCount).toBe(1)
    expect(store.items['sec-a'].title).toBe('A')
  })

  it('bySource groups items by source', () => {
    const store = useStarredStore()
    store.toggle('1', 'One', 'Chapters 1-6', '<p>1</p>')
    store.toggle('2', 'Two', 'Chapters 1-6', '<p>2</p>')
    store.toggle('3', 'Three', 'Quality Metrics', '<p>3</p>')
    store.toggle('4', 'Four') // no source -> 'Unknown'

    const grouped = store.bySource
    expect(Object.keys(grouped)).toHaveLength(3)
    expect(grouped['Chapters 1-6']).toHaveLength(2)
    expect(grouped['Quality Metrics']).toHaveLength(1)
    expect(grouped['Unknown']).toHaveLength(1)
  })

  it('starredCount updates reactively after toggle', () => {
    const store = useStarredStore()
    expect(store.starredCount).toBe(0)
    store.toggle('a', 'A', 'X', '<p>x</p>')
    expect(store.starredCount).toBe(1)
    store.toggle('b', 'B', 'Y', '<p>y</p>')
    expect(store.starredCount).toBe(2)
    store.toggle('a')
    expect(store.starredCount).toBe(1)
  })
})
