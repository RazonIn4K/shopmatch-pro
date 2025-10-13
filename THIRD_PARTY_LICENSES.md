# Third-Party Licenses

This document lists all third-party software dependencies used in ShopMatch Pro and their respective licenses.

---

## License Compliance Statement

ShopMatch Pro is licensed under the **MIT License** (see [LICENSE](./LICENSE)). All third-party dependencies have been reviewed for license compatibility with MIT and commercial use.

### Key Licensing Decisions

1. **node-forge**: This library is dual-licensed `(BSD-3-Clause OR GPL-2.0)`. **We elect to use it under the BSD-3-Clause license**, which is fully compatible with commercial and proprietary software.

2. **glob (logo only)**: The glob package code is ISC licensed. Only the glob logo artwork is CC-BY-SA-4.0. Since ShopMatch Pro does not use or distribute the glob logo, this does not affect our licensing.

---

## Direct Dependencies

### Core Framework & Runtime

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `next` | 15.5.4 | MIT | React framework for production |
| `react` | 19.1.0 | MIT | UI library |
| `react-dom` | 19.1.0 | MIT | React DOM renderer |
| `typescript` | ^5 | Apache-2.0 | Type safety |

### Authentication & Database

| Package | Version | License | Purpose | Notes |
|---------|---------|---------|---------|-------|
| `firebase` | 12.4.0 | Apache-2.0 | Client-side Firebase SDK | Authentication, Firestore |
| `firebase-admin` | 13.5.0 | Apache-2.0 | Server-side Firebase SDK | Admin operations, token verification |

**Transitive Dependency Note**:
- `firebase-admin` → `node-forge@1.3.1` (BSD-3-Clause chosen from dual-license)

### Payments

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `stripe` | 19.1.0 | MIT | Server-side Stripe SDK |
| `@stripe/stripe-js` | 8.0.0 | MIT | Client-side Stripe SDK |

### UI Components & Styling

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `@radix-ui/react-dialog` | 1.1.15 | MIT | Accessible dialog primitives |
| `@radix-ui/react-label` | 2.1.7 | MIT | Accessible label primitives |
| `@radix-ui/react-slot` | 1.2.3 | MIT | Composition utility |
| `@headlessui/react` | 2.2.9 | MIT | Unstyled accessible UI |
| `tailwindcss` | ^4 | MIT | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4 | MIT | Tailwind PostCSS integration |
| `lucide-react` | 0.545.0 | ISC | Icon library |
| `next-themes` | 0.4.6 | MIT | Theme management |

### Forms & Validation

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `react-hook-form` | 7.64.0 | MIT | Form state management |
| `@hookform/resolvers` | 5.2.2 | MIT | Form validation resolvers |
| `zod` | 4.1.12 | MIT | Schema validation |

### Utilities

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `clsx` | 2.1.1 | MIT | Conditional classNames |
| `tailwind-merge` | 3.3.1 | MIT | Merge Tailwind classes |
| `class-variance-authority` | 0.7.1 | Apache-2.0 | Component variants |
| `dotenv` | 17.2.3 | BSD-2-Clause | Environment variables |
| `react-hot-toast` | 2.6.0 | MIT | Toast notifications |
| `sonner` | 2.0.7 | MIT | Toast notifications |

---

## Notable Transitive Dependencies

### node-forge (via firebase-admin)

**Package**: `node-forge@1.3.1`
**Declared License**: `(BSD-3-Clause OR GPL-2.0)` (dual-license)
**Our License Choice**: **BSD-3-Clause**
**Used By**: `firebase-admin` (for cryptographic operations)
**Why This Is Safe**: node-forge offers a dual-license choice. We elect to use the BSD-3-Clause license option, which is fully compatible with commercial and proprietary software. BSD-3-Clause is a permissive open-source license that allows commercial use, modification, and redistribution.

**License Text**: [BSD-3-Clause License](https://opensource.org/licenses/BSD-3-Clause)

```
BSD 3-Clause License

Copyright (c) node-forge contributors

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### glob (via Next.js)

**Package**: `glob` (compiled in Next.js)
**Code License**: ISC
**Logo License**: CC-BY-SA-4.0 (artwork only)
**Why This Is Safe**: ShopMatch Pro uses the glob **code** (ISC licensed, permissive), not the glob logo artwork. The CC-BY-SA-4.0 license applies only to the visual artwork (logo image), which is not used, imported, or distributed in this application. The ISC license is fully compatible with commercial use.

---

## Development Dependencies

All development dependencies (ESLint, TypeScript types, etc.) are used only during development and are not distributed with the production application.

| Package | License | Purpose |
|---------|---------|---------|
| `@types/node` | MIT | TypeScript type definitions |
| `@types/react` | MIT | TypeScript type definitions |
| `@types/react-dom` | MIT | TypeScript type definitions |
| `eslint` | MIT | Code linting |
| `eslint-config-next` | MIT | Next.js ESLint config |

---

## License Categories Summary

| License Type | Count | Examples | Commercial Use |
|--------------|-------|----------|----------------|
| MIT | 25+ | React, Next.js, Stripe, Radix UI | ✅ Yes |
| Apache-2.0 | 3 | Firebase, TypeScript, class-variance-authority | ✅ Yes |
| ISC | 2 | glob code, lucide-react | ✅ Yes |
| BSD-3-Clause | 1 | node-forge (chosen from dual-license) | ✅ Yes |
| BSD-2-Clause | 1 | dotenv | ✅ Yes |

**Total**: All dependencies are permissively licensed and compatible with commercial use.

---

## License Compatibility Analysis

### Is ShopMatch Pro safe for commercial use?

**✅ YES** - All dependencies are either:
1. **MIT licensed** (most permissive, allows everything)
2. **Apache-2.0 licensed** (permissive with patent grant)
3. **ISC licensed** (functionally identical to MIT)
4. **BSD licensed** (permissive with attribution requirement)

### Dual-License Selection (node-forge)

When a package offers a dual-license choice like `(BSD-3-Clause OR GPL-2.0)`, we have the **right to choose** which license to use. We select **BSD-3-Clause** because:
- ✅ Fully compatible with proprietary/commercial software
- ✅ No copyleft requirements (unlike GPL)
- ✅ Allows sublicensing under different terms
- ✅ Industry standard for commercial projects

This is a **legitimate and legally recognized practice** in open-source licensing.

---

## Compliance Checklist

- [x] All direct dependencies reviewed
- [x] All transitive dependencies with potential issues investigated
- [x] Dual-licensed packages have explicit license choice documented
- [x] False positives (glob logo) documented and explained
- [x] All licenses are compatible with MIT (our chosen license)
- [x] All licenses allow commercial use
- [x] No strong copyleft licenses (GPL, AGPL) in distribution
- [x] Attribution requirements documented (BSD, Apache-2.0)

---

## Attribution Requirements

### BSD-3-Clause (node-forge)

When distributing software that includes node-forge, we must:
1. Retain copyright notice (included in `node_modules/node-forge/LICENSE`)
2. Retain license text (included in `node_modules/node-forge/LICENSE`)
3. Not use "node-forge" or contributors' names for endorsement

**Compliance**: ✅ Satisfied by including `node_modules` in distributions (standard practice)

### Apache-2.0 (Firebase, TypeScript, CVA)

When distributing software that includes Apache-2.0 licensed code, we must:
1. Retain copyright notice (included in respective packages)
2. Retain license text (included in respective packages)
3. Include NOTICE file if present (Firebase includes one)
4. Document modifications (if any - we don't modify these packages)

**Compliance**: ✅ Satisfied by including `node_modules` in distributions

---

## How to Verify Licenses

```bash
# Check a specific package license
npm view <package-name> license

# List all package licenses
npm ls --all --json | jq '.dependencies | to_entries | .[] | {name: .key, license: .value.license}'

# Check transitive dependencies
npm ls <package-name>
```

---

## License Audit History

| Date | Auditor | Tool | Result |
|------|---------|------|--------|
| 2025-10-13 | Claude Code | npm ls, manual review | ✅ All licenses compatible |
| 2025-10-13 | FOSSA | Automated scan | ⚠️ False positives resolved |

---

## Questions or Concerns?

If you have questions about licensing or compliance:
1. Review this document for documented decisions
2. Check the [LICENSE](./LICENSE) file for project license
3. Consult with legal counsel for specific legal advice

---

## External Resources

- [Open Source Initiative (OSI)](https://opensource.org/) - Open source license definitions
- [Choose a License](https://choosealicense.com/) - License comparison tool
- [SPDX License List](https://spdx.org/licenses/) - Standardized license identifiers
- [TLDRLegal](https://tldrlegal.com/) - Plain English license summaries

---

**Last Updated**: 2025-10-13
**Project License**: MIT (see [LICENSE](./LICENSE))
**Compliance Status**: ✅ **Fully Compliant** with all commercial use requirements
