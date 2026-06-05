<template>
  <Message severity="error" :closable="false" class="error-message">
    <template #icon>
      <i class="pi pi-exclamation-triangle"></i>
    </template>
    <div class="error-message-content">
      <strong>Failed to load content</strong>
      <span class="error-message-detail">{{ message }}</span>
    </div>
  </Message>
</template>

<script setup lang="ts">
import Message from 'primevue/message'

defineProps({ message: { type: String, required: true } })
</script>

<style scoped>
.error-message {
  margin: 1.5rem 0;
}

.error-message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-message-detail {
  font-size: 0.85rem;
  color: var(--p-surface-300);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>
