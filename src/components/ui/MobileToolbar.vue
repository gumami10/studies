<template>
  <Toolbar class="mobile-toolbar" :class="{ 'highlight-active': highlightMode }">
    <template #start>
      <div class="mobile-toolbar-title">
        <span class="title-text" :class="{ 'title-fade': titleAnimating }">
          {{ displayTitle }}
        </span>
      </div>
    </template>
    <template #end>
      <div class="mobile-toolbar-actions">
        <Button
          class="mobile-hl-btn"
          :class="{ active: highlightMode }"
          type="button"
          :title="highlightMode ? 'Disable highlighter' : 'Enable highlighter'"
          :aria-label="highlightMode ? 'Disable highlighter' : 'Enable highlighter'"
          :icon="'pi pi-pencil'"
          severity="secondary"
          text
          rounded
          @click="highlightMode = !highlightMode"
        />
        <Button
          class="mobile-star-btn"
          :class="{ starred: isPlaced }"
          type="button"
          :title="isPlaced ? 'Unstar this section' : 'Star this section'"
          :aria-label="isPlaced ? 'Unstar this section' : 'Star this section'"
          :icon="isPlaced ? 'pi pi-star-fill' : 'pi pi-star'"
          severity="secondary"
          text
          rounded
          @click="toggleStar"
        />
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import { useSectionTracker } from '@/composables/useSectionTracker'
import { usePlacemarkToggle } from '@/composables/usePlacemarkToggle'

const props = defineProps<{
  highlightSelection: (color: string) => boolean
}>()

const route = useRoute()
const { currentSectionId, currentSectionTitle } = useSectionTracker()

const knowledgeId = () => (route.meta.knowledgeId as string) ?? ''

const { isPlaced, toggle: togglePlacemark } = usePlacemarkToggle(
  () => currentSectionId.value,
  () => currentSectionTitle.value || 'Untitled',
  knowledgeId,
)

const highlightMode = ref(false)
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

function toggleStar() {
  togglePlacemark(['.star-btn', '.mobile-star-btn'])
}

function handleSelectionEnd() {
  if (!highlightMode.value) return
  setTimeout(() => {
    props.highlightSelection('yellow')
  }, 150)
}

onMounted(() => {
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

<style scoped>
.mobile-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--p-surface-900);
  border-bottom: 1px solid var(--p-surface-800);
  border-radius: 0;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  display: none;
}

.mobile-toolbar.highlight-active {
  border-bottom-color: var(--p-amber-400);
}

@media (max-width: 768px) {
  .mobile-toolbar {
    display: flex;
  }
}

.mobile-toolbar :deep(.p-toolbar-start) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  height: 1.4em;
  position: relative;
}

.mobile-toolbar :deep(.p-toolbar-end) {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.title-text {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--p-surface-0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  opacity: 1;
  transform: translateY(0);
}

.title-text.title-fade {
  opacity: 0;
  transform: translateY(-8px);
}

.mobile-hl-btn.active :deep(.p-button-icon) {
  color: var(--p-amber-400);
}

.mobile-star-btn.starred :deep(.p-button-icon) {
  color: var(--p-amber-400);
}

.mobile-hl-btn:active,
.mobile-star-btn:active {
  transform: scale(0.92);
}
</style>
