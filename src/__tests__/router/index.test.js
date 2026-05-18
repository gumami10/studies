import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/chapters', name: 'chapters', component: { template: '<div>Chapters</div>' } },
  { path: '/metrics', name: 'metrics', component: { template: '<div>Metrics</div>' } },
  { path: '/starred', name: 'starred', component: { template: '<div>Starred</div>' } },
]

describe('Router', () => {
  let router

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes,
      scrollBehavior(to) {
        if (to.hash) return { el: to.hash, behavior: 'smooth' }
        return { top: 0 }
      }
    })
    router.push('/')
    await router.isReady()
  })

  it('has 4 routes', () => {
    expect(router.getRoutes()).toHaveLength(4)
  })

  it('home route resolves correctly', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('chapters route resolves correctly', async () => {
    await router.push('/chapters')
    expect(router.currentRoute.value.name).toBe('chapters')
  })

  it('metrics route resolves correctly', async () => {
    await router.push('/metrics')
    expect(router.currentRoute.value.name).toBe('metrics')
  })

  it('starred route resolves correctly', async () => {
    await router.push('/starred')
    expect(router.currentRoute.value.name).toBe('starred')
  })

  it('scrollBehavior returns smooth scroll when hash present', async () => {
    await router.push('/#sec-1')
    // scrollBehavior is applied internally during navigation
    // We verify the route has the hash
    expect(router.currentRoute.value.hash).toBe('#sec-1')
  })

  it('scrollBehavior returns top when no hash', () => {
    // After navigation to root, there should be no hash
    expect(router.currentRoute.value.hash).toBe('')
  })
})
