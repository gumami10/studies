<template>
  <div class="compare">
    <div v-for="(card, i) in block.cards" :key="i" class="compare-card" :class="card.cardType">
      <template v-for="(child, j) in card.content" :key="j">
        <component :is="resolveComponent(child.type)" :block="child" />
      </template>
    </div>
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
