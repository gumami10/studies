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

const route = useRoute()

const chapters = [
  { to: '/chapters', label: 'CTAL-AT' },
  { to: '/metrics', label: 'Quality Metrics' },
  { to: '/tae', label: 'TAE' },
  { to: '/ta', label: 'TA' },
  { to: '/code-review', label: 'Code Review' },
  { to: '/agile-testing', label: 'Agile Testing' },
  { to: '/more-agile-testing', label: 'More Agile Testing' },
]

const links = computed(() => {
  const result = []
  if (route.name !== 'home') result.push({ to: '/', label: 'Home' })
  if (route.name !== 'starred') {
    result.push({ to: '/starred', label: 'Starred Sections' })
  }
  chapters.forEach((ch) => {
    if (ch.to !== route.path) result.push(ch)
  })
  return result
})
</script>
