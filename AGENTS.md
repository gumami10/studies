# AGENTS.md

> **Hard rules for all agents working on this repo — see `.agents/AGENTS.md` for agent constraints and `.agents/xml-schema.md` for the XML content format.**

## Repo Type

Vue 3 SPA with Vite build system. Study guide for ISTQB CTAL-AT certification.

## Stack

- Vue 3 (Composition API, `<script setup lang="ts">`)
- TypeScript (strict mode, vue-tsc for .vue type checking)
- Vue Router 4 (lazy routes)
- Pinia (state management for highlights + starred sections)
- Vite 5 (dev server + production build)
- Plain CSS (custom properties, no framework)
- ESLint (flat config) + Prettier (formatting)
- Husky + lint-staged (pre-commit hooks)

## Commands

- `npm run dev` — Start Vite dev server (HMR)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build
- `npm run convert` — Regenerate data files from `knowledge/xml/*.xml` → `data/*.js`
- `npm test` — Run vitest test suite
- `npm run test:watch` — Run vitest in watch mode
- `npm run test:coverage` — Run vitest with coverage report
- `npm run lint` — Run ESLint with auto-fix
- `npm run lint:check` — Run ESLint (check only, no fixes)
- `npm run typecheck` — Run vue-tsc type checking (no emit)
- `npm run format` — Format all files with Prettier
- `npm run format:check` — Check formatting without writing

## Project Structure

```
index.html            # Vite entry point
package.json          # Dependencies: vue, vue-router, pinia, vite
vite.config.ts        # Vite config with @ alias → src/
tsconfig.json         # TypeScript config (strict, bundler module resolution)
eslint.config.js      # ESLint flat config (Vue + TS + Prettier)
CONTEXT.md            # Domain language (knowledge module, knowledge manifest, ...)
data/                 # JS data modules (generated from XML)
  manifest.js         # KnowledgeCatalog — generated aggregate of all <manifest> elements
  manifest.d.ts       # Type declaration for manifest.js
  <id>.js             # Chapter data for one knowledge module
scripts/
  convert-xml.mjs     # XML → JS data conversion script (also emits manifest)
  migrate-add-manifest.mjs  # One-shot: synthesised <manifest> blocks for the 7 legacy XMLs
knowledge/            # Study materials (PDFs, MDs, XML source-of-truth)
  xml/
    <id>.xml          # One XML per knowledge module; filename = <id> from <manifest>
src/
  main.ts             # createApp, Pinia, Router bootstrap
  App.vue             # Root: <router-view /> + ToTopButton
  types.ts            # Shared TypeScript interfaces (ChapterData, KnowledgeManifest, KnowledgeCatalog, ...)
  env.d.ts            # Vue SFC + Vite type declarations
  router/index.ts     # buildRouter(catalog) + default export. Routes are data, not code.
  stores/
    highlights.ts     # Pinia store: per-page highlight CRUD + localStorage
    starred.ts        # Pinia store: starred sections CRUD + localStorage
  composables/
    useContentCatalog.ts    # Catalog access: list, findById, getChapterData (single seam for everything)
    useScroll.ts            # Scroll-to-top button visibility + behavior
    useHighlightToolbar.ts  # Selection, toolbar positioning, apply/restore highlights
  utils/
    storage.ts        # localStorage wrappers (get/set/available)
    sanitize.ts       # HTML sanitization (DOMParser-based)
  components/
    layout/           # AppDrawer (left nav, mobile-aware, reads from useContentCatalog), AppFooter
    content/          # ContentRenderer (dynamic component map), ContentSection
                      # ContentParagraph, ContentHeading, ContentList,
                      # DataTable, KeyBox, CompareCards, GlossaryList, BadgeList
    ui/               # StarButton, HighlightToolbar, ToTopButton,
                      # ChapterCard, LoadingSpinner, ErrorMessage, EmptyState
    toc/              # TableOfContents (with smooth scroll)
  pages/
    HomePage.vue      # Chapter grid (reads from useContentCatalog)
    ContentPage.vue   # Generic content page (driven by useContentCatalog from route.meta.knowledgeId)
    StarredPage.vue   # Saved sections by source, with unstar buttons
  styles/
    main.css          # Full design system
```

## Adding a New Knowledge Module

1. Create `knowledge/xml/<id>.xml` following the schema in `.agents/xml-schema.md`.
   The XML must include a `<manifest>` block with all 11 required fields
   (id, path, name, navLabel, title, subtitle, tocTitle, homeDescription, homeOrder,
   highlightKey, footerAttribution). The convert script fails loudly if any are missing.
2. Run `npm run convert`. The script reads every XML, writes `data/<id>.js` per chapter
   set, and writes a single aggregated `data/manifest.js` (and `data/manifest.d.ts`).
3. Done. The router, nav, home page, and footer all derive from the manifest.

The router file no longer needs per-knowledge edits. The nav, home page, and footer
also no longer need per-knowledge edits. The only file per knowledge is the XML.

## Agent Notes

- **DO NOT write new HTML files** unless the user explicitly asks for them. The project is a Vue SPA; new pages are Vue components in `src/pages/`, not `.html` files.
- **All new content must be authored as XML** in `knowledge/xml/` following the schema in `.agents/xml-schema.md`. Run `npm run convert` after XML changes.
- Tests use vitest + @vue/test-utils + happy-dom. Run `npm test` before committing changes.
- Test files live in `src/__tests__/` and `scripts/__tests__/` matching the source structure.
- `data/` is git-tracked (generated from XML). Run `npm run convert` after XML changes and commit both.
- `dist/` is gitignored (build output).
- All source files are TypeScript (`.ts`). Vue SFCs use `<script setup lang="ts">`.
- Run `npm run typecheck` and `npm run lint:check` after code changes to ensure type safety and code quality.
- Pre-commit hooks (Husky + lint-staged) run ESLint, Prettier, typecheck, and tests automatically.
