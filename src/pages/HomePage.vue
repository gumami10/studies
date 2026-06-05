<template>
  <header class="landing-hero">
    <div class="landing-hero-row">
      <div class="landing-hero-text">
        <h1>QA Hero</h1>
        <p class="landing-subtitle">
          Interactive study guide for ISTQB Advanced Level certifications
        </p>
      </div>
      <SettingsButton />
    </div>
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
import SettingsButton from '@/components/ui/SettingsButton.vue'
import { useContentCatalog } from '@/composables/useContentCatalog'

const { list } = useContentCatalog()
</script>

<style scoped>
.landing-hero-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.landing-hero-text {
  flex: 1;
  min-width: 0;
}
</style>
