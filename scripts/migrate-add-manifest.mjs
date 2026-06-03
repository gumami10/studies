import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const XML_DIR = resolve('knowledge/xml')

const MIGRATIONS = [
  {
    file: 'ctal-at.xml',
    manifest: {
      id: 'ctal-at',
      path: '/chapters',
      name: 'chapters',
      navLabel: 'CTAL-AT',
      title: 'QA Hero study guide',
      subtitle: 'Advanced Level Agile Tester (v2.0) — Chapter-by-Chapter Review',
      tocTitle: 'Syllabus Chapters',
      homeDescription:
        'Test Strategy, People & Teams, Test Management, Shift Left, Techniques, Automation',
      homeOrder: 1,
      highlightKey: 'ctal-at-highlights-ch1',
      footerAttribution: 'istqb',
    },
  },
  {
    file: 'quality-metrics.xml',
    manifest: {
      id: 'quality-metrics',
      path: '/metrics',
      name: 'metrics',
      navLabel: 'Quality Metrics',
      title: 'Quality Metrics in Agile Testing',
      subtitle: 'ISTQB CTAL-AT (v2.0) — Consolidated metrics reference',
      tocTitle: 'Metrics Reference',
      homeDescription: 'Coverage, monitoring, process improvement & business-facing metrics',
      homeOrder: 2,
      highlightKey: 'ctal-at-highlights-metrics',
      footerAttribution: 'none',
    },
  },
  {
    file: 'ctal-tae.xml',
    manifest: {
      id: 'ctal-tae',
      path: '/tae',
      name: 'tae',
      navLabel: 'TAE',
      title: 'ISTQB CTAL-TAE Study Guide',
      subtitle: 'Advanced Level Test Automation Engineering (v2.0) — Chapter-by-Chapter Review',
      tocTitle: 'Syllabus Chapters',
      homeDescription: 'Test Automation Engineering — architecture, design, and implementation',
      homeOrder: 3,
      highlightKey: 'ctal-tae-highlights',
      footerAttribution: 'istqb',
    },
  },
  {
    file: 'ctal-ta-chapters-1-5.xml',
    manifest: {
      id: 'ctal-ta',
      path: '/ta',
      name: 'ta',
      navLabel: 'TA',
      title: 'ISTQB CTAL-TA Study Guide',
      subtitle: 'Advanced Level Test Analyst (v4.0) — Chapters 1–5',
      tocTitle: 'Syllabus Chapters',
      homeDescription:
        'Test Analyst — test process, risk-based testing, techniques, quality characteristics, defect prevention',
      homeOrder: 4,
      highlightKey: 'ctal-ta-highlights',
      footerAttribution: 'istqb',
    },
  },
  {
    file: 'code-review.xml',
    manifest: {
      id: 'code-review',
      path: '/code-review',
      name: 'code-review',
      navLabel: 'Code Review',
      title: 'Code Review Research Plan',
      subtitle: 'Analyzing the Mind of Code Reviewers Across Top 11 Open Source Repositories',
      tocTitle: 'Research Sections',
      homeDescription: 'Analyzing review strategies across top 11 open source repositories',
      homeOrder: 5,
      highlightKey: 'code-review-highlights',
      footerAttribution: 'none',
    },
  },
  {
    file: 'agile-testing.xml',
    manifest: {
      id: 'agile-testing',
      path: '/agile-testing',
      name: 'agile-testing',
      navLabel: 'Agile Testing',
      title: 'Agile Testing',
      subtitle: 'A Practical Guide for Testers and Agile Teams — Gregory & Crispin (2009)',
      tocTitle: 'Book Parts',
      homeDescription: 'A Practical Guide for Testers and Agile Teams — Gregory & Crispin (2009)',
      homeOrder: 6,
      highlightKey: 'agile-testing-highlights',
      footerAttribution: 'crispin-gregory',
    },
  },
  {
    file: 'more-agile-testing.xml',
    manifest: {
      id: 'more-agile-testing',
      path: '/more-agile-testing',
      name: 'more-agile-testing',
      navLabel: 'More Agile Testing',
      title: 'More Agile Testing',
      subtitle: 'Learning Journeys for the Whole Team — Gregory & Crispin (2015)',
      tocTitle: 'Book Parts',
      homeDescription: 'Learning Journeys for the Whole Team — Gregory & Crispin (2015)',
      homeOrder: 7,
      highlightKey: 'more-agile-testing-highlights',
      footerAttribution: 'crispin-gregory',
    },
  },
]

function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderManifest(m) {
  return [
    '  <manifest>',
    `    <id>${escapeXml(m.id)}</id>`,
    `    <path>${escapeXml(m.path)}</path>`,
    `    <name>${escapeXml(m.name)}</name>`,
    `    <nav-label>${escapeXml(m.navLabel)}</nav-label>`,
    `    <title>${escapeXml(m.title)}</title>`,
    `    <subtitle>${escapeXml(m.subtitle)}</subtitle>`,
    `    <toc-title>${escapeXml(m.tocTitle)}</toc-title>`,
    `    <home-description>${escapeXml(m.homeDescription)}</home-description>`,
    `    <home-order>${m.homeOrder}</home-order>`,
    `    <highlight-key>${escapeXml(m.highlightKey)}</highlight-key>`,
    `    <footer-attribution>${m.footerAttribution}</footer-attribution>`,
    '  </manifest>',
  ].join('\n')
}

function injectManifest(xml, manifestText) {
  if (!/<syllabus>/.test(xml)) throw new Error('No <syllabus> root in XML')
  const existing = /<manifest>[\s\S]*?<\/manifest>/
  if (existing.test(xml)) {
    return xml.replace(existing, manifestText)
  }
  return xml.replace(/(<syllabus>)\s*/, `$1\n${manifestText}\n`)
}

let touched = 0
for (const { file, manifest } of MIGRATIONS) {
  const path = resolve(XML_DIR, file)
  const xml = readFileSync(path, 'utf-8')
  const next = injectManifest(xml, renderManifest(manifest))
  writeFileSync(path, next)
  console.log(`  ${file} → manifest[${manifest.id}]`)
  touched++
}

console.log(`Migration complete: ${touched} knowledge XMLs updated.`)
