import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(__dirname, '../../../src/styles/main.css'), 'utf8')

function ruleBlock(selector: string): string {
  const idx = css.indexOf(selector)
  if (idx === -1) throw new Error(`CSS rule not found: ${selector}`)
  const open = css.indexOf('{', idx)
  let depth = 1
  let i = open + 1
  while (i < css.length && depth > 0) {
    const ch = css[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    i++
  }
  return css.slice(open + 1, i - 1)
}

function topValue(selector: string): string {
  const block = ruleBlock(selector)
  const m = block.match(/(^|\n)\s*top:\s*([^;]+);/)
  if (!m) throw new Error(`No top: declaration in ${selector}`)
  return m[2].trim()
}

describe('bookmark/star sticky offsets', () => {
  it('bookmark-btn is sticky', () => {
    expect(ruleBlock('.bookmark-btn')).toMatch(/position:\s*sticky/)
  })

  it('star-btn is sticky', () => {
    expect(ruleBlock('.star-btn')).toMatch(/position:\s*sticky/)
  })

  it('bookmark-btn and star-btn do not share the same sticky top offset', () => {
    const bmTop = topValue('.bookmark-btn')
    const starTop = topValue('.star-btn')
    expect(bmTop).not.toBe(starTop)
  })

  it('star-btn sticky top sits below bookmark-btn sticky top with safe gap', () => {
    const rem = (v: string) => Number(v.replace('rem', '').trim())
    expect(rem(topValue('.star-btn'))).toBeGreaterThan(rem(topValue('.bookmark-btn')) + 1)
  })
})
