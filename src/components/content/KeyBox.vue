<template>
  <div class="key-box">
    <h4 v-if="block.heading" v-html="block.heading" />
    <template v-for="(child, i) in block.content" :key="i">
      <component :is="resolveComponent(child.type)" :block="child" />
    </template>
  </div>
</template>

<script setup>
import ContentParagraph from './ContentParagraph.vue'
import ContentHeading from './ContentHeading.vue'
import ContentList from './ContentList.vue'
import DataTable from './DataTable.vue'

defineProps({ block: { type: Object, required: true } })

const map = {
  paragraph: ContentParagraph,
  heading: ContentHeading,
  list: ContentList,
  table: DataTable,
}

function resolveComponent(type) {
  return map[type] || 'div'
}
</script>
