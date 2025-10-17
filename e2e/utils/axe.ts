import type { AxeResults } from 'axe-core'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

export async function runAccessibilityScan(page: Page, tags?: string | string[]): Promise<AxeResults> {
  const builder = new AxeBuilder({ page })

  if (tags) {
    builder.withTags(tags)
  }

  return builder.analyze()
}
