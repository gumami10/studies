<template>
  <Button
    class="bookmark-btn"
    :class="{ bookmarked: isBookmarked, 'auto-bookmarked': isAutoBookmarked }"
    type="button"
    :title="titleText"
    :aria-label="titleText"
    :aria-pressed="isBookmarked || isAutoBookmarked"
    :icon="iconClass"
    severity="secondary"
    text
    rounded
    size="small"
    @click="onToggle"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useBookmarksStore } from '@/stores/bookmarks'

const props = defineProps({
  knowledgeId: { type: String, required: true },
  sectionId: { type: String, required: true },
  sectionTitle: { type: String, default: 'Untitled' },
})

const store = useBookmarksStore()

onMounted(() => {
  store.load()
})

const isBookmarked = computed(() => store.isBookmarked(props.knowledgeId, props.sectionId))

const isAutoBookmarked = computed(() => {
  if (isBookmarked.value) return false
  return store.isAutoBookmarked(props.knowledgeId, props.sectionId)
})

const iconClass = computed(() => {
  if (isBookmarked.value || isAutoBookmarked.value) return 'pi pi-bookmark-fill'
  return 'pi pi-bookmark'
})

const titleText = computed(() => {
  if (isBookmarked.value) return 'Remove chapter bookmark'
  if (isAutoBookmarked.value) return 'Auto-bookmarked (click to manually bookmark)'
  return 'Bookmark this chapter'
})

function onToggle() {
  store.toggle(props.knowledgeId, props.sectionId, props.sectionTitle)
}
</script>

<style scoped>
.bookmark-btn.bookmarked :deep(.p-button-icon) {
  color: var(--p-primary-300);
}

.bookmark-btn.auto-bookmarked :deep(.p-button-icon) {
  color: var(--p-amber-400);
}
</style>
