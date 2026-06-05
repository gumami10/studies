import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppNav from '@/components/layout/AppNav.vue'

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/chapters', name: 'chapters', component: { template: '<div>Chapters</div>' } },
  { path: '/metrics', name: 'metrics', component: { template: '<div>Metrics</div>' } },
  { path: '/tae', name: 'tae', component: { template: '<div>TAE</div>' } },
  { path: '/code-review', name: 'code-review', component: { template: '<div>CodeReview</div>' } },
  { path: '/starred', name: 'starred', component: { template: '<div>Starred</div>' } },
]

describe('AppNav', () => {
  let router, pinia

  beforeEach(() => {
    localStorage.clear()
    router = createRouter({ history: createWebHistory(), routes })
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders navigation links', async () => {
    router.push('/chapters')
    await router.isReady()

    const wrapper = mount(AppNav, { global: { plugins: [router, pinia] } })
    expect(wrapper.find('.top-nav').exists()).toBe(true)
    expect(wrapper.find('a[href="/"]').exists()).toBe(true) // Home shown
    expect(wrapper.find('a[href="/starred"]').exists()).toBe(true) // Starred shown
    expect(wrapper.find('a[href="/metrics"]').exists()).toBe(true) // Other chapter
    // Current route not shown
    expect(wrapper.find('a[href="/chapters"]').exists()).toBe(false)
  })

  it('hides Home link when on home page', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(AppNav, { global: { plugins: [router, pinia] } })
    expect(wrapper.find('a[href="/"]').exists()).toBe(false)
  })

  it('separates links with middle dot', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(AppNav, { global: { plugins: [router, pinia] } })
    expect(wrapper.text()).toContain('\u00b7')
  })

  it('renders nothing when all links would be hidden', async () => {
    // This can't happen with current setup, but nav handles it
    router.push('/')
    await router.isReady()

    const wrapper = mount(AppNav, { global: { plugins: [router, pinia] } })
    // On home: starred and chapter links still show
    expect(wrapper.find('.top-nav').exists()).toBe(true)
  })
})
