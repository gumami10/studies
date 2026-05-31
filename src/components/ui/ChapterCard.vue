<template>
  <router-link :to="to" class="chapter-card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <span class="view-more">
      View more
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </span>
  </router-link>
</template>

<script setup lang="ts">
defineProps({
  to: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
