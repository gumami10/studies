# QA Hero study guide

A personal study companion for the **ISTQB Certified Tester Advanced Level — Agile Technical Tester (CTAL-AT)** certification.

Built as a Vue 3 single-page application to make studying interactive — highlight key passages, star important sections, and navigate content quickly.

## Tech Stack

- Vue 3 (Composition API, `<script setup>`)
- Vue Router 4
- Pinia (state management)
- Vite 5
- Plain CSS with custom properties

## Features

- Structured content for certification chapters
- Highlight text and save to localStorage
- Star/unstar sections for quick reference
- Table of contents with smooth scrolling
- Responsive layout

## Project Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Convert XML knowledge files to JS data modules
npm run convert

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Content Workflow

All study content lives in `knowledge/xml/` and is converted to `data/*.js` modules:

1. Edit or add XML files in `knowledge/xml/`
2. Run `npm run convert` to regenerate data files
3. Commit both XML and generated JS files

## Project Structure

```
knowledge/xml/          # Source-of-truth study content (XML)
data/                   # Generated JS data modules
src/
  pages/                # Home, content, starred pages
  components/           # Layout, content renderers, UI, TOC
  stores/               # Pinia: highlights + starred sections
  composables/          # Scroll behavior, highlight toolbar
  router/               # Route definitions
```

---

_Personal project for QA study and exam preparation._
