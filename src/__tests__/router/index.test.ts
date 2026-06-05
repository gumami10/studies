import { describe, it, expect, beforeEach } from 'vitest'
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
    router = buildRouter(fixtureCatalog)
    router.push('/')
    await router.isReady()
  })

  it('declares home, starred, and one route per knowledge', () => {
    const names = router.getRoutes().map((r: { name?: string | symbol | null }) => r.name)
    expect(names).toEqual(expect.arrayContaining(['home', 'starred', 'alpha', 'beta']))
  })

  it('home route resolves', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('starred route resolves', async () => {
    await router.push('/starred')
    expect(router.currentRoute.value.name).toBe('starred')
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

  it('scrollBehavior returns the bookmarked section when a bookmark exists for the knowledge', () => {
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify({
        alpha: { knowledgeId: 'alpha', sectionId: 'ch3', title: 'Ch 3', timestamp: 1 },
      }),
    )
    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ el: '#ch3', behavior: 'smooth' })
  })

  it('scrollBehavior falls back to top when the bookmark has no sectionId', () => {
    localStorage.setItem('ctal_at_bookmarks', JSON.stringify({ alpha: { knowledgeId: 'alpha' } }))
    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ top: 0 })
  })

  it('scrollBehavior falls back to top when no bookmark exists for the knowledge', () => {
    localStorage.clear()
    const to = {
      hash: '',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ top: 0 })
  })

  it('scrollBehavior falls back to top for routes with no knowledgeId', () => {
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify({ alpha: { knowledgeId: 'alpha', sectionId: 'ch3' } }),
    )
    const to = {
      hash: '',
      meta: {},
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ top: 0 })
  })

  it('scrollBehavior prefers a hash over a bookmark', () => {
    localStorage.setItem(
      'ctal_at_bookmarks',
      JSON.stringify({ alpha: { knowledgeId: 'alpha', sectionId: 'ch3' } }),
    )
    const to = {
      hash: '#ch9',
      meta: { knowledgeId: 'alpha' },
    } as unknown as Parameters<NonNullable<Router['options']['scrollBehavior']>>[0]
    const from = {} as Parameters<NonNullable<Router['options']['scrollBehavior']>>[1]
    const result = router.options.scrollBehavior?.(to, from, null)
    expect(result).toEqual({ el: '#ch9', behavior: 'smooth' })
  })
})
