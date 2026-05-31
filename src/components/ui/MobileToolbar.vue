<template>
  <div class="mobile-toolbar" :class="{ 'highlight-active': highlightMode }">
    <div class="mobile-toolbar-title">
      <span class="title-text" :class="{ 'title-fade': titleAnimating }">
        {{ displayTitle }}
      </span>
    </div>
    <div class="mobile-toolbar-actions">
      <button
        class="mobile-hl-btn"
        :class="{ active: highlightMode }"
        type="button"
        :title="highlightMode ? 'Disable highlighter' : 'Enable highlighter'"
        @click="highlightMode = !highlightMode"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      </button>
      <button
        class="mobile-star-btn"
        :class="{ starred: isStarred }"
        type="button"
        :title="isStarred ? 'Unstar this section' : 'Star this section'"
        @click="toggleStar"
        v-text="isStarred ? '★' : '☆'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSectionTracker } from '@/composables/useSectionTracker'
import { useStarredStore } from '@/stores/starred'

const props = defineProps<{
  highlightSelection: (color: string) => boolean
}>()

const route = useRoute()
const starredStore = useStarredStore()
const { currentSectionId, currentSectionTitle } = useSectionTracker()

const highlightMode = ref(false)
const isStarred = ref(false)
const displayTitle = ref('')
const titleAnimating = ref(false)

let titleTimer: ReturnType<typeof setTimeout> | null = null

watch(currentSectionTitle, (newTitle) => {
  if (!newTitle || newTitle === displayTitle.value) return
  titleAnimating.value = true
  if (titleTimer) clearTimeout(titleTimer)
  titleTimer = setTimeout(() => {
    displayTitle.value = newTitle
    titleAnimating.value = false
  }, 200)
})

watch(
  currentSectionId,
  (id) => {
    if (id) {
      starredStore.load()
      isStarred.value = starredStore.isStarred(id)
    }
  },
  { immediate: true },
)

function getSource(): string {
  return route.name === 'chapters'
    ? 'CTAL-AT'
    : route.name === 'metrics'
      ? 'Quality Metrics'
      : route.name === 'tae'
        ? 'CTAL-TAE'
        : route.name === 'ta'
          ? 'CTAL-TA'
          : route.name === 'code-review'
            ? 'Code Review'
            : route.name === 'agile-testing'
              ? 'Agile Testing'
              : route.name === 'more-agile-testing'
                ? 'More Agile Testing'
                : document.title
}

function toggleStar() {
  const id = currentSectionId.value
  if (!id) return

  const section = document.getElementById(id)
  let html = ''
  if (section && !starredStore.isStarred(id)) {
    const clone = section.cloneNode(true) as HTMLElement
    const btn = clone.querySelector('.star-btn')
    if (btn) btn.remove()
    const mobileBtn = clone.querySelector('.mobile-star-btn')
    if (mobileBtn) mobileBtn.remove()
    html = clone.outerHTML
  }

  starredStore.toggle(id, currentSectionTitle.value || 'Untitled', getSource(), html)
  isStarred.value = starredStore.isStarred(id)
}

function handleSelectionEnd() {
  if (!highlightMode.value) return
  setTimeout(() => {
    props.highlightSelection('yellow')
  }, 150)
}

onMounted(() => {
  starredStore.load()
  displayTitle.value = currentSectionTitle.value
  document.addEventListener('mouseup', handleSelectionEnd)
  document.addEventListener('touchend', handleSelectionEnd)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleSelectionEnd)
  document.removeEventListener('touchend', handleSelectionEnd)
  if (titleTimer) clearTimeout(titleTimer)
})
</script>
