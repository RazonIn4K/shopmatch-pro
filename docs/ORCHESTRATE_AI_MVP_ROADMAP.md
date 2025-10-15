# Roadmap: OrchestrateAI MVP

**Objective:** Evolve OrchestrateAI from a functional prototype to a portfolio-ready Minimum Viable Product (MVP). The focus is on making the existing foundation **observable, resilient, and architecturally sound**, demonstrating professional-grade development practices.

This roadmap follows the **Now-Next-Later** framework to prioritize work.

---

## The "Now" Epic: Foundational Observability

**Goal:** Close the visibility gaps. An application that cannot be monitored is not production-ready. This phase makes the system's behavior transparent.

### **User Stories & Tasks:**

**1. As the Solo Developer, I want to access performance metrics in production so that I can diagnose real-world issues.**
- **Task ID:** `UI-001`
- **Acceptance Criteria:**
    - GIVEN the main UI is loaded, WHEN I activate the command menu, THEN the option to "View Performance Dashboard" is available.
    - GIVEN I select the option, THEN I am navigated to the `/performance` route.
- **DoD Checklist:**
    - [ ] Code reviewed and merged by **AI Tech Lead**.
    - [ ] E2E (Playwright) test validating navigation exists and passes.
    - [ ] Documentation updated in `README.md`.
- **Owner (AI Persona):** **AI Pair Programmer**

**2. As the AI Product Manager, I want to track user engagement so that I can validate the product's value.**
- **Task ID:** `LOGIC-001`
- **Acceptance Criteria:**
    - GIVEN a user submits a prompt, WHEN the stream begins, THEN a `STREAM_START` event is fired.
    - GIVEN a stream ends successfully, WHEN the final token is received, THEN a `STREAM_COMPLETE` event is fired.
    - GIVEN a stream fails, WHEN the error is caught, THEN a `STREAM_ERROR` event is fired.
- **DoD Checklist:**
    - [ ] Analytics schema approved by **AI Product Manager**.
    - [ ] Unit tests for event emitters exist and pass.
    - [ ] Code reviewed and merged.
    - [ ] Documentation updated.
- **Owner (AI Persona):** **AI Product Manager** (for schema), **AI Pair Programmer** (for implementation)

**3. As the Solo Developer, I want to be alerted to client-side errors so that I can proactively fix bugs.**
- **Task ID:** `OBS-001`
- **Acceptance Criteria:**
    - GIVEN a React component throws an unhandled error, WHEN the Error Boundary catches it, THEN the error details are POSTed to the `/api/error-report` endpoint.
- **DoD Checklist:**
    - [ ] Code reviewed and merged by **AI QA Engineer**.
    - [ ] E2E test that forces a client-side error and asserts the API call is made.
    - [ ] Documentation updated.
- **Owner (AI Persona):** **AI QA Engineer**

---

## The "Next" Epic: Architectural Integrity & Quality

**Goal:** Address the highest-risk architectural issues and testing gaps identified in the codebase review. This demonstrates foresight and a commitment to quality.

### **User Stories & Tasks:**

**1. As the AI Tech Lead, I want to decouple the AI logic from a specific vendor so that we can avoid lock-in and easily integrate new models.**
- **Task ID:** `ARCH-001`
- **Acceptance Criteria:**
    - GIVEN the application needs to generate a stream, WHEN the orchestration flow is called, THEN it interacts with a generic `ModelProvider` interface, not a concrete Genkit implementation.
- **DoD Checklist:**
    - [ ] Architectural pattern (Adapter) approved by **AI Tech Lead**.
    - [ ] All existing E2E tests pass with the new abstraction layer.
    - [ ] Code reviewed and merged.
    - [ ] Architecture diagram in `ARCHITECTURE.md` is updated.
- **Owner (AI Persona):** **AI Tech Lead**

**2. As the AI QA Engineer, I want automated tests for the core orchestration logic so that I can prevent regressions in the streaming and state management.**
- **Task ID:** `TEST-001`
- **Acceptance Criteria:**
    - GIVEN the `use-orchestration` hook, WHEN I test it with a mocked SSE stream, THEN I can assert that the Zustand store transitions through `loading`, `streaming`, and `finished` states correctly.
- **DoD Checklist:**
    - [ ] Unit tests achieve >80% coverage on `use-orchestration.ts` and `orchestration-store.ts`.
    - [ ] Code reviewed and merged.
    - [ ] Documentation updated.
- **Owner (AI Persona):** **AI QA Engineer**

**3. As the Solo Developer, I want the application to meet its performance budget so that users have a fast initial loading experience.**
- **Task ID:** `PERF-001`
- **Acceptance Criteria:**
    - GIVEN I run a production build, WHEN I analyze the bundle, THEN the initial JavaScript load for the homepage is under 300 kB.
- **DoD Checklist:**
    - [ ] Code reviewed and merged.
    - [ ] CI/CD pipeline includes a step that fails the build if the bundle size exceeds the budget.
    - [ ] Documentation updated.
- **Owner (AI Persona):** **AI Pair Programmer**

---

## The "Later" Epic: MVP+ Feature Expansion

**Goal:** Explore features that build upon the stable MVP foundation. These are excellent talking points for portfolio reviews and interviews, demonstrating your ability to think beyond the immediate scope.

- **Feature: Role-Based Dashboards:** Create a dashboard for authenticated users to view their session history and usage stats.
- **Feature: Advanced Error Analysis:** Build a simple admin UI to view and analyze the errors captured by the `/api/error-report` endpoint.
- **Feature: Multi-Model Router:** Implement a more advanced `ModelProvider` that can route prompts to different models based on complexity or user tier.
- **Feature: Search & Filtering:** Allow users to search their session history.
