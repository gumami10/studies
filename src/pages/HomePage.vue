<template>
  <header>
    <h1>ISTQB CTAL-AT Study Guide</h1>
    <p class="subtitle">Advanced Level Agile Tester (v2.0) — Chapter navigation</p>
    <AppNav />
  </header>

  <main>
    <div class="chapter-grid">
      <ChapterCard
        to="/chapters"
        title="CTAL-AT"
        description="Test Strategy, People & Teams, Test Management, Shift Left, Techniques, Automation"
      />
      <ChapterCard
        to="/metrics"
        title="Quality Metrics"
        description="Coverage, monitoring, process improvement & business-facing metrics"
      />
      <ChapterCard
        to="/tae"
        title="CTAL-TAE"
        description="Test Automation Engineering — architecture, design, and implementation"
      />
      <ChapterCard
        to="/ta"
        title="CTAL-TA"
        description="Test Analyst — test process, risk-based testing, techniques, quality characteristics, defect prevention"
      />
      <ChapterCard
        to="/code-review"
        title="Code Review Research"
        description="Analyzing review strategies across top 11 open source repositories"
      />
    </div>

    <div style="margin-top: 2rem">
      <ChapterCard
        to="/starred"
        title="Starred Sections"
        description="Review your saved study highlights"
      />
    </div>
  </main>

  <AppFooter />
</template>

<script setup lang="ts">
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ChapterCard from '@/components/ui/ChapterCard.vue'
</script>
