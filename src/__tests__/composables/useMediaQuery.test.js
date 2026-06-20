import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

function makeFakeMatchMedia(initial) {
  let current = initial
  const listeners = new Set()
  const mql = {
    matches: current,
    media: '',
    onchange: null,
    addEventListener: vi.fn((_event, cb) => {
      listeners.add(cb)
    }),
    removeEventListener: vi.fn((_event, cb) => {
      listeners.delete(cb)
    }),
    addListener: vi.fn((cb) => listeners.add(cb)),
    removeListener: vi.fn((cb) => listeners.delete(cb)),
    dispatchEvent: vi.fn(() => true),
    fire: () => {
      for (const cb of listeners) cb({ matches: current })
    },
  }
  const impl = (query) => {
    mql.media = query
    mql.matches = current
    return mql
  }
  impl.set = (next) => {
    current = next
    mql.matches = next
  }
  return { impl, mql }
}

function createWrapper(impl) {
  const Comp = defineComponent({
    setup() {
      return { mq: useMediaQuery('(max-width: 767px)') }
    },
    template: '<div />',
  })
  window.matchMedia = impl
  return mount(Comp)
}

describe('useMediaQuery', () => {
  let originalMatchMedia

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.restoreAllMocks()
  })

  it('reflects matchMedia after mount', async () => {
    const { impl } = makeFakeMatchMedia(true)
    const wrapper = createWrapper(impl)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.mq).toBe(true)
    wrapper.unmount()
  })

  it('updates when the media query change fires', async () => {
    const { impl, mql } = makeFakeMatchMedia(false)
    const wrapper = createWrapper(impl)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.mq).toBe(false)
    impl.set(true)
    mql.fire()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.mq).toBe(true)
    wrapper.unmount()
  })

  it('removes its listener on unmount', async () => {
    const { impl, mql } = makeFakeMatchMedia(false)
    const wrapper = createWrapper(impl)
    await wrapper.vm.$nextTick()
    wrapper.unmount()
    expect(mql.removeEventListener).toHaveBeenCalled()
  })
})
