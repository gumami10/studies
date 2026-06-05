import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StorageConsentBanner from '@/components/ui/StorageConsentBanner.vue'

describe('StorageConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows when not previously dismissed', async () => {
    const wrapper = mount(StorageConsentBanner, { attachTo: document.body })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.consent-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('locally in your browser')
    wrapper.unmount()
  })

  it('hides when previously dismissed', async () => {
    localStorage.setItem('consent-banner-dismissed', JSON.stringify(true))
    const wrapper = mount(StorageConsentBanner, { attachTo: document.body })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.consent-banner').exists()).toBe(false)
    wrapper.unmount()
  })

  it('dismisses on button click and persists to localStorage', async () => {
    const wrapper = mount(StorageConsentBanner, { attachTo: document.body })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.consent-banner').exists()).toBe(true)

    await wrapper.find('.consent-dismiss').trigger('click')
    expect(wrapper.find('.consent-banner').exists()).toBe(false)
    expect(JSON.parse(localStorage.getItem('consent-banner-dismissed'))).toBe(true)
    wrapper.unmount()
  })

  it('has correct accessibility attributes', async () => {
    const wrapper = mount(StorageConsentBanner, { attachTo: document.body })
    await new Promise((r) => setTimeout(r, 0))
    const banner = wrapper.find('.consent-banner')
    expect(banner.attributes('role')).toBe('alert')
    expect(banner.attributes('aria-live')).toBe('polite')
    expect(wrapper.find('.consent-dismiss').attributes('aria-label')).toBe('Dismiss privacy notice')
    wrapper.unmount()
  })
})
