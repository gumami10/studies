import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
  { path: '/chapters', name: 'chapters', component: () => import('@/pages/ChapterPage.vue') },
  { path: '/metrics', name: 'metrics', component: () => import('@/pages/MetricsPage.vue') },
  { path: '/starred', name: 'starred', component: () => import('@/pages/StarredPage.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})
