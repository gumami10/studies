<template>
  <ol id="toc-list">
    <li v-for="item in items" :key="item.id" :class="item.status">
      <a v-if="item.status === 'active'" :href="`#${item.id}`" @click.prevent="scrollTo(item.id)">
        {{ item.label }}
      </a>
      <span v-else>{{ item.label }}</span>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { TocItem } from '@/types'

defineProps<{ items: TocItem[] }>()

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>
