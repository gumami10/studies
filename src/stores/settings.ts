import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageGet, storageSet } from '@/utils/storage'

export interface SettingsState {
  autoBookmark: boolean
}

const STORAGE_KEY = 'ctal_at_settings'

const DEFAULT_SETTINGS: SettingsState = {
  autoBookmark: false,
}

export const useSettingsStore = defineStore('settings', () => {
  const autoBookmark = ref(false)

  function load() {
    const saved = storageGet<SettingsState>(STORAGE_KEY, DEFAULT_SETTINGS)
    autoBookmark.value = saved?.autoBookmark ?? false
  }

  function setAutoBookmark(value: boolean) {
    autoBookmark.value = value
    persist()
  }

  function persist() {
    storageSet(STORAGE_KEY, { autoBookmark: autoBookmark.value })
  }

  return { autoBookmark, load, setAutoBookmark, persist }
})
