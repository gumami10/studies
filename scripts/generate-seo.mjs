#!/usr/bin/env node
import { writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const MANIFEST_PATH = resolve(ROOT, 'data/manifest.js')
const PUBLIC_DIR = resolve(ROOT, 'public')
const SITEMAP_PATH = resolve(PUBLIC_DIR, 'sitemap.xml')
const ROBOTS_PATH = resolve(PUBLIC_DIR, 'robots.txt')

const SITE_URL = (process.env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '')
const BASE_PATH = process.env.VITE_BASE_PATH || '/studies/'

async function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found: ${MANIFEST_PATH}. Run \`pnpm convert\` first.`)
  }
  const mod = await import(pathToFileURL(MANIFEST_PATH).href)
  return mod.default
}

function urlFor(path) {
  const trimmedBase = BASE_PATH.replace(/\/$/, '')
  const trimmedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${trimmedBase}${trimmedPath}`
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function buildSitemap(manifest) {
  const entries = [
    { loc: urlFor('/'), priority: '1.0', changefreq: 'weekly' },
    { loc: urlFor('/starred'), priority: '0.5', changefreq: 'weekly' },
    { loc: urlFor('/settings'), priority: '0.3', changefreq: 'monthly' },
  ]
  const sorted = Object.values(manifest)
    .slice()
    .sort((a, b) => a.homeOrder - b.homeOrder)
  for (const k of sorted) {
    entries.push({ loc: urlFor(k.path), priority: '0.8', changefreq: 'monthly' })
  }
  const lastmod = todayISO()
  const body = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

function buildRobots() {
  const trimmedBase = BASE_PATH.replace(/\/$/, '')
  return `User-agent: *\nAllow: ${trimmedBase || '/'}\n\nSitemap: ${SITE_URL}${trimmedBase}/sitemap.xml\n`
}

async function main() {
  const manifest = await loadManifest()
  const sitemap = buildSitemap(manifest)
  const robots = buildRobots()
  writeFileSync(SITEMAP_PATH, sitemap, 'utf8')
  writeFileSync(ROBOTS_PATH, robots, 'utf8')
  const entries = Object.keys(manifest).length + 3
  console.log(`[generate-seo] Wrote ${SITEMAP_PATH} (${entries} URLs)`)
  console.log(`[generate-seo] Wrote ${ROBOTS_PATH}`)
}

main().catch((err) => {
  console.error('[generate-seo] failed:', err.message)
  process.exit(1)
})
