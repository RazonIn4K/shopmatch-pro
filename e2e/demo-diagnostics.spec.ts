/**
 * Diagnostic Tests for Demo Issues
 * 
 * These tests help identify what's broken in the demo
 */

import { test } from '@playwright/test'

const EMPLOYER_CREDENTIALS = {
  email: 'owner@test.com',
  password: 'testtest123',
}

test('diagnose login failure - employer account', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()))
  
  // Enable request logging
  page.on('request', req => console.log('REQUEST:', req.method(), req.url()))
  
  // Enable response logging
  page.on('response', res => console.log('RESPONSE:', res.status(), res.url()))
  
  await page.goto('/login')
  
  console.log('=== FILLING IN CREDENTIALS ===')
  await page.getByLabel(/email/i).fill(EMPLOYER_CREDENTIALS.email)
  await page.getByLabel(/password/i).fill(EMPLOYER_CREDENTIALS.password)
  
  console.log('=== CLICKING SIGN IN ===')
  await page.getByRole('button', { name: /sign in/i }).click()
  
  // Wait a bit to see what happens
  await page.waitForTimeout(5000)
  
  console.log('=== CURRENT URL ===', page.url())
  
  // Check for error messages
  const bodyText = await page.textContent('body')
  console.log('=== PAGE CONTENT (first 500 chars) ===')
  console.log(bodyText?.substring(0, 500))
  
  // Check for specific error indicators
  const errorElements = await page.locator('[role="alert"], .error, [class*="error"]').all()
  console.log('=== ERROR ELEMENTS FOUND ===', errorElements.length)
  
  for (const elem of errorElements) {
    const text = await elem.textContent()
    console.log('ERROR TEXT:', text)
  }
})

test('diagnose jobs page', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()))
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message))
  
  await page.goto('/jobs')
  
  // Wait a few seconds to see what loads
  await page.waitForTimeout(3000)
  
  console.log('=== JOBS PAGE URL ===', page.url())
  
  const bodyText = await page.textContent('body')
  console.log('=== PAGE CONTENT (first 1000 chars) ===')
  console.log(bodyText?.substring(0, 1000))
  
  // Check page structure
  const headings = await page.locator('h1, h2').all()
  console.log('=== HEADINGS FOUND ===', headings.length)
  for (const heading of headings) {
    const text = await heading.textContent()
    console.log('HEADING:', text)
  }
  
  // Check for job cards
  const links = await page.locator('a').all()
  console.log('=== TOTAL LINKS ===', links.length)
  
  // Check for loading states
  const hasLoadingState = await page.locator('[class*="animate-pulse"], [class*="loading"]').count()
  console.log('=== LOADING STATES ===', hasLoadingState)
})

test('check if login page loads correctly', async ({ page }) => {
  await page.goto('/login')
  
  // Take a full page screenshot for analysis
  const screenshot = await page.screenshot({ fullPage: true })
  console.log('Screenshot captured, size:', screenshot.length)
  
  // Get all visible text
  const bodyText = await page.textContent('body')
  console.log('=== LOGIN PAGE CONTENT ===')
  console.log(bodyText)
  
  // Check form elements
  const emailInput = await page.locator('input[type="email"], input[name="email"]').count()
  const passwordInput = await page.locator('input[type="password"], input[name="password"]').count()
  const submitButton = await page.locator('button[type="submit"], button:has-text("Sign In")').count()
  
  console.log('=== FORM ELEMENTS ===')
  console.log('Email inputs:', emailInput)
  console.log('Password inputs:', passwordInput)
  console.log('Submit buttons:', submitButton)
})
