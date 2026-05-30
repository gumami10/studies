import { createRouter, createWebHashHistory } from 'vue-router'
import chaptersData from '../../data/chapters-1-6.js'
import metricsData from '../../data/quality-metrics.js'
import taeData from '../../data/ctal-tae.js'
import codeReviewData from '../../data/code-review.js'

const ContentPage = () => import('@/pages/ContentPage.vue')

const routes = [
  { path: '/index.html', redirect: '/' },
  { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
  {
    path: '/chapters',
    name: 'chapters',
    component: ContentPage,
    meta: {
      title: 'ISTQB CTAL-AT Study Guide',
      subtitle: 'Advanced Level Agile Tester (v2.0) — Chapter-by-Chapter Review',
      tocTitle: 'Syllabus Chapters',
      highlightKey: 'ctal-at-highlights-ch1',
      data: chaptersData,
    },
  },
  {
    path: '/metrics',
    name: 'metrics',
    component: ContentPage,
    meta: {
      title: 'Quality Metrics in Agile Testing',
      subtitle: 'ISTQB CTAL-AT (v2.0) — Consolidated metrics reference',
      tocTitle: 'Metrics Reference',
      highlightKey: 'ctal-at-highlights-metrics',
      data: metricsData,
    },
  },
  {
    path: '/tae',
    name: 'tae',
    component: ContentPage,
    meta: {
      title: 'ISTQB CTAL-TAE Study Guide',
      subtitle: 'Advanced Level Test Automation Engineering (v2.0) — Chapter-by-Chapter Review',
      tocTitle: 'Syllabus Chapters',
      highlightKey: 'ctal-tae-highlights',
      data: taeData,
    },
  },
  {
    path: '/code-review',
    name: 'code-review',
    component: ContentPage,
    meta: {
      title: 'Code Review Research Plan',
      subtitle: 'Analyzing the Mind of Code Reviewers Across Top 11 Open Source Repositories',
      tocTitle: 'Research Sections',
      highlightKey: 'code-review-highlights',
      data: codeReviewData,
    },
  },
  { path: '/starred', name: 'starred', component: () => import('@/pages/StarredPage.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})
