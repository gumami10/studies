import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders loading state container', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.loading-state').exists()).toBe(true)
  })

  it('renders loading text', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.text()).toContain('Loading study content')
  })
})
