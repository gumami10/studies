import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/ui/EmptyState.vue'

describe('EmptyState', () => {
  it('renders empty state message', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toBe('No starred sections yet')
    expect(wrapper.find('p').text()).toContain('Click the star icon')
  })
})
