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
          { id: 'sec-3', label: 'Section 3', status: 'active' },
        ],
      },
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
        items: [{ id: 'sec-1', label: 'Coming Soon', status: 'pending' }],
      },
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('span').text()).toBe('Coming Soon')
  })

  it('scrolls element to the viewport center on link click', async () => {
    const el = document.createElement('div')
    el.id = 'sec-1'
    el.getBoundingClientRect = () => ({
      top: 200,
      left: 0,
      right: 0,
      bottom: 600,
      width: 0,
      height: 400,
      x: 0,
      y: 200,
      toJSON: () => ({}),
    })
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 400 })
    document.body.appendChild(el)

    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(TableOfContents, {
      props: {
        items: [{ id: 'sec-1', label: 'Section 1', status: 'active' }],
      },
    })
    await wrapper.find('a').trigger('click')

    const expectedTop = Math.max(
      0,
      200 + window.scrollY - window.innerHeight / 2 + 400 / 2,
    )
    expect(scrollSpy).toHaveBeenCalledWith({ top: expectedTop, behavior: 'smooth' })

    scrollSpy.mockRestore()
    document.body.removeChild(el)
  })

  it('scrolls a chapter link to the chapter heading center', async () => {
    const chapter = document.createElement('article')
    chapter.id = 'ch1'
    chapter.className = 'chapter'
    chapter.getBoundingClientRect = () => ({
      top: 200,
      left: 0,
      right: 0,
      bottom: 2200,
      width: 0,
      height: 2000,
      x: 0,
      y: 200,
      toJSON: () => ({}),
    })
    Object.defineProperty(chapter, 'offsetHeight', { configurable: true, value: 2000 })

    const heading = document.createElement('h2')
    heading.textContent = 'Chapter 1'
    heading.getBoundingClientRect = () => ({
      top: 260,
      left: 0,
      right: 0,
      bottom: 300,
      width: 0,
      height: 40,
      x: 0,
      y: 260,
      toJSON: () => ({}),
    })
    Object.defineProperty(heading, 'offsetHeight', { configurable: true, value: 40 })
    chapter.appendChild(heading)
    document.body.appendChild(chapter)

    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(TableOfContents, {
      props: {
        items: [{ id: 'ch1', label: 'Chapter 1', status: 'active' }],
      },
    })
    await wrapper.find('a').trigger('click')

    const expectedTop = Math.max(
      0,
      260 + window.scrollY - window.innerHeight / 2 + 40 / 2,
    )
    expect(scrollSpy).toHaveBeenCalledWith({ top: expectedTop, behavior: 'smooth' })

    scrollSpy.mockRestore()
    document.body.removeChild(chapter)
  })

  it('does nothing when the target element is missing', async () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const wrapper = mount(TableOfContents, {
      props: {
        items: [{ id: 'missing', label: 'Missing', status: 'active' }],
      },
    })
    await wrapper.find('a').trigger('click')

    expect(scrollSpy).not.toHaveBeenCalled()

    scrollSpy.mockRestore()
  })

  it('handles empty items array', () => {
    const wrapper = mount(TableOfContents, { props: { items: [] } })
    expect(wrapper.find('#toc-list').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
