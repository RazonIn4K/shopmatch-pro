# FOSSA License Review - 2026-06-16

## Summary

FOSSA reported 40 total issues:

- 2 denied license issues: CC-BY-SA-4.0 on `next@15.5.19` and `highlight.js@10.7.3`
- 2 flagged license review issues: MPL-2.0 on `next@15.5.19` and `@axe-core/playwright@4.11.3`
- 36 outdated dependency quality issues, all transitive

The security scan was passing in FOSSA. Local npm verification shows production dependencies are clean:

```bash
npm audit --omit=dev
```

The full local audit still reports a dev-only Firebase CLI residual through:

```text
firebase-tools -> @google-cloud/pubsub -> @opentelemetry/core@1.30.1
```

`firebase-tools` is a devDependency and is not part of the Vercel runtime bundle.

## Mediation Applied

Updated `.fossa.yml` to:

- Refresh the stale `next` CC-BY-SA-4.0 ignore locator from `15.5.15` to `15.5.19`.
- Add a `highlight.js@10.7.3` CC-BY-SA-4.0 ignore for non-code artwork/assets detected in the dependency chain.
- Add MPL-2.0 review mediation for `next@15.5.19`.
- Add MPL-2.0 review mediation for `@axe-core/playwright@4.11.3`.
- Add path exclusions for generated/local directories: `.next`, `.vercel`, `node_modules`, `playwright-report`, and `test-results`.

## License Rationale

### `next@15.5.19`

Next.js is declared MIT in npm metadata. The FOSSA CC-BY-SA-4.0 detection is treated as a non-code artwork false positive from bundled dependency assets. ShopMatch Pro does not use or distribute that artwork.

The MPL-2.0 detection is acceptable for unmodified dependency usage. ShopMatch Pro does not modify Next.js or any MPL-licensed files.

### `highlight.js@10.7.3`

`highlight.js` is declared BSD-3-Clause in npm metadata. The CC-BY-SA-4.0 detection is treated as non-code artwork/assets in the dependency chain. ShopMatch Pro does not import `highlight.js` directly and does not distribute the artwork.

### `@axe-core/playwright@4.11.3`

`@axe-core/playwright` is MPL-2.0 and is used only by Playwright accessibility tests. It is a devDependency, is not bundled into the production application, and is used as-is without local source modifications.

## Outdated Dependency Quality Findings

The 36 outdated dependency findings are transitive. The notable stale packages called out by FOSSA are under dev tooling, especially `firebase-tools`, including:

- `path-to-regexp@0.1.13` through `firebase-tools -> express`
- `path-to-regexp@1.9.0` through `firebase-tools -> superstatic`
- `marked@13.0.3` and `highlight.js@10.7.3` through Firebase CLI terminal output tooling

Do not force major-version npm overrides for these chains without retesting Firebase emulator, deploy, and rules workflows. Prefer upstream `firebase-tools` updates when they become available.

## Follow-Up

1. Push the CI update so the `FOSSA_API_KEY` GitHub Actions secret runs the FOSSA analysis and policy test job.
2. Re-run the FOSSA dashboard scan with rebuild/mediate dependencies enabled if the badge does not refresh after CI uploads the new analysis.
3. If MPL-2.0 is still flagged by the org-level Standard Bundle Distribution policy, either approve MPL-2.0 in the FOSSA UI policy or manually mark these two reviewed findings as acceptable.
4. Keep Dependabot/Snyk enabled and accept upstream Firebase CLI fixes when they resolve the dev-only OpenTelemetry and stale transitive chains without a downgrade.
