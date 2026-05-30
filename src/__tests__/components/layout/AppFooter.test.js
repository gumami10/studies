import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '@/components/layout/AppFooter.vue'

describe('AppFooter', () => {
  it('renders ISTQB attribution and disclaimer', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('footer').exists()).toBe(true)
    expect(wrapper.text()).toContain('ISTQB')
    expect(wrapper.text()).toContain('unofficial')
    expect(wrapper.find('.footer-sources').exists()).toBe(true)
    expect(wrapper.find('.footer-disclaimer').exists()).toBe(true)
  })

  it('renders slot content when provided', () => {
    const wrapper = mount(AppFooter, {
      slots: { default: 'Custom footer text' }
    })
    expect(wrapper.find('.footer-page-text').exists()).toBe(true)
    expect(wrapper.find('.footer-page-text').text()).toBe('Custom footer text')
  })

  it('hides page text section when no slot content', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('.footer-page-text').exists()).toBe(false)
  })
})
