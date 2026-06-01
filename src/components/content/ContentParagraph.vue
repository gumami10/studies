<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <p v-html="block.html" />
</template>

<script setup lang="ts">
defineProps({ block: { type: Object, required: true } })
</script>
