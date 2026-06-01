<template>
  <header>
    <h1>Starred Sections</h1>
    <p class="subtitle">Your saved study highlights from all chapters</p>
    <AppNav />
  </header>

  <main ref="containerRef">
    <EmptyState v-if="store.starredCount === 0" />
    <template v-else>
      <div v-for="(items, source) in store.bySource" :key="source" class="source-group">
        <div class="source-badge">From: {{ source }}</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-for="item in items" :id="item.id" :key="item.id" ref="itemRefs" v-html="item.html" />
      </div>
    </template>
  </main>

  <ToTopButton />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useStarredStore } from '@/stores/starred'
import AppNav from '@/components/layout/AppNav.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ToTopButton from '@/components/ui/ToTopButton.vue'

const store = useStarredStore()
const containerRef = ref<HTMLElement | null>(null)

function attachStarButtons() {
  nextTick(() => {
    const container = containerRef.value
    if (!container) return

    const sections = container.querySelectorAll<HTMLElement>('[id]')
    sections.forEach((section: HTMLElement) => {
      if (section.querySelector('.star-btn')) return

      const heading = section.querySelector<HTMLElement>('h2, h3, h4')
      const btn = document.createElement('button')
      btn.className = 'star-btn starred'
      btn.innerHTML = '★'
      btn.title = 'Unstar this section'
      btn.type = 'button'

      btn.addEventListener('click', () => {
        store.toggle(section.id, '', '', '')
        section.style.transition = 'opacity .35s ease, transform .35s ease'
        section.style.opacity = '0'
        section.style.transform = 'scale(.98)'
        setTimeout(() => section.remove(), 350)
      })

      if (heading) {
        heading.style.overflow = 'hidden'
        heading.appendChild(btn)
      } else {
        section.insertBefore(btn, section.firstChild)
      }
    })
  })
}

onMounted(() => {
  store.load()
  attachStarButtons()
})

watch(
  () => store.items,
  () => {
    attachStarButtons()
  },
  { deep: true },
)
</script>
