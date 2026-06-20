---
name: study-guide
description: Create and manage XML-based study guide content for the Vue SPA. Use when the user asks to add a new chapter, create a new study guide page, write XML knowledge content, add sections, or wire up new content pages. Covers the full pipeline from XML authoring through conversion to route/nav/home wiring.
---

# Study Guide Content Authoring

End-to-end workflow for creating XML knowledge content that powers the study guide SPA.

## Trigger Conditions

Use this skill when the user:

- Asks to create a new study guide, chapter, or knowledge page
- Wants to add sections, chapters, or content to existing XML
- Needs to wire up a new content page (route, nav, home card)
- Says "add chapter", "new XML", "create study guide", "add knowledge"
- Wants to convert source material (PDF, notes, web content) into structured XML

## Architecture Overview

```
knowledge/xml/*.xml  →  scripts/convert-xml.mjs  →  data/*.js  →  ContentPage.vue (via route meta)
```

- **XML** is the single source of truth. Never edit `data/*.js` directly.
- **convert-xml.mjs** parses XML and emits `{ chapters, toc, footerText }`.
- **ContentPage.vue** is a generic renderer driven by route `meta.data`.
- **HomePage.vue** shows `ChapterCard` entries for each page.
- **AppDrawer.vue** lists cross-navigation links between pages in a left-side drawer.

## Workflow: Adding a New Study Guide Page

### Step 1: Create the XML File

Create `knowledge/xml/<slug>.xml` following the schema below.

### Step 2: Register in convert-xml.mjs

Add a `convertFile` + `writeFileSync` block in the `if (isMain)` section of `scripts/convert-xml.mjs`:

```js
const slugData = convertFile(resolve(XML_DIR, '<slug>.xml'))
writeFileSync(
  resolve(DATA_DIR, '<slug>.js'),
  `export default ${JSON.stringify(slugData, null, 2)}\n`,
)
```

Also add a `console.log` line for it.

### Step 3: Run Conversion

```bash
npm run convert
```

This generates `data/<slug>.js`.

### Step 4: Add Route

In `src/router/index.ts`:

```ts
import slugData from '../../data/<slug>.js'

// Inside routes array:
{
  path: '/<slug>',
  name: '<slug>',
  component: ContentPage,
  meta: {
    title: 'Page Title Shown as H1',
    subtitle: 'Descriptive subtitle shown below the title',
    tocTitle: 'Table of Contents Heading',
    highlightKey: '<slug>-highlights',
    data: slugData,
  },
},
```

**Meta fields explained:**

- `title` — The `<h1>` at the top of the page
- `subtitle` — Gray text below the title (e.g., "ISTQB CTAL-AT (v2.0) — Chapter-by-Chapter Review")
- `tocTitle` — Heading above the table of contents sidebar (e.g., "Syllabus Chapters", "Metrics Reference", "Research Sections")
- `highlightKey` — Unique localStorage key for user highlights on this page
- `data` — The imported JS data module

### Step 5: Add Navigation Link

Nav is now auto-derived from the manifest. `AppDrawer.vue` reads the manifest, groups by `<category>` (Personal / QA), and shows each knowledge as a link. No code change needed — Step 1's manifest entry is enough.

### Step 6: Add Home Page Card

In `src/pages/HomePage.vue`, add a `ChapterCard` inside the `.chapter-grid`:

```html
<ChapterCard to="/<slug>" title="Display Title" description="One-line description of the content" />
```

### Step 7: Verify

```bash
npm run convert
npm test
npm run typecheck
npm run lint:check
npm run dev   # visually check the new page
```

---

## XML Schema Reference

### Document Root

```xml
<?xml version="1.0" encoding="UTF-8"?>
<syllabus>
  <chapters>...</chapters>
  <toc>...</toc>
  <footer-text>...</footer-text>
</syllabus>
```

### Chapter Structure

```xml
<chapter id="unique-id">
  <meta>
    <badge>Label 1</badge>
    <badge>Label 2</badge>
  </meta>
  <title>Chapter Title</title>
  <!-- sections, key-boxes, and other blocks -->
</chapter>
```

**Chapter ID conventions:**

- Certification guides: `ch1`, `ch2`, `ch3`... with section IDs `s1-1`, `s1-2`...
- Research/reference: descriptive kebab-case like `cr-executive-summary`, `cr-common-patterns`
- Single-chapter references: one descriptive ID like `quality-metrics`

**Meta badges** appear as small pills above the chapter title. Use 2-3 badges to indicate:

- Chapter number or position (e.g., "Chapter 1")
- Time estimate (e.g., "60 minutes")
- Content type (e.g., "Reference", "Overview", "Patterns", "Deep Dive")
- Cognitive level (e.g., "K2 Focus: Understand")

### Section Structure

```xml
<section id="s1-1">
  <h2>1.1 Section Heading</h2>
  <!-- content blocks -->
</section>
```

Sections are the primary organizational unit within chapters. Each section gets a TOC anchor via its `id`.

### Block Types

#### `<paragraph>` — Body text with inline formatting

```xml
<paragraph>Text with <strong>bold</strong>, <em>italic</em>, <code>code</code>, and <br/> breaks.</paragraph>
```

Allowed inline: `<strong>`, `<em>`, `<b>`, `<i>`, `<code>`, `<span>`, `<br>`.

#### `<list>` — Bulleted, numbered, or checklist

```xml
<list type="ul">   <!-- bullets (default) -->
<list type="ol">   <!-- numbered -->
<list type="check"> <!-- checkmarks -->
  <item>Item text with <strong>bold</strong></item>
  <item>Another item</item>
</list>
```

Items support inline HTML. Use `type="check"` for learning objectives, key takeaways, and action items.

#### `<table>` — Data tables

```xml
<table>
  <row><cell>Header A</cell><cell>Header B</cell></row>
  <row><cell>Data</cell><cell span="2">Wide cell</cell></row>
</table>
```

First row renders as header. Cells support inline HTML and `span` attribute for colspan.

#### `<key-box>` — Highlighted callout box

```xml
<key-box>
  <heading>Box Title</heading>
  <paragraph>Content...</paragraph>
  <list type="check">...</list>
</key-box>
```

Must start with `<heading>`. Used for: learning objectives, key takeaways, guiding principles, important reminders, definitions.

#### `<compare>` — Side-by-side comparison cards

```xml
<compare>
  <card type="pos">
    <heading>Pros / Approach A</heading>
    <list type="ul">...</list>
  </card>
  <card type="neg">
    <heading>Cons / Approach B</heading>
    <list type="ul">...</list>
  </card>
</compare>
```

`type="pos"` = green/positive styling, `type="neg"` = red/negative. Cards can contain paragraphs, lists, etc. Use for pros/cons, before/after, approach comparisons.

#### `<glossary>` — Term-definition pairs

```xml
<glossary>
  <term>Term Name</term>
  <definition>Definition text.</definition>
  <term>Another Term</term>
  <definition>Another definition.</definition>
</glossary>
```

Terms and definitions are paired by order. Renders as a styled definition list.

#### Heading levels within sections

- `<h2>` — Primary section heading (usually numbered: "1.1 Test Types")
- `<h3>` — Sub-section heading
- `<h4>` — Sub-sub-section heading
- `<heading>` — Generic heading (used inside key-boxes and compare cards)

### Table of Contents

```xml
<toc>
  <item id="ch1" status="active">Chapter 1 Title</item>
  <item id="s1-1" status="active">1.1 Section Title</item>
</toc>
```

**TOC conventions:**

- `id` must match a chapter or section `id` for anchor linking
- TOC can list chapters only, sections only, or a mix
- For certification guides: list chapter IDs (one TOC entry per chapter)
- For reference pages: list section IDs (granular TOC per section)
- `status` attribute is optional, defaults to `active`

### Footer

```xml
<footer-text>Based on ISTQB CTAL-AT Syllabus v2.0 — Chapter-by-Chapter Review</footer-text>
```

---

## Content Writing Patterns

These are the recurring patterns observed across all existing XML files. Follow these conventions for consistency.

### Chapter Opening Pattern

Every chapter starts with:

1. `<meta>` badges (2-3 pills: chapter number, time estimate, focus area)
2. `<title>` (concise, descriptive)
3. Optional opening `<key-box>` with learning objectives or executive summary
4. Then sections

**Example (certification chapter):**

```xml
<chapter id="ch1">
  <meta>
    <badge>Chapter 1</badge>
    <badge>60 minutes</badge>
    <badge>K2 Focus: Understand</badge>
  </meta>
  <title>Test Strategy and Test Approach Challenges</title>
  <key-box>
    <heading>Learning Objectives</heading>
    <list type="check">
      <item>Compare test types to be performed during and after an iteration</item>
      <item>Explain when end-to-end testing should be performed</item>
    </list>
  </key-box>
  <section id="s1-1">...</section>
</chapter>
```

**Example (reference/research chapter):**

```xml
<chapter id="cr-executive-summary">
  <meta>
    <badge>Research Plan</badge>
    <badge>Overview</badge>
  </meta>
  <title>Executive Summary</title>
  <section id="cr-research-objective">...</section>
</chapter>
```

### Section Opening Pattern

Each section typically opens with one of:

- A `<paragraph>` that introduces the topic in 1-2 sentences
- A `<key-box>` that states the core principle or objective
- An `<h2>` heading followed immediately by a paragraph

### Key Takeaway Pattern

End important sections with a `<key-box>` containing the distilled insight:

```xml
<key-box>
  <heading>Key Takeaway</heading>
  <paragraph>The one thing to remember about this section.</paragraph>
</key-box>
```

Variations of heading text: "Key Takeaway", "Key Insight", "Guiding Principle", "Remember", "Key Point".

### Comparison Pattern

Use `<compare>` for pros/cons, trade-offs, or side-by-side approaches:

```xml
<compare>
  <card type="pos">
    <heading>Formal Testing</heading>
    <list type="ul"><item>Traceable</item><item>Repeatable</item></list>
  </card>
  <card type="neg">
    <heading>Holistic Testing</heading>
    <list type="ul"><item>Hard to measure</item><item>Context-sensitive</item></list>
  </card>
</compare>
```

For more than 2 comparisons, use multiple `<compare>` blocks in sequence (as seen in code-review.xml).

### Table Pattern

Tables are used heavily for:

- **Concept definitions**: Column 1 = term, Column 2 = description, Column 3 = example/when to use
- **Comparison matrices**: Rows = items, Columns = attributes
- **Process steps**: Column 1 = step number, Column 2 = name, Column 3 = description
- **Situation → Action**: Column 1 = problem/situation, Column 2 = recommended action

**Table writing conventions:**

- First row is always the header
- Use `<strong>` in the first column to make row labels stand out
- Keep cell text concise — tables are reference material, not prose
- Use `span` attribute when a cell needs to span multiple columns

### List Pattern

- `type="check"` for: learning objectives, action items, checklist items, key takeaways
- `type="ul"` for: general enumerations, characteristics, features
- Use `<strong>` at the start of list items for scannable bold lead-ins:
  ```xml
  <item><strong>Risk</strong> — impact and likelihood of system-level failure</item>
  <item><strong>Feedback time</strong> — heavy suites slow delivery</item>
  ```

### Glossary Pattern

Place glossaries as the last section of a chapter/page. Use for domain-specific terminology:

```xml
<section id="metrics-glossary">
  <h2>Key Terms</h2>
  <glossary>
    <term>Term</term>
    <definition>Clear, concise definition.</definition>
  </glossary>
</section>
```

### Writing Style

- **Bold key terms** on first use within a paragraph: `<strong>GQM (Goal-Question-Metric)</strong>`
- **Italicize** for emphasis, quotes, and titles: `<em>"When a measure becomes a target..."</em>`
- **Use `<code>`** for technical terms, tool names, commands: `<code>git send-email</code>`
- **Keep paragraphs short** — 2-4 sentences max. Break long explanations into lists or tables.
- **Use em dashes** (—) for asides and explanations within sentences
- **Write for scanning** — readers skim study guides. Front-load important info in bold.
- **Be decisive** — state conclusions clearly. "X is better than Y for Z" rather than hedging.

### Content Summarization Approach

When converting source material (PDFs, articles, notes) into XML:

1. **Extract the structure first** — identify the natural chapter/section hierarchy
2. **Distill each section** to its essential points — remove filler, examples that don't add value, repetition
3. **Choose the right block type** for each piece of content:
   - Factual comparisons → `<table>`
   - Enumerated items → `<list>`
   - Key principles → `<key-box>`
   - Trade-offs → `<compare>`
   - Definitions → `<glossary>`
   - Narrative explanation → `<paragraph>`
4. **Add learning objectives** at the top of certification chapters (as `<key-box>` with `<list type="check">`)
5. **Add key takeaways** at the bottom of important sections
6. **Build the TOC** to match the section structure — use section-level TOC for reference pages, chapter-level for certification guides
7. **Write the footer** to cite the source material

### Handling Large Content

For very large syllabi (like CTAL-AT with 1400+ lines):

- Split into logical chapters, each with 3-8 sections
- Keep individual sections focused on one topic
- Use the TOC to provide navigation — don't try to fit everything into one section
- Consider splitting into multiple XML files/pages if the content serves different purposes (e.g., main chapters vs. metrics reference)

---

## Converting Source Material Checklist

When the user provides source material to convert:

1. [ ] Read and understand the source material structure
2. [ ] Identify chapter boundaries and section hierarchy
3. [ ] Create `knowledge/xml/<slug>.xml` with proper schema
4. [ ] Add `<meta>` badges to each chapter
5. [ ] Add learning objectives as `<key-box>` (for certification content)
6. [ ] Convert prose to appropriate block types (tables, lists, key-boxes, etc.)
7. [ ] Add key takeaway boxes at section endings
8. [ ] Build `<toc>` matching the section structure
9. [ ] Add `<footer-text>` citing the source
10. [ ] Register in `scripts/convert-xml.mjs`
11. [ ] Run `npm run convert`
12. [ ] Add route in `src/router/index.ts` (auto-derived from manifest)
13. [ ] Add nav link in `src/components/layout/AppDrawer.vue` (auto-derived from manifest)
14. [ ] Add home card in `src/pages/HomePage.vue` (auto-derived from manifest)
15. [ ] Run `npm test && npm run typecheck && npm run lint:check`
16. [ ] Run `npm run dev` and visually verify

---

## Common Pitfalls

- **Never edit `data/*.js` directly** — they are generated from XML
- **Section IDs must be unique** across the entire XML file (they become DOM anchors)
- **TOC `id` attributes must match** an actual chapter or section `id`
- **`<key-box>` must have `<heading>`** as its first meaningful child
- **`<glossary>` pairs by order** — `<term>` and `<definition>` must alternate
- **Inline HTML in paragraphs** is limited to: `<strong>`, `<em>`, `<b>`, `<i>`, `<code>`, `<span>`, `<br>`
- **Table first row is always the header** — don't put data in the first `<row>`
- **highlightKey must be unique** per route to avoid localStorage collisions
- **Remember to update convert-xml.mjs** — forgetting this is the #1 mistake
