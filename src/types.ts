import type { Component } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContentBlock = Record<string, any> & { type: string }

export interface TocItem {
  id: string
  label: string
  status: string
}

export interface ChapterData {
  chapters: Array<{
    id: string
    meta: { type: string; badges: Array<{ text: string }> }
    title: string
    content: ContentBlock[]
  }>
  toc: TocItem[]
  footerText: string
}

export type ComponentMap = Record<string, Component>
