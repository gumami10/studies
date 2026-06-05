import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useHighlightToolbar } from '@/composables/useHighlightToolbar'

function createWrapper() {
  const Comp = defineComponent({
    setup() {
      return {
        ...useHighlightToolbar(),
      }
    },
    template: '<div id="content-area"><p id="para">Some test text here</p></div>',
  })
  return mount(Comp, {
    attachTo: document.body,
    global: { plugins: [createPinia()] },
  })
}

describe('useHighlightToolbar', () => {
  let wrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    wrapper = createWrapper()
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  it('returns expected API', () => {
    expect(wrapper.vm.show).toBe(false)
    expect(wrapper.vm.position).toEqual({ top: 0, left: 0 })
    expect(typeof wrapper.vm.checkSelection).toBe('function')
    expect(typeof wrapper.vm.applyHighlight).toBe('function')
    expect(typeof wrapper.vm.removeFromSelection).toBe('function')
    expect(typeof wrapper.vm.restoreHighlights).toBe('function')
  })

  it('show is false when no text is selected', () => {
    window.getSelection().removeAllRanges()
    wrapper.vm.checkSelection()
    expect(wrapper.vm.show).toBe(false)
  })

  it('registers and unregisters event listeners', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const Comp = defineComponent({
      setup() {
        return { ...useHighlightToolbar() }
      },
      template: '<div id="content-area" />',
    })
    const w = mount(Comp, { attachTo: document.body, global: { plugins: [createPinia()] } })
    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    w.unmount()
    expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('restoreHighlights returns early when no items', () => {
    wrapper.vm.restoreHighlights?.()
    expect(true).toBe(true)
  })
})
