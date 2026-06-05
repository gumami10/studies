import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContentParagraph from '@/components/content/ContentParagraph.vue'

describe('ContentParagraph', () => {
  it('renders a paragraph with HTML content', () => {
    const wrapper = mount(ContentParagraph, {
      props: { block: { type: 'paragraph', html: 'This is <em>important</em> text.' } },
    })
    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.html()).toContain('<em>important</em>')
  })

  it('renders plain text', () => {
    const wrapper = mount(ContentParagraph, {
      props: { block: { type: 'paragraph', html: 'Simple text.' } },
    })
    expect(wrapper.find('p').text()).toBe('Simple text.')
  })

  it('renders empty paragraph', () => {
    const wrapper = mount(ContentParagraph, {
      props: { block: { type: 'paragraph', html: '' } },
    })
    expect(wrapper.find('p').text()).toBe('')
  })
})
