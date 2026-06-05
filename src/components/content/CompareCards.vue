<template>
  <div class="compare">
    <Card v-for="(card, i) in block.cards" :key="i" class="compare-card" :class="card.cardType">
      <template #content>
        <template v-for="(child, j) in card.content" :key="j">
          <component :is="resolveComponent(child.type)" :block="child" />
        </template>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import Card from 'primevue/card'
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
.compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

@media (max-width: 720px) {
  .compare {
    grid-template-columns: 1fr;
  }
}

.compare-card {
  background: var(--p-surface-800);
  border: 1px solid var(--p-surface-700);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.compare-card:hover {
  transform: translateY(-2px);
}

.compare-card.pos {
  border-top: 3px solid var(--p-green-400);
}

.compare-card.neg {
  border-top: 3px solid var(--p-red-400);
}

.compare-card :deep(.p-card-body) {
  padding: 1rem;
}

.compare-card :deep(.p-card-content) {
  padding: 0;
}
</style>
