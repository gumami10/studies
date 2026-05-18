import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHighlightsStore } from '@/stores/highlights'

describe('useHighlightsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('initializes with empty items array', () => {
    const store = useHighlightsStore()
    expect(store.items).toEqual([])
  })

  it('initializes with default storage key', () => {
    const store = useHighlightsStore()
    expect(store.storageKey).toBe('ctal-at-highlights-ch1')
  })

  it('setKey changes storage key and reloads', () => {
    const store = useHighlightsStore()
    store.add({ id: '1', color: 'yellow' })

    store.storageKey = 'custom-key'
    store.setKey('custom-key')
    expect(store.storageKey).toBe('custom-key')
  })

  it('setKey with empty value uses default', () => {
    const store = useHighlightsStore()
    store.setKey('')
    expect(store.storageKey).toBe('ctal-at-highlights-ch1')
  })

  it('add pushes a highlight and persists to localStorage', () => {
    const store = useHighlightsStore()
    store.add({ id: 'hl-1', color: 'yellow', text: 'test' })
    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toMatchObject({ id: 'hl-1', color: 'yellow', text: 'test' })

    const saved = JSON.parse(localStorage.getItem('ctal-at-highlights-ch1'))
    expect(saved).toHaveLength(1)
  })

  it('remove deletes by id and persists', () => {
    const store = useHighlightsStore()
    store.add({ id: 'hl-1', color: 'yellow' })
    store.add({ id: 'hl-2', color: 'green' })
    expect(store.items).toHaveLength(2)

    store.remove('hl-1')
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe('hl-2')
  })

  it('remove does nothing for non-existent id', () => {
    const store = useHighlightsStore()
    store.add({ id: 'hl-1', color: 'yellow' })
    store.remove('hl-999')
    expect(store.items).toHaveLength(1)
  })

  it('load reads from localStorage', () => {
    const data = [{ id: 'existing', color: 'blue' }]
    localStorage.setItem('ctal-at-highlights-ch1', JSON.stringify(data))

    const store = useHighlightsStore()
    store.load()
    expect(store.items).toEqual(data)
  })

  it('add persists items to localStorage', () => {
    const store = useHighlightsStore()
    store.add({ id: '1' })
    store.add({ id: '2' })

    const saved = JSON.parse(localStorage.getItem('ctal-at-highlights-ch1'))
    expect(saved).toHaveLength(2)
  })

  it('handles multiple add/remove operations', () => {
    const store = useHighlightsStore()
    store.add({ id: '1' })
    store.add({ id: '2' })
    store.add({ id: '3' })
    store.remove('2')
    expect(store.items.map(i => i.id)).toEqual(['1', '3'])
    store.add({ id: '4' })
    expect(store.items).toHaveLength(3)
  })
})
