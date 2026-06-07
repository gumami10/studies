<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <i :class="icon"></i>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: { type: String, default: 'pi pi-star' },
  title: { type: String, default: 'No starred sections yet' },
  description: {
    type: String,
    default: 'Click the star icon next to any section while studying to save it here.',
  },
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 5rem 1.5rem;
  color: var(--p-surface-400);
  background: var(--p-surface-900);
  border: 1px dashed var(--p-surface-700);
  border-radius: 14px;
}

.empty-state-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--p-surface-800);
  color: var(--p-primary-400);
  font-size: 1.75rem;
  margin-bottom: 1.25rem;
}

.empty-state h3 {
  color: var(--p-surface-0);
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0;
  color: var(--p-surface-400);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
</style>
