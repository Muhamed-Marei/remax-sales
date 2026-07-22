# SaleTrack PRD Review and Implementation Plan

**Date:** 2026-07-21

**Source:** [PRD.md](./PRD.md)

**Planning assumption:** one full-stack engineer, one business owner for decisions/UAT, four 2-week delivery sprints after a short discovery phase. Estimates are ideal engineering days, not calendar promises.

## 1. PRD Review

### Score: 7/10 approval items complete

| PRD approval area | Status | Review |
|---|---|---|
| Header and ownership | Missing | Timeline exists, but business, engineering, and design owners are still TBD. |
| Context and 5 Whys | Complete | Problem, impact, root cause, and desired outcome are clear. |
| Personas and permissions | Complete | Admin, salesperson, and excluded users are defined. |
| UX flows and failure states | Partial | Main flows and screens are described; approved wireframes, empty/loading/error states, and mobile behavior are not. |
| Functional requirements | Complete | Core stories have testable Given/When/Then criteria. |
| Technical model and NFRs | Complete | Architecture, collections, security boundaries, performance, and accessibility targets are present. |
| Metrics and guardrails | Complete | HEART measures, funnel formulas, and counter-metrics are defined. |
| Rollout plan | Complete | Alpha, beta, GA, flags, and phase exits are included. |
| Risks and dependencies | Complete | Major data-quality, adoption, security, and Firebase cost risks are covered. |
| GTM/enablement | Missing | Because this is an internal product, it needs launch communication, training, support owner, and spreadsheet migration/cutover instructions rather than external marketing. |

### Required decisions before feature development

| Decision ID | Question | Proposed default | Decision owner |
|---|---|---|---|
| D-01 | What does `mohamed` represent? | A configurable lead source, renamed to its business-approved label | Business owner |
| D-02 | What does `Profolio/Portfolio` measure? | Non-negative count of units added to the salesperson's portfolio | Business owner |
| D-03 | Is a deal a property listing or a customer opportunity? | MVP deal is a property listing/pipeline item; customer CRM is deferred | Business owner |
| D-04 | How long can salespeople edit activity? | Current calendar month; admin can edit all history with audit log | Business owner |
| D-05 | Which deal-state transitions are valid? | Forward/backward transitions allowed except closed states; reopening requires admin | Business owner |
| D-06 | Where will Next.js run? | Firebase App Hosting if available for the project; Vercel otherwise | Engineering owner |
| D-07 | How are invitations sent? | Admin SDK creates account, Firebase-generated password-reset/setup link is sent through an approved email template | Engineering/business owners |

> Security decision: the application will not auto-generate, display, email, or store a plaintext password. The user receives a secure time-limited setup/reset link and chooses their own password.

### Recommended PRD improvements

1. Assign named owners and an MVP approval date.
2. Add approved desktop/mobile RTL wireframes for the seven screens.
3. Add a data glossary defining each count and preventing double-counting between `dealsCount` and actual deal documents.
4. Define valid deal-state transitions, closed/reopened behavior, and lost-reason values.
5. Define migration/cutover, training, operational support, and production incident ownership.

## 2. Delivery Strategy

### Milestones

| Milestone | Target | Outcome |
|---|---|---|
| M0 — Scope approved | End of Discovery | Glossary, wireframes, states, owners, and Firebase environments approved |
| M1 — Secure foundation | End of Sprint 1 | Admin can provision a salesperson; authentication and role isolation work |
| M2 — Operational MVP | End of Sprint 2 | Salespeople can record daily activity and manage assigned unit/deals |
| M3 — Management insights | End of Sprint 3 | Dashboards, profile analysis, filters, and exports work |
| M4 — Pilot-ready release | End of Sprint 4 | Security, accessibility, migration, monitoring, documentation, and UAT pass |

### Priority definitions

- **P0:** required for secure MVP launch.
- **P1:** important for pilot usability; may move within the same milestone.
- **P2:** stretch or post-MVP improvement.

## 3. Implementation Backlog

## Discovery — 3 to 5 business days

**Goal:** eliminate business ambiguity and approve the build contract.

| ID | Pri | Task | Estimate | Depends on | Acceptance check |
|---|---:|---|---:|---|---|
| DISC-01 | P0 | Assign business, engineering, design/UAT, and support owners | 0.25d | None | Names and approval responsibilities appear in the PRD |
| DISC-02 | P0 | Workshop and approve the bilingual activity data glossary | 0.5d | None | Every activity field has definition, example, source, and anti-double-counting rule |
| DISC-03 | P0 | Resolve D-01 through D-05 | 0.5d | DISC-02 | Written decisions approved by business owner |
| DISC-04 | P0 | Specify deal transition matrix and lost-reason list | 0.5d | DISC-03 | Every state has permitted next states and required fields |
| DISC-05 | P0 | Create RTL desktop/mobile wireframes and state inventory | 1.5d | DISC-02 | Admin and sales flows include loading, empty, validation, error, and permission-denied states |
| DISC-06 | P0 | Confirm Firebase/hosting projects, email domain, environments, budget alerts | 0.5d | None | Development and production environment checklist approved |
| DISC-07 | P1 | Define spreadsheet import/cutover and data retention policy | 0.5d | DISC-02 | Template, validation rules, owner, cutoff date, and rollback process documented |

**Discovery exit gate:** all P0 decisions approved. UI and schema work must not start against unresolved field meanings.

## Sprint 1 — Secure Foundation

**Sprint goal:** an admin can securely create a salesperson who can set a password, sign in, and reach only role-allowed routes.

| ID | Pri | Task | Estimate | Depends on | Acceptance check |
|---|---:|---|---:|---|---|
| ✅ FND-01 | P0 | Initialize Next.js App Router, TypeScript, linting, formatting, and test tooling | 0.75d | Discovery gate | CI runs typecheck, lint, unit tests, and production build |
| ✅ FND-02 | P0 | Add UI foundation: design tokens, Arabic/English dictionaries, RTL/LTR shell, responsive navigation | 1.5d | DISC-05, FND-01 | Core shell works at mobile and desktop widths in both directions |
| ✅ FND-03 | P0 | Configure isolated Firebase development/production projects and emulator suite | 0.75d | DISC-06, FND-01 | Local Auth, Firestore, Functions, and Storage emulators start from documented command |
| ✅ FND-04 | P0 | Implement shared TypeScript types and Zod schemas for users, activity, deals, settings, and audit data | 1d | DISC-02, DISC-04 | Valid fixtures pass and invalid/unknown fields fail unit tests |
| ✅ FND-05 | P0 | Implement Firebase client/Admin initialization and environment validation | 0.75d | FND-03 | Missing secrets fail safely; Admin credentials never enter client bundle |
| ✅ AUTH-01 | P0 | Build unified sign-in page with role-based redirection, sign-out, auth-loading, expired-session, forgot-password, and change-password flows | 1.5d | FND-02, FND-05 | Auth scenarios in FR-1 pass without email enumeration; users redirect to role-specific dashboard |
| ✅ AUTH-02 | P0 | Implement verified server session/ID-token handling and route guards | 1.25d | AUTH-01 | Anonymous, inactive, admin, and salesperson access matrix passes integration tests |
| ✅ AUTH-03 | P0 | Build trusted admin invitation endpoint/function | 1.25d | AUTH-02 | Admin creates unique salesperson; secure setup link is issued; non-admin is rejected |
| ✅ USER-01 | P0 | Build admin salesperson list, invite form, activate/deactivate action, and profile shell | 1.5d | AUTH-03 | Duplicate email, invalid input, loading, success, and failure states work |
| ✅ SEC-01 | P0 | Write initial Firestore/Storage rules for organization and role isolation | 1.5d | FND-04, AUTH-02 | Emulator tests reject cross-user/cross-role reads and protected-field writes |
| ✅ OBS-01 | P1 | Add structured error logging and safe audit-log helper | 0.75d | FND-05 | Errors contain request correlation data but no password, email, or private notes |

**Sprint 1 exit gate:** M1 demo plus passing role-isolation tests. Estimated load: 12.5 ideal days; scope should be adjusted to the team's real capacity, keeping P0 items first.

## Sprint 2 — Activity and Deal Operations

**Sprint goal:** a salesperson can accurately record daily work and maintain their assigned property pipeline.

| ID | Pri | Task | Estimate | Depends on | Acceptance check |
|---|---:|---|---:|---|---|
| ✅ ACT-01 | P0 | Implement deterministic daily activity repository (`salesId_YYYY-MM-DD`) | 1d | FND-04, SEC-01 | Concurrent/repeated save updates one record rather than creating duplicates |
| ✅ ACT-02 | P0 | Build bilingual daily activity create/edit form | 1.5d | ACT-01, FND-02 | Integers, source, attendance, notes, date limits, and all validation states work |
| ✅ ACT-03 | P0 | Build salesperson activity history with pagination/date filter | 1d | ACT-01 | Salesperson sees only own records and can reopen an allowed date |
| ✅ ACT-04 | P0 | Build admin activity table and audited correction flow | 1.25d | ACT-01, OBS-01 | Admin edit records actor, timestamp, and safe before/after values |
| ✅ DEAL-01 | P0 | Implement deal repository, normalized EGP/commission fields, and Firestore indexes | 1.25d | FND-04, DISC-04 | Create/read/update queries work for admin and assigned salesperson roles |
| ✅ DEAL-02 | P0 | Build deal/unit create and edit form | 1.75d | DEAL-01, FND-02 | Required property, deal type/state, close/lost validation, and errors work |
| ✅ DEAL-03 | P0 | Build deal list/detail with filters, assignment checks, and state timeline | 1.5d | DEAL-02 | Admin sees all; salesperson sees assigned only; history displays in order |
| ✅ DEAL-04 | P0 | Implement atomic state transition and audit/history write | 1d | DEAL-01, DISC-04, OBS-01 | Invalid transitions fail; valid transition and history commit together |
| ✅ FILE-01 | P1 | Implement compressed unit photo upload, limits, delete, and Storage rules | 1.25d | DEAL-02, SEC-01 | Allowed image types/sizes upload; unauthorized paths and unsafe files fail |
| ✅ SEC-02 | P0 | Expand emulator rule tests for all activity/deal/storage operations | 1d | ACT-04, DEAL-04 | Permissions matrix has positive and negative tests for each operation |

**Sprint 2 exit gate:** M2 demo using admin and two salesperson test accounts. Estimated load: 12.5 ideal days.

## Sprint 3 — Dashboards and Reports

**Sprint goal:** admins can evaluate team performance and salespeople can understand their own progress using consistent filters.

| ID | Pri | Task | Estimate | Depends on | Acceptance check |
|---|---:|---|---:|---|---|
| ✅ ANA-01 | P0 | Implement pure KPI/funnel calculation library | 1d | ACT-01, DEAL-01 | Formula tests cover zero denominators, empty ranges, and boundary dates |
| ✅ ANA-02 | P0 | Implement organization-scoped query services and shared filter model | 1.25d | ANA-01 | Date, user, source, attendance, state, type, and location filters compose consistently |
| ✅ DASH-01 | P0 | Build salesperson dashboard | 1.5d | ANA-02 | Current-month cards, trend, funnel, attendance, and open deals show own data only |
| ✅ DASH-02 | P0 | Build admin overview dashboard | 2d | ANA-02 | Team KPIs, trends, funnel, source mix, pipeline, and needs-attention list share filters |
| ✅ DASH-03 | P0 | Complete salesperson profile drill-down | 1.5d | DASH-02, USER-01 | Summary, activity, attendance, conversion, and deals reconcile with raw records |
| ✅ REP-01 | P0 | Build admin report tables and filter URL state | 1.25d | ANA-02 | Reload/back navigation preserves valid filters and tables paginate correctly |
| ✅ REP-02 | P0 | Implement CSV exports for activity and deals | 1d | REP-01 | Export exactly matches filtered rows, handles Arabic UTF-8, and is admin-only |
| ✅ PERF-01 | P1 | Profile Firestore reads/indexes and add summary aggregation only if thresholds require it | 1d | DASH-02 | P95/load and read-count budget are recorded; indexes/aggregates resolve hot queries |
| ✅ ANA-03 | P1 | Add privacy-safe product events from PRD measurement plan | 0.75d | DASH-02 | Event validation tests ensure no PII/free-text payloads |

**Sprint 3 exit gate:** M3 reconciliation test proves dashboard totals and CSV values match seeded Firestore records. Estimated load: 11.25 ideal days.

## Sprint 4 — Hardening, Migration, and Pilot

**Sprint goal:** release a secure, accessible, observable build that passes business UAT with real pilot data.

| ID | Pri | Task | Estimate | Depends on | Acceptance check |
|---|---:|---|---:|---|---|
| ✅ QA-01 | P0 | Add end-to-end tests for invitation, reset, daily activity, deal state, dashboard, and export | 2d | M3 | Critical happy paths and permission-denied paths pass in CI |
| ✅ QA-02 | P0 | Complete responsive Arabic RTL, keyboard, screen-reader, contrast, and error-state QA | 1.5d | M3 | MVP flows meet WCAG 2.1 AA target with documented exceptions |
| ✅ QA-03 | P0 | Run threat review and Firebase rules regression suite | 1d | SEC-02, M3 | No critical/high issue remains; rules tests pass against production candidate |
| ✅ MIG-01 | P0 | Build a one-time validated spreadsheet/CSV import script with dry-run mode | 1.5d | DISC-07, FND-04 | Invalid rows are reported; rerun is idempotent; no write occurs in dry run |
| ✅ OPS-01 | P0 | Configure deployment pipeline, secrets, preview environment, backups/retention, alerts, and budget limits | 1.5d | FND-03 | Production deploy is repeatable; rollback and secret rotation are documented/tested |
| ✅ OPS-02 | P0 | Add health/error monitoring and operational runbook | 0.75d | OBS-01, OPS-01 | Support owner can diagnose auth, Firestore, Storage, and email-link failures |
| ✅ DOC-01 | P0 | Write admin and salesperson bilingual quick-start guides | 0.75d | M3 | Pilot users complete core flows using the guide without developer help |
| ✅ UAT-01 | P0 | Seed staging, conduct business UAT, resolve P0/P1 defects, and record sign-off | 2d | QA-01–03, DOC-01 | All PRD acceptance criteria have evidence and business owner approves pilot |
| RLS-01 | P0 | Enable alpha flags for admin plus 1–2 salespeople and monitor two-week pilot | 0.5d setup | UAT-01, OPS-02 | Pilot cohort enabled; daily completion, errors, costs, and feedback are reviewed |

**Sprint 4 exit gate:** M4 production candidate, UAT sign-off, and alpha cohort enabled. Estimated build/setup load: 11.5 ideal days, excluding the two-week pilot observation window.

## 4. Post-MVP Backlog

| ID | Pri | Task | Trigger |
|---|---:|---|---|
| PM-01 | P2 | Automated missing-activity reminders | Pilot shows manual follow-up is costly |
| PM-02 | P2 | Saved reports and scheduled email summaries | Admins repeatedly use the same filters |
| PM-03 | P2 | Lead/contact CRM linked to unit/deal | Business confirms customer-opportunity workflow |
| PM-04 | P2 | WhatsApp/call integrations | Privacy, provider, and attribution rules are approved |
| PM-05 | P2 | Commission/closing-price module | Finance definitions and approval workflow are signed off |
| PM-06 | P2 | Server-maintained aggregate documents | Firestore dashboard read cost/latency crosses agreed threshold |

## 5. Dependency Order

```text
Business glossary + state matrix + wireframes
  → shared schemas + Firebase environments
    → authentication + role rules
      → activity/deal operations
        → calculation/query layer
          → dashboards/reports
            → security/E2E/accessibility QA
              → migration + UAT + alpha pilot
```

## 6. Definition of Done

A task is complete only when:

- Acceptance checks and relevant PRD Given/When/Then scenarios pass.
- Code is typed, reviewed, formatted, and merged with no unresolved high-severity finding.
- Unit/integration/emulator/E2E tests appropriate to the risk pass in CI.
- Arabic RTL and mobile behavior are verified for user-facing changes.
- Security rules are updated and negatively tested when data access changes.
- Loading, empty, validation, permission, offline, and server-error states are handled.
- No secrets, passwords, private notes, or emails appear in client logs or analytics.
- Documentation, indexes, migration notes, and environment configuration are updated.
- Business owner accepts user-visible behavior for milestone-level tasks.

## 7. Capacity and Control

Plan only 70–80% of available team capacity each sprint. If a sprint is overloaded, move P1 work first; do not cut authentication verification, security rules/tests, audit history, schema validation, or UAT. Estimates must be recalibrated after Sprint 1 using actual throughput.

Weekly control points:

1. Review decisions/blockers and Firestore/security risks.
2. Demo working behavior against acceptance criteria, not screenshots alone.
3. Reconcile dashboard totals against known fixtures.
4. Review Firebase usage/cost and production-readiness checklist.
