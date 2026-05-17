<template>
  <router-link :to="to" class="chapter-card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </router-link>
</template>

<script setup>
defineProps({
  to: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>
