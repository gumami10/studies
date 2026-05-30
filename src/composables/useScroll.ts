import { ref, onMounted, onUnmounted } from 'vue'

export function useScroll() {
  const showButton = ref(false)
  let ticking = false

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        showButton.value = window.scrollY > 400
        ticking = false
      })
      ticking = true
    }
  }

  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onUnmounted(() => window.removeEventListener('scroll', onScroll))

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { showButton, scrollToTop }
}
