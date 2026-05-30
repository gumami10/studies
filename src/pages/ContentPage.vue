<template>
  <header>
    <h1>{{ meta.title }}</h1>
    <p class="subtitle">{{ meta.subtitle }}</p>
    <AppNav />
  </header>

  <div class="toc">
    <h2>{{ meta.tocTitle }}</h2>
    <TableOfContents :items="data.toc" />
  </div>

  <main id="content-area">
    <template v-for="chapter in data.chapters" :key="chapter.id">
      <article :id="chapter.id">
        <BadgeList :block="chapter.meta" />
        <h2 v-if="chapter.title">{{ chapter.title }}</h2>
        <ContentRenderer :blocks="chapter.content" />
      </article>
    </template>
  </main>

  <HighlightToolbar
    :show="toolbarShow"
    :position="toolbarPosition"
    @apply="applyHighlight"
    @remove="removeFromSelection"
  />
  <ToTopButton />
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHighlightsStore } from '@/stores/highlights'
import { useHighlightToolbar } from '@/composables/useHighlightToolbar'
import type { ChapterData } from '@/types'
import AppNav from '@/components/layout/AppNav.vue'
import TableOfContents from '@/components/toc/TableOfContents.vue'
import ContentRenderer from '@/components/content/ContentRenderer.vue'
import BadgeList from '@/components/content/BadgeList.vue'
import HighlightToolbar from '@/components/ui/HighlightToolbar.vue'
import ToTopButton from '@/components/ui/ToTopButton.vue'

const route = useRoute()
const meta = computed(() => route.meta)
const data = computed(() => meta.value.data as ChapterData)
const store = useHighlightsStore()
const {
  show: toolbarShow,
  position: toolbarPosition,
  applyHighlight,
  removeFromSelection,
  restoreHighlights,
} = useHighlightToolbar()

function init() {
  store.setKey(meta.value.highlightKey as string)
  restoreHighlights()
}

onMounted(init)
watch(() => route.name, init)
</script>
