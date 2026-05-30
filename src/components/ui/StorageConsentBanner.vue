<template>
  <Transition name="banner-slide">
    <div v-if="visible" class="consent-banner" role="alert" aria-live="polite">
      <div class="consent-banner-content">
        <p>
          <strong>Privacy notice:</strong> Your highlights and starred sections are stored
          <strong>locally in your browser</strong>. This app does not collect, transmit, or store
          any personal data on external servers. No tracking, no analytics, no cookies.
        </p>
      </div>
      <button
        class="consent-dismiss"
        type="button"
        aria-label="Dismiss privacy notice"
        @click="dismiss"
      >
        Got it
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
