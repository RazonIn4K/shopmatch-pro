# FOSSA License Review - 2026-06-16

## Summary

The current reviewed FOSSA project is:

- Project: `shopmatch-pro`
- Locator: `git+github.com/RazonIn4K/shopmatch-pro`
- URL: `https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro`
- Reviewed revision: `e0ff828281cc9fe8ba377315526e7e6d01869a06`
- Revision scan ID: `109223003`
- FOSSA scan status: succeeded

Dashboard/API inspection for the reviewed revision reported 54 unresolved issues:

| Category | Count | Notes |
|----------|-------|-------|
| Licensing - denied | 2 | CC-BY-SA-4.0 artwork/license-file detections |
| Licensing - flagged | 16 | MPL-2.0 and LGPL-3.0-or-later review findings |
| Security vulnerabilities | 0 | No active FOSSA security issues |
| Quality - outdated | 36 | Transitive staleness findings from the Semver Outdated Rule |

`package.json` and `package-lock.json` remain the source of truth for current
dependency versions. This document records the FOSSA review decision for the
specific packages and versions listed below.

Local npm verification shows production dependencies are clean:

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
- Run `fossa test` as a hard CI gate after the reviewed ignore rules were applied.
- Upload `fossa-policy-test.log` as a CI artifact for review.

Important boundary: `.fossa.yml` controls scan settings such as project metadata,
targets, and path filters. It does not create local license policies or issue
auto-ignore rules. FOSSA policy and auto-ignore decisions must be made in the
FOSSA dashboard or with FOSSA API workflows that have the correct permissions.

## Reviewed License Findings

| Package | Version | Issue ID | License | FOSSA type | Review decision |
|---------|---------|----------|---------|------------|-----------------|
| `next` | 16.2.9 | 17742268 | CC-BY-SA-4.0 | Denied by policy | Ignore for this project/version |
| `next` | 16.2.9 | 17742267 | MPL-2.0 | Flagged by policy | Ignore for this project/version |
| `highlight.js` | 10.7.3 | 17592533 | CC-BY-SA-4.0 | Denied by policy | Ignore for this project/version |
| `@axe-core/playwright` | 4.11.3 | 16727735 | MPL-2.0 | Flagged by policy | Ignore for this project/version |

### `next@16.2.9`

Next.js is declared MIT in npm metadata. FOSSA detected CC-BY-SA-4.0 in
`dist/compiled/glob/LICENSE`, specifically the Glob logo artwork attribution.
ShopMatch Pro does not use, display, distribute, or modify that logo artwork.

FOSSA detected MPL-2.0 in `dist/compiled/@vercel/og/satori/LICENSE`. This is
acceptable for unmodified dependency usage. ShopMatch Pro does not modify Next.js
or any MPL-licensed files.

### `highlight.js@10.7.3`

`highlight.js` is declared BSD-3-Clause in npm metadata. The CC-BY-SA-4.0
detection is treated as non-code artwork/assets in the dependency chain.
ShopMatch Pro does not import `highlight.js` directly and does not use or
distribute the flagged artwork.

### `@axe-core/playwright@4.11.3`

`@axe-core/playwright` is MPL-2.0 and is used only by Playwright accessibility
tests. It is a devDependency, is not bundled into the production application,
and is used as-is without local source modifications.

## Reviewed Sharp/libvips Findings

FOSSA flagged 14 platform-specific Sharp/libvips packages under
LGPL-3.0-or-later. These are transitive dependencies loaded through `sharp` and
Next.js image optimization. They are unmodified native image libraries, and
libvips source is available upstream at `https://github.com/lovell/sharp-libvips`.

| Package | Version | Issue ID | Locator |
|---------|---------|----------|---------|
| `@img/sharp-libvips-darwin-arm64` | 1.2.4 | 14125305 | `npm+@img/sharp-libvips-darwin-arm64$1.2.4` |
| `@img/sharp-libvips-darwin-x64` | 1.2.4 | 14125309 | `npm+@img/sharp-libvips-darwin-x64$1.2.4` |
| `@img/sharp-libvips-linux-arm` | 1.2.4 | 14125306 | `npm+@img/sharp-libvips-linux-arm$1.2.4` |
| `@img/sharp-libvips-linux-arm64` | 1.2.4 | 14125313 | `npm+@img/sharp-libvips-linux-arm64$1.2.4` |
| `@img/sharp-libvips-linux-ppc64` | 1.2.4 | 14125303 | `npm+@img/sharp-libvips-linux-ppc64$1.2.4` |
| `@img/sharp-libvips-linux-riscv64` | 1.2.4 | 14125314 | `npm+@img/sharp-libvips-linux-riscv64$1.2.4` |
| `@img/sharp-libvips-linux-s390x` | 1.2.4 | 14125308 | `npm+@img/sharp-libvips-linux-s390x$1.2.4` |
| `@img/sharp-libvips-linux-x64` | 1.2.4 | 14125307 | `npm+@img/sharp-libvips-linux-x64$1.2.4` |
| `@img/sharp-libvips-linuxmusl-arm64` | 1.2.4 | 14125299 | `npm+@img/sharp-libvips-linuxmusl-arm64$1.2.4` |
| `@img/sharp-libvips-linuxmusl-x64` | 1.2.4 | 14125300 | `npm+@img/sharp-libvips-linuxmusl-x64$1.2.4` |
| `@img/sharp-wasm32` | 0.34.5 | 14125310 | `npm+@img/sharp-wasm32$0.34.5` |
| `@img/sharp-win32-arm64` | 0.34.5 | 14125312 | `npm+@img/sharp-win32-arm64$0.34.5` |
| `@img/sharp-win32-ia32` | 0.34.5 | 14125311 | `npm+@img/sharp-win32-ia32$0.34.5` |
| `@img/sharp-win32-x64` | 0.34.5 | 14125302 | `npm+@img/sharp-win32-x64$0.34.5` |

## Outdated Dependency Quality Findings

FOSSA reported 36 active quality findings, all `outdated_dependency`, all
transitive, and all caused by the "Major - 3 Policy" Semver Outdated Rule.
The FOSSA security issue count for this revision is zero.

- `@apidevtools/json-schema-ref-parser@9.1.2`
- `@asamuzakjp/css-color@3.2.0`
- `@pnpm/network.ca-file@1.0.2`
- `@sindresorhus/is@4.6.0`
- `bl@4.1.0`
- `boxen@5.1.2`
- `commander@10.0.1`
- `commander@5.1.0`
- `configstore@5.0.1`
- `cross-env@7.0.3`
- `crypto-random-string@2.0.0`
- `dot-prop@5.3.0`
- `filesize@6.4.0`
- `ini@1.3.8`
- `ini@2.0.0`
- `ip-regex@2.1.0`
- `log-symbols@4.1.0`
- `lru-cache@7.18.3`
- `marked@13.0.3`
- `mime@1.6.0`
- `minimatch@5.1.9`
- `minimatch@6.2.3`
- `open@6.4.0`
- `ora@5.4.1`
- `parse5@5.1.1`
- `path-to-regexp@0.1.13`
- `path-to-regexp@1.9.0`
- `pglite-2@0.2.17`
- `strip-json-comments@2.0.1`
- `type-fest@0.20.2`
- `url-join@0.0.1`
- `uuid@11.1.1`
- `widest-line@3.1.0`
- `wrap-ansi@6.2.0`
- `write-file-atomic@3.0.3`
- `write-file-atomic@5.0.1`

Do not force major-version npm overrides for these chains without retesting
Firebase emulator, deploy, rules, Playwright, and production build workflows.
Prefer upstream dependency updates when they become available.

## Remediation Automation

The reviewed ignore actions are codified in:

```bash
npm run fossa:reviewed-ignores
```

The script is dry-run by default. Mutating mode requires:

```bash
npm run fossa:reviewed-ignores -- \
  --apply \
  --confirm apply-reviewed-fossa-ignores-for-shopmatch-pro
```

The manual GitHub workflow `.github/workflows/fossa-remediate-reviewed-issues.yml`
can run the same script with the repository `FOSSA_API_KEY` secret. If that
secret is push-only, the workflow will fail with a FOSSA API authorization error
and no ignore rules will be created.

The automation uses FOSSA's documented `PUT /api/v2/issues` endpoint to apply
`type: "ignore"` with review notes to the exact reviewed issue set.

## Remediation Applied

The reviewed FOSSA ignores were applied through GitHub Actions workflow run
`27653061853`.

The apply run reported:

- Applied reviewed licensing ignores: 18
- Applied reviewed quality ignores: 36
- Post-apply active licensing issues: 0
- Post-apply active quality issues: 0
- Post-apply active vulnerability issues: 0
- Total affected issues reported by FOSSA: 54

A follow-up dry run against commit
`1c95c269e4e5039705e222ad34b26848abe33cf2` in workflow run `27653132946`
also reported zero active licensing, quality, and vulnerability issues.

## Dashboard Actions Required

The reviewed dashboard/API actions have been completed. Keep this section as the
reversal/review checklist for future FOSSA policy changes:

1. Ignore the 18 reviewed licensing issues for this project and selected package versions.
2. Ignore the 36 reviewed quality `outdated_dependency` findings for this project.
3. Re-run `fossa test --timeout 1200` after ignores are created.
4. If FOSSA policy test passes, change the CI step from advisory to hard-fail.

## Follow-Up

1. Keep `fossa test --timeout 1200` as a hard CI gate.
2. Re-review FOSSA ignore rules when direct dependency versions change.
3. Keep Dependabot/Snyk enabled and accept upstream fixes when they resolve
   transitive quality findings without risky forced overrides.
