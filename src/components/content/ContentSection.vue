<template>
  <section :id="block.id" class="content-section">
    <div v-if="knowledgeId" class="section-actions">
      <BookmarkButton
        :knowledge-id="knowledgeId"
        :section-id="block.id"
        :section-title="sectionTitle"
      />
      <StarButton
        :section-id="block.id"
        :section-title="sectionTitle"
        :knowledge-id="knowledgeId"
      />
    </div>
    <ContentRenderer :blocks="block.content" :knowledge-id="knowledgeId" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ContentBlock } from '@/types'
import ContentRenderer from './ContentRenderer.vue'
import BookmarkButton from '@/components/ui/BookmarkButton.vue'
import StarButton from '@/components/ui/StarButton.vue'

const props = defineProps<{
  block: ContentBlock & { id: string; content: ContentBlock[] }
  knowledgeId?: string
}>()

const sectionTitle = computed(() => {
  const heading = props.block.content.find(
    (b) => b.type === 'h2' || b.type === 'h3' || b.type === 'h4' || b.type === 'heading',
  )
  return heading?.text?.replace(/<[^>]*>/g, '') || props.block.id
})
</script>
