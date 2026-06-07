import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import StarButton from '@/components/ui/StarButton.vue'
import { usePlacemarksStore } from '@/stores/placemarks'

vi.mock('@/composables/useContentCatalog', () => ({
  useContentCatalog: () => ({
    getLabel: (id) => (id === 'chapters' ? 'CTAL-AT' : id),
    findById: () => undefined,
    getChapterData: () => undefined,
    list: [],
    byId: {},
  }),
}))

describe('StarButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders unstarred icon initially', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section', knowledgeId: 'chapters' },
      global: { plugins: [pinia] },
    })
    await nextTick()
    expect(wrapper.find('.pi-star').exists()).toBe(true)
    expect(wrapper.find('.starred').exists()).toBe(false)
  })

  it('shows starred icon when section is already starred', async () => {
    const data = {
      'test-section': {
        id: 'test-section',
        knowledgeId: 'chapters',
        sectionId: 'test-section',
        title: 'Test',
        source: 'CTAL-AT',
        html: '<p>x</p>',
        timestamp: 1,
      },
    }
    localStorage.setItem('ctal_at_placemarks', JSON.stringify(data))

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section', knowledgeId: 'chapters' },
      global: { plugins: [pinia] },
    })
    await nextTick()

    const store = usePlacemarksStore()
    expect(store.isStarred('test-section')).toBe(true)
    expect(wrapper.find('.pi-star-fill').exists()).toBe(true)
    expect(wrapper.find('.starred').exists()).toBe(true)
  })

  it('toggles star state on click', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section', knowledgeId: 'chapters' },
      global: { plugins: [pinia] },
    })
    await nextTick()
    expect(wrapper.find('.pi-star').exists()).toBe(true)

    await wrapper.find('.star-btn').trigger('click')
    await nextTick()
    expect(wrapper.find('.pi-star-fill').exists()).toBe(true)

    await wrapper.find('.star-btn').trigger('click')
    await nextTick()
    expect(wrapper.find('.pi-star').exists()).toBe(true)
  })

  it('has correct accessibility attributes', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section', knowledgeId: 'chapters' },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('.star-btn').attributes('title')).toBe('Star this section')
    expect(wrapper.find('.star-btn').attributes('aria-label')).toBe('Star this section')
  })
})
