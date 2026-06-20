import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Router } from 'vue-router'
import { buildRouter, buildKnowledgeRoutes } from '../../../src/router/index'
import type { KnowledgeCatalog } from '../../../src/types'

const fixtureCatalog: KnowledgeCatalog = {
  alpha: {
    id: 'alpha',
    path: '/alpha',
    name: 'alpha',
    navLabel: 'Alpha',
    title: 'Alpha Title',
    subtitle: 'Alpha subtitle',
    tocTitle: 'Alpha TOC',
    homeDescription: 'Alpha blurb',
    homeOrder: 2,
    highlightKey: 'alpha-highlights',
    footerAttribution: 'istqb',
    category: 'qa',
  },
  beta: {
    id: 'beta',
    path: '/beta',
    name: 'beta',
    navLabel: 'Beta',
    title: 'Beta Title',
    subtitle: 'Beta subtitle',
    tocTitle: 'Beta TOC',
    homeDescription: 'Beta blurb',
    homeOrder: 1,
    highlightKey: 'beta-highlights',
    footerAttribution: 'none',
    category: 'qa',
  },
}

describe('buildKnowledgeRoutes', () => {
  it('emits one route per manifest entry', () => {
    const routes = buildKnowledgeRoutes(fixtureCatalog)
    expect(routes).toHaveLength(2)
  })

  it('sorts routes by homeOrder ascending', () => {
    const routes = buildKnowledgeRoutes(fixtureCatalog)
    expect(routes[0].name).toBe('beta')
    expect(routes[1].name).toBe('alpha')
  })

  it('forwards knowledgeId and footerAttribution on meta', () => {
    const routes = buildKnowledgeRoutes(fixtureCatalog)
    const alpha = routes.find((r) => r.name === 'alpha')
    expect(alpha?.meta).toEqual({ knowledgeId: 'alpha', footerAttribution: 'istqb' })
  })

  it('uses the catalog path as the route path', () => {
    const routes = buildKnowledgeRoutes(fixtureCatalog)
    expect(routes.find((r) => r.name === 'alpha')?.path).toBe('/alpha')
    expect(routes.find((r) => r.name === 'beta')?.path).toBe('/beta')
  })

  it('returns an empty array for an empty catalog', () => {
    expect(buildKnowledgeRoutes({})).toEqual([])
  })
})

describe('buildRouter', () => {
  let router: Router

  beforeEach(async () => {
    localStorage.clear()
    document.body.innerHTML = ''
    router = buildRouter(fixtureCatalog)
    await router.push('/')
  })

  afterEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('declares home, starred, settings, and one route per knowledge', () => {
    const names = router.getRoutes().map((r: { name?: string | symbol | null }) => r.name)
    expect(names).toEqual(expect.arrayContaining(['home', 'starred', 'settings', 'alpha', 'beta']))
  })

  it('home route resolves', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('starred route resolves', async () => {
    await router.push('/starred')
    expect(router.currentRoute.value.name).toBe('starred')
  })

  it('settings route resolves', async () => {
    await router.push('/settings')
    expect(router.currentRoute.value.name).toBe('settings')
  })

  it('knowledge route resolves and exposes knowledgeId in meta', async () => {
    await router.push('/alpha')
    expect(router.currentRoute.value.name).toBe('alpha')
    expect(router.currentRoute.value.meta.knowledgeId).toBe('alpha')
    expect(router.currentRoute.value.meta.footerAttribution).toBe('istqb')
  })

  it('redirects /index.html to /', async () => {
    await router.push('/index.html')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('scrollBehavior resolves hash to anchor element selector', async () => {
    await router.push('/alpha#sec-1')
    expect(router.currentRoute.value.hash).toBe('#sec-1')
  })

  it('scrollBehavior returns top when no hash', () => {
    expect(router.currentRoute.value.hash).toBe('')
  })

  it('scrollBehavior scrolls to the top of the bookmarked section when a bookmark exists for the knowledge', async () => {
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify([{ knowledgeId: 'alpha', sectionId: 'ch3', title: 'Ch 3', timestamp: 1 }]),
    )
    const el = document.createElement('section')
    el.id = 'ch3'
    el.getBoundingClientRect = () =>
      ({
        top: 200,
        left: 0,
        right: 0,
        bottom: 600,
        width: 0,
        height: 400,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      }) as DOMRect
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 400 })
    document.body.appendChild(el)

    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    const expectedTop = Math.max(0, 200 + window.scrollY - 24)
    expect(result).toEqual({ top: expectedTop, behavior: 'auto' })

    document.body.removeChild(el)
  })

  it('scrollBehavior scrolls to the top of the chapter element, not the heading inside it', async () => {
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify([{ knowledgeId: 'alpha', sectionId: 'ch3', title: 'Ch 3', timestamp: 1 }]),
    )
    const chapter = document.createElement('article')
    chapter.id = 'ch3'
    chapter.className = 'chapter'
    chapter.getBoundingClientRect = () =>
      ({
        top: 200,
        left: 0,
        right: 0,
        bottom: 2200,
        width: 0,
        height: 2000,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      }) as DOMRect
    Object.defineProperty(chapter, 'offsetHeight', { configurable: true, value: 2000 })

    const heading = document.createElement('h2')
    heading.textContent = 'Chapter 3'
    heading.getBoundingClientRect = () =>
      ({
        top: 260,
        left: 0,
        right: 0,
        bottom: 300,
        width: 0,
        height: 40,
        x: 0,
        y: 260,
        toJSON: () => ({}),
      }) as DOMRect
    Object.defineProperty(heading, 'offsetHeight', { configurable: true, value: 40 })
    chapter.appendChild(heading)
    document.body.appendChild(chapter)

    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    const expectedTop = Math.max(0, 200 + window.scrollY - 24)
    expect(result).toEqual({ top: expectedTop, behavior: 'auto' })

    document.body.removeChild(chapter)
  })

  it('scrollBehavior falls back to top when the bookmark has no sectionId', async () => {
    localStorage.setItem('ctal_at_bookmarks', JSON.stringify([{ knowledgeId: 'alpha' }]))
    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ top: 0 })
  })

  it('scrollBehavior falls back to top when no bookmark exists for the knowledge', async () => {
    localStorage.clear()
    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ top: 0 })
  })

  it('scrollBehavior falls back to auto-bookmark when no manual bookmark exists', async () => {
    localStorage.clear()
    localStorage.setItem(
      'ctal_at_auto_bookmarks',
      JSON.stringify({
        alpha: { knowledgeId: 'alpha', sectionId: 'ch4', title: 'Ch 4', timestamp: 1 },
      }),
    )
    const el = document.createElement('section')
    el.id = 'ch4'
    el.getBoundingClientRect = () =>
      ({
        top: 300,
        left: 0,
        right: 0,
        bottom: 500,
        width: 0,
        height: 200,
        x: 0,
        y: 300,
        toJSON: () => ({}),
      }) as DOMRect
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 200 })
    document.body.appendChild(el)

    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    const expectedTop = Math.max(0, 300 + window.scrollY - 24)
    expect(result).toEqual({ top: expectedTop, behavior: 'auto' })

    document.body.removeChild(el)
  })

  it('scrollBehavior falls back to top for routes with no knowledgeId', async () => {
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify([{ knowledgeId: 'alpha', sectionId: 'ch3' }]),
    )
    const to = {
      hash: '',
      meta: {},
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ top: 0 })
  })

  it('scrollBehavior prefers a hash over a bookmark', async () => {
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify([{ knowledgeId: 'alpha', sectionId: 'ch3' }]),
    )
    const el = document.createElement('section')
    el.id = 'ch9'
    el.getBoundingClientRect = () =>
      ({
        top: 100,
        left: 0,
        right: 0,
        bottom: 300,
        width: 0,
        height: 200,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      }) as DOMRect
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 200 })
    document.body.appendChild(el)

    const to = {
      hash: '#ch9',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    const expectedTop = Math.max(0, 100 + window.scrollY - 24)
    expect(result).toEqual({ top: expectedTop, behavior: 'auto' })

    document.body.removeChild(el)
  })

  it('scrollBehavior prefers manual bookmark over auto-bookmark', async () => {
    localStorage.clear()
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify([{ knowledgeId: 'alpha', sectionId: 'ch3', title: 'Ch 3', timestamp: 1 }]),
    )
    localStorage.setItem(
      'ctal_at_auto_bookmarks',
      JSON.stringify({
        alpha: { knowledgeId: 'alpha', sectionId: 'ch4', title: 'Ch 4', timestamp: 1 },
      }),
    )
    const el3 = document.createElement('section')
    el3.id = 'ch3'
    el3.getBoundingClientRect = () =>
      ({
        top: 200,
        left: 0,
        right: 0,
        bottom: 600,
        width: 0,
        height: 400,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      }) as DOMRect
    Object.defineProperty(el3, 'offsetHeight', { configurable: true, value: 400 })
    document.body.appendChild(el3)

    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = await router.options.scrollBehavior?.(to, from, null)
    const expectedTop = Math.max(0, 200 + window.scrollY - 24)
    expect(result).toEqual({ top: expectedTop, behavior: 'auto' })

    document.body.removeChild(el3)
  })
})
