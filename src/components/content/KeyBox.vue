<template>
  <Message severity="info" class="key-box" :closable="false">
    <template #icon>
      <i class="pi pi-bolt"></i>
    </template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="block.heading" class="key-box-heading" v-html="block.heading" />
    <div class="key-box-body">
      <template v-for="(child, i) in block.content" :key="i">
        <component :is="resolveComponent(child.type)" :block="child" />
      </template>
    </div>
  </Message>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import Message from 'primevue/message'
import type { ContentBlock } from '@/types'
import ContentParagraph from './ContentParagraph.vue'
import ContentHeading from './ContentHeading.vue'
import ContentList from './ContentList.vue'
import DataTable from './DataTable.vue'

defineProps<{ block: ContentBlock }>()

const map: Record<string, Component> = {
  paragraph: ContentParagraph,
  heading: ContentHeading,
  list: ContentList,
  table: DataTable,
}

function resolveComponent(type: string): Component | string {
  return map[type] || 'div'
}
</script>

<style scoped>
.key-box {
  margin: 1rem 0;
}

.key-box-heading {
  font-weight: 600;
  color: var(--p-primary-300);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.key-box-body :deep(p) {
  margin: 0.5rem 0;
}

.key-box-body :deep(p:first-child) {
  margin-top: 0;
}

.key-box-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
