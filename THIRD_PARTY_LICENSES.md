# Third-Party Licenses

This document lists all third-party software dependencies used in ShopMatch Pro and their respective licenses.

---

## License Compliance Statement

ShopMatch Pro is licensed under the **MIT License** (see [LICENSE](./LICENSE)). All third-party dependencies have been reviewed for license compatibility with MIT and commercial use.

> **2025-10-17 Update**: Active FOSSA license alerts were reviewed and cleared. Detailed findings are documented in [`docs/FOSSA_LICENSE_REVIEW_2025-10-17.md`](./docs/FOSSA_LICENSE_REVIEW_2025-10-17.md).

### Key Licensing Decisions

1. **node-forge**: This library is dual-licensed `(BSD-3-Clause OR GPL-2.0)`. **We elect to use it under the BSD-3-Clause license**, which is fully compatible with commercial and proprietary software.

2. **glob (logo only)**: The glob package code is ISC licensed. Only the glob logo artwork is CC-BY-SA-4.0. Since ShopMatch Pro does not use or distribute the glob logo, this does not affect our licensing.

---

## Direct Dependencies

**Note**: Versions listed are as of 2025-10-13. See `package.json` for current versions.

### Core Framework & Runtime

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `next` | 15.5.5 | MIT | React framework for production |
| `react` | 19.2.0 | MIT | UI library |
| `react-dom` | 19.2.0 | MIT | React DOM renderer |

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
| `lucide-react` | 0.545.0 | ISC | Icon library |
| `next-themes` | 0.4.6 | MIT | Theme management |

### Forms & Validation

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `react-hook-form` | 7.65.0 | MIT | Form state management |
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

## Copyleft Licenses (Acceptable for Library Usage)

### LGPL-3.0-or-later (Sharp/libvips)

**Status**: ✅ **Acceptable under LGPL library exception**

The following packages contain LGPL-3.0-or-later licensed code (libvips image processing library):

| Package | Version | Platform | License |
|---------|---------|----------|---------|
| `@img/sharp-libvips-darwin-arm64` | 1.2.3 | macOS ARM64 | LGPL-3.0-or-later |
| `@img/sharp-libvips-darwin-x64` | 1.2.3 | macOS x64 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-arm` | 1.2.3 | Linux ARM | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-arm64` | 1.2.3 | Linux ARM64 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linuxmusl-arm64` | 1.2.3 | Linux musl ARM64 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linuxmusl-x64` | 1.2.3 | Linux musl x64 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-ppc64` | 1.2.3 | Linux PowerPC64 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-s390x` | 1.2.3 | Linux s390x | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-x64` | 1.2.3 | Linux x64 | LGPL-3.0-or-later |
| `@img/sharp-wasm32` | 0.34.4 | WebAssembly | LGPL-3.0-or-later |
| `@img/sharp-win32-arm64` | 0.34.4 | Windows ARM64 | LGPL-3.0-or-later |
| `@img/sharp-win32-ia32` | 0.34.4 | Windows 32-bit | LGPL-3.0-or-later |
| `@img/sharp-win32-x64` | 0.34.4 | Windows 64-bit | LGPL-3.0-or-later |

**Used By**: Next.js (for automatic image optimization)
**Transitive Dependency**: Yes (via Next.js → Sharp)

**Why This Is Safe for Commercial Use**:

1. **Library Exception**: LGPL allows linking as a library without copyleft obligations
2. **Pre-compiled Binaries**: These are platform-specific pre-compiled binaries of libvips
3. **No Modifications**: We use these binaries as-is without modification
4. **Separate Library**: Sharp/libvips runs as a separate library, not integrated into our source code
5. **Standard Practice**: Widely used in commercial Next.js applications (Vercel, Netlify, etc.)

**LGPL-3.0-or-later Compliance Requirements**:
- ✅ **Retain copyright notices**: Included in `node_modules/@img/*/LICENSE` files
- ✅ **Retain license text**: Included in `node_modules/@img/*/LICENSE` files
- ✅ **No modifications**: We do not modify the libvips source code or binaries
- ✅ **Library usage**: Used as separate library via Next.js image optimization
- ✅ **Source availability**: Original source available at https://github.com/libvips/libvips

**LGPL Key Points**:
- LGPL does NOT require your entire application to be open source
- LGPL only requires that modifications to the LGPL library itself be shared
- Using an LGPL library without modifying it is explicitly allowed for commercial/proprietary software
- Dynamic linking or separate binary usage (as we do) complies with LGPL

**Legal Precedent**: The LGPL library exception is well-established and used by countless commercial applications (including proprietary software from Microsoft, Google, Apple, etc.)

### MPL-2.0 (Next.js)

**Status**: ✅ **Acceptable for commercial use**

**Package**: `next` (15.5.5)
**License**: Contains some MPL-2.0 licensed code
**Depth**: Direct dependency

**Why This Is Safe for Commercial Use**:

1. **Weak Copyleft**: MPL-2.0 is "weak copyleft" (file-level, not application-level)
2. **File-Level Requirement**: Only modifications to MPL-licensed files must be shared
3. **Compatible with Proprietary Software**: Explicitly designed to allow mixing with proprietary code
4. **No Modifications**: We do not modify Next.js source code
5. **Industry Standard**: Next.js is used by thousands of commercial companies

**MPL-2.0 Compliance Requirements**:
- ✅ **Retain copyright notices**: Included in `node_modules/next/` directory
- ✅ **Retain license text**: Included in `node_modules/next/LICENSE` file
- ✅ **No modifications**: We use Next.js as-is via npm, without modifying source files
- ✅ **Source availability**: Original source at https://github.com/vercel/next.js

**MPL-2.0 Key Points**:
- MPL-2.0 does NOT require your application to be open source
- Only requires sharing modifications to MPL-licensed files (which we don't make)
- Explicitly allows combining MPL code with proprietary code in the same project
- Used by major commercial software: Firefox, Thunderbird, LibreOffice

**Commercial Use**: Companies using Next.js (with MPL components) include Airbnb, Netflix, Uber, Nike, Starbucks, and thousands more.

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

All development dependencies are used only during development and build processes. **These are not included in the production bundle** and do not affect runtime licensing.

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `typescript` | ^5 | Apache-2.0 | Type checking (build-time only) |
| `@types/node` | 24.7.2 | MIT | Node.js type definitions |
| `@types/react` | ^19 | MIT | React type definitions |
| `@types/react-dom` | 19.2.2 | MIT | React DOM type definitions |
| `eslint` | ^9 | MIT | Code linting (development only) |
| `eslint-config-next` | 15.5.5 | MIT | Next.js ESLint rules |
| `tailwindcss` | ^4 | MIT | CSS framework (build-time processing) |
| `@tailwindcss/postcss` | ^4 | MIT | PostCSS integration (build-time) |
| `@eslint/eslintrc` | ^3 | MIT | ESLint configuration utilities |
| `@playwright/test` | ^1.48.0 | Apache-2.0 | E2E testing framework (test-time only) |
| `@axe-core/playwright` | 4.10.2 | MPL-2.0 | Accessibility testing (test-time only) |
| `wait-on` | ^8.0.1 | MIT | Test server wait utility (test-time only) |

**Note**: CSS from Tailwind is compiled at build-time and included in the production bundle as regular CSS, not as a runtime dependency.

### MPL-2.0 in Development Dependencies (@axe-core/playwright)

**Status**: ✅ **Acceptable for test-only usage**

**Package**: `@axe-core/playwright` (4.10.2)
**License**: MPL-2.0
**Depth**: Direct dev dependency
**Usage**: Accessibility testing in CI/CD pipeline (test-time only)

**Why This Is Safe for Commercial Use**:

1. **Test-Only Dependency**: Used exclusively for automated accessibility testing, never in production
2. **No Modifications**: We use the library as-is via npm without modifying source files
3. **No Distribution**: Not packaged with the application or distributed to end users
4. **Weak Copyleft**: MPL-2.0 is file-level copyleft, doesn't affect application source code
5. **Industry Standard**: Used by major companies for accessibility compliance testing

**MPL-2.0 Compliance for Dev Dependencies**:
- ✅ **Retain copyright notices**: Included in `node_modules/@axe-core/playwright/` directory
- ✅ **Retain license text**: Included in `node_modules/@axe-core/playwright/LICENSE` file
- ✅ **No modifications**: We use @axe-core/playwright as-is via npm
- ✅ **Source availability**: Original source at https://github.com/dequelabs/axe-core-npm
- ✅ **Not distributed**: Development dependency, not included in production bundle

**Dev Dependency Clarification**:
- Dev dependencies are used during development and CI/CD testing **only**
- They are explicitly excluded from production builds (`devDependencies` in package.json)
- MPL-2.0 licensing requirements apply to the library itself, not to applications that use it for testing
- No source code disclosure requirements for applications that use MPL-2.0 licensed dev tools

**Similar Industry Practice**: Companies use MPL-2.0 licensed development tools without source code disclosure, including Mozilla's own tooling, HashiCorp Terraform (previously MPL-2.0), and various CI/CD tools.

---

## License Categories Summary

| License Type | Count | Examples | Commercial Use | Notes |
|--------------|-------|----------|----------------|-------|
| MIT | 25+ | React, Next.js core, Stripe, Radix UI | ✅ Yes | Most permissive |
| Apache-2.0 | 3 | Firebase, TypeScript, class-variance-authority | ✅ Yes | Patent grant included |
| ISC | 2 | glob code, lucide-react | ✅ Yes | Functionally equivalent to MIT |
| BSD-3-Clause | 1 | node-forge (chosen from dual-license) | ✅ Yes | Permissive with attribution |
| BSD-2-Clause | 1 | dotenv | ✅ Yes | Permissive |
| LGPL-3.0-or-later | 13 | Sharp/libvips (image processing) | ✅ Yes | Library exception applies |
| MPL-2.0 | 1 | Next.js (some components) | ✅ Yes | Weak copyleft (file-level) |

**Total**: All dependencies are compatible with commercial and proprietary software use.

**Copyleft Clarification**:
- **LGPL-3.0-or-later**: Acceptable for library usage (we don't modify the library)
- **MPL-2.0**: Acceptable for unmodified usage (weak copyleft, file-level only)

---

## License Compatibility Analysis

### Is ShopMatch Pro safe for commercial use?

**✅ YES** - All dependencies are either:
1. **MIT licensed** (most permissive, allows everything)
2. **Apache-2.0 licensed** (permissive with patent grant)
3. **ISC licensed** (functionally identical to MIT)
4. **BSD licensed** (permissive with attribution requirement)
5. **LGPL-3.0-or-later licensed** (acceptable for unmodified library usage)
6. **MPL-2.0 licensed** (weak copyleft, compatible with proprietary software)

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
- [x] LGPL packages used as libraries without modification (compliant)
- [x] MPL packages used without modification (compliant)
- [x] No strong copyleft licenses (GPL, AGPL) applied to our code
- [x] Attribution requirements documented (BSD, Apache-2.0, LGPL, MPL)

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

### LGPL-3.0-or-later (Sharp/libvips)

When distributing software that uses LGPL-licensed libraries, we must:
1. Retain copyright notices (included in `node_modules/@img/*/LICENSE` files)
2. Retain license text (included in respective packages)
3. Make LGPL source code available (already public at https://github.com/libvips/libvips)
4. Allow users to modify the LGPL library (library is replaceable, not locked in)
5. Document that LGPL components are used (documented in this file)

**Compliance**: ✅ Satisfied by:
- Including `node_modules` with LICENSE files in distributions
- Using libraries as-is without modification
- Not preventing users from replacing the library
- Documenting usage in THIRD_PARTY_LICENSES.md

**Note**: LGPL does NOT require distributing our application's source code, only the LGPL library's source (which is already public).

### MPL-2.0 (Next.js)

When distributing software that includes MPL-2.0 licensed code, we must:
1. Retain copyright notices (included in `node_modules/next/` directory)
2. Retain license text (included in `node_modules/next/LICENSE`)
3. Document which files are MPL-licensed (Next.js maintains this internally)
4. Make MPL source code available (already public at https://github.com/vercel/next.js)
5. Share modifications to MPL files (we don't modify Next.js source)

**Compliance**: ✅ Satisfied by:
- Including `node_modules` with LICENSE files in distributions
- Using Next.js as-is via npm without modifying source files
- Next.js source code is publicly available

**Note**: MPL-2.0 does NOT require distributing our application's source code, only modifications to MPL-licensed files (which we don't make).

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
| 2025-10-13 | npm audit | Security scan | ✅ 0 vulnerabilities (648 total packages: 248 prod, 315 dev) |

**Latest Security Audit** (2025-10-13):
```json
{
  "vulnerabilities": {
    "info": 0,
    "low": 0,
    "moderate": 0,
    "high": 0,
    "critical": 0,
    "total": 0
  },
  "dependencies": {
    "prod": 248,
    "dev": 315,
    "total": 648
  }
}
```

**Verification**: Run `npm audit` in the project directory to verify current security status.

---

## Transitive Dependency Management

### Understanding "Outdated" Warnings

FOSSA and other scanning tools may flag certain transitive dependencies as "outdated." Here's what you need to know:

**What are transitive dependencies?**
- Dependencies that your direct dependencies rely on
- Example: `firebase-admin` → `node-forge` → other packages
- You don't directly control their versions

**Why do "outdated" warnings persist?**
- Parent packages (firebase-admin, Next.js, etc.) lock specific versions
- Updates are constrained by parent package's `package.json`
- Updating within semver ranges (`npm update`) won't change locked versions
- Only the maintainers of parent packages can update these dependencies

**Are "outdated" warnings a problem?**
- **License-wise**: ❌ No - outdated doesn't mean non-compliant
- **Security-wise**: Depends - check npm audit for actual vulnerabilities
- **Functionality-wise**: ❌ No - these versions are battle-tested and stable
- **Commercial use**: ✅ Still safe - license terms don't change with age

**Common "outdated" packages in this project**:
- `brace-expansion@1.1.12` - locked by `minimatch` (Next.js dependency)
- `minimatch@3.1.2` - locked by Next.js build tools
- `uuid@8.3.2` / `uuid@9.0.1` - locked by firebase-admin
- `find-up@5.0.0`, `p-limit@3.1.0` - locked by various tools
- `react-is@16.13.1` - locked by React ecosystem packages

**What can solo developers do?**
1. ✅ **Keep direct dependencies updated** (we do this regularly)
2. ✅ **Monitor security advisories** (`npm audit` shows zero vulnerabilities)
3. ✅ **Wait for parent packages to update** (firebase-admin, Next.js will eventually update)
4. ❌ **Don't force-update transitive dependencies** - breaks compatibility and introduces bugs

**FOSSA Badge Status**:
- License compliance: ✅ All licenses permissive and documented
- Security scan: ✅ Zero known vulnerabilities
- "Outdated" warnings: ⚠️ May persist (transitive dependencies locked by parents)

**TL;DR**: "Outdated" warnings are informational, not critical. As long as:
- ✅ No security vulnerabilities (`npm audit` on 2025-10-13 shows 0 vulnerabilities across 648 packages)
- ✅ All licenses are compatible (documented: all permissive - MIT, Apache-2.0, BSD, ISC)
- ✅ Direct dependencies are updated (verified 2025-10-13: Next.js 15.5.5, React 19.2.0, etc.)
- ✅ Application builds and runs correctly (production build passing)

...then "outdated" warnings for transitive dependencies are **acceptable** and **safe to ignore**.

**Last Verified**: 2025-10-13 | **Verification Command**: `npm audit` | **Result**: 0 vulnerabilities

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
