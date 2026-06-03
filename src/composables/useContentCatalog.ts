import catalog from '../../data/manifest.js'
import type { ChapterData, ChapterModuleMap, KnowledgeManifest } from '@/types'

const chapterModules = import.meta.glob<{ default: ChapterData }>(
  ['../../data/*.js', '!**/manifest.js'],
  { eager: true },
)

const chapterData: ChapterModuleMap = Object.fromEntries(
  Object.entries(chapterModules).map(([path, mod]) => {
    const filename = path.split('/').pop()?.replace('.js', '') ?? ''
    return [filename, mod.default]
  }),
)

const sortedList: KnowledgeManifest[] = Object.values(catalog)
  .slice()
  .sort((a, b) => a.homeOrder - b.homeOrder)

export function useContentCatalog() {
  return {
    list: sortedList,
    byId: catalog,
    findById(id: string): KnowledgeManifest | undefined {
      return catalog[id]
    },
    getChapterData(id: string): ChapterData | undefined {
      return chapterData[id]
    },
  }
}
