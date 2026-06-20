<template>
  <header class="page-header">
    <div class="page-header-row">
      <div class="page-header-text">
        <h1>{{ manifest.title }}</h1>
        <p class="subtitle">{{ manifest.subtitle }}</p>
      </div>
      <SettingsButton />
    </div>
  </header>

  <div class="toc">
    <h2>{{ manifest.tocTitle }}</h2>
    <TableOfContents :items="data.toc" />
  </div>

  <main id="content-area">
    <template v-for="chapter in data.chapters" :key="chapter.id">
      <article :id="chapter.id" class="chapter">
        <div class="section-actions">
          <BookmarkButton
            :knowledge-id="knowledgeId"
            :section-id="chapter.id"
            :section-title="chapter.title || chapter.id"
          />
        </div>
        <BadgeList :block="chapter.meta" />
        <h2 v-if="chapter.title">{{ chapter.title }}</h2>
        <ContentRenderer :blocks="chapter.content" :knowledge-id="knowledgeId" />
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
import { usePlacemarksStore } from '@/stores/placemarks'
import { useHighlightToolbar } from '@/composables/useHighlightToolbar'
import { useContentCatalog } from '@/composables/useContentCatalog'
import { useChapterTracker } from '@/composables/useChapterTracker'
import { useSettingsStore } from '@/stores/settings'
import type { ChapterData, KnowledgeManifest } from '@/types'
import TableOfContents from '@/components/toc/TableOfContents.vue'
import ContentRenderer from '@/components/content/ContentRenderer.vue'
import BadgeList from '@/components/content/BadgeList.vue'
import HighlightToolbar from '@/components/ui/HighlightToolbar.vue'
import BookmarkButton from '@/components/ui/BookmarkButton.vue'
import MobileToolbar from '@/components/ui/MobileToolbar.vue'
import ToTopButton from '@/components/ui/ToTopButton.vue'
import SettingsButton from '@/components/ui/SettingsButton.vue'

const route = useRoute()
const store = useHighlightsStore()
const placemarks = usePlacemarksStore()
const settings = useSettingsStore()
const { findById, getChapterData } = useContentCatalog()
const { currentChapterId } = useChapterTracker()
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
  settings.load()
  placemarks.load()
  nextTick(() => {
    restoreHighlights()
  })
}

onMounted(init)
watch(() => route.name, init)

watch(currentChapterId, (chapterId) => {
  if (!chapterId || !settings.autoBookmark) return
  // Do not auto-bookmark if a manual bookmark already exists for this study
  if (placemarks.getLatestBookmark(knowledgeId.value)) return
  const chapter = data.value.chapters.find((c) => c.id === chapterId)
  if (!chapter) return
  placemarks.setAutoBookmark(knowledgeId.value, chapterId, chapter.title || chapterId)
})
</script>
