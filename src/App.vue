<template>
  <a class="skip-link" href="#content-area">Skip to content</a>
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

.skip-link {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  z-index: 1000;
  padding: 0.5rem 0.75rem;
  background: var(--p-primary-500);
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  transform: translateY(-200%);
  transition: transform 0.15s ease-in-out;
}

.skip-link:focus,
.skip-link:focus-visible {
  transform: translateY(0);
  outline: 2px solid var(--p-primary-300);
}
</style>
