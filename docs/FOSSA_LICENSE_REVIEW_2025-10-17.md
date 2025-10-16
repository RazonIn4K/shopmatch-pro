# FOSSA License Review — 2025-10-17

This document records the targeted review of all components currently flagged as **Active License Issues** in FOSSA for the `ci/QUAL-001-commit-validation-accessibility` branch (PR #20). The goal is to determine whether each dependency introduces a license risk or can be cleared/ignored in FOSSA.

## Methodology

1. Pulled all “Active” license issues from the FOSSA dashboard (snapshot provided by PM).
2. For each package:
   - Confirmed the installed version via `package-lock.json`.
   - Reviewed the package’s published license metadata (`node_modules/<package>/package.json` or `LICENSE` file).
   - Cross-referenced OSI/SPDX identifiers to ensure the license is approved and compatible with our MIT-licensed product.
3. Logged verification notes and risk assessments in the table below.

## Findings

| Package | Version | License | Verification Evidence | Assessment |
| --- | --- | --- | --- | --- |
| `ansi-escapes` | 4.3.2 | MIT | `node_modules/ansi-escapes/package.json` | ✅ Permissive; no action needed. |
| `camelcase` | 5.3.1 | MIT | `node_modules/camelcase/package.json` | ✅ Permissive; no action needed. |
| `escape-string-regexp` | 2.0.0 | MIT | `node_modules/escape-string-regexp/package.json` | ✅ Permissive; no action needed. |
| `execa` | 5.1.1 | MIT | `node_modules/execa/package.json` | ✅ Permissive; no action needed. |
| `find-up` | 4.1.0 | MIT | `node_modules/find-up/package.json` | ✅ Permissive; no action needed. |
| `get-stream` | 6.0.1 | MIT | `node_modules/get-stream/package.json` | ✅ Permissive; no action needed. |
| `glob` | 7.2.3 | ISC (code), CC-BY-SA-4.0 (logo only) | `.fossa.yml` override + `node_modules/glob/LICENSE` | ✅ Already covered by existing override; safe. |
| `human-signals` | 2.1.0 | MIT | `node_modules/human-signals/package.json` | ✅ Permissive; no action needed. |
| `locate-path` | 5.0.0 | MIT | `node_modules/locate-path/package.json` | ✅ Permissive; no action needed. |
| `lru-cache` | 5.1.1 | ISC | `node_modules/lru-cache/package.json` | ✅ ISC is permissive; no action needed. |
| `mimic-fn` | 2.1.0 | MIT | `node_modules/mimic-fn/package.json` | ✅ Permissive; no action needed. |
| `parse-json` | 5.2.0 | MIT | `node_modules/parse-json/package.json` | ✅ Permissive; no action needed. |
| `pkg-dir` | 4.2.0 | MIT | `node_modules/pkg-dir/package.json` | ✅ Permissive; no action needed. |
| `p-limit` | 2.3.0 | MIT | `node_modules/p-limit/package.json` | ✅ Permissive; no action needed. |
| `pretty-format` | 27.5.1 | MIT | `node_modules/pretty-format/package.json` | ✅ Permissive; no action needed. |
| `string-width` | 5.1.2 | MIT | `node_modules/string-width/package.json` | ✅ Permissive; no action needed. |
| `type-fest` | 0.21.3 | MIT | `node_modules/type-fest/package.json` | ✅ Permissive; no action needed. |
| `@types/jsdom` | 21.1.7 | MIT | `node_modules/@types/jsdom/package.json` | ✅ Permissive; no action needed. |
| `@axe-core/playwright` | 4.10.2 | MPL-2.0 | `node_modules/@axe-core/playwright/package.json` | ✅ MPL-2.0 (weak copyleft) already allowed in `.fossa.yml`. |
| `jsdom` | 26.1.0 | MIT | `node_modules/jsdom/package.json` | ✅ Permissive; no action needed. |

## Conclusion

- All 20 flagged dependencies use permissive licenses (MIT, ISC) or weak copyleft (MPL-2.0) that are already explicitly allowed in `.fossa.yml`.
- No GPL/AGPL or otherwise incompatible licenses were discovered.
- These issues can be safely **cleared/ignored in FOSSA** with the justification that they are permissively licensed and documented here.

## Follow-Up Actions

1. Update `.fossa.yml` (done in PR #20) to point auditors to this review.
2. In the FOSSA dashboard, mark each component as “Resolved – license approved” referencing this document.
3. Schedule the next routine audit for **2025-11-17** or after upgrading major dependencies.

_Prepared by:_ Codex CLI assistant  
_Date:_ 2025-10-17
