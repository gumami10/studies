<template>
  <Button
    id="to-top-btn"
    class="to-top-btn"
    :class="{ visible: showButton }"
    type="button"
    title="Back to top"
    aria-label="Back to top"
    icon="pi pi-arrow-up"
    severity="secondary"
    rounded
    @click="scrollToTop"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { useScroll } from '@/composables/useScroll'

const { showButton, scrollToTop } = useScroll()
</script>

<style scoped>
.to-top-btn {
  position: fixed !important;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition:
    opacity 0.25s,
    visibility 0.25s,
    transform 0.25s;
  z-index: 900;
}

.to-top-btn.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.to-top-btn :deep(.p-button-icon) {
  font-size: 1rem;
  color: var(--p-primary-300);
}
</style>
