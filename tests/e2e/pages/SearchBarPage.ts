import type { Locator, Page } from '@playwright/test'

export type SearchTier = 'chapter' | 'section' | 'content'

export class SearchBarPage {
  readonly input: Locator
  readonly results: Locator
  readonly options: Locator
  readonly noMatchHint: Locator

  constructor(private readonly page: Page) {
    this.input = page.locator('.search-bar-input')
    this.results = page.locator('#search-bar-results')
    this.options = page.getByRole('option')
    this.noMatchHint = page.locator('.search-bar-hint', { hasText: /no matches for/i })
  }

  async open(): Promise<void> {
    await this.input.click()
    await this.input.focus()
  }

  async fillQuery(query: string): Promise<void> {
    await this.input.fill(query)
  }

  async waitForResults(): Promise<void> {
    await this.options.first().waitFor({ state: 'visible' })
  }

  firstOption(): Locator {
    return this.options.first()
  }

  optionByTier(tier: SearchTier): Locator {
    return this.options.filter({ has: this.page.locator(`.search-bar-tier-${tier}`) }).first()
  }

  async selectFirst(): Promise<void> {
    await this.options.first().click()
  }

  async selectByTier(tier: SearchTier): Promise<void> {
    await this.optionByTier(tier).click()
  }

  async selectByIndex(index: number): Promise<void> {
    await this.options.nth(index).click()
  }

  async submitActiveWithEnter(): Promise<void> {
    await this.input.press('Enter')
  }
}
