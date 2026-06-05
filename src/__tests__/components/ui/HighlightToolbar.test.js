import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HighlightToolbar from '@/components/ui/HighlightToolbar.vue'

describe('HighlightToolbar', () => {
  it('renders hidden when show is false', () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: false, position: { top: 100, left: 200 } },
    })
    expect(wrapper.find('#highlight-toolbar').attributes('style')).toContain('display: none')
  })

  it('renders visible when show is true', () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: { top: 100, left: 200 } },
    })
    expect(wrapper.find('#highlight-toolbar').attributes('style')).toContain('display: flex')
  })

  it('renders all color buttons', () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: { top: 100, left: 200 } },
    })
    const buttons = wrapper.findAll('.hl-btn')
    expect(buttons).toHaveLength(4)
    expect(buttons[0].attributes('data-color')).toBe('yellow')
    expect(buttons[1].attributes('data-color')).toBe('green')
    expect(buttons[2].attributes('data-color')).toBe('blue')
    expect(buttons[3].attributes('data-color')).toBe('pink')
  })

  it('renders remove button', () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: { top: 100, left: 200 } },
    })
    expect(wrapper.find('.hl-btn-remove').exists()).toBe(true)
  })

  it('emits apply with color on button click', async () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: { top: 100, left: 200 } },
    })
    await wrapper.find('[data-color="green"]').trigger('click')
    expect(wrapper.emitted('apply')).toBeTruthy()
    expect(wrapper.emitted('apply')[0]).toEqual(['green'])
  })

  it('emits remove on remove button click', async () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: { top: 100, left: 200 } },
    })
    await wrapper.find('.hl-btn-remove').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
  })

  it('positions toolbar based on position prop', () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: { top: 200, left: 300 } },
    })
    const style = wrapper.find('#highlight-toolbar').attributes('style')
    expect(style).toContain('top: 156px') // 200 - 44
    expect(style).toContain('left: 208px') // 300 - 92
  })

  it('clamps position to minimum 8px', () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: { top: 10, left: 10 } },
    })
    const style = wrapper.find('#highlight-toolbar').attributes('style')
    expect(style).toContain('top: 8px')
    expect(style).toContain('left: 8px')
  })

  it('handles undefined position gracefully', () => {
    const wrapper = mount(HighlightToolbar, {
      props: { show: true, position: undefined },
    })
    const style = wrapper.find('#highlight-toolbar').attributes('style')
    expect(style).toContain('top: 8px')
    expect(style).toContain('left: 8px')
  })
})
