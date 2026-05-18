import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import StarButton from '@/components/ui/StarButton.vue'
import { useStarredStore } from '@/stores/starred'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    name: 'chapters'
  })
}))

describe('StarButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders unstarred (☆) initially', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section' },
      global: { plugins: [pinia] }
    })
    await nextTick()
    expect(wrapper.text()).toContain('☆')
  })

  it('shows starred (★) when section is already starred', async () => {
    const data = { 'test-section': { id: 'test-section', title: 'Test', source: 'X', html: '<p>x</p>' } }
    localStorage.setItem('ctal_at_starred', JSON.stringify(data))

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section' },
      global: { plugins: [pinia] }
    })
    await nextTick()

    const store = useStarredStore()
    expect(store.isStarred('test-section')).toBe(true)
    expect(wrapper.text()).toContain('★')
    expect(wrapper.find('.starred').exists()).toBe(true)
  })

  it('toggles star state on click', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section' },
      global: { plugins: [pinia] }
    })
    await nextTick()
    expect(wrapper.text()).toContain('☆')

    await wrapper.find('.star-btn').trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('★')

    await wrapper.find('.star-btn').trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('☆')
  })

  it('has correct accessibility attributes', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StarButton, {
      props: { sectionId: 'test-section', sectionTitle: 'Test Section' },
      global: { plugins: [pinia] }
    })
    expect(wrapper.find('.star-btn').attributes('title')).toBe('Star this section')
    expect(wrapper.find('.star-btn').attributes('aria-label')).toBe('Star this section')
  })
})
