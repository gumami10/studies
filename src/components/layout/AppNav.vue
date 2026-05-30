<template>
  <nav v-if="links.length" class="top-nav">
    <template v-for="(link, i) in links" :key="link.to">
      <span v-if="i > 0"> · </span>
      <router-link :to="link.to">{{ link.label }}</router-link>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStarredStore } from '@/stores/starred'

const route = useRoute()
const store = useStarredStore()

const chapters = [
  { to: '/chapters', label: 'Chapters 1–6' },
  { to: '/metrics', label: 'Quality Metrics' },
  { to: '/tae', label: 'TAE' },
]

const links = computed(() => {
  const result = []
  if (route.name !== 'home') result.push({ to: '/', label: 'Home' })
  if (route.name !== 'starred') {
    result.push({ to: '/starred', label: `Starred Sections (${store.starredCount})` })
  }
  chapters.forEach(ch => {
    if (ch.to !== route.path) result.push(ch)
  })
  return result
})
</script>
