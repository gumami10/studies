# AGENTS.md

## Repo Type
Vue 3 SPA with Vite build system. Study guide for ISTQB CTAL-AT certification.

## Stack
- Vue 3 (Composition API, `<script setup>`)
- Vue Router 4 (lazy routes)
- Pinia (state management for highlights + starred sections)
- Vite 5 (dev server + production build)
- Plain CSS (custom properties, no framework)

## Commands
- `npm run dev` — Start Vite dev server (HMR)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build
- `npm run convert` — Regenerate data files from `xml/*.xml` → `data/*.js`

## Project Structure
```
index.html            # Vite entry point (replaces old static index)
package.json          # Dependencies: vue, vue-router, pinia, vite
vite.config.js        # Vite config with @ alias → src/
data/                 # JS data modules (generated from XML)
  chapters-1-6.js     # Structured content for chapters 1-6
  quality-metrics.js  # Structured content for quality metrics
scripts/
  convert-xml.mjs     # XML → JS data conversion script
xml/                  # Source-of-truth XML files
  chapters-1-6.xml
  quality-metrics.xml
src/
  main.js             # createApp, Pinia, Router bootstrap
  App.vue             # Root: <router-view /> + ToTopButton
  router/index.js     # 4 routes (home, chapters, metrics, starred)
  stores/
    highlights.js     # Pinia store: per-page highlight CRUD + localStorage
    starred.js        # Pinia store: starred sections CRUD + localStorage
  composables/
    useScroll.js      # Scroll-to-top button visibility + behavior
    useHighlightToolbar.js  # Selection, toolbar positioning, apply/restore highlights
  utils/
    storage.js        # localStorage wrappers (get/set/available)
    sanitize.js       # HTML sanitization (DOMParser-based)
  components/
    layout/           # AppHeader, AppFooter, AppNav (router-link-based nav)
    content/          # ContentRenderer (dynamic component map), ContentSection
                      # ContentParagraph, ContentHeading, ContentList,
                      # DataTable, KeyBox, CompareCards, GlossaryList, BadgeList
    ui/               # StarButton, HighlightToolbar, ToTopButton,
                      # ChapterCard, LoadingSpinner, ErrorMessage, EmptyState
    toc/              # TableOfContents (with smooth scroll)
  pages/
    HomePage.vue      # Chapter grid + nav
    ChapterPage.vue   # Chapters 1-6: TOC + content + highlights
    MetricsPage.vue   # Quality Metrics: TOC + content + highlights
    StarredPage.vue   # Saved sections by source, with unstar buttons
  styles/
    main.css          # Full design system (ported from study-common.css)
```

## Adding a New Chapter/Page
1. Create XML in `xml/` following the existing schema
2. Run `npm run convert` to generate the JS data module
3. Create a new page component in `src/pages/`
4. Add the route in `src/router/index.js`
5. Add the nav link in `src/components/layout/AppNav.vue`

## Content Data Format
Each JS data module exports `{ chapters: [...], toc: [...], footerText: '...' }`.
Block types: `section`, `h2`, `h3`, `h4`, `heading`, `paragraph`, `list`, `table`,
`key-box`, `compare`, `glossary`, `meta`. See `scripts/convert-xml.mjs` for the full mapping.

## Legacy Files (kept for reference)
- `index-static.html` — original index page
- `CTAL-AT-Chapter1.html` — original chapters page
- `quality-metrics.html` — original metrics page
- `starred.html` — original starred page
- `study-common.css` — original CSS (now ported to `src/styles/main.css`)
- `study-common.js` — original JS (now Vue components + Pinia stores)
- `study-loader.js` — original XML loader (now `scripts/convert-xml.mjs` + ContentRenderer)
- `study-highlights.js` — original highlights (now `useHighlightToolbar.js` + highlights store)

## Agent Notes
- No lint, typecheck, or test commands configured. Not applicable to this repo.
- The old static `.html` files alongside the new Vue SPA are intentional — they serve as reference/staging.
- `data/` is git-tracked (generated from XML). Run `npm run convert` after XML changes and commit both.
- `dist/` is gitignored (build output).
