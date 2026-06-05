import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storageGet, storageSet, storageAvailable } from '@/utils/storage'

describe('storageGet', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns parsed JSON when key exists', () => {
    localStorage.setItem('test', JSON.stringify({ a: 1 }))
    expect(storageGet('test')).toEqual({ a: 1 })
  })

  it('returns fallback when key does not exist', () => {
    expect(storageGet('nonexistent', 'fallback')).toBe('fallback')
  })

  it('returns null fallback by default', () => {
    expect(storageGet('nonexistent')).toBeNull()
  })

  it('returns fallback on JSON parse error', () => {
    localStorage.setItem('bad', '{invalid json')
    expect(storageGet('bad', [])).toEqual([])
  })

  it('returns fallback when localStorage.getItem throws', () => {
    const original = globalThis.localStorage
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('quota')
      },
    })
    expect(storageGet('any', 'safe')).toBe('safe')
    vi.stubGlobal('localStorage', original)
  })
})

describe('storageSet', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores a value as JSON and returns true', () => {
    expect(storageSet('test', { x: 42 })).toBe(true)
    expect(JSON.parse(localStorage.getItem('test'))).toEqual({ x: 42 })
  })

  it('stores primitive values', () => {
    storageSet('num', 100)
    expect(localStorage.getItem('num')).toBe('100')
  })

  it('returns false when setItem throws', () => {
    const original = globalThis.localStorage
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('quota')
      },
    })
    expect(storageSet('any', 'v')).toBe(false)
    vi.stubGlobal('localStorage', original)
  })
})

describe('storageAvailable', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns true when localStorage works', () => {
    expect(storageAvailable()).toBe(true)
  })

  it('returns false when setItem throws', () => {
    const original = globalThis.localStorage
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {},
    })
    expect(storageAvailable()).toBe(false)
    vi.stubGlobal('localStorage', original)
  })

  it('returns false when removeItem throws', () => {
    const original = globalThis.localStorage
    vi.stubGlobal('localStorage', {
      setItem: () => {},
      removeItem: () => {
        throw new Error('nope')
      },
    })
    expect(storageAvailable()).toBe(false)
    vi.stubGlobal('localStorage', original)
  })
})
