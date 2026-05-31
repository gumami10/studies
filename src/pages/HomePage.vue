<template>
  <header class="landing-hero">
    <h1>QA Hero</h1>
    <p class="landing-subtitle">Interactive study guide for ISTQB Advanced Level certifications</p>
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
  </main>
</template>

<script setup lang="ts">
import ChapterCard from '@/components/ui/ChapterCard.vue'
</script>
