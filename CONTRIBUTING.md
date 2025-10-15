# Contributing

## Branches

**Format:** `type/<ID>-<slug>`

- `type`: feat | fix | perf | sec | docs | test | refactor | ci | build
- - `<ID>`: UPPERCASE work item (UI-001, ARCH-001, SEC-001, …)
  - - `<slug>`: short-kebab summary
   
    - ### Examples
   
    - - `feat/UI-001-perf-dashboard-entry`
      - - `sec/SEC-001-rate-limit-analytics`
        - - `perf/PERF-001-first-load-split`
          - - `docs/ARCH-001-api-guidelines`
            - - `test/QA-001-e2e-checkout`
             
              - ## Commits & PRs
             
              - **Commit style** (Conventional Commits):
              - ```
                feat(ui): mount performance dashboard (UI-001)
                fix(auth): resolve token expiry on refresh (SEC-001)
                perf(api): optimize payload size (PERF-001)
                ```

                **PR title:** `[UI-001] Mount performance dashboard (L6/L5)`

                ## Workflow

                1. Create branch matching `type/<ID>-<slug>` format
                2. 2. Write tests first where helpful; keep small PRs
                   3. 3. Update docs and Execution Journal
                      4. 4. Ensure CI passes: typecheck, lint, test, e2e, build
                         5. 5. Use PR template; link Issues/ADRs
                            6. 6. Attach evidence artifacts: `first-load-report.json`, a11y report, test paths
                              
                               7. ## Requirements
                              
                               8. - **Performance:** First-load JS ≤ 300 KB (measured with Playwright; artifact required)
                                  - - **Accessibility:** Zero axe violations on `/`, `/dashboard`, `/subscribe`
                                    - - **Security:** Stripe handlers export `runtime = 'nodejs'`; APIs validate input (zod), enforce auth/claims, rate-limit
                                      - - **Testing:** Unit/E2E tests added; docs updated
                                        - - **Template:** PR uses template & includes evidence
