# Project Agent Rules

## Hard Constraints

- **DO NOT write new HTML files** unless the user explicitly asks for them.
- **DO NOT create new `.html` pages** in the project root or anywhere else.

## How to Add New Knowledge / Content

1.  **Create or update XML** in the `knowledge/xml/` folder following the schema defined in `xml-schema.md`.
2.  Run `npm run convert` to regenerate the JS data modules in `data/`.
3.  If a new page is needed, add a route in `src/router/index.js` using `ContentPage` with meta: `{ title, subtitle, tocTitle, highlightKey, data }`. No new Vue component needed.
4.  Update `src/components/layout/AppNav.vue` and `src/pages/HomePage.vue` if required.
5.  Run `npm test` before committing.

## Quick Reference

- `knowledge/xml/` = source of truth for all content.
- `data/` = generated from XML, git-tracked.
- `npm run convert` = XML → JS.
- `npm test` = vitest suite.
