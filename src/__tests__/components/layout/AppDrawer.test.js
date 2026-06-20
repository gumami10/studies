import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppDrawer from '@/components/layout/AppDrawer.vue'

function makeMatchMedia(matches) {
  return (query) => {
    const listeners = new Set()
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: (_, cb) => {
        listeners.add(cb)
      },
      removeEventListener: (_, cb) => {
        listeners.delete(cb)
      },
      addListener: (cb) => listeners.add(cb),
      removeListener: (cb) => listeners.delete(cb),
      dispatchEvent: () => true,
    }
  }
}

const ROUTES = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/chapters', name: 'chapters', component: { template: '<div>Chapters</div>' } },
  { path: '/starred', name: 'starred', component: { template: '<div>Starred</div>' } },
  { path: '/settings', name: 'settings', component: { template: '<div>Settings</div>' } },
  { path: '/keller-prayer', name: 'keller-prayer', component: { template: '<div>Prayer</div>' } },
  { path: '/tae', name: 'tae', component: { template: '<div>TAE</div>' } },
]

function setup(opts) {
  const router = createRouter({ history: createWebHistory(), routes: ROUTES })
  const pinia = createPinia()
  setActivePinia(pinia)
  window.matchMedia = makeMatchMedia(opts.mobile)
  return { router, pinia }
}

async function mountAt(router, pinia) {
  const wrapper = mount(AppDrawer, { global: { plugins: [router, pinia] } })
  await router.isReady()
  return wrapper
}

describe('AppDrawer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders drawer as an aside element', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: false })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    const drawer = wrapper.find('#app-drawer')
    expect(drawer.exists()).toBe(true)
    expect(drawer.element.tagName.toLowerCase()).toBe('aside')
  })

  it('renders utility links when not on those routes', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: false })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    expect(wrapper.find('a[href="/"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/starred"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/settings"]').exists()).toBe(true)
  })

  it('hides the utility link matching the current route', async () => {
    const { router, pinia } = setup({ route: '/starred', mobile: false })
    await router.push('/starred')
    const wrapper = await mountAt(router, pinia)
    expect(wrapper.find('a[href="/starred"]').exists()).toBe(false)
  })

  it('renders Personal and Quality Assurance section labels', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: false })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    const labels = wrapper.findAll('.drawer-section-label').map((el) => el.text())
    expect(labels).toContain('Personal')
    expect(labels).toContain('Quality Assurance')
  })

  it('omits empty section when all items filtered out', async () => {
    const { router, pinia } = setup({ route: '/keller-prayer', mobile: false })
    await router.push('/keller-prayer')
    const wrapper = await mountAt(router, pinia)
    const labels = wrapper.findAll('.drawer-section-label').map((el) => el.text())
    expect(labels).not.toContain('Personal')
    expect(labels).toContain('Quality Assurance')
  })

  it('hides current knowledge from its section', async () => {
    const { router, pinia } = setup({ route: '/keller-prayer', mobile: false })
    await router.push('/keller-prayer')
    const wrapper = await mountAt(router, pinia)
    expect(wrapper.find('a[href="/keller-prayer"]').exists()).toBe(false)
  })

  it('desktop: collapses drawer when toggle clicked, hiding sections', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: false })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    expect(wrapper.find('.drawer-collapsed').exists()).toBe(false)
    await wrapper.find('.drawer-toggle').trigger('click')
    await flushPromises()
    expect(wrapper.find('.drawer-collapsed').exists()).toBe(true)
    expect(wrapper.find('.drawer-section-label').exists()).toBe(false)
  })

  it('mobile: shows floating toggle when closed', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: true })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    const floating = wrapper.find('.drawer-floating-toggle')
    expect(floating.exists()).toBe(true)
  })

  it('mobile: floating toggle opens drawer', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: true })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    await wrapper.find('.drawer-floating-toggle').trigger('click')
    await flushPromises()
    expect(wrapper.find('.drawer-mobile-open').exists()).toBe(true)
    expect(wrapper.find('.drawer-backdrop').exists()).toBe(true)
  })

  it('mobile: backdrop click closes drawer', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: true })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    await wrapper.find('.drawer-floating-toggle').trigger('click')
    await flushPromises()
    await wrapper.find('.drawer-backdrop').trigger('click')
    await flushPromises()
    expect(wrapper.find('.drawer-mobile-open').exists()).toBe(false)
    expect(wrapper.find('.drawer-backdrop').exists()).toBe(false)
  })

  it('mobile: Escape key closes drawer', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: true })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    await wrapper.find('.drawer-floating-toggle').trigger('click')
    await flushPromises()
    expect(wrapper.find('.drawer-mobile-open').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('.drawer-mobile-open').exists()).toBe(false)
  })

  it('mobile: drawer auto-closes on route change', async () => {
    const { router, pinia } = setup({ route: '/chapters', mobile: true })
    await router.push('/chapters')
    const wrapper = await mountAt(router, pinia)
    await wrapper.find('.drawer-floating-toggle').trigger('click')
    await flushPromises()
    expect(wrapper.find('.drawer-mobile-open').exists()).toBe(true)
    await router.push('/tae')
    await flushPromises()
    expect(wrapper.find('.drawer-mobile-open').exists()).toBe(false)
  })
})
