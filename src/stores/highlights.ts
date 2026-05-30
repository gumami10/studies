import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageGet, storageSet, storageAvailable } from '@/utils/storage'

export interface HighlightItem {
  id: string
  color: string
  text: string
  startPath: string[]
  startOffset: number
  endPath: string[]
  endOffset: number
}

const DEFAULT_KEY = 'ctal-at-highlights-ch1'

export const useHighlightsStore = defineStore('highlights', () => {
  const items = ref<HighlightItem[]>([])
  const storageKey = ref(DEFAULT_KEY)
  const available = ref(true)

  function setKey(key: string) {
    storageKey.value = key || DEFAULT_KEY
    load()
  }

  function load() {
    if (!storageAvailable()) {
      available.value = false
      console.warn('[Highlights] localStorage not available')
      return
    }
    items.value = storageGet<HighlightItem[]>(storageKey.value, []) ?? []
  }

  function save() {
    storageSet(storageKey.value, items.value)
  }

  function add(data: HighlightItem) {
    items.value.push(data)
    save()
  }

  function remove(id: string) {
    items.value = items.value.filter((h) => h.id !== id)
    save()
  }

  return { items, storageKey, available, setKey, load, add, remove }
})
