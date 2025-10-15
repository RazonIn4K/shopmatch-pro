# Project Kanban: OrchestrateAI

**S-Tier:** S3 – System | **Active Layers:** L2, L3, L4, L5, L6, L8, L9 | **Status:** In Development

> This board tracks the work required to move OrchestrateAI from its current state to a portfolio-ready MVP. Each card represents an action derived from the codebase overview. Move cards from **Backlog** to **Next Up** to plan a sprint, then to **In Progress** during your `SHOOT` phase.

---

### Kanban Board

| Backlog (Future Work) | Next Up (This Sprint) | In Progress | Done |
| :--- | :--- | :--- | :--- |
| <li>**Feature:** Implement Multi-Model Router</li><li>**Feature:** Build Advanced Error Analysis Dashboard</li><li>**Infra:** Integrate RUM (DataDog/New Relic)</li> | <li>**Task:** Mount Performance Dashboard</li><li>**Task:** Wire Full Analytics Loop</li><li>**Task:** Implement Model Provider Abstraction</li><li>**Task:** Harden Security & Test Rate Limits</li> | | |

---

### Sprint Task Details

#### 🟥 Task: Mount Performance Dashboard
- **ID:** `UI-001`
- **Description:** The performance dashboard UI exists but is only accessible in dev. Mount a minimal entry point (e.g., a button or command palette action) in the main UI so it can be accessed in production builds.
- **Primary Layer:** **L6 (Application)**
- **Secondary Layer:** **L5 (Observability)**
- **Owner (AI Persona):** AI Pair Programmer
- **Definition of Done:**
    - [ ] A user can access the `/performance` route from the main interface in a production environment.
    - [ ] The entry point is accessible and keyboard-navigable (`axe` checks pass).
    - [ ] The action is documented in the `README.md`.

#### 🟨 Task: Wire Full Analytics Loop
- **ID:** `LOGIC-001`
- **Description:** The analytics integration framework exists but is only partially wired. Connect all key user interactions (form submits, stream lifecycle events, errors) to the analytics service.
- **Primary Layer:** **L6 (Application)**
- **Secondary Layer:** **L5 (Observability)**
- **Owner (AI Persona):** AI Product Manager (for schema), AI Pair Programmer (for implementation)
- **Definition of Done:**
    - [ ] `use-orchestration.ts` emits `STREAM_START`, `STREAM_PROGRESS`, `STREAM_COMPLETE`, `STREAM_ERROR` events.
    - [ ] The main prompt form emits `PROMPT_SUBMITTED`.
    - [ ] All events are captured by `analytics-integration.ts` and POSTed to `/api/analytics`.
    - [ ] A read-only analytics role is added to `firestore.rules` to support future dashboards.
- **AI Prompt Starter (for AI PM):**
  > "Review the user actions in `responsive-orchestration-interface.tsx` and `use-orchestration.ts`. Propose a normalized analytics schema (event names, properties, user/session IDs) consistent with our product metrics. Return a mapping for each UI event to a tracking event."

#### 🟦 Task: Implement Model Provider Abstraction
- **ID:** `ARCH-001`
- **Description:** The current AI orchestration is tightly coupled to Genkit, creating vendor lock-in risk. Create a lightweight provider interface and refactor the Gemini integration into an adapter. This will allow for future models without rewriting the core flow.
- **Primary Layer:** **L8 (AI)**
- **Owner (AI Persona):** AI Tech Lead
- **Definition of Done:**
    - [ ] A `ModelProvider` interface is defined in `src/ai/providers/interface.ts`.
    - [ ] `src/ai/providers/gemini-adapter.ts` implements the interface.
    - [ ] `real-time-agent-logs-stream.ts` depends only on the interface, not directly on Genkit.
    - [ ] All existing E2E tests pass with the new abstraction.
- **AI Prompt Starter (for AI Tech Lead):**
  > "Design a TypeScript `ModelProvider` interface and a `GeminiAdapter` class that implements it. Show how `real-time-agent-logs-stream.ts` should be refactored to depend on the interface, not on Genkit specifics."

#### 🟩 Task: Harden Security & Test Rate Limits
- **ID:** `SEC-001`
- **Description:** The rate-limiting logic and Firestore rules are in place but lack dedicated test coverage. Audit for potential abuse vectors and add specific tests.
- **Primary Layer:** **L9 (Security)**
- **Secondary Layers:** **L2 (Data/Config)**, **L6 (Application)**
- **Owner (AI Persona):** AI Security Engineer
- **Definition of Done:**
    - [ ] `firestore.rules` has been audited for escalation or DoS vectors.
    - [ ] `usage-limiter.ts` has dedicated unit tests covering anon, auth, and admin tiers.
    - [ ] A Playwright test is created to assert that a 429 status code is returned after exceeding the anonymous usage limit.
- **AI Prompt Starter (for AI Security Engineer):**
  > "Audit `firestore.rules` and `usage-limiter.ts`. Identify three potential abuse vectors (e.g., replay attacks, resource exhaustion). For each, propose a specific mitigation and a test case that would verify the fix."
