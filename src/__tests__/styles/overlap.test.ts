import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(__dirname, '../../../src/styles/main.css'), 'utf8')

function ruleBlock(selector: string): string {
  const re = new RegExp(`(?:^|\\n)\\s*${selector.replace(/\./g, '\\.')}\\s*\\{`)
  const m = css.match(re)
  if (!m || m.index === undefined) throw new Error(`CSS rule not found: ${selector}`)
  const idx = m.index
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

function declaredValue(selector: string, prop: string): string {
  const block = ruleBlock(selector)
  const m = block.match(new RegExp(`(?:^|\\n)\\s*${prop}:\\s*([^;]+);`))
  if (!m) throw new Error(`No ${prop} declaration in ${selector}`)
  return m[1].trim()
}

function rem(v: string): number {
  return Number(v.replace('rem', '').trim())
}

describe('bookmark/star button placement', () => {
  it('bookmark-btn is absolutely positioned (no longer sticky)', () => {
    expect(ruleBlock('.bookmark-btn')).toMatch(/position:\s*absolute/)
  })

  it('star-btn is absolutely positioned (no longer sticky)', () => {
    expect(ruleBlock('.star-btn')).toMatch(/position:\s*absolute/)
  })

  it('bookmark-btn and star-btn share the same top offset', () => {
    const bmTop = declaredValue('.bookmark-btn', 'top')
    const starTop = declaredValue('.star-btn', 'top')
    expect(bmTop).toBe(starTop)
  })

  it('bookmark-btn and star-btn have different right offsets to prevent overlap', () => {
    const bmRight = declaredValue('.bookmark-btn', 'right')
    const starRight = declaredValue('.star-btn', 'right')
    expect(bmRight).not.toBe(starRight)
  })

  it('bookmark-btn sits to the left of star-btn (with safe gap)', () => {
    const bmRight = declaredValue('.bookmark-btn', 'right')
    expect(rem(bmRight)).toBeGreaterThan(rem(declaredValue('.star-btn', 'right')))
  })
})
