import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageGet, storageSet } from '@/utils/storage'
import type { Placemark, PlacemarkMap } from '@/types'

const STARS_KEY = 'ctal_at_placemarks'
const BOOKMARKS_KEY = 'ctal_at_bookmarks'
const AUTO_BOOKMARKS_KEY = 'ctal_at_auto_bookmarks'
const LEGACY_STARS_KEY = 'ctal_at_starred'

export const usePlacemarksStore = defineStore('placemarks', () => {
  const stars = ref<PlacemarkMap>({})
  const bookmarks = ref<Placemark[]>([])
  const autoBookmarks = ref<PlacemarkMap>({})

  function load() {
    stars.value = storageGet<PlacemarkMap>(STARS_KEY, {}) ?? {}
    autoBookmarks.value = storageGet<PlacemarkMap>(AUTO_BOOKMARKS_KEY, {}) ?? {}
    loadBookmarks()
    migrateLegacyStars()
  }

  function loadBookmarks() {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    if (!raw) {
      bookmarks.value = []
      return
    }
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        bookmarks.value = parsed
      } else if (parsed && typeof parsed === 'object') {
        bookmarks.value = Object.values(parsed) as Placemark[]
        persistBookmarks()
      } else {
        bookmarks.value = []
      }
    } catch {
      bookmarks.value = []
    }
  }

  function migrateLegacyStars() {
    if (Object.keys(stars.value).length > 0) return
    const legacy = storageGet<
      Record<string, { id: string; title: string; source: string; html: string }>
    >(LEGACY_STARS_KEY, null)
    if (!legacy || Object.keys(legacy).length === 0) return
    for (const item of Object.values(legacy)) {
      stars.value[item.id] = {
        id: item.id,
        knowledgeId: '',
        sectionId: item.id,
        title: item.title,
        source: item.source,
        html: item.html,
        timestamp: 0,
      }
    }
    persistStars()
    localStorage.removeItem(LEGACY_STARS_KEY)
  }

  function persistStars() {
    storageSet(STARS_KEY, stars.value)
  }

  function persistBookmarks() {
    storageSet(BOOKMARKS_KEY, bookmarks.value)
  }

  function persistAutoBookmarks() {
    storageSet(AUTO_BOOKMARKS_KEY, autoBookmarks.value)
  }

  function isStarred(id: string): boolean {
    return !!stars.value[id]
  }

  function toggleStar(
    id: string,
    knowledgeId: string,
    sectionId: string,
    title: string,
    source: string,
    html?: string,
  ) {
    if (stars.value[id]) {
      delete stars.value[id]
    } else {
      stars.value[id] = { id, knowledgeId, sectionId, title, source, html, timestamp: Date.now() }
    }
    persistStars()
  }

  const starredCount = computed(() => Object.keys(stars.value).length)

  const bySource = computed(() => {
    const grouped: Record<string, Placemark[]> = {}
    for (const item of Object.values(stars.value)) {
      const src = item.source || 'Unknown'
      if (!grouped[src]) grouped[src] = []
      grouped[src].push(item)
    }
    return grouped
  })

  function isBookmarked(knowledgeId: string, sectionId: string): boolean {
    return bookmarks.value.some((b) => b.knowledgeId === knowledgeId && b.sectionId === sectionId)
  }

  function isAutoBookmarked(knowledgeId: string, sectionId: string): boolean {
    const b = autoBookmarks.value[knowledgeId]
    return !!b && b.sectionId === sectionId
  }

  function setBookmark(knowledgeId: string, sectionId: string, title: string) {
    // Only one manual bookmark per study; clear any existing ones for this knowledgeId
    bookmarks.value = bookmarks.value.filter((b) => b.knowledgeId !== knowledgeId)
    // Also clear the auto-bookmark so it doesn't compete
    if (autoBookmarks.value[knowledgeId]) {
      delete autoBookmarks.value[knowledgeId]
      persistAutoBookmarks()
    }
    bookmarks.value.push({
      id: `${knowledgeId}:${sectionId}`,
      knowledgeId,
      sectionId,
      title,
      source: '',
      timestamp: Date.now(),
    })
    persistBookmarks()
  }

  function setAutoBookmark(knowledgeId: string, sectionId: string, title: string) {
    // Never auto-bookmark when a manual bookmark already exists for this study
    if (bookmarks.value.some((b) => b.knowledgeId === knowledgeId)) {
      return
    }
    const existing = autoBookmarks.value[knowledgeId]
    if (existing?.sectionId === sectionId) {
      return
    }
    autoBookmarks.value[knowledgeId] = {
      id: `${knowledgeId}:${sectionId}`,
      knowledgeId,
      sectionId,
      title,
      source: '',
      timestamp: Date.now(),
    }
    persistAutoBookmarks()
  }

  function clearBookmark(knowledgeId: string, sectionId: string) {
    const before = bookmarks.value.length
    bookmarks.value = bookmarks.value.filter(
      (b) => !(b.knowledgeId === knowledgeId && b.sectionId === sectionId),
    )
    if (bookmarks.value.length !== before) persistBookmarks()
  }

  function toggleBookmark(knowledgeId: string, sectionId: string, title: string) {
    if (isBookmarked(knowledgeId, sectionId)) {
      clearBookmark(knowledgeId, sectionId)
    } else {
      setBookmark(knowledgeId, sectionId, title)
    }
  }

  function getLatestBookmark(knowledgeId: string): Placemark | undefined {
    let latest: Placemark | undefined
    for (const b of bookmarks.value) {
      if (b.knowledgeId === knowledgeId) {
        if (!latest || b.timestamp >= latest.timestamp) latest = b
      }
    }
    return latest
  }

  function getAutoBookmark(knowledgeId: string): Placemark | undefined {
    return autoBookmarks.value[knowledgeId]
  }

  const bookmarkCount = computed(() => bookmarks.value.length)

  return {
    stars,
    bookmarks,
    autoBookmarks,
    load,
    isStarred,
    toggleStar,
    starredCount,
    bySource,
    getLatestBookmark,
    getAutoBookmark,
    isBookmarked,
    isAutoBookmarked,
    setBookmark,
    setAutoBookmark,
    clearBookmark,
    toggleBookmark,
    bookmarkCount,
  }
})
