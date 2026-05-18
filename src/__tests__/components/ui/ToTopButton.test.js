import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ToTopButton from '@/components/ui/ToTopButton.vue'

describe('ToTopButton', () => {
  it('renders the button', () => {
    const wrapper = mount(ToTopButton, { attachTo: document.body })
    expect(wrapper.find('#to-top-btn').exists()).toBe(true)
    expect(wrapper.find('.to-top-btn').exists()).toBe(true)
    wrapper.unmount()
  })

  it('has correct accessibility attributes', () => {
    const wrapper = mount(ToTopButton, { attachTo: document.body })
    const btn = wrapper.find('.to-top-btn')
    expect(btn.attributes('title')).toBe('Back to top')
    expect(btn.attributes('aria-label')).toBe('Back to top')
    wrapper.unmount()
  })

  it('calls scrollToTop on click', async () => {
    const spy = vi.spyOn(window, 'scrollTo')
    const wrapper = mount(ToTopButton, { attachTo: document.body })
    await wrapper.find('.to-top-btn').trigger('click')
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    spy.mockRestore()
    wrapper.unmount()
  })

  it('has visible class when showButton is true', async () => {
    window.scrollY = 500
    const wrapper = mount(ToTopButton, { attachTo: document.body })
    window.dispatchEvent(new Event('scroll'))
    await new Promise((r) => requestAnimationFrame(r))
    expect(wrapper.find('.to-top-btn').classes()).toContain('visible')
    wrapper.unmount()
    window.scrollY = 0
  })

  it('does not have visible class when showButton is false', () => {
    window.scrollY = 0
    const wrapper = mount(ToTopButton, { attachTo: document.body })
    expect(wrapper.find('.to-top-btn').classes()).not.toContain('visible')
    wrapper.unmount()
  })
})
