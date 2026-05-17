import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageGet, storageSet } from '@/utils/storage'

const STORAGE_KEY = 'ctal_at_starred'

export const useStarredStore = defineStore('starred', () => {
  const items = ref({})

  function load() {
    items.value = storageGet(STORAGE_KEY, {})
  }

  function isStarred(id) {
    return !!items.value[id]
  }

  function toggle(id, title, source, html) {
    if (items.value[id]) {
      delete items.value[id]
    } else {
      items.value[id] = { id, title, source, html }
    }
    storageSet(STORAGE_KEY, items.value)
  }

  const starredCount = computed(() => Object.keys(items.value).length)

  const bySource = computed(() => {
    const grouped = {}
    Object.values(items.value).forEach(item => {
      const src = item.source || 'Unknown'
      if (!grouped[src]) grouped[src] = []
      grouped[src].push(item)
    })
    return grouped
  })

  return { items, load, isStarred, toggle, starredCount, bySource }
})
