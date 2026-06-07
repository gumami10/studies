<template>
  <header class="page-header">
    <div class="page-header-row">
      <div class="page-header-text">
        <h1>My Study Place</h1>
        <p class="subtitle">Your saved highlights and reading progress</p>
      </div>
      <SettingsButton />
    </div>
    <AppNav />
  </header>

  <main>
    <!-- Starred Sections -->
    <section class="page-section">
      <h2 class="section-heading">
        <i class="pi pi-star-fill section-icon starred-icon"></i>
        Starred Sections
      </h2>
      <EmptyState
        v-if="store.starredCount === 0"
        icon="pi pi-star"
        title="No starred sections yet"
        description="Click the star icon next to any section while studying to save it here."
      />
      <div v-else class="card-grid">
        <div
          v-for="item in sortedStars"
          :key="item.id"
          class="placemark-card"
          role="button"
          tabindex="0"
          @click="openStarDrawer(item)"
          @keydown.enter="openStarDrawer(item)"
        >
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">{{ item.source }}</div>
        </div>
      </div>
    </section>

    <!-- Where You Left Off -->
    <section class="page-section">
      <h2 class="section-heading">
        <i class="pi pi-bookmark-fill section-icon bookmark-icon"></i>
        Where You Left Off
      </h2>
      <EmptyState
        v-if="combinedBookmarks.length === 0"
        icon="pi pi-bookmark"
        title="No bookmarks yet"
        description="Bookmark a chapter or keep reading to track your progress automatically."
      />
      <div v-else class="card-grid">
        <div
          v-for="item in combinedBookmarks"
          :key="item.id"
          class="placemark-card"
          role="button"
          tabindex="0"
          @click="openBookmarkDrawer(item)"
          @keydown.enter="openBookmarkDrawer(item)"
        >
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">{{ getSourceLabel(item) }}</div>
          <div v-if="isAutoBookmark(item)" class="card-badge">Auto</div>
        </div>
      </div>
    </section>
  </main>

  <!-- Star Drawer -->
  <Drawer
    v-model:visible="starDrawerVisible"
    position="right"
    class="placemark-drawer"
    :header="selectedStar?.title"
    style="width: 45vw; max-width: 700px"
  >
    <div v-if="selectedStar" class="drawer-body">
      <!-- eslint-disable vue/no-v-html -->
      <div class="drawer-content" v-html="selectedStar.html"></div>
      <!-- eslint-enable vue/no-v-html -->
      <div class="drawer-actions">
        <Button
          label="Unstar"
          icon="pi pi-star-fill"
          severity="secondary"
          @click="unstar(selectedStar)"
        />
        <Button label="Go to Study" icon="pi pi-arrow-right" @click="goToStudy(selectedStar)" />
      </div>
    </div>
  </Drawer>

  <!-- Bookmark Drawer -->
  <Drawer
    v-model:visible="bookmarkDrawerVisible"
    position="right"
    class="placemark-drawer"
    :header="selectedBookmark?.title"
    style="width: 45vw; max-width: 700px"
  >
    <div v-if="selectedBookmark" class="drawer-body">
      <div class="drawer-content">
        <div v-if="selectedBookmark.html">
          <!-- eslint-disable vue/no-v-html -->
          <div v-html="selectedBookmark.html"></div>
          <!-- eslint-enable vue/no-v-html -->
        </div>
        <div v-else-if="bookmarkBlocks.length">
          <ContentRenderer :blocks="bookmarkBlocks" :knowledge-id="selectedBookmark.knowledgeId" />
        </div>
        <div v-else class="drawer-empty">
          <p>Content preview not available.</p>
        </div>
      </div>
      <div class="drawer-actions">
        <Button
          label="Remove Bookmark"
          icon="pi pi-bookmark-fill"
          severity="secondary"
          @click="removeBookmark(selectedBookmark)"
        />
        <Button label="Go to Study" icon="pi pi-arrow-right" @click="goToStudy(selectedBookmark)" />
      </div>
    </div>
  </Drawer>

  <ToTopButton />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlacemarksStore } from '@/stores/placemarks'
import { useContentCatalog } from '@/composables/useContentCatalog'
import type { Placemark } from '@/types'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import AppNav from '@/components/layout/AppNav.vue'
import SettingsButton from '@/components/ui/SettingsButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ToTopButton from '@/components/ui/ToTopButton.vue'
import ContentRenderer from '@/components/content/ContentRenderer.vue'

const store = usePlacemarksStore()
const { findById, getChapterData, getLabel } = useContentCatalog()
const router = useRouter()

const selectedStar = ref<Placemark | null>(null)
const starDrawerVisible = ref(false)

const selectedBookmark = ref<Placemark | null>(null)
const bookmarkDrawerVisible = ref(false)

const sortedStars = computed(() =>
  Object.values(store.stars).sort((a, b) => b.timestamp - a.timestamp),
)

const combinedBookmarks = computed(() => {
  const manualIds = new Set(store.bookmarks.map((b) => b.knowledgeId))
  const autoList = Object.values(store.autoBookmarks).filter((b) => !manualIds.has(b.knowledgeId))
  return [...store.bookmarks, ...autoList].sort((a, b) => b.timestamp - a.timestamp)
})

const bookmarkBlocks = computed(() => {
  if (!selectedBookmark.value) return []
  const data = getChapterData(selectedBookmark.value.knowledgeId)
  if (!data) return []
  const chapter = data.chapters.find((c) => c.id === selectedBookmark.value!.sectionId)
  return chapter?.content ?? []
})

function openStarDrawer(item: Placemark) {
  selectedStar.value = item
  starDrawerVisible.value = true
}

function openBookmarkDrawer(item: Placemark) {
  selectedBookmark.value = item
  bookmarkDrawerVisible.value = true
}

function unstar(item: Placemark) {
  store.toggleStar(item.id, item.knowledgeId, item.sectionId, item.title, item.source, item.html)
  starDrawerVisible.value = false
}

function removeBookmark(item: Placemark) {
  store.clearBookmark(item.knowledgeId, item.sectionId)
  bookmarkDrawerVisible.value = false
}

function goToStudy(item: Placemark) {
  const manifest = findById(item.knowledgeId)
  if (!manifest) return
  starDrawerVisible.value = false
  bookmarkDrawerVisible.value = false
  router.push({ path: manifest.path, hash: '#' + item.sectionId })
}

function getSourceLabel(item: Placemark): string {
  return getLabel(item.knowledgeId) || item.source || 'Unknown'
}

function isAutoBookmark(item: Placemark): boolean {
  return store.isAutoBookmarked(item.knowledgeId, item.sectionId)
}

onMounted(() => {
  store.load()
})
</script>

<style scoped>
.page-section {
  margin-bottom: 3rem;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-surface-0);
  margin: 0 0 1.25rem;
}

.section-icon {
  font-size: 1.1rem;
}

.starred-icon {
  color: var(--p-amber-400);
}

.bookmark-icon {
  color: var(--p-primary-300);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.placemark-card {
  background: var(--p-surface-900);
  border: 1px solid var(--p-surface-800);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
}

.placemark-card:hover {
  border-color: var(--p-primary-500);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--p-primary-500) 25%, transparent);
}

.placemark-card:focus-visible {
  outline: 2px solid var(--p-primary-400);
  outline-offset: 2px;
}

.card-title {
  font-weight: 600;
  color: var(--p-primary-300);
  margin-bottom: 0.4rem;
  line-height: 1.3;
}

.card-meta {
  font-size: 0.85rem;
  color: var(--p-surface-400);
}

.card-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--p-surface-800);
  color: var(--p-amber-400);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--p-surface-700);
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.drawer-content {
  line-height: 1.65;
}

.drawer-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-800);
}

.drawer-empty {
  color: var(--p-surface-400);
  text-align: center;
  padding: 2rem 0;
}
</style>
