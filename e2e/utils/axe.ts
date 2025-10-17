import type { AxeResults } from 'axe-core'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

export async function runAccessibilityScan(page: Page, context?: Parameters<AxeBuilder['withTags']>[0]): Promise<AxeResults> {
  const builder = new AxeBuilder({ page })

  if (context?.tags) {
    builder.withTags(context.tags)
  }

  return builder.analyze()
}
