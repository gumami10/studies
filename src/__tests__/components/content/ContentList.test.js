import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContentList from '@/components/content/ContentList.vue'

describe('ContentList', () => {
  it('renders an unordered list by default', () => {
    const wrapper = mount(ContentList, {
      props: {
        block: {
          type: 'list',
          listType: 'ul',
          items: [{ html: 'Item 1' }, { html: 'Item 2' }, { html: 'Item 3' }]
        }
      }
    })
    expect(wrapper.find('ul').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.find('li').html()).toContain('Item 1')
  })

  it('renders an ordered list when listType is ol', () => {
    const wrapper = mount(ContentList, {
      props: {
        block: {
          type: 'list',
          listType: 'ol',
          items: [{ html: 'First' }, { html: 'Second' }]
        }
      }
    })
    expect(wrapper.find('ol').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('adds check class when listType is check', () => {
    const wrapper = mount(ContentList, {
      props: {
        block: {
          type: 'list',
          listType: 'check',
          items: [{ html: 'Done' }]
        }
      }
    })
    expect(wrapper.find('ul.check').exists()).toBe(true)
  })

  it('renders items with span attribute as colspan', () => {
    const wrapper = mount(ContentList, {
      props: {
        block: {
          type: 'list',
          listType: 'ul',
          items: [{ html: 'Spanned', span: '2' }]
        }
      }
    })
    expect(wrapper.find('li').attributes('colspan')).toBe('2')
  })

  it('renders inline HTML in list items', () => {
    const wrapper = mount(ContentList, {
      props: {
        block: {
          type: 'list',
          listType: 'ul',
          items: [{ html: '<strong>Bold</strong> item' }]
        }
      }
    })
    expect(wrapper.find('li').html()).toContain('<strong>Bold</strong>')
  })
})
