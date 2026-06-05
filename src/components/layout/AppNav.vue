<template>
  <nav v-if="links.length" class="top-nav">
    <template v-for="(link, i) in links" :key="link.to">
      <span v-if="i > 0" class="top-nav-sep">·</span>
      <router-link :to="link.to" class="top-nav-link">
        {{ link.label }}
      </router-link>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContentCatalog } from '@/composables/useContentCatalog'

const route = useRoute()
const { list } = useContentCatalog()

const links = computed(() => {
  const result: { to: string; label: string }[] = []
  if (route.name !== 'home') result.push({ to: '/', label: 'Home' })
  if (route.name !== 'starred') {
    result.push({ to: '/starred', label: 'Starred Sections' })
  }
  if (route.name !== 'settings') {
    result.push({ to: '/settings', label: 'Settings' })
  }
  list.forEach((k) => {
    if (k.path !== route.path) result.push({ to: k.path, label: k.navLabel })
  })
  return result
})
</script>

<style scoped>
.top-nav {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--p-surface-800);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.top-nav-link {
  color: var(--p-primary-400);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.top-nav-link:hover {
  color: var(--p-primary-300);
  background: var(--p-surface-800);
  text-decoration: none;
}

.top-nav-link.router-link-exact-active {
  color: var(--p-surface-0);
  background: var(--p-surface-800);
}

.top-nav-sep {
  color: var(--p-surface-600);
  user-select: none;
}
</style>
