<template>
  <p v-html="block.html" />
</template>

<script setup>
defineProps({ block: { type: Object, required: true } })
</script>
