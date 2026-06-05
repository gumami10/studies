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
const AUTO_BOOKMARKS_KEY = 'ctal_at_auto_bookmarks'

export const useBookmarksStore = defineStore('bookmarks', () => {
  const items = ref<BookmarkMap>({})
  const autoItems = ref<BookmarkMap>({})

  function load() {
    items.value = storageGet<BookmarkMap>(STORAGE_KEY, {}) ?? {}
    autoItems.value = storageGet<BookmarkMap>(AUTO_BOOKMARKS_KEY, {}) ?? {}
  }

  function persist() {
    storageSet(STORAGE_KEY, items.value)
  }

  function autoPersist() {
    storageSet(AUTO_BOOKMARKS_KEY, autoItems.value)
  }

  function get(knowledgeId: string): Bookmark | undefined {
    return items.value[knowledgeId]
  }

  function autoGet(knowledgeId: string): Bookmark | undefined {
    return autoItems.value[knowledgeId]
  }

  function isBookmarked(knowledgeId: string, sectionId: string): boolean {
    const b = items.value[knowledgeId]
    return !!b && b.sectionId === sectionId
  }

  function isAutoBookmarked(knowledgeId: string, sectionId: string): boolean {
    const b = autoItems.value[knowledgeId]
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

  function setAuto(knowledgeId: string, sectionId: string, title: string) {
    autoItems.value[knowledgeId] = {
      knowledgeId,
      sectionId,
      title,
      timestamp: Date.now(),
    }
    autoPersist()
  }

  function clear(knowledgeId: string) {
    if (items.value[knowledgeId]) {
      delete items.value[knowledgeId]
      persist()
    }
  }

  function clearAuto(knowledgeId: string) {
    if (autoItems.value[knowledgeId]) {
      delete autoItems.value[knowledgeId]
      autoPersist()
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

  return {
    items,
    autoItems,
    load,
    get,
    autoGet,
    isBookmarked,
    isAutoBookmarked,
    set,
    setAuto,
    clear,
    clearAuto,
    toggle,
    count,
  }
})
