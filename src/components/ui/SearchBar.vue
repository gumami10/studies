<template>
  <div ref="rootRef" class="search-bar" :class="{ 'search-bar-open': open }">
    <div class="search-bar-input-wrap">
      <i class="pi pi-search search-bar-icon" aria-hidden="true" />
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        class="search-bar-input"
        :placeholder="props.placeholder"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        :aria-expanded="open && query.length > 0"
        aria-controls="search-bar-results"
        @keydown="onKeydown"
        @focus="onFocus"
        @input="onInput"
      />
      <kbd v-if="!query" class="search-bar-kbd" aria-hidden="true">/</kbd>
      <button
        v-else
        type="button"
        class="search-bar-clear"
        aria-label="Clear search"
        @click="clear"
      >
        <i class="pi pi-times" aria-hidden="true" />
      </button>
    </div>

    <div
      v-if="open && (query.length > 0 || isMac)"
      id="search-bar-results"
      class="search-bar-panel"
      role="listbox"
    >
      <p v-if="!query" class="search-bar-hint">Type to search chapters, sections, and content.</p>
      <p v-else-if="!results.length" class="search-bar-hint">
        No matches for &ldquo;{{ query }}&rdquo;.
      </p>
      <ol v-else class="search-bar-list">
        <li v-for="(r, i) in results" :key="r.id">
          <button
            type="button"
            role="option"
            :aria-selected="i === activeIndex"
            :title="resultTooltip(r)"
            class="search-bar-result"
            :class="[
              `search-bar-result-${r.tier}`,
              { 'search-bar-result-active': i === activeIndex },
            ]"
            @click="goTo(r)"
            @mouseenter="activeIndex = i"
          >
            <span class="search-bar-tier" :class="`search-bar-tier-${r.tier}`">{{
              tierLabel(r.tier)
            }}</span>
            <span class="search-bar-text">
              <!-- eslint-disable vue/no-v-html -->
              <span class="search-bar-label" v-html="labelHtml(r)" />
              <span v-if="r.sectionTitle && r.tier !== 'section'" class="search-bar-sub">
                <span class="search-bar-sub-sep" aria-hidden="true">›</span>
                <span v-html="highlight(r.sectionTitle)" />
              </span>
              <!-- eslint-enable vue/no-v-html -->
            </span>
            <span class="search-bar-source">{{ r.knowledgeTitle }}</span>
          </button>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchIndex } from '@/composables/useSearchIndex'
import { scrollToTopForElement } from '@/utils/scrollPosition'
import type { SearchResult, SearchTier } from '@/types'

const props = withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  { placeholder: 'Search…' },
)

const router = useRouter()
const { search } = useSearchIndex()

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const open = ref(false)
const activeIndex = ref(0)
const isMac = ref(false)

function makeDebouncedRef<T>(source: Ref<T>, ms: number): Ref<T> {
  const out = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null
  watch(
    source,
    (v) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        out.value = v
      }, ms)
    },
    { flush: 'sync' },
  )
  return out
}

const debouncedQuery = makeDebouncedRef(query, 150)

const results = computed<SearchResult[]>(() => {
  if (!debouncedQuery.value.trim()) return []
  return search(debouncedQuery.value)
})

watch(query, () => {
  activeIndex.value = 0
})

watch(results, () => {
  if (activeIndex.value >= results.value.length) {
    activeIndex.value = Math.max(0, results.value.length - 1)
  }
})

const TIER_LABELS: Record<SearchTier, string> = {
  chapter: 'Chapter',
  section: 'Section',
  content: 'Mention',
}

function tierLabel(t: SearchTier): string {
  return TIER_LABELS[t]
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[c] ?? c
  })
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlight(text: string | null | undefined): string {
  const safe = escapeHtml((text ?? '').trim())
  const q = debouncedQuery.value.trim()
  if (!q) return safe
  return safe.replace(new RegExp(`(${escapeRe(q)})`, 'gi'), '<mark>$1</mark>')
}

function labelHtml(r: SearchResult): string {
  if (r.tier === 'content') return highlight(r.snippet)
  if (r.tier === 'section') return highlight(r.sectionTitle)
  return highlight(r.chapterTitle)
}

function resultTooltip(r: SearchResult): string {
  const primary =
    r.tier === 'content'
      ? r.snippet
      : r.tier === 'section'
        ? (r.sectionTitle ?? r.chapterTitle)
        : r.chapterTitle
  const parts = [primary]
  if (r.tier === 'content' && r.sectionTitle) parts.push(r.sectionTitle)
  parts.push(r.knowledgeTitle)
  return parts.join(' — ')
}

function onInput(): void {
  open.value = true
}

function onFocus(): void {
  open.value = true
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    if (open.value) {
      open.value = false
    } else if (query.value) {
      clear()
    } else {
      inputRef.value?.blur()
    }
    e.preventDefault()
    return
  }

  if (!open.value && (e.key === 'ArrowDown' || e.key === 'Enter')) {
    open.value = true
    return
  }

  if (e.key === 'ArrowDown') {
    if (results.value.length === 0) return
    activeIndex.value = (activeIndex.value + 1) % results.value.length
    e.preventDefault()
    return
  }

  if (e.key === 'ArrowUp') {
    if (results.value.length === 0) return
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
    e.preventDefault()
    return
  }

  if (e.key === 'Enter') {
    const target = results.value[activeIndex.value]
    if (target) {
      goTo(target)
      e.preventDefault()
    }
    return
  }
}

function clear(): void {
  query.value = ''
  activeIndex.value = 0
  inputRef.value?.focus()
}

async function goTo(r: SearchResult): Promise<void> {
  open.value = false
  const to = r.sectionId ? `${r.knowledgePath}#${r.sectionId}` : r.knowledgePath
  query.value = ''
  activeIndex.value = 0
  try {
    await router.push(to)
  } catch {
    return
  }
  await nextTick()
  if (r.sectionId) {
    const el = document.getElementById(r.sectionId)
    if (el) {
      window.scrollTo({ top: scrollToTopForElement(el), behavior: 'smooth' })
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function onDocumentMouseDown(e: MouseEvent): void {
  if (!open.value) return
  const root = rootRef.value
  if (root && e.target instanceof Node && !root.contains(e.target)) {
    open.value = false
  }
}

function onGlobalKeydown(e: KeyboardEvent): void {
  const target = e.target as HTMLElement | null
  const inField =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target?.isContentEditable

  if (e.key === '/' && !inField) {
    e.preventDefault()
    inputRef.value?.focus()
    open.value = true
    return
  }

  const isMod = isMac.value ? e.metaKey : e.ctrlKey
  if (isMod && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
    inputRef.value?.select()
    open.value = true
  }
}

onMounted(() => {
  isMac.value = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  document.addEventListener('mousedown', onDocumentMouseDown)
  document.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown)
  document.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
}

.search-bar-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.5rem;
  background: var(--p-surface-800);
  border: 1px solid var(--p-surface-700);
  border-radius: 6px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.search-bar-open .search-bar-input-wrap {
  border-color: var(--p-primary-400);
}

.search-bar-icon {
  color: var(--p-surface-400);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.search-bar-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--p-surface-100);
  font-size: 0.9rem;
  padding: 0.15rem 0;
}

.search-bar-input::placeholder {
  color: var(--p-surface-400);
}

.search-bar-input::-webkit-search-cancel-button {
  display: none;
}

.search-bar-kbd {
  font-family: inherit;
  font-size: 0.7rem;
  color: var(--p-surface-400);
  background: var(--p-surface-700);
  border: 1px solid var(--p-surface-600);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  line-height: 1.2;
  flex-shrink: 0;
}

.search-bar-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  color: var(--p-surface-400);
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.search-bar-clear:hover,
.search-bar-clear:focus-visible {
  color: var(--p-surface-100);
  background: var(--p-surface-700);
  outline: none;
}

.search-bar-panel {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 60vh;
  overflow-y: auto;
  background: var(--p-surface-900);
  border: 1px solid var(--p-surface-700);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  padding: 0.35rem;
}

.search-bar-hint {
  margin: 0;
  padding: 0.75rem 0.5rem;
  color: var(--p-surface-400);
  font-size: 0.85rem;
  text-align: center;
}

.search-bar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.search-bar-result {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.55rem;
  background: transparent;
  border: 0;
  border-radius: 5px;
  text-align: left;
  cursor: pointer;
  color: var(--p-surface-100);
  font-size: 0.85rem;
  transition: background 0.1s ease;
}

.search-bar-result:hover,
.search-bar-result-active {
  background: var(--p-surface-800);
}

.search-bar-result:focus-visible {
  outline: 2px solid var(--p-primary-400);
  outline-offset: -2px;
}

.search-bar-tier {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--p-surface-700);
  color: var(--p-surface-300);
  white-space: nowrap;
  flex-shrink: 0;
}

.search-bar-tier-chapter {
  background: var(--p-primary-900);
  color: var(--p-primary-200);
}

.search-bar-tier-section {
  background: var(--p-surface-700);
  color: var(--p-surface-200);
}

.search-bar-tier-content {
  background: var(--p-surface-800);
  color: var(--p-surface-400);
}

.search-bar-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.search-bar-label {
  color: var(--p-surface-100);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-bar-label :deep(mark) {
  background: var(--p-primary-400);
  color: var(--p-surface-900);
  padding: 0 0.1rem;
  border-radius: 2px;
}

.search-bar-sub {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--p-surface-400);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-bar-sub :deep(mark) {
  background: transparent;
  color: var(--p-primary-300);
}

.search-bar-sub-sep {
  color: var(--p-surface-500);
}

.search-bar-source {
  font-size: 0.7rem;
  color: var(--p-surface-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  max-width: 7rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
