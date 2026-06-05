<template>
  <Button
    class="star-btn"
    :class="{ starred }"
    type="button"
    :title="starred ? 'Unstar this section' : 'Star this section'"
    :aria-label="starred ? 'Unstar this section' : 'Star this section'"
    :icon="starred ? 'pi pi-star-fill' : 'pi pi-star'"
    severity="secondary"
    text
    rounded
    size="small"
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import { useStarredStore } from '@/stores/starred'

const props = defineProps({
  sectionId: { type: String, required: true },
  sectionTitle: { type: String, default: 'Untitled' },
})

const store = useStarredStore()
const route = useRoute()
const starred = ref(false)

watch(
  () => props.sectionId,
  (id) => {
    store.load()
    starred.value = store.isStarred(id)
  },
  { immediate: true },
)

function toggle() {
  const section = document.getElementById(props.sectionId)
  let html = ''
  if (section && !store.isStarred(props.sectionId)) {
    const clone = section.cloneNode(true) as HTMLElement
    const btn = clone.querySelector('.star-btn')
    if (btn) btn.remove()
    html = clone.outerHTML
  }

  const source =
    route.name === 'chapters'
      ? 'CTAL-AT'
      : route.name === 'metrics'
        ? 'Quality Metrics'
        : document.title

  store.toggle(props.sectionId, props.sectionTitle, source, html)
  starred.value = store.isStarred(props.sectionId)
}
</script>

<style scoped>
.star-btn.starred :deep(.p-button-icon) {
  color: var(--p-amber-400);
}

.star-btn:hover :deep(.p-button-icon) {
  color: var(--p-amber-300);
}
</style>
