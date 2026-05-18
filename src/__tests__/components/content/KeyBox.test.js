import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KeyBox from '@/components/content/KeyBox.vue'

describe('KeyBox', () => {
  it('renders a key-box div', () => {
    const wrapper = mount(KeyBox, {
      props: { block: { type: 'key-box', heading: 'Key Point', content: [] } }
    })
    expect(wrapper.find('.key-box').exists()).toBe(true)
  })

  it('renders heading when provided', () => {
    const wrapper = mount(KeyBox, {
      props: { block: { type: 'key-box', heading: 'Key Point', content: [] } }
    })
    expect(wrapper.find('h4').text()).toBe('Key Point')
  })

  it('renders without heading', () => {
    const wrapper = mount(KeyBox, {
      props: { block: { type: 'key-box', heading: undefined, content: [] } }
    })
    expect(wrapper.find('h4').exists()).toBe(false)
  })

  it('renders content blocks', () => {
    const wrapper = mount(KeyBox, {
      props: {
        block: {
          type: 'key-box',
          heading: 'Note',
          content: [
            { type: 'paragraph', html: 'Content paragraph' },
            { type: 'list', listType: 'ul', items: [{ html: 'Item' }] }
          ]
        }
      }
    })
    expect(wrapper.find('p').text()).toBe('Content paragraph')
    expect(wrapper.find('li').text()).toBe('Item')
  })

  it('renders heading with inline HTML', () => {
    const wrapper = mount(KeyBox, {
      props: {
        block: {
          type: 'key-box',
          heading: 'Note: <em>Important</em>',
          content: []
        }
      }
    })
    expect(wrapper.find('h4').html()).toContain('<em>Important</em>')
  })

  it('falls back to div for unknown block type', () => {
    const wrapper = mount(KeyBox, {
      props: {
        block: {
          type: 'key-box',
          content: [{ type: 'unknown', html: 'test' }]
        }
      }
    })
    expect(wrapper.find('.key-box').exists()).toBe(true)
  })
})
