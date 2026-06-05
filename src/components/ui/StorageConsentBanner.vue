<template>
  <Transition name="banner-slide">
    <div v-if="visible" class="consent-banner" role="alert" aria-live="polite">
      <i class="pi pi-shield consent-banner-icon" aria-hidden="true"></i>
      <p class="consent-banner-text">
        <strong>Privacy notice:</strong> Your highlights and starred sections are stored
        <strong>locally in your browser</strong>. This app does not collect, transmit, or store any
        personal data on external servers. No tracking, no analytics, no cookies.
      </p>
      <Button
        class="consent-dismiss"
        type="button"
        label="Got it"
        severity="primary"
        size="small"
        aria-label="Dismiss privacy notice"
        @click="dismiss"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import { storageGet, storageSet } from '@/utils/storage'

const DISMISS_KEY = 'consent-banner-dismissed'
const visible = ref(false)

onMounted(() => {
  const dismissed = storageGet<boolean>(DISMISS_KEY, false)
  if (!dismissed) {
    visible.value = true
  }
})

function dismiss() {
  visible.value = false
  storageSet(DISMISS_KEY, true)
}
</script>

<style scoped>
.consent-banner-icon {
  color: var(--p-primary-400);
  font-size: 1.4rem;
  flex-shrink: 0;
}

.consent-banner-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-surface-100);
  flex: 1;
  min-width: 0;
}
</style>
