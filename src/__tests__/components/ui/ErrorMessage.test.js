import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('renders the error container', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Something went wrong' },
    })
    expect(wrapper.find('.error-message').exists()).toBe(true)
  })

  it('renders the error title and detail', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Something went wrong' },
    })
    expect(wrapper.text()).toContain('Failed to load content')
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('renders different error messages', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Network error' },
    })
    expect(wrapper.text()).toContain('Network error')
  })
})
