<template>
  <div class="app-shell">
    <AppDrawer />
    <div class="app-main">
      <div class="container">
        <router-view />
      </div>
      <AppFooter />
    </div>
  </div>
  <StorageConsentBanner />
  <ToTopButton />
</template>

<script setup lang="ts">
import ToTopButton from '@/components/ui/ToTopButton.vue'
import StorageConsentBanner from '@/components/ui/StorageConsentBanner.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppDrawer from '@/components/layout/AppDrawer.vue'
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  align-items: stretch;
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app-main > .container {
  flex: 1;
}
</style>
