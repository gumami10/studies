<template>
  <nav v-if="links.length" class="top-nav">
    <template v-for="(link, i) in links" :key="link.to">
      <span v-if="i > 0"> · </span>
      <router-link :to="link.to">{{ link.label }}</router-link>
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
  list.forEach((k) => {
    if (k.path !== route.path) result.push({ to: k.path, label: k.navLabel })
  })
  return result
})
</script>
