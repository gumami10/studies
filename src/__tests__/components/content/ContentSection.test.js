import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ContentSection from '@/components/content/ContentSection.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'chapters' }),
}))

const pinia = createPinia()
setActivePinia(pinia)

describe('ContentSection', () => {
  it('renders a section with correct id', () => {
    const wrapper = mount(ContentSection, {
      props: { block: { id: 'sec-1', content: [] } },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('section#sec-1').exists()).toBe(true)
  })

  it('renders content blocks via ContentRenderer', () => {
    const wrapper = mount(ContentSection, {
      props: {
        block: {
          id: 'sec-1',
          content: [
            { type: 'h2', text: 'Title' },
            { type: 'paragraph', html: '<p>Body text</p>' },
          ],
        },
      },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('h2').text()).toBe('Title')
  })

  it('does not render a StarButton (moved to chapter-level action group)', () => {
    const wrapper = mount(ContentSection, {
      props: {
        block: {
          id: 'sec-1',
          content: [
            { type: 'h3', text: 'Section Title' },
            { type: 'paragraph', html: 'content' },
          ],
        },
      },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('.star-btn').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'StarButton' }).exists()).toBe(false)
  })
})
