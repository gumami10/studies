import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContentHeading from '@/components/content/ContentHeading.vue'

describe('ContentHeading', () => {
  it('renders h2 for type h2', () => {
    const wrapper = mount(ContentHeading, {
      props: { block: { type: 'h2', text: 'Chapter Title' } },
    })
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('h2').html()).toContain('Chapter Title')
  })

  it('renders h3 for type h3', () => {
    const wrapper = mount(ContentHeading, {
      props: { block: { type: 'h3', text: 'Section Title' } },
    })
    expect(wrapper.find('h3').exists()).toBe(true)
  })

  it('renders h4 for type h4', () => {
    const wrapper = mount(ContentHeading, {
      props: { block: { type: 'h4', text: 'Subsection' } },
    })
    expect(wrapper.find('h4').exists()).toBe(true)
  })

  it('renders h4 for type heading', () => {
    const wrapper = mount(ContentHeading, {
      props: { block: { type: 'heading', text: 'Key Point' } },
    })
    expect(wrapper.find('h4').exists()).toBe(true)
  })

  it('renders title tag for type title', () => {
    const wrapper = mount(ContentHeading, {
      props: { block: { type: 'title', text: 'Main Title' } },
    })
    expect(wrapper.find('title').exists()).toBe(true)
  })

  it('renders inline HTML via v-html', () => {
    const wrapper = mount(ContentHeading, {
      props: { block: { type: 'h2', text: 'Hello <strong>World</strong>' } },
    })
    expect(wrapper.find('h2').html()).toContain('<strong>World</strong>')
  })
})
