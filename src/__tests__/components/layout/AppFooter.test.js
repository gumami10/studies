import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '@/components/layout/AppFooter.vue'

describe('AppFooter', () => {
  it('renders default slot content', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('footer').exists()).toBe(true)
    expect(wrapper.text()).toContain('Based on ISTQB CTAL-AT Syllabus v2.0')
  })

  it('renders custom slot content', () => {
    const wrapper = mount(AppFooter, {
      slots: { default: 'Custom footer text' }
    })
    expect(wrapper.text()).toBe('Custom footer text')
  })
})
