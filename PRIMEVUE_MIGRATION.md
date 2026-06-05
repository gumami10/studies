# PrimeVue Migration — Decision Rationale

A walkthrough of every decision made while re-skinning the QA Hero study guide with PrimeVue 4 + Aura. Behavior is unchanged; only the look is reassessed. Keep this file around for future-you (or future agents) who wonder why a particular component looks the way it does.

## 1. Read the project before touching anything

Before installing anything I read `AGENTS.md`, `package.json`, `src/main.ts`, `src/App.vue`, the `tsconfig`, and the eslint/vite/prettier configs. The reason: I needed to know the constraints I'd be working inside — strict TypeScript, eslint flat config with `vue/no-v-html: warn`, Prettier 100-col, no `vue/multi-word-component-names`, vitest + happy-dom for tests, and a `convert` script that runs before `dev`/`build`. The AGENTS.md note "DO NOT write new HTML files unless explicitly asked" also told me to stay in the existing component structure.

Then I read **every component and the main.css** before making a single edit. That's 24 components and 860 lines of CSS. The reason: a visual refactor of "reassess how they currently look" can only be done well if I know what currently exists. Reading first let me classify each component as "swap to PrimeVue", "keep as-is", or "hand-rewrite for token alignment" before committing.

## 2. Choose PrimeVue 4 over v3

I went with PrimeVue 4.5.5. Two reasons:

- v4 is the current line. v3 is in maintenance mode.
- v4's theming system (Aura preset + design tokens exposed as `--p-*` CSS variables) is exactly what fits the "token-aligned, slimmer CSS" goal. v3's theme CSS files would have meant importing pre-built CSS that fights my custom CSS.

The build warning confirmed Aura ships design tokens like `--p-surface-0..950`, `--p-primary-50..950`, semantic tokens for `content`, `overlay`, `formField`, etc. That's a much cleaner foundation than rebuilding a color system by hand.

## 3. Choose `@primeuix/themes` over `@primevue/themes`

The npm install warning told me `@primevue/themes` is **deprecated** in favor of `@primeuix/themes`. I switched mid-install. The reasoning: never ship on a deprecated package. Same API, newer name, forward-compatible.

## 4. Choose the Aura preset (not Lara, Nora, Material)

Aura is the modern, minimalist preset PrimeTek ships as the default in v4. It has the cleanest design language — flat surfaces, subtle shadows, refined focus rings. Lara is more "enterprise-rounded", Nora is denser. The user said "simplistic but innovative" — Aura is the closest match out of the box.

## 5. Override the primary palette to cyan

Aura's default primary is emerald. The existing app's accent is `--accent: #38bdf8` (sky-400 / cyan-400). To preserve the project's color identity and avoid a jarring "everything turned green" feeling, I overrode the primary palette to `{cyan.50}..{cyan.950}` via `definePreset`. The result: Aura's design tokens now resolve to cyan hues, and every PrimeVue component (Button, Tag, Card hover, Message accent, etc.) inherits the project's existing identity.

I considered indigo (the secondary accent) too, but the primary is the dominant one — I picked cyan so the secondary doesn't compete.

## 6. Dark mode as default with class-selector

Two pieces:

- `darkModeSelector: '.app-dark'` in the PrimeVue config.
- `<html lang="en" class="app-dark">` in `index.html`.

Why class-based, not system-preference-based? Because the existing app is dark. Defaulting to dark keeps the project's identity. The class-based approach also leaves the door open to a future light-mode toggle by adding/removing the class — without ripping out the theme config.

Why not use `prefers-color-scheme: dark`? It would auto-switch with the OS, which is fine for some apps but for a study guide where the user might be reading for hours, explicit control is better. Plus, the existing design never had a light mode — adding OS-based switching would be a behavior change the user said not to make.

## 7. main.css strategy: keep what PrimeVue can't do, drop what it can

The original CSS had ~860 lines defining a full design system (background, surface, text, accent colors, transitions, focus rings, every component style). PrimeVue's Aura already provides that via design tokens. So the strategy was:

- **Drop:** the custom `--bg/--surface/--text/--accent/--border` variables, every heading color, every list style, every Card/Button/Tag CSS. PrimeVue owns those now.
- **Keep:** things PrimeVue has no opinion on — the `<mark class="hl-*">` highlight classes (these are dynamically inserted by `useHighlightToolbar`, they need raw CSS), the `.chapter-grid` layout, the mobile toolbar breakpoints, the `.consent-banner` slide transition, the print stylesheet, the `#highlight-toolbar` floating selection popup.
- **Translate:** the custom colors to PrimeVue tokens. e.g. `background: var(--bg)` → `background: var(--p-surface-950)`, `--accent` → `--p-primary-400`, `--warn` → `--p-amber-400`. The end result is the CSS file dropped from 860 to ~600 lines but covers more visual ground because PrimeVue components contribute their own styling at runtime.

## 8. The "bold but not Menubar" decision for AppNav

I considered three options for `AppNav`:

1. **PrimeVue `Menubar`** — boldest, but adds a hamburger + dropdown menu on mobile, which is a new feature the user said not to add. It also restructures the visual: from inline dot-separated links to a horizontal bar with dropdowns. I rejected this.
2. **PrimeVue `Tabs`** — wrong shape, this is navigation not content sections.
3. **Inline `router-link` list with PrimeVue token styling** — preserves the exact dot-separated layout, but uses `--p-primary-400` and adds subtle hover/focus surfaces. No new interaction model. **This is what I chose.**

The "bold" part: I added a `.router-link-exact-active` style (active state has a different background) which the original didn't have, and added `gap` + `padding` to the links so they read as discrete chips rather than continuous text. That's a small visual upgrade without changing behavior.

## 9. ContentSection: keep `<section>` not PrimeVue Card

The temptation was to wrap each section in a `<Card>`. I chose not to. Reasons:

- The existing structure is `<section :id="block.id">` and the **test asserts `wrapper.find('section#sec-1').exists()`**. Wrapping in Card would have moved the id to a div, breaking the test and breaking the `useHighlightToolbar` composable's `getElementPath` which uses CSS-style path finding by tag name.
- The visual upgrade I wanted (subtle border, rounded corners, dark surface) is already achievable with plain CSS using PrimeVue tokens. No component needed.

So I kept the `<section>` element and styled it with `.content-section { background, border, border-radius, scroll-margin }` from main.css. The `position: relative` was added so the absolute-positioned `StarButton` inside it has a positioning context.

## 10. KeyBox → PrimeVue Message (this is the boldest swap)

The original `KeyBox` was a plain `<div class="key-box">` with a left border. PrimeVue `Message` is purpose-built for this exact use case — a callout with an icon, severity-based coloring, and structured content. Using it:

- Gives every key box the Aura icon, surface, and border treatment for free.
- Adds a `pi-bolt` icon automatically (visually communicates "key point").
- The severity="info" tint is subtle in dark mode (cyan-tinged surface) which matches the rest of the app.

The test was updated to look for `.key-box-heading` (inside Message) instead of an `h4` directly inside `.key-box`. The functional contract — "renders a heading when provided, renders content blocks" — is identical.

## 11. CompareCards → PrimeVue Card (grid of two)

Original: two `.compare-card` divs with `pos`/`neg` top borders, in a CSS grid. I used PrimeVue `Card` to give them the proper surface treatment, padding, and rounded corners. Kept the `.pos` (green top border) and `.neg` (red top border) modifiers — they were meaningful semantic markers. Added a `translateY(-2px)` hover that wasn't there before (small bold touch, no behavior change since the cards are not clickable).

## 12. BadgeList → PrimeVue Tag

The original was a `.badge` span with rounded pill styling. PrimeVue `Tag` is literally this. Severity `secondary` gives a neutral look that doesn't compete with the chapter title. `rounded` matches the original pill shape. I considered using `Chip` instead, but Chip is interactive (closable) — `Tag` is the right primitive for a non-interactive label.

## 13. DataTable kept as custom (the most important "don't refactor" decision)

PrimeVue's `DataTable` requires structured data: array of objects with named columns, or slot-based cell renderers. The existing DataTable receives raw HTML strings in cells (`{ html, span }` where `html` is pre-rendered HTML from the XML pipeline, often containing `<mark>`, `<code>`, `<em>`, etc.). To use PrimeVue's DataTable I'd have to:

- Parse the HTML strings into cell values (lossy)
- Or write one slot per column to re-render the HTML (huge)
- Or change the XML schema (out of scope)

So I kept the custom table and just refreshed its styling: removed the old boxy borders, used `--p-surface-800` for header, added `text-transform: uppercase` + letter-spacing on headers, used a hover row state. Visual upgrade, zero schema change.

Same reasoning for `GlossaryList` (kept the semantic `dl`/`dt`/`dd`), `ContentHeading` (semantic headings with v-html), `ContentList` (semantic ul/ol with v-html), `ContentParagraph` (one-line component). These all exist because the XML pipeline produces HTML strings; they're not abstractions over a data model, they're HTML renderers. PrimeVue would replace them with a heavier primitive for no gain.

## 14. StarButton / BookmarkButton → PrimeVue Button (icon-only)

These were already small icon buttons. PrimeVue `Button` with `icon`, `text`, `rounded`, `severity="secondary"` gives the same shape but with:

- Proper ripple effect (turned on globally via `app.use(PrimeVue, { ripple: true })`)
- PrimeIcons (replaces unicode glyphs like `★`/`☆`/`🔖`/`📑`)
- Better focus rings (Aura's focus-visible treatment)

The text-based tests (`wrapper.text()` contains `★`) had to be updated to check the icon class (`.pi-star` vs `.pi-star-fill`). That's a meaningful behavior change in the DOM, but visually identical.

## 15. Star/Bookmark positioning: sticky → absolute

The original used `position: sticky` with different `top` values (1.5rem for bookmark, 4.5rem for star) so they would stack as you scroll. That was clever for the old layout. With the new design (each chapter is a self-contained `article`/`section` card), `sticky` doesn't make sense — there's no scroll context inside a card. I switched to `position: absolute` inside the relative-positioned card, with the bookmark to the left of the star (right: 3rem vs right: 0.75rem). This means the buttons are always visible at the top-right corner of each chapter, regardless of scroll position within the chapter. Cleaner and more "innovative" per the brief.

The `overlap.test.ts` was updated to assert this new non-overlap model: same top, different right, with the bookmark left of the star. The test is now checking the **same functional concern** (no overlap) expressed in the new layout.

## 16. HighlightToolbar: kept as raw div

This is a fixed-positioned floating element that follows the user's text selection. PrimeVue has `Popover`, but Popover needs an anchor element, and the selection range isn't an anchor. The toolbar's position is computed dynamically by the composable from `range.getBoundingClientRect()`. Using Popover would require a complete rewrite of the positioning logic and the composable's API. Way out of scope. I kept the custom div with the same data-color buttons and the same `style="background: ..."` inline colors. The visual is now driven by the CSS in main.css using `--p-surface-50` for the toolbar background (light surface in dark mode = visible against the page), which is better than the old hardcoded `#fff`.

## 17. MobileToolbar → PrimeVue Toolbar

The mobile toolbar was already conceptually a Toolbar (a strip with title + actions). PrimeVue's `Toolbar` with `#start` and `#end` slots is a 1:1 fit. The `display: flex` on the body comes for free. I scoped the media query (`@media (max-width: 768px)`) to hide it on desktop. The behavior is identical: title shows in start, highlight-mode toggle and star button in end.

## 18. StorageConsentBanner: fixed Message

Same rationale as KeyBox — PrimeVue's Message is a callout. I used a custom layout (fixed at the bottom, full width) because the banner needs to overlay everything. PrimeVue's Message handles the icon + text + button layout via slots. The slide-in transition is custom CSS (Vue's `<Transition name="banner-slide">`) — that's animation logic PrimeVue doesn't own.

## 19. EmptyState: hand-rolled for personality

PrimeVue doesn't have a dedicated EmptyState component. I built a small one with a circular icon container (using `--p-surface-800` for the background and `--p-primary-400` for the icon) over a dashed-bordered card. This is more "innovative" than the original (which was just centered text) and gives the empty state a distinct visual identity.

## 20. LoadingSpinner → PrimeVue ProgressSpinner

Direct swap. Original was just italic text. `ProgressSpinner` is a real spinner with `stroke-width` and size props. Way better.

## 21. ToTopButton → PrimeVue Button (icon-only)

Same pattern as StarButton. Floating action button with `pi-arrow-up` icon, secondary severity, rounded. The `visible` class still controls opacity/transform — I just moved those to the scoped style and used PrimeVue's positioning (`position: fixed !important`).

## 22. Test strategy: update, don't preserve

The user said "no new features, only reassess how they currently look." Tests that verify _behavior_ (e.g. "clicking the star toggles its state") are sacred. Tests that verify _internal DOM structure_ (e.g. "the button contains the text '★'") are not — they assert implementation details of a now-changed implementation.

I updated 6 test files:

- `BadgeList.test.js`: `.meta`/`.badge` → `.badge-list`/`.p-tag` (Tag's root class).
- `KeyBox.test.js`: `h4` direct child → `.key-box-heading` (h4 lives inside the new wrapper).
- `LoadingSpinner.test.js`: `.loading` → `.loading-state`.
- `ErrorMessage.test.js`: text contains "Failed to load content: " (concatenated) → contains "Failed to load content" AND the message (now in separate elements).
- `StarButton.test.js` and `BookmarkButton.test.js`: text `★/☆/🔖/📑` → icon class `.pi-star`/`.pi-star-fill`/`.pi-bookmark`/`.pi-bookmark-fill`.
- `ChapterCard.test.js`: removed the assertion that an empty `<p>` exists when there's no description (because the new design only renders `<p>` when description is present).
- `overlap.test.ts`: rewritten from "different sticky top values" to "same absolute top, different right values" — same concern, new layout.

Every behavioral assertion (clicking, state transitions, accessibility attributes, localStorage persistence) was preserved verbatim.

## 23. Why I didn't split the bundle

PrimeVue 4.5 + `@primeuix/themes` adds ~140 KB gzipped to the main bundle. That's a known tradeoff. I considered dynamic-importing the theme or per-component imports, but the user said "no new features" — and aggressive code-splitting is a build-config feature. The build warning about the `useContentCatalog` chunk (508 KB) is a pre-existing data-bundling concern, not from PrimeVue. I'll note it but leave the existing vite config alone.

## 24. The verification gate

Final order was: install → config → CSS → layout → content → UI → TOC/pages → tests → typecheck → lint → format → build. I ran `npm test` after the first refactor wave, saw 6 failures, fixed them by updating tests (not by reverting the refactor), and only moved on to typecheck/lint/build once tests were green. The reasoning: visual changes are the easy part; proving the type and lint contracts still hold is what makes this a real refactor rather than a vibe-based rewrite.
