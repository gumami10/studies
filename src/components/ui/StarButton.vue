<template>
  <Button
    class="star-btn"
    :class="{ starred: isPlaced }"
    type="button"
    :title="isPlaced ? 'Unstar this section' : 'Star this section'"
    :aria-label="isPlaced ? 'Unstar this section' : 'Star this section'"
    :icon="isPlaced ? 'pi pi-star-fill' : 'pi pi-star'"
    severity="secondary"
    text
    rounded
    size="small"
    @click="onToggle"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { usePlacemarkToggle } from '@/composables/usePlacemarkToggle'

const props = defineProps({
  sectionId: { type: String, required: true },
  sectionTitle: { type: String, default: 'Untitled' },
  knowledgeId: { type: String, required: true },
})

const { isPlaced, toggle } = usePlacemarkToggle(
  () => props.sectionId,
  () => props.sectionTitle,
  () => props.knowledgeId,
)

function onToggle() {
  toggle(['.star-btn'])
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
