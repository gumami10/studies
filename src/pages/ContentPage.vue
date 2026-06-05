<template>
  <header>
    <h1>{{ manifest.title }}</h1>
    <p class="subtitle">{{ manifest.subtitle }}</p>
    <AppNav />
  </header>

  <div class="toc">
    <h2>{{ manifest.tocTitle }}</h2>
    <TableOfContents :items="data.toc" />
  </div>

  <main id="content-area">
    <template v-for="chapter in data.chapters" :key="chapter.id">
      <article :id="chapter.id">
        <BookmarkButton
          :knowledge-id="knowledgeId"
          :section-id="chapter.id"
          :section-title="chapter.title || chapter.id"
        />
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
  <MobileToolbar :highlight-selection="highlightSelection" />
  <ToTopButton />
</template>

<script setup lang="ts">
import { computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHighlightsStore } from '@/stores/highlights'
import { useBookmarksStore } from '@/stores/bookmarks'
import { useHighlightToolbar } from '@/composables/useHighlightToolbar'
import { useContentCatalog } from '@/composables/useContentCatalog'
import type { ChapterData, KnowledgeManifest } from '@/types'
import AppNav from '@/components/layout/AppNav.vue'
import TableOfContents from '@/components/toc/TableOfContents.vue'
import ContentRenderer from '@/components/content/ContentRenderer.vue'
import BadgeList from '@/components/content/BadgeList.vue'
import HighlightToolbar from '@/components/ui/HighlightToolbar.vue'
import BookmarkButton from '@/components/ui/BookmarkButton.vue'
import MobileToolbar from '@/components/ui/MobileToolbar.vue'
import ToTopButton from '@/components/ui/ToTopButton.vue'

const route = useRoute()
const store = useHighlightsStore()
const bookmarks = useBookmarksStore()
const { findById, getChapterData } = useContentCatalog()
const {
  show: toolbarShow,
  position: toolbarPosition,
  applyHighlight,
  removeFromSelection,
  restoreHighlights,
  highlightSelection,
} = useHighlightToolbar()

const knowledgeId = computed(() => route.meta.knowledgeId as string)
const manifest = computed<KnowledgeManifest>(() => {
  const k = findById(knowledgeId.value)
  if (!k) throw new Error(`No manifest for knowledgeId: ${knowledgeId.value}`)
  return k
})
const data = computed<ChapterData>(() => {
  const d = getChapterData(knowledgeId.value)
  if (!d) throw new Error(`No chapter data for knowledgeId: ${knowledgeId.value}`)
  return d
})

function init() {
  store.setKey(manifest.value.highlightKey)
  bookmarks.load()
  nextTick(() => {
    restoreHighlights()
  })
}

onMounted(init)
watch(() => route.name, init)
</script>
