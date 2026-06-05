import { createRouter, createWebHashHistory, type RouteRecordRaw, type Router } from 'vue-router'
import catalog from '../../data/manifest.js'
import type { KnowledgeCatalog } from '@/types'
import { storageGet } from '@/utils/storage'

interface BookmarkEntry {
  sectionId?: string
  knowledgeId?: string
  title?: string
  timestamp?: number
}

const BOOKMARKS_STORAGE_KEY = 'ctal_at_bookmarks'

const ContentPage = () => import('@/pages/ContentPage.vue')
const HomePage = () => import('@/pages/HomePage.vue')
const StarredPage = () => import('@/pages/StarredPage.vue')

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
]

export function buildRouter(c: KnowledgeCatalog): Router {
  return createRouter({
    history: createWebHashHistory(),
    routes: [...baseRoutes, ...buildKnowledgeRoutes(c)],
    scrollBehavior(to) {
      if (to.hash) return { el: to.hash, behavior: 'smooth' }
      const knowledgeId = to.meta.knowledgeId as string | undefined
      if (knowledgeId) {
        const bookmarks = storageGet<Record<string, BookmarkEntry>>(BOOKMARKS_STORAGE_KEY, {}) ?? {}
        const bookmark = bookmarks[knowledgeId]
        if (bookmark?.sectionId) {
          return { el: '#' + bookmark.sectionId, behavior: 'smooth' }
        }
      }
      return { top: 0 }
    },
  })
}

export default buildRouter(catalog)
