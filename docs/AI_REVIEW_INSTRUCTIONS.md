# AI Review Instructions

This document outlines how to leverage AI-powered code review tools (Codex, GitHub Copilot, Jules, Stitch) in the shopmatch-pro workflow.

---

## 1. Codex — Senior Tech Lead + Security/Perf Gatekeeper

**Role:** Strict architectural and security reviewer
**Model:** Claude (Codex settings in IDE)
**Use when:** Initial PR review, security/perf gates, architecture compliance

### Custom Instructions (Already Configured)
Codex is configured with custom instructions that enforce:
- Branch format: `type/<ID>-<slug>`
- - Documentation context: `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, etc.
  - - Gates: Perf ≤300 KB, Axe a11y zero violations, Stripe `runtime='nodejs'`, zod validation, tests
    - - Review style: Blockers → High-impact suggestions → Nits
     
      - ### How to Use
      - **Invoke in PR comment:**
      - ```
        Act as our Senior Tech Lead + Security/Perf gatekeeper. Using docs/*, adr/*, and the PR template:
        1. List blockers (perf ≤300 KB, a11y, security, tests, evidence).
        2. Give patch-sized suggestions (files & code hunks).
        3. Nits.
        4. Confirm artifacts (first-load-report.json, axe report) and link paths.
        ```

        ### Key Gates
        - **Perf:** First-load JS ≤ 300 KB (artifact: `first-load-report.json`)
        - - **A11y:** Zero axe violations on `/`, `/dashboard`, `/subscribe`
          - - **Security:** Stripe handlers `export runtime='nodejs'`; input validation (zod); auth/rate-limit
            - - **Testing:** Unit/E2E tests added; docs updated
             
              - ---

              ## 2. GitHub Copilot — Staff Line Reviewer & Test-Coverage Buddy

              **Role:** Collaborative reviewer, test suggestions
              **Model:** GitHub's curated LLM (requires Copilot Pro/Business/Enterprise)
              **Use when:** Line-by-line review, test coverage gaps, complex functions

              ### Setup
              - Enable in repository settings (GitHub → Copilot code review)
              - - Copilot can auto-review PRs or be invoked per-PR
               
                - ### Prompts
               
                - **Whole-PR review:**
                - ```
                  Review for correctness & test completeness. Check TS types, await context.params,
                  SSR vs client boundaries, zod validation, auth/claims, Firestore security,
                  runtime='nodejs' on Stripe, opportunities for next/dynamic. Produce small,
                  pasteable diffs.
                  ```

                  **API file audit:**
                  ```
                  Audit input validation (zod), rate-limit hooks, auth/claims checks, error codes,
                  log redaction. Suggest a minimal patch.
                  ```

                  **Test generation:**
                  ```
                  Generate unit tests for module X and one E2E spec (happy + failure). Use commands
                  from docs/TESTING.md and ensure artifacts satisfy the PR template.
                  ```

                  ### Key Focus Areas
                  - Type safety (strict TS, correct `await context.params` for Next 15)
                  - - SSR/Client boundaries
                    - - Input validation (zod)
                      - - Auth/claims enforcement
                        - - Rate-limiting
                          - - Log redaction (no PII)
                           
                            - ---

                            ## 3. Google Jules — Agentic Coding Agent

                            **What it is:** Google's AI agent that clones repos, analyzes, applies changes, opens PRs
                            **Availability:** Free tier + paid tiers
                            **Use when:** Backlog items, refactors, feature development, dependency bumps

                            ### How to Use
                            1. **Prepare the task:** Link your repo, CONTRIBUTING.md, docs/TESTING.md, docs/SECURITY.md
                            2. 2. **Give Jules a task:**
                               3.    ```
                                        Create feat/UI-00X-applications-csv branch:
                                        - Add CSV export for owner applications
                                        - Write unit & E2E tests
                                        - Keep first-load ≤300 KB
                                        - Open PR with artifacts per template
                                        ```
                                     3. **Review Jules' PR** as you would any teammate PR (using Codex/Copilot above)
                                     4. 4. **Iterate:** Comment on PR; Jules will re-run based on feedback
                                       
                                        5. ### Example Tasks
                                        6. - "Refactor owner dashboard to lazy-load heavy components; show first-load-report.json improvement"
                                           - - "Add rate-limit middleware to API routes per SECURITY.md"
                                             - - "Bump Next.js to v15 and fix all type errors in src/"
                                              
                                               - ---

                                               ## 4. Google Stitch — UI Design → Code

                                               **What it is:** AI-powered UI design tool (text/sketches → Figma → exportable code)
                                               **Engine:** Powered by Gemini 2.5
                                               **Use when:** UI prototyping, design-to-code workflow, portfolio polish

                                               ### Workflow
                                               1. **Prototype:** Use Stitch (text or sketches) + your color palette + shadcn/ui tokens
                                               2. 2. **Refine in Figma:** Export from Stitch → finalize design → component tokens
                                                  3. 3. **Integrate to Next.js:** Use exported code; respect 300 KB first-load budget via `next/dynamic`
                                                     4. 4. **Test:** Attach artifacts (first-load-report.json, axe report) in PR
                                                       
                                                        5. ### Example
                                                        6. - Design: "Owner Dashboard with cards showing applications, stats, and action buttons"
                                                           - - Export to Figma, refine, integrate → `feat/UI-00X-dashboard-redesign`
                                                             - - Code-split heavy charts/modals with `next/dynamic`
                                                              
                                                               - ---

                                                               ## Pre-PR Checklist

                                                               - [ ] Branch matches regex: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)/[A-Z]+-[0-9]{2,4}-[a-z0-9-]+$`
                                                               - [ ] - [ ] Unit/E2E tests added (or N/A with justification)
                                                               - [ ] - [ ] First-load ≤ 300 KB (artifact attached)
                                                               - [ ] - [ ] Axe report attached (0 violations on critical routes)
                                                               - [ ] - [ ] Docs updated & linked
                                                               - [ ] - [ ] PR title: `[ID] Description (Layer)` format
                                                               - [ ] - [ ] Commit follows Conventional Commits: `type(scope): message (ID)`
                                                              
                                                               - [ ] ---
                                                              
                                                               - [ ] ## PR Review Flow
                                                              
                                                               - [ ] 1. **Codex review** (blocking gates)
                                                               - [ ]    - Paste the gatekeeper prompt above
                                                               - [ ]       - Address blockers before merge
                                                              
                                                               - [ ]      2. **Copilot review** (optional, auto or on-demand)
                                                               - [ ]     - Check for test gaps, type issues, best practices
                                                              
                                                               - [ ]    3. **Human review** (merge authority)
                                                               - [ ]       - Final approval from maintainer
                                                               - [ ]      - Ensure all gates pass & artifacts present
                                                              
                                                               - [ ]  ---
                                                              
                                                               - [ ]  ## Resources
                                                              
                                                               - [ ]  - [CONTRIBUTING.md](./CONTRIBUTING.md) — Branch/commit/PR conventions
                                                               - [ ]  - [SECURITY.md](./SECURITY.md) — Auth, rate-limit, Stripe, Firestore rules
                                                               - [ ]  - [TESTING.md](./TESTING.md) — Test setup, commands, E2E patterns
                                                               - [ ]  - [ARCHITECTURE.md](./ARCHITECTURE.md) — Tech stack, design decisions
                                                               - [ ]  - [.github/pull_request_template.md](./.github/pull_request_template.md) — PR template with evidence checklist
