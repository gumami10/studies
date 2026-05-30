<template>
  <div class="container">
    <router-view />
  </div>
  <AppFooter />
  <StorageConsentBanner />
  <ToTopButton />
</template>

<script setup lang="ts">
import ToTopButton from '@/components/ui/ToTopButton.vue'
import StorageConsentBanner from '@/components/ui/StorageConsentBanner.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>
