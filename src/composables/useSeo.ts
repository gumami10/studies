import { onBeforeUnmount, watch } from 'vue'

export interface SeoMeta {
  title: string
  description: string
  path: string
  ogImage?: string
  ogType?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const DEFAULT_TITLE = 'QA Hero — Study Guide for ISTQB CTAL Certifications'
const DEFAULT_DESCRIPTION =
  'Interactive study guide covering ISTQB CTAL-AT, CTAL-TAE, CTAL-TA, quality metrics, and code review research.'

function siteUrl(): string {
  const raw = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://example.com'
  return raw.replace(/\/$/, '')
}

function basePath(): string {
  const raw = (import.meta.env.BASE_URL as string | undefined) || ''
  if (!raw || raw === '/') return '/studies'
  return raw.replace(/\/$/, '')
}

function absoluteUrl(path: string): string {
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl()}${basePath()}${trimmed}`
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove()
}

function applyJsonLd(payload: Record<string, unknown> | Record<string, unknown>[]): string {
  const id = 'seo-jsonld'
  removeJsonLd(id)
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(payload)
  document.head.appendChild(script)
  return id
}

export function useSeo(meta: () => SeoMeta) {
  let jsonLdId: string | null = null
  const previousTitle = document.title

  const apply = () => {
    const m = meta()
    document.title = m.title
    upsertMeta('name', 'description', m.description)
    upsertLink('canonical', absoluteUrl(m.path))

    upsertMeta('property', 'og:title', m.title)
    upsertMeta('property', 'og:description', m.description)
    upsertMeta('property', 'og:type', m.ogType ?? 'website')
    upsertMeta('property', 'og:url', absoluteUrl(m.path))
    if (m.ogImage) {
      upsertMeta('property', 'og:image', absoluteUrl(m.ogImage))
    }

    upsertMeta('name', 'twitter:title', m.title)
    upsertMeta('name', 'twitter:description', m.description)
    if (m.ogImage) {
      upsertMeta('name', 'twitter:image', absoluteUrl(m.ogImage))
    }

    if (m.jsonLd) {
      const payload = Array.isArray(m.jsonLd) ? m.jsonLd : [m.jsonLd]
      const wrapped = payload.length === 1 ? payload[0] : { '@graph': payload }
      jsonLdId = applyJsonLd(wrapped)
    } else if (jsonLdId) {
      removeJsonLd(jsonLdId)
      jsonLdId = null
    }
  }

  apply()
  const stop = watch(meta, apply)

  onBeforeUnmount(() => {
    stop()
    if (jsonLdId) {
      removeJsonLd(jsonLdId)
      jsonLdId = null
    }
    document.title = previousTitle
  })
}

export function defaultSeoMeta(): SeoMeta {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    ogType: 'website',
  }
}
