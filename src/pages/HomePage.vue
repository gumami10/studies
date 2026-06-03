<template>
  <header class="landing-hero">
    <h1>QA Hero</h1>
    <p class="landing-subtitle">Interactive study guide for ISTQB Advanced Level certifications</p>
  </header>

  <main>
    <div class="chapter-grid">
      <ChapterCard
        v-for="k in list"
        :key="k.id"
        :to="k.path"
        :title="k.navLabel"
        :description="k.homeDescription"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import ChapterCard from '@/components/ui/ChapterCard.vue'
import { useContentCatalog } from '@/composables/useContentCatalog'

const { list } = useContentCatalog()
</script>
