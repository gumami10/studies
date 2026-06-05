<template>
  <div class="loading-state">
    <ProgressSpinner style="width: 50px; height: 50px" stroke-width="3" aria-label="Loading" />
    <p class="loading-text">Loading study content…</p>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
}

.loading-text {
  margin: 0;
  color: var(--p-surface-400);
  font-style: italic;
}
</style>
