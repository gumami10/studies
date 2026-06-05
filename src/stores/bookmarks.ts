import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageGet, storageSet } from '@/utils/storage'

export interface Bookmark {
  knowledgeId: string
  sectionId: string
  title: string
  timestamp: number
}

export type BookmarkMap = Record<string, Bookmark>

const STORAGE_KEY = 'ctal_at_bookmarks'

export const useBookmarksStore = defineStore('bookmarks', () => {
  const items = ref<BookmarkMap>({})

  function load() {
    items.value = storageGet<BookmarkMap>(STORAGE_KEY, {}) ?? {}
  }

  function persist() {
    storageSet(STORAGE_KEY, items.value)
  }

  function get(knowledgeId: string): Bookmark | undefined {
    return items.value[knowledgeId]
  }

  function isBookmarked(knowledgeId: string, sectionId: string): boolean {
    const b = items.value[knowledgeId]
    return !!b && b.sectionId === sectionId
  }

  function set(knowledgeId: string, sectionId: string, title: string) {
    items.value[knowledgeId] = {
      knowledgeId,
      sectionId,
      title,
      timestamp: Date.now(),
    }
    persist()
  }

  function clear(knowledgeId: string) {
    if (items.value[knowledgeId]) {
      delete items.value[knowledgeId]
      persist()
    }
  }

  function toggle(knowledgeId: string, sectionId: string, title: string) {
    if (isBookmarked(knowledgeId, sectionId)) {
      clear(knowledgeId)
    } else {
      set(knowledgeId, sectionId, title)
    }
  }

  const count = computed(() => Object.keys(items.value).length)

  return { items, load, get, isBookmarked, set, clear, toggle, count }
})
