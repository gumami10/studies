import { createRouter, createWebHashHistory, type RouteRecordRaw, type Router } from 'vue-router'
import { nextTick } from 'vue'
import catalog from '../../data/manifest.js'
import type { KnowledgeCatalog } from '@/types'
import { storageGet } from '@/utils/storage'
import { scrollToTopForElement } from '@/utils/scrollPosition'

interface BookmarkEntry {
  sectionId?: string
  knowledgeId?: string
  title?: string
  timestamp?: number
}

const BOOKMARKS_STORAGE_KEY = 'ctal_at_bookmarks'
const AUTO_BOOKMARKS_STORAGE_KEY = 'ctal_at_auto_bookmarks'

const ContentPage = () => import('@/pages/ContentPage.vue')
const HomePage = () => import('@/pages/HomePage.vue')
const StarredPage = () => import('@/pages/StarredPage.vue')
const SettingsPage = () => import('@/pages/SettingsPage.vue')

export function buildKnowledgeRoutes(c: KnowledgeCatalog): RouteRecordRaw[] {
  return Object.values(c)
    .slice()
    .sort((a, b) => a.homeOrder - b.homeOrder)
    .map((k) => ({
      path: k.path,
      name: k.name,
      component: ContentPage,
      meta: { knowledgeId: k.id, footerAttribution: k.footerAttribution },
    }))
}

const baseRoutes: RouteRecordRaw[] = [
  { path: '/index.html', redirect: '/' },
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { footerAttribution: 'none' },
  },
  { path: '/starred', name: 'starred', component: StarredPage },
  { path: '/settings', name: 'settings', component: SettingsPage },
]

function scrollToId(id: string): Promise<{ top: number; behavior: ScrollBehavior }> {
  return nextTick().then(() => {
    return new Promise<{ top: number; behavior: ScrollBehavior }>((resolve) => {
      setTimeout(() => {
        const el = document.getElementById(id)
        resolve({ top: el ? scrollToTopForElement(el) : 0, behavior: 'auto' as const })
      }, 50)
    })
  })
}

function findLatestBookmark(knowledgeId: string, raw: unknown): BookmarkEntry | undefined {
  if (!raw) return undefined
  if (Array.isArray(raw)) {
    let latest: BookmarkEntry | undefined
    for (const b of raw as BookmarkEntry[]) {
      if (b.knowledgeId === knowledgeId && b.sectionId) {
        if (!latest || (b.timestamp ?? 0) > (latest.timestamp ?? 0)) latest = b
      }
    }
    return latest
  }
  if (typeof raw === 'object') {
    const entry = (raw as Record<string, BookmarkEntry>)[knowledgeId]
    return entry?.sectionId ? entry : undefined
  }
  return undefined
}

export function buildRouter(c: KnowledgeCatalog): Router {
  return createRouter({
    history: createWebHashHistory(),
    routes: [...baseRoutes, ...buildKnowledgeRoutes(c)],
    scrollBehavior(to) {
      if (to.hash) {
        const id = to.hash.slice(1)
        if (id) return scrollToId(id)
      }
      const knowledgeId = to.meta.knowledgeId as string | undefined
      if (knowledgeId) {
        const bookmarksRaw = storageGet(BOOKMARKS_STORAGE_KEY, null)
        const bookmark = findLatestBookmark(knowledgeId, bookmarksRaw)
        if (bookmark?.sectionId) return scrollToId(bookmark.sectionId)

        const autoBookmarks =
          storageGet<Record<string, BookmarkEntry>>(AUTO_BOOKMARKS_STORAGE_KEY, {}) ?? {}
        const autoBookmark = autoBookmarks[knowledgeId]
        if (autoBookmark?.sectionId) return scrollToId(autoBookmark.sectionId)
      }
      return { top: 0 }
    },
  })
}

export default buildRouter(catalog)
