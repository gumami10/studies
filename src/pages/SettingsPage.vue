<template>
  <header class="page-header">
    <div class="page-header-row">
      <div class="page-header-text">
        <h1>Settings</h1>
        <p class="subtitle">Configure your study experience</p>
      </div>
      <SettingsButton />
    </div>
    <AppNav />
  </header>

  <main class="settings-page">
    <div class="settings-card">
      <div class="setting-item">
        <div class="setting-info">
          <h3>Auto-bookmark</h3>
          <p class="setting-desc">
            Automatically bookmark the current chapter as you scroll through the content. The
            bookmark icon will turn yellow to indicate the auto-bookmark. You can still manually
            bookmark any chapter — manual bookmarks take priority and are shown in blue.
          </p>
        </div>
        <ToggleButton
          v-model="toggleValue"
          on-label="On"
          off-label="Off"
          class="setting-toggle"
          @change="onToggleChange"
        />
      </div>
    </div>
  </main>

  <ToTopButton />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ToggleButton from 'primevue/togglebutton'
import AppNav from '@/components/layout/AppNav.vue'
import SettingsButton from '@/components/ui/SettingsButton.vue'
import ToTopButton from '@/components/ui/ToTopButton.vue'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()
const toggleValue = ref(false)

onMounted(() => {
  store.load()
  toggleValue.value = store.autoBookmark
})

watch(
  () => store.autoBookmark,
  (val) => {
    toggleValue.value = val
  },
)

function onToggleChange() {
  store.setAutoBookmark(toggleValue.value)
}
</script>

<style scoped>
.page-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.page-header-text {
  flex: 1;
  min-width: 0;
}

.settings-card {
  background: var(--p-surface-900);
  border: 1px solid var(--p-surface-800);
  border-radius: 12px;
  padding: 1.5rem;
}

.setting-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.setting-info {
  flex: 1;
  min-width: 0;
}

.setting-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-surface-0);
}

.setting-desc {
  margin: 0;
  color: var(--p-surface-400);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 600px;
}

.setting-toggle {
  flex-shrink: 0;
}
</style>
