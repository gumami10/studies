# Project Agent Rules

## Hard Constraints

- **DO NOT write new HTML files** unless the user explicitly asks for them.
- **DO NOT create new `.html` pages** in the project root or anywhere else.
- The existing static `.html` files (e.g., `index-static.html`, `CTAL-AT-Chapter1.html`, `quality-metrics.html`, `starred.html`) are **legacy reference only**.

## How to Add New Knowledge / Content

1.  **Create or update XML** in the `knowledge/xml/` folder following the schema defined in `xml-schema.md`.
2.  Run `npm run convert` to regenerate the JS data modules in `data/`.
3.  If a new page is needed, create a **Vue page component** in `src/pages/` — never a static `.html` file.
4.  Update `src/router/index.js` and `src/components/layout/AppNav.vue` if required.
5.  Run `npm test` before committing.

## Quick Reference

- `knowledge/xml/` = source of truth for all content.
- `data/` = generated from XML, git-tracked.
- `npm run convert` = XML → JS.
- `npm test` = vitest suite.
