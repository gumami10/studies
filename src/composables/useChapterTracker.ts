import { ref, onMounted, onUnmounted } from 'vue'

export function useChapterTracker() {
  const currentChapterId = ref('')

  function onScroll() {
    const chapters = document.querySelectorAll<HTMLElement>('article.chapter[id]')
    if (!chapters.length) return

    let active: HTMLElement | null = null
    for (const chapter of chapters) {
      const rect = chapter.getBoundingClientRect()
      if (rect.top <= window.innerHeight / 2) {
        active = chapter
      } else {
        break
      }
    }

    if (active && active.id !== currentChapterId.value) {
      currentChapterId.value = active.id
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    setTimeout(onScroll, 150)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { currentChapterId }
}
