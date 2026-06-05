<template>
  <div class="badge-list">
    <Tag
      v-for="(badge, i) in block.badges"
      :key="i"
      :value="badge.text"
      severity="secondary"
      rounded
    />
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'

defineProps({ block: { type: Object, required: true } })
</script>

<style scoped>
.badge-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
</style>
