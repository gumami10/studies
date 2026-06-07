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

export type FooterAttribution = 'istqb' | 'crispin-gregory' | 'none'

export interface KnowledgeManifest {
  id: string
  path: string
  name: string
  navLabel: string
  title: string
  subtitle: string
  tocTitle: string
  homeDescription: string
  homeOrder: number
  highlightKey: string
  footerAttribution: FooterAttribution
}

export interface Placemark {
  id: string
  knowledgeId: string
  sectionId: string
  title: string
  source: string
  html?: string
  timestamp: number
}

export type PlacemarkMap = Record<string, Placemark>

export type KnowledgeCatalog = Record<string, KnowledgeManifest>

export type ChapterModuleMap = Record<string, ChapterData>
