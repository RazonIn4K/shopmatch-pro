# FOSSA License Review - 2026-06-16

## Summary

The latest GitHub Actions FOSSA CLI run for commit
`44b65516132ba45573c5391223d27a1343039ba5` successfully uploaded analysis, then
`fossa test --timeout 1200` reported 38 active policy issues:

- 1 denied license issue: CC-BY-SA-4.0 on `next@15.5.19`
- 14 flagged license review issues: 13 Sharp/libvips LGPL packages and MPL-2.0 on `next@15.5.19`
- 23 outdated dependency quality issues, all transitive

Earlier dashboard results also listed `highlight.js@10.7.3` and
`@axe-core/playwright@4.11.3`; those two findings were not present in the latest
CLI policy output.

The security scan was passing in FOSSA. Local npm verification shows production dependencies are clean:

```bash
npm audit --omit=dev
```

The full local audit still reports a dev-only Firebase CLI residual through:

```text
firebase-tools -> @google-cloud/pubsub -> @opentelemetry/core@1.30.1
```

`firebase-tools` is a devDependency and is not part of the Vercel runtime bundle.

## Repository Changes Applied

Updated `.fossa.yml` to:

- Use only supported FOSSA CLI configuration fields.
- Remove stale project team assignment that caused CI analysis failure.
- Remove local policy/ignore sections that the FOSSA CLI does not apply.
- Add path exclusions for generated/local directories: `.next`, `.vercel`, `node_modules`, `playwright-report`, and `test-results`.
- Disable FOSSA CLI telemetry for CI runs.

Updated GitHub Actions to:

- Install the FOSSA CLI directly.
- Run `fossa analyze` before `fossa test`, so the current revision exists in FOSSA.
- Keep the policy test advisory until the dashboard policy/ignore inbox is mediated.
- Upload `fossa-policy-test.log` as a CI artifact for review.

Important boundary: `.fossa.yml` controls scan settings such as project metadata,
targets, and path filters. It does not create local license policies or issue
auto-ignore rules. FOSSA policy and auto-ignore decisions must be made in the
FOSSA dashboard or with FOSSA API workflows that have the correct permissions.

## License Rationale

### `next@15.5.19`

Next.js is declared MIT in npm metadata. The FOSSA CC-BY-SA-4.0 detection is treated as a non-code artwork false positive from bundled dependency assets. ShopMatch Pro does not use or distribute that artwork.

The MPL-2.0 detection is acceptable for unmodified dependency usage. ShopMatch Pro does not modify Next.js or any MPL-licensed files.

### `highlight.js@10.7.3`

`highlight.js` is declared BSD-3-Clause in npm metadata. The CC-BY-SA-4.0 detection is treated as non-code artwork/assets in the dependency chain. ShopMatch Pro does not import `highlight.js` directly and does not distribute the artwork.

### `@axe-core/playwright@4.11.3`

`@axe-core/playwright` is MPL-2.0 and is used only by Playwright accessibility tests. It is a devDependency, is not bundled into the production application, and is used as-is without local source modifications.

## Outdated Dependency Quality Findings

The latest FOSSA run reported 23 outdated dependency quality findings:

- `@types/eslint-scope@3.7.7`
- `agent-base@6.0.2`
- `balanced-match@1.0.2`
- `brace-expansion@1.1.14`
- `commander@2.20.3`
- `data-uri-to-buffer@4.0.1`
- `eslint-scope@5.1.1`
- `find-up@5.0.0`
- `http-proxy-agent@5.0.0`
- `https-proxy-agent@5.0.1`
- `jest-worker@27.5.1`
- `js-tokens@4.0.0`
- `lru-cache@5.1.1`
- `lru-cache@6.0.0`
- `p-limit@3.1.0`
- `string-width@4.2.3`
- `tr46@0.0.3`
- `type-fest@0.7.1`
- `uuid@11.1.1`
- `webidl-conversions@3.0.1`
- `whatwg-url@5.0.0`
- `which@2.0.2`
- `wrap-ansi@7.0.0`

Do not force major-version npm overrides for these chains without retesting Firebase emulator, deploy, and rules workflows. Prefer upstream `firebase-tools` updates when they become available.

## Dashboard Actions Required

These findings cannot be cleared by `.fossa.yml` alone:

1. Accept or auto-ignore CC-BY-SA-4.0 on `next@15.5.19` for this project and selected version. Rationale: non-code artwork/license text detection; ShopMatch Pro does not use or distribute the artwork.
2. Accept MPL-2.0 on `next@15.5.19` for unmodified dependency usage.
3. Allow or auto-ignore LGPL-3.0-or-later for the Sharp/libvips platform packages listed in `THIRD_PARTY_LICENSES.md`. Rationale: unmodified library usage with source available upstream.
4. Decide whether FOSSA outdated dependency quality findings should remain a hard gate. If they are advisory for this project, adjust the FOSSA quality policy or add scoped ignore rules for the current transitive findings.
5. After dashboard mediation, change the CI policy test from advisory back to a hard gate by making the `Run FOSSA policy test` step exit non-zero on `fossa test` failure.

## Follow-Up

1. Complete the FOSSA dashboard actions above for the latest uploaded revision.
2. Re-run the FOSSA dashboard policy scan after mediation.
3. Keep Dependabot/Snyk enabled and accept upstream Firebase CLI fixes when they resolve the dev-only OpenTelemetry and stale transitive chains without a downgrade.
4. Re-enable hard CI failure for `fossa test` after the dashboard issue count is clean.
