import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

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
    // Dashboard when not authenticated (should redirect or show login)
    await page.goto('/dashboard')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    if (accessibilityScanResults.violations.length > 0) {
      console.error('Accessibility violations found on dashboard:')
      accessibilityScanResults.violations.forEach(violation => {
        console.error(`- ${violation.id}: ${violation.description}`)
        console.error(`  Impact: ${violation.impact}`)
      })
    }
  })

  test('subscribe page should have no accessibility violations', async ({ page }) => {
    await page.goto('/subscribe')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
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
