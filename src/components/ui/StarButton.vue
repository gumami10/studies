<template>
  <button
    class="star-btn"
    :class="{ starred }"
    type="button"
    :title="starred ? 'Unstar this section' : 'Star this section'"
    :aria-label="starred ? 'Unstar this section' : 'Star this section'"
    @click="toggle"
    v-text="starred ? '★' : '☆'"
  />
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStarredStore } from '@/stores/starred'

const props = defineProps({
  sectionId: { type: String, required: true },
  sectionTitle: { type: String, default: 'Untitled' }
})

const store = useStarredStore()
const route = useRoute()
const starred = ref(false)

onMounted(() => {
  store.load()
  starred.value = store.isStarred(props.sectionId)
})

function toggle() {
  const section = document.getElementById(props.sectionId)
  let html = ''
  if (section && !store.isStarred(props.sectionId)) {
    const clone = section.cloneNode(true)
    const btn = clone.querySelector('.star-btn')
    if (btn) btn.remove()
    html = clone.outerHTML
  }

  const source = route.name === 'chapters' ? 'Chapters 1–6'
    : route.name === 'metrics' ? 'Quality Metrics'
    : document.title

  store.toggle(props.sectionId, props.sectionTitle, source, html)
  starred.value = store.isStarred(props.sectionId)
}
</script>
