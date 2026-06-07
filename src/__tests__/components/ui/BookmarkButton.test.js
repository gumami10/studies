import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import BookmarkButton from '@/components/ui/BookmarkButton.vue'
import { usePlacemarksStore } from '@/stores/placemarks'

describe('BookmarkButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders unbookmarked icon initially', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        sectionTitle: 'Chapter 1',
      },
      global: { plugins: [pinia] },
    })
    await nextTick()
    expect(wrapper.find('.pi-bookmark').exists()).toBe(true)
    expect(wrapper.find('.bookmarked').exists()).toBe(false)
  })

  it('shows bookmarked icon when chapter is already bookmarked', async () => {
    const data = {
      'study-a': {
        id: 'study-a:chapter-1',
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        title: 'Chapter 1',
        source: '',
        timestamp: 1,
      },
    }
    localStorage.setItem('ctal_at_bookmarks', JSON.stringify(data))

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        sectionTitle: 'Chapter 1',
      },
      global: { plugins: [pinia] },
    })
    await nextTick()

    const store = usePlacemarksStore()
    expect(store.isBookmarked('study-a', 'chapter-1')).toBe(true)
    expect(wrapper.find('.pi-bookmark-fill').exists()).toBe(true)
    expect(wrapper.find('.bookmarked').exists()).toBe(true)
  })

  it('clicking sets the bookmark', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        sectionTitle: 'Chapter 1',
      },
      global: { plugins: [pinia] },
    })
    await nextTick()

    await wrapper.find('.bookmark-btn').trigger('click')
    await nextTick()

    const store = usePlacemarksStore()
    expect(store.isBookmarked('study-a', 'chapter-1')).toBe(true)
    expect(wrapper.find('.pi-bookmark-fill').exists()).toBe(true)
  })

  it('clicking the same chapter again removes the bookmark', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        sectionTitle: 'Chapter 1',
      },
      global: { plugins: [pinia] },
    })
    await nextTick()

    await wrapper.find('.bookmark-btn').trigger('click')
    await nextTick()
    expect(wrapper.find('.pi-bookmark-fill').exists()).toBe(true)

    await wrapper.find('.bookmark-btn').trigger('click')
    await nextTick()

    const store = usePlacemarksStore()
    expect(store.isBookmarked('study-a', 'chapter-1')).toBe(false)
    expect(wrapper.find('.pi-bookmark').exists()).toBe(true)
  })

  it('clicking a different section replaces the previous bookmark', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapperA = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        sectionTitle: 'Chapter 1',
      },
      global: { plugins: [pinia] },
    })
    const wrapperB = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-2',
        sectionTitle: 'Chapter 2',
      },
      global: { plugins: [pinia] },
    })
    await nextTick()

    await wrapperA.find('.bookmark-btn').trigger('click')
    await nextTick()
    await wrapperB.find('.bookmark-btn').trigger('click')
    await nextTick()

    const store = usePlacemarksStore()
    expect(store.bookmarkCount).toBe(1)
    expect(store.isBookmarked('study-a', 'chapter-1')).toBe(false)
    expect(store.isBookmarked('study-a', 'chapter-2')).toBe(true)

    await wrapperA.vm.$nextTick()
    await wrapperB.vm.$nextTick()
    expect(wrapperA.find('.pi-bookmark').exists()).toBe(true)
    expect(wrapperB.find('.pi-bookmark-fill').exists()).toBe(true)
  })

  it('has correct accessibility attributes when unbookmarked', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        sectionTitle: 'Chapter 1',
      },
      global: { plugins: [pinia] },
    })
    const btn = wrapper.find('.bookmark-btn')
    expect(btn.attributes('title')).toBe('Bookmark this chapter')
    expect(btn.attributes('aria-label')).toBe('Bookmark this chapter')
    expect(btn.attributes('aria-pressed')).toBe('false')
  })

  it('has correct accessibility attributes when bookmarked', async () => {
    const data = {
      'study-a': {
        id: 'study-a:chapter-1',
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        title: 'Chapter 1',
        source: '',
        timestamp: 1,
      },
    }
    localStorage.setItem('ctal_at_bookmarks', JSON.stringify(data))

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BookmarkButton, {
      props: {
        knowledgeId: 'study-a',
        sectionId: 'chapter-1',
        sectionTitle: 'Chapter 1',
      },
      global: { plugins: [pinia] },
    })
    await nextTick()

    const btn = wrapper.find('.bookmark-btn')
    expect(btn.attributes('title')).toBe('Remove chapter bookmark')
    expect(btn.attributes('aria-label')).toBe('Remove chapter bookmark')
    expect(btn.attributes('aria-pressed')).toBe('true')
  })
})
