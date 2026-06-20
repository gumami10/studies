import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import ChapterCard from '@/components/ui/ChapterCard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>home</div>' } },
    { path: '/chapters', component: { template: '<div>chapters</div>' } },
    { path: '/metrics', component: { template: '<div>metrics</div>' } },
  ],
})

describe('ChapterCard', () => {
  it('renders as a router-link with correct to', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(ChapterCard, {
      props: { to: '/chapters', title: 'Chapters', description: 'Desc' },
      global: { plugins: [router] },
    })
    expect(wrapper.find('.chapter-card').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Chapters')
    expect(wrapper.find('p').text()).toBe('Desc')
  })

  it('renders without description', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(ChapterCard, {
      props: { to: '/metrics', title: 'Metrics' },
      global: { plugins: [router] },
    })
    expect(wrapper.find('h2').text()).toBe('Metrics')
    expect(wrapper.find('p').exists()).toBe(false)
  })
})
