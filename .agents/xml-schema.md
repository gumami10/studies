# XML Content Schema (Distilled)

This document distils the XML schema used in the `knowledge/xml/` folder.  
**All new knowledge MUST be authored as XML following this schema.**  
The `scripts/convert-xml.mjs` parser transforms these files into JS data modules consumed by the Vue SPA.

## Document Root

```xml
<?xml version="1.0" encoding="UTF-8"?>
<syllabus>
  <chapters>...</chapters>
  <toc>...</toc>
  <footer-text>...</footer-text>
</syllabus>
```

## Top-Level Structure

| Element | Required | Description |
|---------|----------|-------------|
| `<chapters>` | Yes | Container for one or more `<chapter>` elements. |
| `<toc>` | No | Table of contents: `<item>` entries. |
| `<footer-text>` | No | Plain text shown in the page footer. |

## Chapter

```xml
<chapter id="ch1">
  <meta>
    <badge>Chapter 1</badge>
    <badge>60 minutes</badge>
  </meta>
  <title>Chapter Title</title>
  <!-- content blocks -->
</chapter>
```

| Element | Cardinality | Description |
|---------|-------------|-------------|
| `<meta>` | 0-1 | Group of `<badge>` elements. |
| `<title>` | 1 | Chapter title. |
| `<section>` | 0-n | Main content container. |
| `<key-box>` | 0-n | Highlighted call-out box (can appear at chapter level or inside sections). |

## Section

```xml
<section id="s1-1">
  <h2>1.1 Section Heading</h2>
  <!-- content blocks -->
</section>
```

| Element | Cardinality | Description |
|---------|-------------|-------------|
| `<h2>` / `<h3>` / `<h4>` | 0-1 per section | Headings. |
| `<paragraph>` | 0-n | Paragraph with inline HTML (`<strong>`, `<em>`, `<code>`, `<br>`, `<span>`). |
| `<heading>` | 0-n | Sub-heading inside a section or key-box. |
| `<list>` | 0-n | Unordered / check-list. |
| `<table>` | 0-n | Simple rows × cells table. |
| `<key-box>` | 0-n | Highlighted box. |
| `<compare>` | 0-n | Side-by-side comparison cards. |
| `<glossary>` | 0-n | Term + definition pairs. |

## Block-Level Elements Detail

### `<paragraph>`

```xml
<paragraph>Plain text with <strong>bold</strong>, <em>italic</em>, <code>code</code>.</paragraph>
```

Allowed inline tags: `<strong>`, `<em>`, `<b>`, `<i>`, `<code>`, `<span>`, `<br>`.

### `<list>`

```xml
<list type="ul">
  <item>First item</item>
  <item>Second item</item>
</list>
```

- `type` attribute: `ul` (bullets), `check` (checkmarks), or any string.
- `<item>` may have a `span` attribute (numeric, used for colspan-style layout in tables).

### `<table>`

```xml
<table>
  <row>
    <cell>Header A</cell>
    <cell>Header B</cell>
  </row>
  <row>
    <cell>Data A</cell>
    <cell span="2">Wide cell</cell>
  </row>
</table>
```

- First `<row>` is treated as the header row by the renderer.
- `<cell>` may have a `span` attribute.

### `<key-box>`

```xml
<key-box>
  <heading>Box Title</heading>
  <paragraph>Content…</paragraph>
  <list type="check">...</list>
</key-box>
```

- Must contain a `<heading>` as its first meaningful child.
- Everything after the heading is the box content.

### `<compare>`

```xml
<compare>
  <card type="pos">
    <heading>Pros</heading>
    <list type="ul">...</list>
  </card>
  <card type="neg">
    <heading>Cons</heading>
    <list type="ul">...</list>
  </card>
</compare>
```

- `type="pos"` or `type="neg"` drives card styling.
- Each `<card>` can contain `<heading>`, `<paragraph>`, `<list>`, etc.

### `<glossary>`

```xml
<glossary>
  <term>Term A</term>
  <definition>Definition of term A.</definition>
  <term>Term B</term>
  <definition>Definition of term B.</definition>
</glossary>
```

- Terms and definitions are paired by order.

## Table of Contents

```xml
<toc>
  <item id="ch1" status="active">Chapter 1 Title</item>
  <item id="ch2" status="active">Chapter 2 Title</item>
</toc>
```

- `status` attribute is optional (defaults to `active`).
- `id` must match a chapter or section `id` for anchor linking.

## Footer

```xml
<footer-text>Footer text here.</footer-text>
```

## Complete Minimal Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<syllabus>
  <chapters>
    <chapter id="ch-min">
      <meta>
        <badge>Reference</badge>
      </meta>
      <title>Minimal Chapter</title>
      <section id="s-min-1">
        <h2>1.1 Heading</h2>
        <paragraph>This is a <strong>paragraph</strong>.</paragraph>
        <key-box>
          <heading>Key Point</heading>
          <paragraph>Important information.</paragraph>
        </key-box>
      </section>
    </chapter>
  </chapters>
  <toc>
    <item id="ch-min">Minimal Chapter</item>
  </toc>
  <footer-text>End of document.</footer-text>
</syllabus>
```

## Agent Workflow Summary

1.  Read existing XML files in `knowledge/xml/` to understand content patterns.
2.  Add / edit XML following this schema.
3.  Run `npm run convert`.
4.  Verify with `npm test`.
5.  Do **not** manually edit files in `data/` — they are generated.
