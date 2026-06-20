import { describe, it, expect, beforeEach } from 'vitest'
import { existsSync, readFileSync, rmSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const SITEMAP = resolve(ROOT, 'public/sitemap.xml')
const ROBOTS = resolve(ROOT, 'public/robots.txt')

function runScript(env = {}) {
  const envStr = Object.entries(env)
    .map(([k, v]) => `${k}='${v}'`)
    .join(' ')
  execSync(`${envStr} node scripts/generate-seo.mjs`, { cwd: ROOT, stdio: 'pipe' })
}

describe('generate-seo', () => {
  beforeEach(() => {
    for (const f of [SITEMAP, ROBOTS]) {
      if (existsSync(f)) rmSync(f)
    }
  })

  it('writes a sitemap.xml with one url per knowledge module plus home/starred/settings', () => {
    runScript()
    expect(existsSync(SITEMAP)).toBe(true)
    const xml = readFileSync(SITEMAP, 'utf8')
    expect(xml).toContain('<urlset')
    const urls = (xml.match(/<loc>/g) || []).length
    expect(urls).toBeGreaterThanOrEqual(4)
    expect(xml).toMatch(/<loc>https:\/\/example\.com\/studies\/<\/loc>/)
  })

  it('writes a robots.txt with a Sitemap directive', () => {
    runScript()
    expect(existsSync(ROBOTS)).toBe(true)
    const txt = readFileSync(ROBOTS, 'utf8')
    expect(txt).toMatch(/^User-agent: \*/m)
    expect(txt).toMatch(/^Allow: \/studies/m)
    expect(txt).toMatch(/^Sitemap: https:\/\/example\.com\/studies\/sitemap\.xml/m)
  })

  it('honours VITE_SITE_URL override', () => {
    runScript({ VITE_SITE_URL: 'https://qa-hero.example.org' })
    const txt = readFileSync(ROBOTS, 'utf8')
    expect(txt).toContain('https://qa-hero.example.org/studies/sitemap.xml')
  })
})
