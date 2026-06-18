# FOSSA License Review - 2026-06-16

## Summary

The current reviewed FOSSA project is:

- Project: `shopmatch-pro`
- Locator: `git+github.com/RazonIn4K/shopmatch-pro`
- URL: `https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro`
- Reviewed revision: `e0ff828281cc9fe8ba377315526e7e6d01869a06`
- Revision scan ID: `109223003`
- FOSSA scan status: succeeded

Original post-remediation verification snapshot:

- Verified revision: `55dcc8c3652c8e94b16735659a7a9887b8a70862`
- Verified revision scan ID: `109231746`
- FOSSA revision status: not stale
- Active unresolved licensing issues: 0
- Active unresolved security issues: 0
- Active unresolved quality issues: 0
- CI run `27653396029` passed the FOSSA policy regression gate against reviewed baseline `e0ff828281cc9fe8ba377315526e7e6d01869a06`
- Dry-run remediation workflow `27653593770` confirmed the script is idempotent and found zero active issues to change

Recent CI verification snapshots:

- Dependency-update verification on `2026-06-18` UTC: revision
  `7e0e85e30c446fc0dc32b6da3c2f66cf9847bccd` passed CI run `27734511222`,
  including `FOSSA License and Security Scan`, `Security Scan (Snyk)`, local
  smoke tests, production smoke tests, accessibility tests, Firestore rules
  tests, and build/test. The FOSSA job uploaded analysis for that revision and
  `fossa test --timeout 1200 --diff e0ff828281cc9fe8ba377315526e7e6d01869a06`
  passed with no new issues compared to the reviewed baseline.
- Documentation-refresh verification on `2026-06-18` UTC: revision
  `d466845fe56e6fdad3c36258a1b6d7b6cb652ff7` passed CI run `27735804320`,
  including the same FOSSA, Snyk, smoke, accessibility, Firestore, and build/test
  gates.
- Mirror workflow runs `27734511216` and `27735804339` completed successfully,
  keeping GitLab `main` in sync for the verified revisions.

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
- Run `fossa test --diff e0ff828281cc9fe8ba377315526e7e6d01869a06`
  as a hard regression gate after the reviewed ignore rules were applied.
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

For the reviewed baseline revision, FOSSA reported 36 quality findings, all
`outdated_dependency`, all transitive, and all caused by the "Major - 3 Policy"
Semver Outdated Rule. The FOSSA security issue count for that reviewed revision
was zero.

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

A final dry run during remediation against commit
`55dcc8c3652c8e94b16735659a7a9887b8a70862` in workflow run `27653593770`
reported zero active licensing, quality, and vulnerability issues.

A later dependency-update CI run against commit
`7e0e85e30c446fc0dc32b6da3c2f66cf9847bccd` in workflow run `27734511222`
uploaded FOSSA analysis for that revision and passed the same `--diff`
policy gate with no new issues compared to the reviewed baseline.

A documentation-refresh CI run against commit
`d466845fe56e6fdad3c36258a1b6d7b6cb652ff7` in workflow run `27735804320`
also passed the FOSSA `--diff` policy gate.

The FOSSA CLI still reports the reviewed baseline findings in an absolute
`fossa test` run, so CI uses the FOSSA-supported `--diff` mode against the
reviewed baseline revision. This makes CI fail for new/unreviewed FOSSA findings
without re-failing the already reviewed baseline items.

## Dashboard Actions Required

The reviewed dashboard/API actions have been completed. Keep this section as the
reversal/review checklist for future FOSSA policy changes:

1. Ignore the 18 reviewed licensing issues for this project and selected package versions.
2. Ignore the 36 reviewed quality `outdated_dependency` findings for this project.
3. Re-run `fossa test --timeout 1200 --diff <reviewed-baseline>` after ignores are created.
4. If the FOSSA regression test passes, keep the CI step as a hard gate.

## Follow-Up

1. Keep `fossa test --timeout 1200 --diff <reviewed-baseline>` as a hard CI gate.
2. Re-review FOSSA ignore rules when direct dependency versions change.
3. Keep Dependabot/Snyk enabled and accept upstream fixes when they resolve
   transitive quality findings without risky forced overrides.
