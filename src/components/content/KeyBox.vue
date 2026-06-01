<template>
  <div class="key-box">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <h4 v-if="block.heading" v-html="block.heading" />
    <template v-for="(child, i) in block.content" :key="i">
      <component :is="resolveComponent(child.type)" :block="child" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
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
