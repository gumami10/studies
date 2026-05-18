import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('renders error message prop', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Something went wrong' }
    })
    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.text()).toBe('Failed to load content: Something went wrong')
  })

  it('renders different error messages', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Network error' }
    })
    expect(wrapper.text()).toContain('Network error')
  })
})
