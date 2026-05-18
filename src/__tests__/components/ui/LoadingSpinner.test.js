import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders loading text', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading study content')
  })
})
