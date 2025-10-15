# Prompt Pack — Why/How & Persona Roles

Use these with your AI tools; paste context + file paths. Always prepend:
> *"Use my Technology Landscape 2025 & S2 maturity. If you choose tech, justify using my Decision Matrix weights."*

## Product Manager — Why this way?
> “Given our MVP and Decision Matrix, explain **why** we’re using Next.js + Stripe + Firebase for S2. Identify the **business trade-offs** and one counter-metric to watch. Return a 5‑bullet rationale and a 3‑bullet risks/mitigations.”

## Tech Lead — Build on what exists
> “Given the current `docs/ARCHITECTURE.md` and `SHOPMATCH_PRO_COMPONENT_REGISTRY.md`, propose the **smallest architectural change** to support feature X without bundle regressions. Show the file diffs you’d expect.”

## QA Engineer — Test plan
> “Write test cases for feature X across unit/component/E2E and a rules emulator test. Include pass/fail criteria and a minimal Playwright spec skeleton.”

## Security Engineer — Threat model
> “Audit `/api/*` endpoints and Firestore rules for feature X. List 3 abuse vectors, mitigations, and tests. Include rate-limit and schema validation notes.”

## Pair Programmer — Implementation diffs
> “Generate a step-by-step implementation plan (by file) for feature X, followed by code snippets. Respect a11y and bundle budget.”

## Researcher — Landscape changes
> “Scan for 2025 updates impacting Firebase/Stripe/Vercel. Summarize changes that would **change our scores** in the Decision Matrix.”
