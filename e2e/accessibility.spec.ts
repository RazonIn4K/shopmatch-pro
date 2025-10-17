import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const AXE_CONTEXT = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'section508'],
  },
}

/**
 * Accessibility Tests for ShopMatch Pro
 *
 * Uses axe-core to automatically detect WCAG violations.
 * Zero tolerance policy - any violations will fail the test.
 *
 * Coverage:
 * - Homepage (public landing)
 * - Dashboard (authentication required)
 * - Subscribe page (payment flow)
 *
 * @see https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
 */

test.describe('Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(AXE_CONTEXT.runOnly.values)
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    if (accessibilityScanResults.violations.length > 0) {
      console.error('Accessibility violations found on homepage:')
      accessibilityScanResults.violations.forEach(violation => {
        console.error(`- ${violation.id}: ${violation.description}`)
        console.error(`  Impact: ${violation.impact}`)
        console.error(`  Help: ${violation.helpUrl}`)
        console.error(`  Affected elements: ${violation.nodes.length}`)
        violation.nodes.forEach((node, index) => {
          console.error(`    ${index + 1}. ${node.html}`)
          console.error(`       ${node.failureSummary}`)
        })
      })
    }
  })

  test('dashboard should have no accessibility violations (unauthenticated)', async ({ page }) => {
    // Dashboard when not authenticated should redirect to login
    await page.goto('/dashboard')

    // Wait for redirect to login page
    await page.waitForURL('**/login', { timeout: 10000 })
    await page.waitForSelector('main h1', { timeout: 5000, state: 'visible' })

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(AXE_CONTEXT.runOnly.values)
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    if (accessibilityScanResults.violations.length > 0) {
      console.error('Accessibility violations found on dashboard (redirected to login):')
      accessibilityScanResults.violations.forEach(violation => {
        console.error(`- ${violation.id}: ${violation.description}`)
        console.error(`  Impact: ${violation.impact}`)
      })
    }
  })

  test('subscribe page should have no accessibility violations', async ({ page }) => {
    await page.goto('/subscribe')

    // Wait for the main heading to be visible (page should render immediately)
    await page.waitForSelector('h1:has-text("Choose Your Plan")', { timeout: 10000, state: 'visible' })

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(AXE_CONTEXT.runOnly.values)
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    if (accessibilityScanResults.violations.length > 0) {
      console.error('Accessibility violations found on subscribe page:')
      accessibilityScanResults.violations.forEach(violation => {
        console.error(`- ${violation.id}: ${violation.description}`)
        console.error(`  Impact: ${violation.impact}`)
      })
    }
  })

  test('login page should have no accessibility violations', async ({ page }) => {
    await page.goto('/login')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(AXE_CONTEXT.runOnly.values)
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    if (accessibilityScanResults.violations.length > 0) {
      console.error('Accessibility violations found on login page:')
      accessibilityScanResults.violations.forEach(violation => {
        console.error(`- ${violation.id}: ${violation.description}`)
        console.error(`  Impact: ${violation.impact}`)
      })
    }
  })
})
