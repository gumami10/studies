import { ref, watch } from 'vue'
import { usePlacemarksStore } from '@/stores/placemarks'
import { useContentCatalog } from '@/composables/useContentCatalog'

export function usePlacemarkToggle(
  sectionId: () => string,
  sectionTitle: () => string,
  knowledgeId: () => string,
) {
  const store = usePlacemarksStore()
  const { getLabel } = useContentCatalog()
  const isPlaced = ref(false)

  watch(
    sectionId,
    (id) => {
      store.load()
      isPlaced.value = id ? store.isStarred(id) : false
    },
    { immediate: true },
  )

  function toggle(stripSelectors: string[] = ['.star-btn']) {
    const id = sectionId()
    if (!id) return

    let html: string | undefined
    if (!store.isStarred(id)) {
      const section = document.getElementById(id)
      if (section) {
        const clone = section.cloneNode(true) as HTMLElement
        for (const selector of stripSelectors) {
          clone.querySelectorAll(selector).forEach((el) => el.remove())
        }
        html = clone.outerHTML
      }
    }

    const source = getLabel(knowledgeId()) || document.title
    store.toggleStar(id, knowledgeId(), id, sectionTitle(), source, html)
    isPlaced.value = store.isStarred(id)
  }

  return { isPlaced, toggle }
}
