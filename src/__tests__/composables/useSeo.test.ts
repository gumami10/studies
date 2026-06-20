import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useSeo, defaultSeoMeta, type SeoMeta } from '../../../src/composables/useSeo'

function withSetup(meta: () => SeoMeta) {
  let captured: ReturnType<typeof useSeo> | null = null
  const Comp = defineComponent({
    setup() {
      captured = useSeo(meta)
      return () => h('div')
    },
  })
  const wrapper = mount(Comp, { attachTo: document.body })
  return { wrapper, get: () => captured! }
}

function metaByName(name: string) {
  return document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
}

function metaByProp(prop: string) {
  return document.head.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`)
}

function linkByRel(rel: string) {
  return document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
}

describe('useSeo', () => {
  beforeEach(() => {
    document.title = 'preexisting'
    ;['description', 'twitter:title', 'twitter:description', 'twitter:image'].forEach((n) => {
      metaByName(n)?.remove()
    })
    ;['og:title', 'og:description', 'og:type', 'og:url', 'og:image'].forEach((p) => {
      metaByProp(p)?.remove()
    })
    linkByRel('canonical')?.remove()
    document.getElementById('seo-jsonld')?.remove()
  })

  afterEach(() => {
    document.getElementById('seo-jsonld')?.remove()
  })

  it('writes title, description, canonical, og and twitter tags', async () => {
    withSetup(() => ({
      title: 'Alpha Title — QA Hero',
      description: 'Alpha desc',
      path: '/alpha',
      ogType: 'article',
    }))
    await nextTick()
    expect(document.title).toBe('Alpha Title — QA Hero')
    expect(metaByName('description')?.content).toBe('Alpha desc')
    expect(linkByRel('canonical')?.href).toContain('/studies/alpha')
    expect(metaByProp('og:title')?.content).toBe('Alpha Title — QA Hero')
    expect(metaByProp('og:type')?.content).toBe('article')
    expect(metaByProp('og:url')?.content).toBeTruthy()
    expect(metaByName('twitter:title')?.content).toBe('Alpha Title — QA Hero')
  })

  it('prepends base path to absolute canonical url', async () => {
    withSetup(() => ({ title: 't', description: 'd', path: '/ctal-at' }))
    await nextTick()
    expect(linkByRel('canonical')?.href).toMatch(/\/studies\/ctal-at$/)
  })

  it('injects JSON-LD when jsonLd is provided', async () => {
    withSetup(() => ({
      title: 't',
      description: 'd',
      path: '/',
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'QA Hero' },
    }))
    await nextTick()
    const script = document.getElementById('seo-jsonld')
    expect(script).toBeTruthy()
    const parsed = JSON.parse(script!.textContent || '{}')
    expect(parsed['@type']).toBe('WebSite')
  })

  it('upserts idempotently (does not stack duplicate meta tags)', async () => {
    withSetup(() => ({ title: 'first', description: 'first', path: '/a' }))
    await nextTick()
    withSetup(() => ({ title: 'second', description: 'second', path: '/b' }))
    await nextTick()
    const descs = document.head.querySelectorAll<HTMLMetaElement>('meta[name="description"]')
    expect(descs.length).toBe(1)
    expect(descs[0].content).toBe('second')
  })

  it('defaultSeoMeta provides the home-page baseline', () => {
    const m = defaultSeoMeta()
    expect(m.title).toContain('QA Hero')
    expect(m.path).toBe('/')
  })
})
