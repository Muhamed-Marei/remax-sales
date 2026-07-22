# Product Requirements Document: SaleTrack

| Metadata | Details |
|---|---|
| Status | Draft — ready for product/design review |
| Product | SaleTrack: internal real-estate sales activity and deal pipeline |
| Date | 2026-07-21 |
| Target release | MVP in 6–8 weeks after scope approval |
| Platform | Next.js web app with Firebase backend |
| Owners | Business Admin (TBD), Product/Engineering (TBD) |

## 1. Product Summary

SaleTrack replaces manually collected sales spreadsheets with a role-based workspace for recording each salesperson's daily activity, managing real-estate unit listings/deals, and giving administrators reliable performance analysis.

The MVP has two roles:

- **Admin:** creates sales accounts, views company and salesperson dashboards, manages users, reviews activity and reports, and can view all units/deals.
- **Sales:** signs in, resets or changes a password, records own daily activity, and creates/updates only their permitted deals/units.

All user-facing labels should support Arabic and English. Arabic is the default UI language, with English labels shown where helpful.

## 2. Strategic Fit & Problem Statement

### 2.1 Problem statement

Sales managers need a trusted, current view of sales effort and unit pipeline. Today, activities and listings are captured in inconsistent spreadsheet rows, so it is difficult to compare salespeople, identify weak conversion stages, or see which units can close quickly.

**Desired outcome:** every salesperson enters daily work in a consistent form; management can analyze performance, inventory, and deal progress without manual consolidation.

### 2.2 5 Whys

1. Why is it hard to assess salesperson performance? Activity data is not standardized or centrally visible.
2. Why is data not standardized? The spreadsheet columns are manually interpreted and may be incomplete.
3. Why are reports slow to prepare? Managers must combine rows and calculate ratios manually.
4. Why are next actions unclear? Deal state and the ease/time-to-close signal are not structured.
5. **Root cause:** there is no authenticated, role-based system with a defined activity schema and deal workflow.

### 2.3 Objectives and measurable outcomes

| Objective | Key result for first 90 days after launch | Contribution |
|---|---|---|
| Improve activity visibility | 90% of working-day activity records submitted by active salespeople | Consistent daily entry and missing-entry dashboard |
| Improve management response | Admin can identify a salesperson or pipeline stage needing support in under 5 minutes | Drill-down dashboards and filters |
| Improve pipeline discipline | 95% of open deals have a state and deal type | Required structured fields |

## 3. Users, Roles, and Permissions

| User | Needs | Allowed actions |
|---|---|---|
| Admin | Manage team, monitor results, audit data | Create/disable users; view, filter, export all data; correct any record; manage state/source settings |
| Salesperson | Fast daily record and personal pipeline | Sign in; reset/change own password; create/edit own activity and assigned deals; view own dashboard |
| Not in MVP | External broker/owner, public visitor, payroll user | No access; do not build public deal pages or compensation automation |

**Access rule:** a salesperson must never read another salesperson's activity, profile metrics, or private deal data. An admin may access all organization data.

## 4. Scope

### 4.1 MVP includes

1. Firebase Authentication email/password sign-in, account invitation/reset email, password reset, and password change.
2. Admin user management: add salesperson by email, assign name, send password-setup email, activate/deactivate account.
3. Daily sales activity form using the supplied columns.
4. Deal/unit inventory form using the supplied unit columns, deal type, and deal state.
5. Admin and salesperson dashboards, profile drill-down, filtering, and CSV export.
6. Firebase security rules, audit timestamps, validation, responsive Arabic RTL UI.

### 4.2 Explicitly deferred

- Lead-by-lead CRM, WhatsApp/call integration, automatic attendance device integration.
- Commission calculation/payroll, customer portal, multi-company tenancy, native mobile app.
- AI forecasts or automated source attribution. These can be added after clean historical data exists.

## 5. Core Workflows and UX Design

### 5.1 Navigation

**Admin:** Overview, Salespeople, Activity, Units & Deals, Reports, Team settings.

**Sales:** My dashboard, Daily activity, My units & deals, My profile.

### 5.2 Primary flows

```text
Admin creates salesperson → Firebase sends password-setup/reset email
→ salesperson sets password → signs in → completes daily activity / maintains deals
→ Firestore aggregates are visible in personal dashboard → admin views team dashboard
→ admin opens salesperson profile → filters, exports, or corrects data
```

```text
New unit/deal → owner enters property details → selects deal type and state
→ saves as active → records viewings/meetings/updates → won or lost with reason
```

### 5.3 Screens

| Screen | Key content and behavior |
|---|---|
| Sign in / Forgot password | Email and password; “Forgot password?” sends Firebase reset email; generic confirmation prevents email enumeration |
| Admin overview | Date range, salesperson/source/state filters; KPI cards; activity trend; conversion funnel; top/needs-attention salespeople; pipeline by state and deal type |
| Salespeople list | Name, email, status, last activity, current-period deals; add, deactivate, open profile |
| Salesperson profile | Summary cards, activity chart/table, attendance, source distribution, funnel ratios, units/deals table, date filters and export |
| Daily activity form | One record per salesperson per calendar date; numeric fields default to 0, source breakdown, attendance status, submit/edit |
| Units & deals | Search and filters; table/cards; create/edit drawer with property and pipeline data; state timeline/history |
| Reports | Company/team/salesperson report by date range; CSV export; saved filter presets in a later release |

### 5.4 Daily activity schema and labels

Each salesperson creates **at most one activity record per date**. Numeric values are non-negative integers. A later correction overwrites the same day record and preserves `updatedAt`/`updatedBy`.

| Field key | Arabic / English label | Type | Required |
|---|---|---:|---:|
| `activityDate` | التاريخ / Date | Date | Yes |
| `primarySource` | مصدره / Source | Configurable enum | Yes |
| `leads` | عميل / Leads | Integer | Yes |
| `followUps` | المتابعات / Follow-ups | Integer | Yes |
| `responses` | الردود / Responses | Integer | Yes |
| `calls` | مكالمات / Calls | Integer | Yes |
| `siteVisits` | زيارة موقع / Site Visits | Integer | Yes |
| `viewings` | معاينات / Viewings | Integer | Yes |
| `meetings` | اجتماعات / Meetings | Integer | Yes |
| `dealsCount` | صفقة / Deals | Integer | Yes |
| `newUnits` | وحدات جديدة / New Units | Integer | Yes |
| `portfolioCount` | Profolio / Portfolio | Integer | Yes |
| `facebookCount` | Facebook | Integer | Yes |
| `marketplaceCount` | Marketplace | Integer | Yes |
| `mohamedCount` | mohamed | Integer | Yes |
| `attendance` | الحضور / Attendance | Enum | Yes |
| `notes` | ملاحظات / Notes | Text | No |

`attendance` values: `present`, `late`, `absent`, `leave`, `remote`. The business owner must confirm whether “mohamed” is a lead source/person/source channel before launch; MVP treats it as a configurable source label to preserve the current sheet.

### 5.5 Deal/unit schema and workflow

Property/unit fields are retained in Arabic exactly as requested; values can be entered in Arabic or English.

| Field key | Arabic label | Type | Required |
|---|---|---:|---:|
| `unitType` | نوع الوحدة | Text | Yes |
| `specifications` | المواصفات | Long text | Yes |
| `location` | اللوكيشن | Text | Yes |
| `ownerCooperative` | المالك متعاون | Enum: cooperative / not_cooperative / unknown | Yes |
| `photos` | الصور | Image URLs/files | No |
| `commissionRate` | الكوميشن | Decimal percent | No |
| `askingPrice` | السعر المميز | Currency (EGP) | Yes |
| `notes` | ملاحظات | Long text | No |
| `dealType` | نوع الصفقة | Enum | Yes |
| `dealState` | حالة الصفقة | Enum | Yes |
| `assignedSalesId` | مسؤول المبيعات | User reference | Yes |

**Deal type:** `easy_to_pay` (easy/ready to close) or `needs_time` (requires longer nurturing). Display Arabic labels: **سهل الدفع** and **يحتاج وقت**.

**Deal state:** `draft`, `active`, `contacted`, `viewing_scheduled`, `viewed`, `meeting_scheduled`, `negotiating`, `reserved`, `won`, `lost`, `archived`. Closed states require a `closedAt`; `lost` also requires a `lostReason`. State changes are retained in history.

## 6. Functional Requirements and Acceptance Criteria

### FR-1: Account administration and authentication

**As an admin, I want to add a salesperson with an email address so that they receive secure access without me handling their password.**

- Given an admin enters a valid, unused email and name, when they save the user, then the system creates the user profile and sends a Firebase password-reset/setup email.
- Given an email already belongs to an account, when the admin submits it, then the system shows a clear duplicate-email message and does not create a second profile.
- Given a user uses the emailed reset link, when they choose a valid new password, then they can sign in.
- Given a user successfully signs in from the unified login page, when they are authenticated, then they are redirected to their respective dashboard (Admin Overview for admins, My Dashboard for salespeople) based on their role.
- Given any visitor requests a reset email, when the address is submitted, then the UI shows the same generic success message whether or not the address exists.

**Implementation note:** use a trusted server-side Firebase Admin SDK route/Cloud Function to create users and issue a password-reset link/email. Do not generate, display, or store plaintext passwords. Firebase Authentication handles password storage.

### FR-2: Salesperson daily activity entry

**As a salesperson, I want to record my work for a date so that my performance is counted accurately.**

- Given a signed-in salesperson, when they open Daily Activity, then the form defaults to today with all counts at zero.
- Given they submit valid data, when saved, then exactly one record is stored for their user ID and selected date.
- Given a record already exists for that date, when they reopen it, then they can edit their own record rather than create a duplicate.
- Given a count is negative, decimal, or not a number, when submitted, then saving is blocked with an inline Arabic/English validation message.

### FR-3: Deal/unit management

**As a salesperson, I want to manage assigned unit/deal details and progression so that my pipeline is current.**

- Given the required property and pipeline fields are filled, when saved, then an active deal is visible to its assigned salesperson and admins.
- Given a deal is changed to `lost`, when saved, then a lost reason is required and the state transition is recorded.
- Given a salesperson tries to open an unassigned deal, when data is requested, then Firebase denies access.

### FR-4: Management analysis

**As an admin, I want to see team and salesperson analysis so that I can coach and allocate effort.**

- Given an admin selects a date range, when the dashboard loads, then all cards, charts, tables, and exports use the same range and filters.
- Given activity exists, when the admin opens a salesperson profile, then they see daily metrics, attendance, source breakdown, conversion ratios, and deals in that period.
- Given an admin exports a report, when they choose CSV, then the file includes only records matching the active filters and Arabic/English column headers.

### FR-5: Personal dashboard

**As a salesperson, I want to see only my own results so that I can understand my progress.**

- Given a salesperson signs in, when their dashboard loads, then it shows their current-month activity, personal funnel, attendance, and assigned open deals only.

## 7. Reporting and Analysis Specification

### 7.1 Dashboard KPIs

| Area | Metrics |
|---|---|
| Activity | Leads, follow-ups, responses, calls, site visits, viewings, meetings, new units, portfolio count |
| Outcomes | Deal count, won deals, lost deals, win rate, open pipeline, total asking-price value |
| Funnel | Response rate = responses/leads; follow-up rate = followUps/leads; viewing rate = viewings/leads; meeting rate = meetings/viewings; deal rate = dealsCount/meetings |
| Discipline | Activity-submission rate, attendance distribution, last activity date |
| Source | Lead count and conversion by primary source and Facebook/Marketplace/Mohamed fields |
| Pipeline | Deal count/value by state, deal type, location, and assigned salesperson |

Use `—` instead of a percentage when its denominator is zero. Do not infer revenue from asking price; surface it as pipeline asking value.

### 7.2 Report filters

Global filters: date range (default current month), salesperson, source, attendance, deal state, deal type, location, and search term. Admins can export activity and deal tables separately.

## 8. Technical Design: Next.js and Firebase

### 8.1 Architecture

- **Frontend:** Next.js App Router, TypeScript, React Hook Form + Zod validation, RTL-aware component system.
- **Authentication:** Firebase Authentication email/password. Next.js middleware/session strategy protects routes; Firebase ID tokens are verified server-side for privileged actions.
- **Database:** Cloud Firestore. Firestore real-time listeners for live dashboards where query cost remains acceptable; paginated tables for history.
- **Files:** Firebase Storage for unit photos, storing only paths/metadata in Firestore.
- **Privileged operations:** Next.js server route or Firebase Cloud Functions with Firebase Admin SDK for user provisioning, user status changes, and audit-protected admin actions.
- **Deployment:** Firebase App Hosting or Vercel for Next.js; Firebase project separated into development and production environments.

### 8.2 Firestore collections

```text
organizations/{orgId}
  users/{userId}
  activities/{userId_YYYY-MM-DD}
  deals/{dealId}
  dealStateHistory/{historyId}
  settings/sources
  auditLogs/{auditId}
```

| Collection | Essential fields |
|---|---|
| `users` | `email`, `displayName`, `role`, `status`, `createdAt`, `lastLoginAt` |
| `activities` | `orgId`, `salesId`, `activityDate`, all fields in §5.4, `createdAt`, `updatedAt`, `updatedBy` |
| `deals` | `orgId`, fields in §5.5, `createdAt`, `updatedAt`, `createdBy`, `closedAt`, `lostReason` |
| `dealStateHistory` | `dealId`, `fromState`, `toState`, `changedBy`, `changedAt`, `note` |
| `auditLogs` | actor, action, resource, timestamp, safe before/after summary |

Use timestamp types for audit fields and an ISO calendar-date string (`YYYY-MM-DD`) for activity date to avoid timezone ambiguity. Create composite Firestore indexes for common combinations: `orgId + activityDate + salesId`, `orgId + assignedSalesId + dealState`, and `orgId + updatedAt`.

### 8.3 Security rules

- All documents must include `orgId`; queries must be organization-scoped.
- User profile fields `role`, `status`, and `orgId` can only be changed by a trusted server/Admin SDK operation.
- Salespeople may create/read/update activity only where `salesId == request.auth.uid`; admins may read/update all organization activity.
- Salespeople may read/update deals only when `assignedSalesId == request.auth.uid`; admins can manage all deals.
- Storage photo paths must use `organizations/{orgId}/deals/{dealId}/…`, with matching auth checks.
- Do not trust role claims supplied by the browser; enforce custom claims and/or server-validated user profile rules.

## 9. Non-Functional Requirements

| Category | Requirement | Success criterion |
|---|---|---|
| Security | Least-privilege Firestore/Storage access; no plaintext passwords; audit privileged changes | Unauthorized cross-user reads/writes are rejected in emulator tests |
| Privacy | Limit stored PII to business email/name; restrict exports to admins | No personal contact data in client logs |
| Performance | Dashboard summary initial view and activity save | P95 under 2.5s on normal 4G; save acknowledgement under 1.5s excluding network outages |
| Reliability | Clear offline/error state and retry-safe writes | No duplicate daily activity via deterministic document IDs |
| Accessibility | Keyboard operation, sufficient contrast, Arabic RTL layout, labelled controls | Meets WCAG 2.1 AA target for MVP flows |
| Data quality | Required enums, integer validation, state transition validation | 100% of new records conform to schema |
| Auditability | Track creation, update, and deal-state changes | Admin can see who changed a deal and when |

## 10. Measurement Plan

### 10.1 HEART metrics

| Metric | HEART category | Definition | Target |
|---|---|---|---|
| Daily-entry completion | Task success | Active salespeople with a submitted working-day record | ≥90% by day 90 |
| Weekly active salespeople | Engagement | Salespeople who log in and submit/view data each week | ≥85% of active users |
| Dashboard usefulness score | Happiness | Monthly 1–5 admin survey | ≥4.0 |
| Activity form completion time | Task efficiency | Median time from open to saved | ≤3 minutes |

### 10.2 Guardrails

- Authentication/reset failure rate below 2% (excluding invalid credentials).
- Unauthorized Firestore access attempts expose no data.
- Dashboard query/read cost is monitored; add server-side aggregates before cost becomes material.
- No decrease in activity completion rate after UI releases.

### 10.3 Instrumentation events

`login_succeeded`, `password_reset_requested`, `salesperson_invited`, `activity_saved`, `deal_created`, `deal_state_changed`, `dashboard_filtered`, `report_exported`. Include `role`, `orgId`, filter type, and non-sensitive counts; never include unit notes, emails, or passwords.

## 11. Delivery Plan

| Phase | Scope | Exit criteria |
|---|---|---|
| 0. Discovery (3–5 days) | Confirm business definitions, source list, exact deal-state meanings, reporting priorities; approve wireframes | Signed-off glossary and MVP scope |
| 1. Foundation (1–2 weeks) | Next.js setup, Firebase projects, auth, roles, security rules, admin user invite | Admin creates a salesperson and reset/setup flow works end-to-end |
| 2. Operations (2 weeks) | Daily activity and deals/units CRUD, photo upload, validation, audit fields | Salesperson can complete all core entries securely |
| 3. Insights (1–2 weeks) | Dashboards, profile drill-down, filters, CSV reports | Admin can answer KPI questions from system data |
| 4. Hardening (1 week) | Firebase emulator security tests, accessibility, responsive RTL QA, pilot fixes | Pilot sign-off and production readiness checklist complete |

### 11.1 Rollout

1. **Alpha:** Admin plus 1–2 salespeople use real data for two weeks.
2. **Private beta:** Entire sales team; retain spreadsheet as read-only contingency for one reporting cycle.
3. **General availability:** Make SaleTrack the source of truth after data-quality review.

Feature flags: `daily_activity_v1`, `deals_v1`, `reports_export_v1`. Ensure a short onboarding guide and password-reset support path before beta.

## 12. Risks, Dependencies, and Open Decisions

| Risk | Probability | Impact | Mitigation |
|---|---:|---:|---|
| Ambiguous spreadsheet definitions produce misleading analysis | High | High | Approve a data dictionary before build; show tooltips with agreed definitions |
| Firebase rules expose cross-user data | Medium | High | Emulator rule tests, least privilege, code review, staged pilot |
| Salespeople do not enter daily data | Medium | High | Fast mobile-first form, visible missing-day list, manager follow-up; consider reminders after MVP |
| Free-text prices/commission prevent reporting | Medium | Medium | Store normalized numeric EGP and percentage alongside display formatting |
| Dashboard query costs rise with history | Medium | Medium | Paginate raw data; add Cloud Function daily/monthly aggregate documents when required |

### Dependencies

- Firebase project, configured email action handler/domain, and authorized sender email.
- A business owner to define sources, attendance policy, all deal states, and whether price means asking or closing price.
- Brand/UI direction and Arabic terminology approval.

### Decisions required before implementation

1. Is **“Mohamed”** a person, a source, or a numeric KPI? The proposed design treats it as a configurable source.
2. Does **“Portfolio/Profolio”** mean a count of units added, a value, or another activity measure?
3. Should a deal represent a property unit, a customer opportunity, or a sale between both? This PRD models it as a unit listing/pipeline item; a lead CRM is intentionally deferred.
4. Which users may edit historic activities and for how many days? Proposed: salespeople can edit the current month; admins can correct any date with an audit log.

## 13. Approval Checklist

- [ ] Business definitions for every activity field approved.
- [ ] Arabic/English labels and RTL design approved.
- [ ] Deal states and allowed transitions approved.
- [ ] Firebase project, authorized email domain, and environments available.
- [ ] Security rules and emulator test plan reviewed.
- [ ] MVP dashboard metrics and report layouts approved.
- [ ] Pilot salespeople and launch owner assigned.
