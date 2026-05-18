import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TableOfContents from '@/components/toc/TableOfContents.vue'

describe('TableOfContents', () => {
  it('renders toc list with active items as links', () => {
    const wrapper = mount(TableOfContents, {
      props: {
        items: [
          { id: 'sec-1', label: 'Section 1', status: 'active' },
          { id: 'sec-2', label: 'Section 2', status: 'pending' },
          { id: 'sec-3', label: 'Section 3', status: 'active' }
        ]
      }
    })
    expect(wrapper.find('#toc-list').exists()).toBe(true)
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[0].classes()).toContain('active')
    expect(items[1].classes()).toContain('pending')

    // Active items are links
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2)
    expect(links[0].attributes('href')).toBe('#sec-1')
    expect(links[1].attributes('href')).toBe('#sec-3')
  })

  it('renders pending items as spans, not links', () => {
    const wrapper = mount(TableOfContents, {
      props: {
        items: [
          { id: 'sec-1', label: 'Coming Soon', status: 'pending' }
        ]
      }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('span').text()).toBe('Coming Soon')
  })

  it('scrolls to element on link click', async () => {
    const el = document.createElement('div')
    el.id = 'sec-1'
    el.scrollIntoView = vi.fn()
    document.body.appendChild(el)

    const wrapper = mount(TableOfContents, {
      props: {
        items: [{ id: 'sec-1', label: 'Section 1', status: 'active' }]
      }
    })
    await wrapper.find('a').trigger('click')
    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    document.body.removeChild(el)
  })

  it('handles empty items array', () => {
    const wrapper = mount(TableOfContents, { props: { items: [] } })
    expect(wrapper.find('#toc-list').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
