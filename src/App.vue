<template>
  <div class="container">
    <router-view />
  </div>
  <ToTopButton />
</template>

<script setup lang="ts">
import ToTopButton from '@/components/ui/ToTopButton.vue'
</script>
