<template>
  <router-link to="/settings" class="settings-btn" title="Settings" aria-label="Settings">
    <i class="pi pi-cog"></i>
  </router-link>
</template>

<style scoped>
.settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  color: var(--p-surface-400);
  font-size: 1.15rem;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.settings-btn:hover {
  background: var(--p-surface-800);
  color: var(--p-primary-300);
}
</style>
