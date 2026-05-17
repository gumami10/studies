<template>
  <div class="meta">
    <span v-for="(badge, i) in block.badges" :key="i" class="badge">{{ badge.text }}</span>
  </div>
</template>

<script setup>
defineProps({ block: { type: Object, required: true } })
</script>
