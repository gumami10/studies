<template>
  <p class="error">Failed to load content: {{ message }}</p>
</template>

<script setup lang="ts">
defineProps({ message: { type: String, required: true } })
</script>
