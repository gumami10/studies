import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '@/components/layout/AppFooter.vue'

const mockRoute = { meta: {} }

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}))

describe('AppFooter', () => {
  beforeEach(() => {
    mockRoute.meta = {}
  })

  it('renders ISTQB attribution by default', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('footer').exists()).toBe(true)
    expect(wrapper.text()).toContain('ISTQB')
    expect(wrapper.text()).toContain('unofficial')
    expect(wrapper.find('.footer-sources').exists()).toBe(true)
    expect(wrapper.find('.footer-disclaimer').exists()).toBe(true)
  })

  it('renders ISTQB attribution explicitly', () => {
    mockRoute.meta = { footerAttribution: 'istqb' }
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('ISTQB')
    expect(wrapper.find('.footer-sources').exists()).toBe(true)
    expect(wrapper.find('.footer-disclaimer').exists()).toBe(true)
  })

  it('renders Crispin & Gregory attribution', () => {
    mockRoute.meta = { footerAttribution: 'crispin-gregory' }
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('Lisa Crispin')
    expect(wrapper.text()).toContain('Janet Gregory')
    expect(wrapper.text()).toContain('Agile Testing')
    expect(wrapper.text()).toContain('More Agile Testing')
    expect(wrapper.find('.footer-sources').exists()).toBe(true)
    expect(wrapper.find('.footer-disclaimer').exists()).toBe(true)
  })

  it('renders nothing for user content', () => {
    mockRoute.meta = { footerAttribution: 'none' }
    const wrapper = mount(AppFooter)
    expect(wrapper.find('.footer-sources').exists()).toBe(false)
    expect(wrapper.find('.footer-disclaimer').exists()).toBe(false)
  })

  it('renders slot content when provided', () => {
    const wrapper = mount(AppFooter, {
      slots: { default: 'Custom footer text' },
    })
    expect(wrapper.find('.footer-page-text').exists()).toBe(true)
    expect(wrapper.find('.footer-page-text').text()).toBe('Custom footer text')
  })

  it('hides page text section when no slot content', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('.footer-page-text').exists()).toBe(false)
  })
})
