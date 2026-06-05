<template>
  <router-link :to="to" class="chapter-card">
    <div class="chapter-card-inner">
      <h2 class="chapter-card-title">{{ title }}</h2>
      <p v-if="description" class="chapter-card-desc">{{ description }}</p>
      <span class="view-more">
        View more
        <i class="pi pi-arrow-right" />
      </span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps({
  to: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<style scoped>
.chapter-card {
  background: var(--p-surface-900);
  border: 1px solid var(--p-surface-800);
  border-radius: 14px;
  padding: 0;
  text-decoration: none;
  color: var(--p-surface-0);
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.chapter-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--p-primary-500), var(--p-primary-300));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chapter-card:hover {
  border-color: var(--p-primary-500);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px -10px color-mix(in srgb, var(--p-primary-500) 35%, transparent);
}

.chapter-card:hover::before {
  opacity: 1;
}

.chapter-card-inner {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.chapter-card-title {
  margin: 0;
  font-size: 1.15rem;
  color: var(--p-primary-300);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.chapter-card-desc {
  margin: 0;
  color: var(--p-surface-300);
  font-size: 0.92rem;
  line-height: 1.5;
}
</style>
