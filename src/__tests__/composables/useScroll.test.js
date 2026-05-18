import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useScroll } from '@/composables/useScroll'

function createWrapper() {
  const Comp = defineComponent({
    setup() {
      return useScroll()
    },
    template: '<div />'
  })
  return mount(Comp, { attachTo: document.body })
}

describe('useScroll', () => {
  beforeEach(() => {
    window.scrollY = 0
  })

  it('returns showButton ref and scrollToTop function', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.showButton).toBe(false)
    expect(typeof wrapper.vm.scrollToTop).toBe('function')
    wrapper.unmount()
  })

  it('showButton is false when scrollY <= 400', async () => {
    const wrapper = createWrapper()
    window.scrollY = 400
    window.dispatchEvent(new Event('scroll'))
    await new Promise((r) => requestAnimationFrame(r))
    expect(wrapper.vm.showButton).toBe(false)
    wrapper.unmount()
  })

  it('showButton is true when scrollY > 400', async () => {
    const wrapper = createWrapper()
    window.scrollY = 401
    window.dispatchEvent(new Event('scroll'))
    await new Promise((r) => requestAnimationFrame(r))
    expect(wrapper.vm.showButton).toBe(true)
    wrapper.unmount()
  })

  it('scrollToTop calls window.scrollTo', () => {
    const spy = vi.spyOn(window, 'scrollTo')
    const wrapper = createWrapper()
    wrapper.vm.scrollToTop()
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    spy.mockRestore()
    wrapper.unmount()
  })

  it('throttles scroll events via requestAnimationFrame', async () => {
    const wrapper = createWrapper()
    window.scrollY = 500
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    await new Promise((r) => requestAnimationFrame(r))
    expect(wrapper.vm.showButton).toBe(true)
    wrapper.unmount()
  })
})
