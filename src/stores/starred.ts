import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageGet, storageSet } from '@/utils/storage'

export interface StarredItem {
  id: string
  title: string
  source: string
  html: string
}

const STORAGE_KEY = 'ctal_at_starred'

export const useStarredStore = defineStore('starred', () => {
  const items = ref<Record<string, StarredItem>>({})

  function load() {
    items.value = storageGet<Record<string, StarredItem>>(STORAGE_KEY, {}) ?? {}
  }

  function isStarred(id: string): boolean {
    return !!items.value[id]
  }

  function toggle(id: string, title: string, source: string, html: string) {
    if (items.value[id]) {
      delete items.value[id]
    } else {
      items.value[id] = { id, title, source, html }
    }
    storageSet(STORAGE_KEY, items.value)
  }

  const starredCount = computed(() => Object.keys(items.value).length)

  const bySource = computed(() => {
    const grouped: Record<string, StarredItem[]> = {}
    Object.values(items.value).forEach((item) => {
      const src = item.source || 'Unknown'
      if (!grouped[src]) grouped[src] = []
      grouped[src].push(item)
    })
    return grouped
  })

  return { items, load, isStarred, toggle, starredCount, bySource }
})
