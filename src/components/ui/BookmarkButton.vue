<template>
  <button
    class="bookmark-btn"
    :class="{ bookmarked }"
    type="button"
    :title="titleText"
    :aria-label="titleText"
    :aria-pressed="bookmarked"
    @click="onToggle"
    v-text="icon"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

const bookmarked = computed(() => store.isBookmarked(props.knowledgeId, props.sectionId))

const icon = computed(() => (bookmarked.value ? '🔖' : '📑'))
const titleText = computed(() =>
  bookmarked.value ? 'Remove chapter bookmark' : 'Bookmark this chapter',
)

function onToggle() {
  store.toggle(props.knowledgeId, props.sectionId, props.sectionTitle)
}
</script>
