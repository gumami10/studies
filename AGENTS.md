# AGENTS.md

> **Hard rules for all agents working on this repo — see `.agents/AGENTS.md` for agent constraints and `.agents/xml-schema.md` for the XML content format.**

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
- `npm run convert` — Regenerate data files from `knowledge/xml/*.xml` → `data/*.js`
- `npm test` — Run vitest test suite
- `npm run test:watch` — Run vitest in watch mode
- `npm run test:coverage` — Run vitest with coverage report

## Project Structure
```
index.html            # Vite entry point
package.json          # Dependencies: vue, vue-router, pinia, vite
vite.config.js        # Vite config with @ alias → src/
data/                 # JS data modules (generated from XML)
  chapters-1-6.js     # Structured content for chapters 1-6
  quality-metrics.js  # Structured content for quality metrics
  ctal-tae.js         # Structured content for CTAL-TAE
  code-review.js      # Structured content for code review research
scripts/
  convert-xml.mjs     # XML → JS data conversion script
knowledge/            # Study materials (PDFs, MDs, XML source-of-truth)
  xml/
    chapters-1-6.xml
    quality-metrics.xml
    ctal-tae.xml
    code-review.xml
src/
  main.js             # createApp, Pinia, Router bootstrap
  App.vue             # Root: <router-view /> + ToTopButton
  router/index.js     # 6 routes (home, chapters, metrics, tae, code-review, starred)
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
    ContentPage.vue   # Generic content page (driven by route meta: title, subtitle, tocTitle, data, highlightKey)
    StarredPage.vue   # Saved sections by source, with unstar buttons
  styles/
    main.css          # Full design system
```

## Adding a New Chapter/Page
1. Create XML in `knowledge/xml/` following the schema documented in `.agents/xml-schema.md`
2. Run `npm run convert` to generate the JS data module
3. Add a route in `src/router/index.js` using `ContentPage` with meta: `{ title, subtitle, tocTitle, highlightKey, data }`
4. Import the data module at the top of `router/index.js`
5. Add the nav link in `src/components/layout/AppNav.vue` and the home card in `src/pages/HomePage.vue`

## Content Data Format
Each JS data module exports `{ chapters: [...], toc: [...], footerText: '...' }`.
Block types: `section`, `h2`, `h3`, `h4`, `heading`, `paragraph`, `list`, `table`,
`key-box`, `compare`, `glossary`, `meta`. See `scripts/convert-xml.mjs` for the full mapping.

## Agent Notes
- **DO NOT write new HTML files** unless the user explicitly asks for them. The project is a Vue SPA; new pages are Vue components in `src/pages/`, not `.html` files.
- **All new content must be authored as XML** in `knowledge/xml/` following the schema in `.agents/xml-schema.md`. Run `npm run convert` after XML changes.
- Tests use vitest + @vue/test-utils + happy-dom. Run `npm test` before committing changes.
- Test files live in `src/__tests__/` and `scripts/__tests__/` matching the source structure.
- `data/` is git-tracked (generated from XML). Run `npm run convert` after XML changes and commit both.
- `dist/` is gitignored (build output).
