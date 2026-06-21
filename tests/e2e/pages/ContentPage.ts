import type { Locator, Page } from '@playwright/test'

export class ContentPage {
  readonly heading: Locator
  readonly subtitle: Locator

  constructor(private readonly page: Page) {
    this.heading = page.locator('.page-header h1')
    this.subtitle = page.locator('.page-header .subtitle')
  }

  get url(): string {
    return this.page.url()
  }

  getPathAndHash(): { pathname: string; hash: string } {
    const u = new URL(this.page.url())
    return { pathname: u.pathname, hash: u.hash }
  }
}
