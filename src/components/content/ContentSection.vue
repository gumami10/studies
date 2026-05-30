<template>
  <section :id="block.id">
    <ContentRenderer :blocks="block.content" />
    <StarButton :section-id="block.id" :section-title="extractedTitle" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ContentBlock } from '@/types'
import ContentRenderer from './ContentRenderer.vue'
import StarButton from '@/components/ui/StarButton.vue'

const props = defineProps<{ block: ContentBlock & { id: string; content: ContentBlock[] } }>()

const extractedTitle = computed(() => {
  const heading = props.block.content?.find((b: ContentBlock) =>
    ['h2', 'h3', 'h4', 'heading', 'title'].includes(b.type),
  )
  return (heading?.text as string) || props.block.id || 'Untitled'
})
</script>
