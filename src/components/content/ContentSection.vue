<template>
  <section :id="block.id" class="content-section">
    <ContentRenderer :blocks="block.content" />
  </section>
</template>

<script setup lang="ts">
import type { ContentBlock } from '@/types'
import ContentRenderer from './ContentRenderer.vue'

defineProps<{ block: ContentBlock & { id: string; content: ContentBlock[] } }>()
</script>
