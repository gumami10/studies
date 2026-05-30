export function storageGet<T = unknown>(key: string, fallback: T | null = null): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function storageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`[Storage] Failed to write ${key}:`, e)
    return false
  }
}

export function storageAvailable(): boolean {
  try {
    const key = '__storage_test__'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
