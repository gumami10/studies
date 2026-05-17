<template>
  <template v-for="(block, i) in blocks" :key="i">
    <component :is="resolveComponent(block.type)" :block="block" />
  </template>
</template>

<script setup>
import ContentSection from './ContentSection.vue'
import ContentHeading from './ContentHeading.vue'
import ContentParagraph from './ContentParagraph.vue'
import ContentList from './ContentList.vue'
import DataTable from './DataTable.vue'
import KeyBox from './KeyBox.vue'
import CompareCards from './CompareCards.vue'
import GlossaryList from './GlossaryList.vue'
import BadgeList from './BadgeList.vue'

defineProps({ blocks: { type: Array, required: true } })

const componentMap = {
  section: ContentSection,
  h2: ContentHeading,
  h3: ContentHeading,
  h4: ContentHeading,
  heading: ContentHeading,
  title: ContentHeading,
  paragraph: ContentParagraph,
  list: ContentList,
  table: DataTable,
  'key-box': KeyBox,
  compare: CompareCards,
  glossary: GlossaryList,
  meta: BadgeList,
}

function resolveComponent(type) {
  return componentMap[type] || 'div'
}
</script>
