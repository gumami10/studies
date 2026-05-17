<template>
  <section :id="block.id">
    <ContentRenderer :blocks="block.content" />
    <StarButton :section-id="block.id" :section-title="extractedTitle" />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ContentRenderer from './ContentRenderer.vue'
import StarButton from '@/components/ui/StarButton.vue'

const props = defineProps({ block: { type: Object, required: true } })

const extractedTitle = computed(() => {
  const heading = props.block.content?.find(b =>
    ['h2', 'h3', 'h4', 'heading', 'title'].includes(b.type)
  )
  return heading?.text || props.block.id || 'Untitled'
})
</script>
