# Sprint Execution Playbook: OrchestrateAI

> **Purpose:** Single source of truth for executing **every task** in OrchestrateAI during the `SHOOT` and `SKIN` phases. This SOP binds your Atlas & Universal Framework, AI Team Personas, and Kanban/Roadmap into a repeatable loop that produces portfolio‑grade results.

**S‑Tier:** S3 (System) · **Active Layers:** L2, L3, L4, L5, L6, L8, L9 · **BHS:** PRESTUDY → AIM (Roadmap/Kanban) → **SHOOT (This Playbook)** → SKIN

---

## 0) Preconditions (Definition of Ready for any card)

Before moving a card from **Next Up** → **In Progress**, ensure:

- **Scope & Why**: The task links to a Roadmap story and has a clear “why”.  
- **Owner Persona**: A primary AI Persona is assigned (PM, Tech Lead, QA, Security, Pair Programmer).  
- **Layer Mapping**: Primary/secondary Universal Framework layers identified (e.g., L6 + L5).  
- **Evidence Plan**: You know what evidence you will attach for DoD (links to code diff, test paths, screenshots, logs).  
- **Branch**: Create a feature branch: `feat/<ID>-<slug>` (e.g., `feat/UI-001-performance-entry`).  
- **Env Parity**: `.env.example` updated if needed; Emulator suite available for local tests if applicable.

---

## 1) Task Kickoff & Requirement Clarification

**Goal:** Align on the *what* and *why* with the owner persona and confirm the smallest discoverable UX.

1. Move the card to **In Progress**.  
2. Start a kickoff with the **Owner Persona** using a prompt tailored to the task.

**Prompt (template):**
> “I’m starting `{ID}: {Title}`. Goal: `{1‑sentence outcome}`. Propose the minimal, discoverable user interaction consistent with `Product-Design-Guide-2025` (discoverability + minimalism). Offer 2 options, choose one, and justify.”

**Example (UI‑001: Mount Performance Dashboard):**
> “I’m starting `UI‑001`. Goal: Production‑accessible entry point for the performance dashboard. Button in header vs. command palette entry? Choose per our design principles and justify.”

**Outputs:** Decision summary + updated acceptance criteria (add to the card).

---

## 2) Pre‑Implementation Analysis (Micro Critical Path)

**Goal:** Surface dependencies/risks before coding. Create a micro CPM note: `CPM-<ID>` in your daily note or `/notes/cpm/`.

**Use this template:**

```
# CPM-<ID> <Title>

## Context
<1-2 lines of why and desired outcome>

## Affected Layers
- L6 (UI): <components/files>
- L5 (Obs): <metrics/telemetry impacted>
- L4 (Build): <bundle/SSR implications>
- L2 (Data): <rules/collections>
- L9 (Security): <rate-limit/auth concerns>

## Baseline
- Current bundle metric (if relevant): <value>
- Current perf budget: LCP ≤ 2.5s; First-load JS ≤ 300 kB

## Risks
- R1: <risk>  · Mitigation: <action>
- R2: <risk>  · Mitigation: <action>

## Dependencies
- Routes/components: </performance>, <PerformanceDashboard>
- Feature flags / env: <flag/var>

## Evidence Plan
- E2E path:
- Unit path:
- Screenshots/logs:
```

Take a **baseline** measurement if performance/bundle might change.

---

## 3) AI‑Augmented Development (SHOOT)

**Goal:** Implement the smallest slice that meets the DoD, with tests first where helpful.

### 3.1 Implement Feature

- Pair with **AI Pair Programmer**. Provide file paths, constraints, and acceptance criteria.

**Prompt (UI‑001 example):**
> “Implement a command‑palette action ‘Performance Dashboard’ in `responsive-orchestration-interface.tsx` that navigates to `/performance` (Next.js `useRouter`). Follow a11y rules and avoid increasing main bundle size.”

**Pattern: Next.js lazy entry points (avoid bundle bloat)**

```tsx
// example: lazy open of a heavy control or palette
import dynamic from "next/dynamic";
const CommandPalette = dynamic(() => import("./command-palette"), { ssr: false });

// inside the UI component:
<CommandPalette commands={[
  { id: "perf-dashboard", title: "Performance Dashboard", action: () => router.push("/performance") }
]} />
```

### 3.2 Implement Tests

- Collaborate with **AI QA Engineer** to write the E2E and any focused unit tests.

**Playwright E2E template (UI navigation):**
```ts
import { test, expect } from "@playwright/test";

test("opens Performance Dashboard via command palette", async ({ page }) => {
  await page.goto("/");
  // open palette (replace with your key/btn)
  await page.keyboard.press("Meta+k");
  await page.getByRole("menuitem", { name: /performance dashboard/i }).click();
  await expect(page).toHaveURL(/\/performance$/);
  await expect(page.getByRole("heading", { level: 1, name: /performance/i })).toBeVisible();
});
```

**Unit template (events/state; Jest):**
```ts
import { act, renderHook } from "@testing-library/react";
import { useOrchestration } from "@/hooks/use-orchestration";

test("stream lifecycle emits start/complete", async () => {
  const { result } = renderHook(() => useOrchestration(/* mock deps */));
  await act(async () => {
    await result.current.startStream({ prompt: "hi" });
  });
  expect(result.current.state.status).toBe("finished");
  // assert analytics/event calls via a mock
});
```

---

## 4) The “Wrench” Protocol (Inject Reality, Learn Fast)

**Goal:** Deliberately introduce and resolve one realistic complication per task.

**How to:** Ask the designated persona to inject a problem after initial implementation.

- **Tech Lead (performance)**  
  Prompt: “Simulate a high‑priority regression: the new entry point increased the main JS chunk by 40 kB and LCP regressed. Report with repro and suggested next steps.”

- **Security (abuse)**  
  Prompt: “Raise a blocking concern: `/api/analytics` is abusable without auth. Propose rate‑limit & input validation. Provide a test plan.”

- **QA (vague bug)**  
  Prompt: “File an ambiguous bug titled ‘It’s broken on mobile’. Force me to triage: include a cryptic STR + one screenshot.”

**Resolve using runbooks:**  
- Follow the **Performance Investigation Runbook** quick‑start. Typical fix for UI‑001: **code‑split** or **defer** the palette or dashboard launcher.

**Bundle refactor snippet (dynamic import on demand):**
```tsx
const PerfButton = dynamic(() => import("./PerfButton"), { ssr: false, loading: () => null });
// ensure it's not included in the main route chunk until used
```

**Record in CPM:** Add a **Lessons Learned** block with root cause and fix.

---

## 5) DoD Validation & Go‑Live Readiness Gate

**Goal:** Verify quality. Attach evidence links in the card and PR.

**DoD (task‑level):**
- [ ] a11y/keyboard passes (axe) where applicable  
- [ ] Unit/E2E tests added and green  
- [ ] Telemetry added/updated (events, error reporting)  
- [ ] Bundle/perf budgets respected (no regressions)  
- [ ] Docs updated (README/ARCHITECTURE/CHANGELOG)

**Go‑Live Gate (PR‑level):**
- [ ] CI passes: `typecheck`, `lint`, `test`, `build`, `e2e`  
- [ ] Security touchpoints reviewed (rate‑limit, rules, secrets)  
- [ ] Screenshots or logs attached for acceptance criteria  
- [ ] Linked Roadmap story and Kanban card

**PR Description Template:**

```
## Summary
<what/why>

## Acceptance Criteria
- <list>

## Evidence
- E2E: <path or CI link>
- Unit: <path or coverage>
- Screens: <images or URLs>
- Perf: <bundle diff / LCP notes>

## Risks & Mitigations
- <…>

## Checklist
- [ ] Docs updated
- [ ] Events added
- [ ] Security reviewed
```

---

## 6) Merge & Synthesize (SKIN)

**Goal:** Turn work into durable knowledge and portfolio narrative.

1. **Merge PR** → Move card to **Done**.  
2. **Synthesis note** (short, in daily/weekly note):

```
# SKIN – <ID> <Title>
- Outcome: <what shipped>
- Wrench: <problem injected>
- Diagnosis: <how found>
- Fix: <code-split, rule update, test, etc.>
- Cross-layer insight: e.g., L6 change → L4 bundle impact → L5 visibility
- Next safeguard: e.g., add bundle budget check to CI
```

---

# Persona Prompt Bank (copy/paste)

### AI Product Manager
- “Propose an analytics schema for these UI events: SUBMIT, STREAM_START, STREAM_PROGRESS, STREAM_COMPLETE, STREAM_ERROR. Include required properties (sessionId, userId (hashed/UID), ts, promptLen, model, latencyMs, tokenCount). Return a mapping from UI action → event.”
- “Evaluate whether this feature changes our North‑Star or input metrics; suggest one counter‑metric to watch.”

### AI Tech Lead
- “Design a `ModelProvider` interface and a `GeminiAdapter` for streaming. Show how `real-time-agent-logs-stream.ts` depends only on the interface.”
- “Detect bundle regressions and propose code‑splitting points for the changed files.”

### AI QA Engineer
- “Write a Playwright test for the new navigation path and a failure case.”
- “Create a minimal unit test to assert `use-orchestration` state transitions with a mocked SSE.”

### AI Security Engineer
- “Audit `firestore.rules` and `/api/analytics`. Identify 3 abuse vectors (replay, spam, escalation). Propose precise mitigations (rate‑limit, schema validation, auth/anon split) and tests.”

### AI Pair Programmer
- “Given file X and acceptance criteria Y, generate an implementation plan with diffs by file, then the code.”

---

# Working Examples for Current Sprint

## UI‑001 – Mount Performance Dashboard (L6→L5)
**DoD:** Navigable in prod; a11y OK; doc updated.  
**Wrench:** Bundle size increased → fix by dynamic import / defer.  
**Evidence:** Playwright test file `e2e/performance-entry.spec.ts`, screenshot of palette, bundle diff.

## LOGIC‑001 – Wire Full Analytics Loop (L6→L5)
**Steps:**
1) Define schema with PM; 2) Emit events in `use-orchestration` and prompt form; 3) POST via `analytics-integration.ts`; 4) Add read‑only analytics role in `firestore.rules`.
**Wrench:** Spam on `/api/analytics` → add rate‑limit + input validation.  
**Evidence:** Unit tests for emitters; E2E trace shows events; rules test via Emulator.

**Emitter stub (example):**
```ts
track("STREAM_START", { sessionId, model, promptLen });
track("STREAM_COMPLETE", { sessionId, latencyMs, tokenCount });
track("STREAM_ERROR", { sessionId, code, message: redacted(err) });
```

## ARCH‑001 – Model Provider Abstraction (L8)
**Steps:** Define interface → implement `GeminiAdapter` → refactor orchestration to depend on interface → run all E2E.  
**Interface sketch:**
```ts
export interface ModelProvider {
  startStream(input: { prompt: string; system?: string }): AsyncIterable<{ token: string }>
  summarize?(text: string): Promise<string>
  id: string
}
```
**Wrench:** Typings/stream mismatch → add adapter tests & fallback path.  
**Evidence:** Interface + adapter files; passing E2E run; updated `ARCHITECTURE.md` diagram.

## SEC‑001 – Harden Security & Test Rate Limits (L9/L2/L6)
**Steps:** Review `firestore.rules`; write unit tests for `usage-limiter.ts` (anon/auth/admin); write Playwright test for 429 after exceeding anon budget.  
**Unit test sketch:**
```ts
import { limiter } from "@/lib/usage-limiter";
test("anon tier limits after N requests", async () => {
  const user = { tier: "anon", ip: "1.2.3.4" };
  for (let i=0; i<limit; i++) expect(await limiter.allow(user)).toBe(true);
  expect(await limiter.allow(user)).toBe(false);
});
```
**Wrench:** Bypass via rotated IPs → add per‑session + per‑IP composite key; log suspected abuse.  
**Evidence:** Rules emulator results; unit + E2E logs; security checklist.

---

# Checklists & Templates

## A. Analytics Event Mapping (fill once, reuse)
| UI Action | Event Name | Required Properties | PII/Redaction | Notes |
|---|---|---|---|---|
| Prompt submit | PROMPT_SUBMITTED | sessionId, userId, promptLen | redact prompt? length only |  |
| Stream start | STREAM_START | sessionId, model | n/a |  |
| Stream token | STREAM_PROGRESS | sessionId, tokenIdx | do not log token text |  |
| Stream done | STREAM_COMPLETE | sessionId, latencyMs, tokenCount | n/a |  |
| Error | STREAM_ERROR | sessionId, code | redact message |  |

## B. Security Review (per change)
- [ ] Inputs validated (zod/schema)  
- [ ] Rate‑limited endpoints updated/tests added  
- [ ] Firestore rules diff reviewed + emulator tests run  
- [ ] Secrets/env handled via `.env` + platform secrets

## C. Performance (per UI change)
- [ ] Compare bundle diff (CI artifact)  
- [ ] Code‑split heavy components  
- [ ] LCP/RUM hook (once RUM enabled)

## D. Bug Report (QA template)
```
Title: <concise>
Env: <browser/os>
STR:
1. …
2. …
Expected: …
Actual: …
Evidence: <screenshot/log>
Severity: P1/P2/P3
```

---

## 7) Daily Cadence & Sprint Rhythm

- **Daily (10 min):** What I shipped yesterday; today’s target; one risk; one help request to a persona.  
- **Mid‑sprint review:** Demo the smallest meaningful slice; confirm Roadmap alignment.  
- **Retro (SKIN):** Capture 1 process win, 1 friction, 1 automation to add (e.g., CI budget gate).

---

## 8) Cross‑Doc Links (anchor this playbook)

- **Kanban:** `PROJECT_ORCHESTRATE_AI_KANBAN.md`  
- **Roadmap:** `ORCHESTRATE_AI_MVP_ROADMAP.md`  
- **Runbooks & Guides:** `Performance-Investigation-Runbook.md`, `Critical-Path-Map-Template.md`, `Go-Live-Readiness-Gate.md`, `Product-Design-Guide-2025.md`, `Tool-Selection-Mini-Tree.md`

---

**Usage:** For each card, run **Sections 1 → 6** end‑to‑end. Add the CPM and SKIN notes. Expect to inject **exactly one wrench** per task. Over time, the SKIN notes become your interview stories and the durable IP of OrchestrateAI.
