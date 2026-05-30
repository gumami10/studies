import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '@/components/layout/AppHeader.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

describe('AppHeader', () => {
  it('renders title and subtitle', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', component: { template: '' } }] })

    const wrapper = mount(AppHeader, {
      global: { plugins: [pinia, router] }
    })
    expect(wrapper.find('h1').text()).toBe('QA Hero study guide')
    expect(wrapper.find('.subtitle').text()).toContain('Advanced Level Agile Tester')
  })

  it('includes AppNav', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', component: { template: '' } }] })

    const wrapper = mount(AppHeader, {
      global: { plugins: [pinia, router] }
    })
    expect(wrapper.findComponent({ name: 'AppNav' }).exists()).toBe(true)
  })
})
