import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/utils/sanitize'

describe('sanitizeHtml', () => {
  it('returns clean HTML unchanged', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('removes script tags', () => {
    const input = '<p>text</p><script>alert("xss")</script>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('script')
    expect(result).not.toContain('alert')
    expect(result).toContain('<p>text</p>')
  })

  it('removes iframe tags', () => {
    expect(sanitizeHtml('<iframe src="evil"></iframe>')).not.toContain('iframe')
  })

  it('removes object and embed tags', () => {
    const result = sanitizeHtml('<object data="x"></object><embed src="y">')
    expect(result).not.toContain('object')
    expect(result).not.toContain('embed')
  })

  it('removes form-related tags', () => {
    const result = sanitizeHtml('<form><input><button>click</button><select><textarea></textarea></select></form>')
    expect(result).not.toContain('form')
    expect(result).not.toContain('input')
    expect(result).not.toContain('button')
    expect(result).not.toContain('select')
    expect(result).not.toContain('textarea')
  })

  it('removes link, meta, base, applet tags', () => {
    let result = sanitizeHtml('<link rel="stylesheet"><meta charset="utf-8"><base href="/"><applet code="x"></applet>')
    expect(result).not.toContain('link')
    expect(result).not.toContain('meta')
    expect(result).not.toContain('base')
    expect(result).not.toContain('applet')
  })

  it('strips event handler attributes (onclick, onload, etc.)', () => {
    const result = sanitizeHtml('<p onclick="alert(1)" onload="evil()" onmouseover="xss">text</p>')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('onload')
    expect(result).not.toContain('onmouseover')
    expect(result).toContain('<p>text</p>')
  })

  it('keeps safe attributes intact', () => {
    const result = sanitizeHtml('<p class="test" id="main" data-foo="bar">text</p>')
    expect(result).toContain('class="test"')
    expect(result).toContain('id="main"')
    expect(result).toContain('data-foo="bar"')
  })

  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('handles nested dangerous tags', () => {
    const result = sanitizeHtml('<div><script>evil</script><p>safe</p></div>')
    expect(result).toContain('safe')
    expect(result).not.toContain('evil')
  })
})
