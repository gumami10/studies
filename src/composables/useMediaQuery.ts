import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mql: MediaQueryList | null = null

  function update() {
    if (mql) matches.value = mql.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    if (mql) mql.removeEventListener('change', update)
  })

  return matches
}
