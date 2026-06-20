<template>
  <button
    v-show="isMobile && !isOpen"
    type="button"
    class="drawer-floating-toggle"
    aria-label="Open menu"
    aria-controls="app-drawer"
    @click="open"
  >
    <i class="pi pi-bars" aria-hidden="true" />
  </button>

  <Transition name="backdrop">
    <div v-if="isMobile && isOpen" class="drawer-backdrop" aria-hidden="true" @click="close" />
  </Transition>

  <aside
    id="app-drawer"
    class="drawer"
    :class="drawerClasses"
    :aria-hidden="isMobile && !isOpen ? 'true' : 'false'"
    :inert="isMobile && !isOpen"
  >
    <header class="drawer-header">
      <button
        type="button"
        class="drawer-toggle"
        :aria-label="toggleAriaLabel"
        :aria-expanded="ariaExpanded"
        aria-controls="app-drawer"
        @click="toggle"
      >
        <i :class="toggleIconClass" aria-hidden="true" />
      </button>
      <span v-if="!isCollapsed" class="drawer-title">QA Hero</span>
    </header>

    <nav v-if="!isCollapsed" class="drawer-nav" aria-label="Primary">
      <ul class="drawer-list drawer-utilities">
        <li v-for="link in utilityLinks" :key="link.to">
          <router-link
            :to="link.to"
            class="drawer-link"
            active-class="drawer-link-active"
            :exact-active-class="'drawer-link-exact-active'"
          >
            <i v-if="link.icon" :class="link.icon" class="drawer-link-icon" aria-hidden="true" />
            <span class="drawer-link-label">{{ link.label }}</span>
          </router-link>
        </li>
      </ul>

      <template v-for="group in sectionGroups" :key="group.key">
        <h3 v-if="group.items.length" class="drawer-section-label">{{ group.label }}</h3>
        <ul v-if="group.items.length" class="drawer-list">
          <li v-for="link in group.items" :key="link.to">
            <router-link :to="link.to" class="drawer-link" active-class="drawer-link-active">
              <span class="drawer-link-label">{{ link.label }}</span>
            </router-link>
          </li>
        </ul>
      </template>
    </nav>

    <nav v-else class="drawer-rail" aria-label="Primary">
      <ul class="drawer-rail-list">
        <li v-for="link in utilityLinks" :key="link.to">
          <router-link
            :to="link.to"
            class="drawer-rail-link"
            :title="link.label"
            :aria-label="link.label"
            active-class="drawer-rail-link-active"
            :exact-active-class="'drawer-rail-link-exact-active'"
          >
            <i v-if="link.icon" :class="link.icon" aria-hidden="true" />
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useContentCatalog } from '@/composables/useContentCatalog'
import type { KnowledgeCategory } from '@/types'

interface NavLink {
  to: string
  label: string
  icon?: string
}

interface NavGroup {
  key: string
  label: string
  items: NavLink[]
}

const MOBILE_QUERY = '(max-width: 767px)'

const route = useRoute()
const { list } = useContentCatalog()
const isMobile = useMediaQuery(MOBILE_QUERY)

const isOpen = ref(true)

const SECTION_LABELS: Record<KnowledgeCategory, string> = {
  personal: 'Personal',
  qa: 'Quality Assurance',
}

const SECTION_ORDER: KnowledgeCategory[] = ['personal', 'qa']

const isCollapsed = computed(() => !isMobile.value && !isOpen.value)

const drawerClasses = computed(() => ({
  'drawer-mobile': isMobile.value,
  'drawer-mobile-open': isMobile.value && isOpen.value,
  'drawer-collapsed': isCollapsed.value,
}))

const toggleAriaLabel = computed(() => {
  if (isMobile.value) return isOpen.value ? 'Close menu' : 'Open menu'
  return isOpen.value ? 'Collapse menu' : 'Expand menu'
})

const ariaExpanded = computed(() => (isMobile.value ? isOpen.value : true))

const toggleIconClass = computed(() => {
  if (isMobile.value) return isOpen.value ? 'pi pi-times' : 'pi pi-bars'
  return isOpen.value ? 'pi pi-chevron-left' : 'pi pi-chevron-right'
})

const utilityLinks = computed<NavLink[]>(() => {
  const links: NavLink[] = []
  if (route.name !== 'home') links.push({ to: '/', label: 'Home', icon: 'pi pi-home' })
  if (route.name !== 'starred') {
    links.push({ to: '/starred', label: 'Starred Sections', icon: 'pi pi-star-fill' })
  }
  if (route.name !== 'settings') {
    links.push({ to: '/settings', label: 'Settings', icon: 'pi pi-cog' })
  }
  return links
})

const sectionGroups = computed<NavGroup[]>(() => {
  const groups: NavGroup[] = []
  for (const category of SECTION_ORDER) {
    const items = list
      .filter((k) => k.category === category && k.path !== route.path)
      .map<NavLink>((k) => ({ to: k.path, label: k.navLabel }))
    if (items.length) {
      groups.push({ key: category, label: SECTION_LABELS[category], items })
    }
  }
  return groups
})

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isMobile.value && isOpen.value) {
    close()
  }
}

watch(
  isMobile,
  (mobile) => {
    isOpen.value = !mobile
  },
  { immediate: true },
)

watch(
  () => route.path,
  () => {
    if (isMobile.value && isOpen.value) close()
  },
)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.drawer {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  background: var(--p-surface-900);
  border-right: 1px solid var(--p-surface-800);
  height: 100vh;
  position: sticky;
  top: 0;
  transition: width 0.2s ease;
}

.drawer-collapsed {
  width: 64px;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-800);
  min-height: 3.5rem;
}

.drawer-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--p-surface-300);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.drawer-toggle:hover,
.drawer-toggle:focus-visible {
  background: var(--p-surface-800);
  color: var(--p-primary-300);
  outline: none;
}

.drawer-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--p-surface-100);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 0.5rem 1.5rem;
}

.drawer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.drawer-utilities {
  margin-bottom: 0.5rem;
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  color: var(--p-surface-200);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  border-radius: 6px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.drawer-link:hover {
  background: var(--p-surface-800);
  color: var(--p-surface-0);
  text-decoration: none;
}

.drawer-link-active,
.drawer-link-exact-active {
  background: var(--p-surface-800);
  color: var(--p-primary-300);
}

.drawer-link-icon {
  font-size: 1rem;
  width: 1.1rem;
  text-align: center;
  flex-shrink: 0;
}

.drawer-link-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-section-label {
  margin: 1rem 0.75rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--p-surface-500);
}

.drawer-rail {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem 0;
}

.drawer-rail-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.drawer-rail-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--p-surface-300);
  text-decoration: none;
  font-size: 1.05rem;
  border-radius: 8px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.drawer-rail-link:hover {
  background: var(--p-surface-800);
  color: var(--p-primary-300);
  text-decoration: none;
}

.drawer-rail-link-active,
.drawer-rail-link-exact-active {
  background: var(--p-surface-800);
  color: var(--p-primary-300);
}

.drawer-floating-toggle {
  display: none;
}

.drawer-backdrop {
  display: none;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: none;
  }

  .drawer-mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
  }

  .drawer-collapsed {
    width: 280px;
  }

  .drawer-floating-toggle {
    display: inline-flex;
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 999;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: var(--p-surface-900);
    color: var(--p-surface-100);
    border: 1px solid var(--p-surface-700);
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.05rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }

  .drawer-floating-toggle:focus-visible {
    outline: 2px solid var(--p-primary-400);
    outline-offset: 2px;
  }

  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }
}
</style>
