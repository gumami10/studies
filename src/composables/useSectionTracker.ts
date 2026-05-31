import { ref, onMounted, onUnmounted } from 'vue'

export function useSectionTracker() {
  const currentSectionId = ref('')
  const currentSectionTitle = ref('')

  function extractTitle(section: HTMLElement): string {
    const heading = section.querySelector('h2, h3, h4')
    if (heading?.textContent) return heading.textContent.trim()
    return section.id || 'Untitled'
  }

  function onScroll() {
    const sections = document.querySelectorAll<HTMLElement>('#content-area section[id]')
    if (!sections.length) return

    let active: HTMLElement | null = null
    for (const section of sections) {
      const rect = section.getBoundingClientRect()
      if (rect.top <= 80) {
        active = section
      } else {
        break
      }
    }

    if (active && active.id !== currentSectionId.value) {
      currentSectionId.value = active.id
      currentSectionTitle.value = extractTitle(active)
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    setTimeout(onScroll, 150)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { currentSectionId, currentSectionTitle }
}
