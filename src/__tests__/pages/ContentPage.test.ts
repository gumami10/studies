import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ContentPage from '@/pages/ContentPage.vue'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => ({
      name: 'ctal-at',
      meta: { knowledgeId: 'ctal-at' },
    }),
  }
})

vi.mock('@/composables/useSectionTracker', () => ({
  useSectionTracker: () => ({
    currentSectionId: '',
    currentSectionTitle: '',
  }),
}))

function visibleChapterRect(index: number): DOMRect {
  const top = index === 0 ? 100 : 1000
  return {
    top,
    left: 0,
    right: 0,
    bottom: top + 500,
    width: 800,
    height: 500,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

describe('ContentPage auto-bookmarking', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('loads persisted settings before auto-bookmarking the visible chapter', async () => {
    localStorage.setItem('ctal_at_settings', JSON.stringify({ autoBookmark: true }))

    mount(ContentPage, {
      attachTo: document.body,
      global: {
        plugins: [createPinia()],
        stubs: {
          AppNav: true,
          TableOfContents: true,
          ContentRenderer: true,
          BadgeList: true,
          BookmarkButton: true,
          StarButton: true,
          HighlightToolbar: true,
          MobileToolbar: true,
          ToTopButton: true,
          SettingsButton: true,
        },
      },
    })

    document.querySelectorAll<HTMLElement>('article.chapter[id]').forEach((chapter, index) => {
      chapter.getBoundingClientRect = () => visibleChapterRect(index)
    })

    vi.advanceTimersByTime(150)
    await nextTick()

    const saved = JSON.parse(localStorage.getItem('ctal_at_auto_bookmarks') ?? '{}')
    expect(saved['ctal-at']).toMatchObject({
      knowledgeId: 'ctal-at',
      sectionId: 'ch1',
      title: 'Test Strategy and Test Approach Challenges',
    })
  })
})
