<template>
  <header>
    <h1>ISTQB CTAL-AT Study Guide</h1>
    <p class="subtitle">Advanced Level Agile Tester (v2.0) — Chapter-by-Chapter Review</p>
    <AppNav />
  </header>

  <div class="toc">
    <h2>Syllabus Chapters</h2>
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

  <AppFooter>{{ data.footerText }}</AppFooter>
  <HighlightToolbar :show="highlight.show" :position="highlight.position" @apply="highlight.applyHighlight" @remove="highlight.removeFromSelection" />
  <ToTopButton />
</template>

<script setup>
import { onMounted } from 'vue'
import chaptersData from '../../data/chapters-1-6.js'
import { useHighlightsStore } from '@/stores/highlights'
import { useHighlightToolbar } from '@/composables/useHighlightToolbar'
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import TableOfContents from '@/components/toc/TableOfContents.vue'
import ContentRenderer from '@/components/content/ContentRenderer.vue'
import BadgeList from '@/components/content/BadgeList.vue'
import HighlightToolbar from '@/components/ui/HighlightToolbar.vue'
import ToTopButton from '@/components/ui/ToTopButton.vue'

const data = chaptersData
const store = useHighlightsStore()
const highlight = useHighlightToolbar()

onMounted(() => {
  store.setKey('ctal-at-highlights-ch1')
  highlight.restoreHighlights()
})
</script>
