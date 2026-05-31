import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import chaptersData from '../../data/ctal-at.js'
import metricsData from '../../data/quality-metrics.js'
import taeData from '../../data/ctal-tae.js'
import codeReviewData from '../../data/code-review.js'
import taData from '../../data/ctal-ta.js'
import agileTestingData from '../../data/agile-testing.js'
import moreAgileTestingData from '../../data/more-agile-testing.js'

const ContentPage = () => import('@/pages/ContentPage.vue')

const routes: RouteRecordRaw[] = [
  { path: '/index.html', redirect: '/' },
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { footerAttribution: 'none' },
  },
  {
    path: '/chapters',
    name: 'chapters',
    component: ContentPage,
    meta: {
      title: 'QA Hero study guide',
      subtitle: 'Advanced Level Agile Tester (v2.0) — Chapter-by-Chapter Review',
      tocTitle: 'Syllabus Chapters',
      highlightKey: 'ctal-at-highlights-ch1',
      data: chaptersData,
      footerAttribution: 'istqb',
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
      footerAttribution: 'none',
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
      footerAttribution: 'istqb',
    },
  },
  {
    path: '/ta',
    name: 'ta',
    component: ContentPage,
    meta: {
      title: 'ISTQB CTAL-TA Study Guide',
      subtitle: 'Advanced Level Test Analyst (v4.0) — Chapters 1–5',
      tocTitle: 'Syllabus Chapters',
      highlightKey: 'ctal-ta-highlights',
      data: taData,
      footerAttribution: 'istqb',
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
      footerAttribution: 'none',
    },
  },
  {
    path: '/agile-testing',
    name: 'agile-testing',
    component: ContentPage,
    meta: {
      title: 'Agile Testing',
      subtitle: 'A Practical Guide for Testers and Agile Teams — Gregory & Crispin (2009)',
      tocTitle: 'Book Parts',
      highlightKey: 'agile-testing-highlights',
      data: agileTestingData,
      footerAttribution: 'crispin-gregory',
    },
  },
  {
    path: '/more-agile-testing',
    name: 'more-agile-testing',
    component: ContentPage,
    meta: {
      title: 'More Agile Testing',
      subtitle: 'Learning Journeys for the Whole Team — Gregory & Crispin (2015)',
      tocTitle: 'Book Parts',
      highlightKey: 'more-agile-testing-highlights',
      data: moreAgileTestingData,
      footerAttribution: 'crispin-gregory',
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
  },
})
