import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageGet, storageSet, storageAvailable } from '@/utils/storage'

const DEFAULT_KEY = 'ctal-at-highlights-ch1'

export const useHighlightsStore = defineStore('highlights', () => {
  const items = ref([])
  const storageKey = ref(DEFAULT_KEY)
  const available = ref(true)

  function setKey(key) {
    storageKey.value = key || DEFAULT_KEY
    load()
  }

  function load() {
    if (!storageAvailable()) {
      available.value = false
      console.warn('[Highlights] localStorage not available')
      return
    }
    items.value = storageGet(storageKey.value, [])
  }

  function save() {
    storageSet(storageKey.value, items.value)
  }

  function add(data) {
    items.value.push(data)
    save()
  }

  function remove(id) {
    items.value = items.value.filter(h => h.id !== id)
    save()
  }

  return { items, storageKey, available, setKey, load, add, remove }
})
