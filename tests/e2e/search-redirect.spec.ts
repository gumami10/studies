import { test, expect } from '@playwright/test'
import { SearchBarPage } from './pages/SearchBarPage'
import { ContentPage } from './pages/ContentPage'

test.describe('Search bar', () => {
  test('redirects to the correct knowledge page from a chapter-tier result', async ({ page }) => {
    const search = new SearchBarPage(page)
    const content = new ContentPage(page)

    // Arrange — start on the home page so the drawer (and its search bar) is mounted.
    await page.goto('/')
    await expect(page.locator('.landing-hero h1')).toHaveText('QA Hero')

    // Act — open the search bar, type a query that matches a chapter title, click the first result.
    await search.open()
    await search.fillQuery('metrics')
    await search.waitForResults()
    await expect(search.optionByTier('chapter')).toBeVisible()
    await search.selectByTier('chapter')

    // Assert — we landed on the Quality Metrics knowledge page with the right title and no stale hash.
    await expect(page).toHaveURL(/\/studies\/metrics(?:#.+)?$/)
    const { pathname, hash } = content.getPathAndHash()
    expect(pathname).toBe('/studies/metrics')
    expect(hash).toBe('')
    await expect(content.heading).toHaveText('Quality Metrics in Agile Testing')
    await expect(content.subtitle).toContainText('ISTQB CTAL-AT')
  })

  test('Enter key on the active result performs the same redirect', async ({ page }) => {
    const search = new SearchBarPage(page)
    const content = new ContentPage(page)

    // Arrange
    await page.goto('/')
    await search.open()

    // Act — type, let results settle, press Enter to activate the highlighted option.
    await search.fillQuery('metrics')
    await search.waitForResults()
    await search.submitActiveWithEnter()

    // Assert
    await expect(page).toHaveURL(/\/studies\/metrics(?:#.+)?$/)
    await expect(content.heading).toHaveText('Quality Metrics in Agile Testing')
  })
})
