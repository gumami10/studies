<template>
  <button
    id="to-top-btn"
    class="to-top-btn"
    :class="{ visible: showButton }"
    type="button"
    title="Back to top"
    aria-label="Back to top"
    @click="scrollToTop"
  >&#8593;</button>
</template>

<script setup>
import { useScroll } from '@/composables/useScroll'

const { showButton, scrollToTop } = useScroll()
</script>
