/**
 * Quick verification test for demo login credentials
 */

import { test, expect } from '@playwright/test'

test('verify demo employer login works', async ({ page }) => {
  await page.goto('/login')
  
  // Fill in employer credentials
  await page.getByLabel(/email/i).fill('owner@test.com')
  await page.getByLabel(/password/i).fill('testtest123')
  
  // Submit form
  await page.getByRole('button', { name: /sign in/i }).click()
  
  // Wait for navigation (increased timeout)
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
  
  // Verify we're on dashboard (either /dashboard/owner or redirecting)
  const currentUrl = page.url()
  console.log('Current URL after login:', currentUrl)
  
  expect(currentUrl).toMatch(/\/dashboard/)
})

test('verify demo seeker login works', async ({ page }) => {
  await page.goto('/login')
  
  // Fill in seeker credentials
  await page.getByLabel(/email/i).fill('seeker@test.com')
  await page.getByLabel(/password/i).fill('testtest123')
  
  // Submit form
  await page.getByRole('button', { name: /sign in/i }).click()
  
  // Wait for navigation (increased timeout)
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
  
  // Verify we're on dashboard (either /dashboard/seeker or redirecting)
  const currentUrl = page.url()
  console.log('Current URL after login:', currentUrl)
  
  expect(currentUrl).toMatch(/\/dashboard/)
})

test('verify jobs page loads successfully', async ({ page }) => {
  await page.goto('/jobs')
  
  // Wait for jobs to load
  await page.waitForSelector('h1:has-text("Browse Jobs")', { timeout: 10000 })
  
  // Should show jobs (not error message)
  const pageText = await page.textContent('body')
  expect(pageText).not.toContain('Failed to fetch jobs')
  expect(pageText).not.toContain('Error loading jobs')
  
  // Should show job count or jobs
  const hasJobs = pageText?.includes('opportunities') || pageText?.includes('job')
  expect(hasJobs).toBeTruthy()
})
