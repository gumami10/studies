export function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`[Storage] Failed to write ${key}:`, e)
    return false
  }
}

export function storageAvailable() {
  try {
    const key = '__storage_test__'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
