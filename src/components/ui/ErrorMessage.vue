<template>
  <p class="error">Failed to load content: {{ message }}</p>
</template>

<script setup>
defineProps({ message: { type: String, required: true } })
</script>
