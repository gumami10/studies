import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readdirSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const OUT_DIR = resolve(ROOT, 'public/og')

describe('optimize-og artifacts', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR) || readdirSync(OUT_DIR).length === 0) {
      execSync('node scripts/optimize-og.mjs', { cwd: ROOT, stdio: 'pipe' })
    }
  })

  it('produces webp + jpeg og variants and a 32px favicon', () => {
    const files = readdirSync(OUT_DIR)
    expect(files).toContain('robot-1200x630.webp')
    expect(files).toContain('robot-1200x630.jpg')
    expect(files).toContain('robot-square.webp')
    expect(files).toContain('favicon-32.webp')
    expect(files).toContain('favicon-32.png')
  })

  it('keeps each variant under 100 KB', () => {
    const files = readdirSync(OUT_DIR)
    for (const f of files) {
      const size = statSync(resolve(OUT_DIR, f)).size
      expect(size, `${f} should be < 100 KB`).toBeLessThan(100 * 1024)
    }
  })
})
