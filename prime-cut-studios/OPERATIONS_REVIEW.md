# PrimeCuts OS | Operations review and zero-build roadmap
**Review:** October 13, 2026 · **Scope:** current published v0.4, staged operations expansion, Supabase schema, role boundaries · **Deployment:** none requested; **no live production schema change**.

## Outcome: one production operating system, different workspaces
Keep **one** existing Next.js app (`prime-cut-studios`), **one** existing Supabase BBHUB project, and existing external media storage. Staff, talent and client use their own credentials. The owner can manage everything; assigned employees see only authorized operational modules and projects. Do not create parallel Vercel projects, another Supabase instance, or a second admin site.

## Confirmed existing foundations (v0.4)
- Booking inquiries, quotes, project creation, status, approved portfolio images, file/review links.
- Authenticated client accounts, per-project membership and manually generated one-time invitations.
- Lightroom, Blackmagic Cloud/Resolve and Google Drive HTTPS review links shown only after client login and explicit admin visibility release.
- **Gaps in v0.4**: one owner/admin role, no employees, no casting, no native review discussion, no operations audit, no automated document/signature/billing/Drive API integration.

## Staged expansion (does not exist on production yet)
- `/operations`: private role-scoped operations dashboard, manual project registration for owner/secretary/manager/producer; scoped creators receive membership automatically.
- `/operations/team`: owner-only employee invitations, assignment, revocation, suspension, role and access-scope changes; session invalidation on every permissions change.
- `/operations/projects/[id]`: tasks, shoot schedule, scouting, lookbooks, crew items, references, media, budgets, documents, contracts, approvals, private/team notes. Time-stamped audit trail; assignee and project checks.
- `/operations/casting`: staff-side casting calls, shortlist, auditions, selection, and private two-way correspondence with each applicant. Per-project application visibility.
- `/casting`, `/talent`: public listing for authorized adult casting calls, registered talent profiles, applications, audition links, status and private messages. No public directory of talent contact information.
- `/client/projects/[id]/operations`: authenticated project member sees only released creative references, writes comments, makes approval/change requests, and optionally provides typed-name contract acknowledgment.
- **Security**: service-role-only database operations, RLS plus revoked anon/authenticated grants, signed HttpOnly staff/talent sessions, role checks server-side, per-project restrictions, login throttles and action audits.

## Permission matrix (staged defaults)
| Role | Allowed | Explicitly blocked |
|---|---|---|
| Owner | All, including staff access | none |
| Manager | Projects, creative, casting, schedule, tasks, finance, documents, contracts, audit | Invite/manage staff |
| Secretary | Projects, casting, tasks, schedule, creative, documents, contracts | Finance, staff permissions |
| Producer | Projects, casting, tasks, schedule, creative, media, documents, contracts | Finance, staff permissions |
| Editor | Assigned tasks, creative and media | Budgets, legal contracts, staff and casting |
| Crew | Assigned tasks and schedule | Budgets, documents, casting, staff management |
| Accountant | Finance, documents and contracts in assigned projects | Casting, crew assignment, creative, staff management |
| Casting coordinator | Authorized casting calls, creative and schedule | Finance, contracts, staff management |
| Client | Their own project and released records | All internal records and any other client's project |
| Talent | Their own profile, applications and correspondence | Other applicants and private project/crew records |

For staff: **module permission AND project membership** must both pass. Only owner grants roles or access. Avoid using shared credentials.

## Priority review findings
### P0 — Required before release
1. **Merge onto v0.4 without replacing its working client authentication**. The older operations scaffold was written against v0.3; overlay new operations routes on v0.4. Preserve existing `/client/login`, account invitations, and provider review links.
2. **Apply Operations SQL migration in a controlled release only**. The application depends on new `pc_ops_*` tables. Do not deploy code first; no migration is applied as part of this draft.
3. **Full Next.js build and authenticated integration tests** are not complete in this environment. Offline TS parsing and static permission checks are not substitutes. Test staff, talent and client workflows with separate real test accounts and confirm cross-project isolation.
4. **Admin credential rotation**. Replace the temporary shared admin password, consider MFA and a dedicated role-based owner account before use with staff/customer data.
5. **Contracts are not legally verified e-sign**: typed-name acknowledgment captures consent/time/hash, but linked external PDFs may change; store immutable document snapshots, signer intent, version ID, delivery copies and audit evidence. Have a qualified professional review forms and requirements.
6. **Talent email is not verified**: don't use talent email identities for identity-sensitive approval or hire. Add verified-email invitations or a provider; do not claim verification without it.
7. **Public casting must be approved before launch**, clearly state pay/range and location; no date/fee promises without confirmation. Adult-only for the draft; minors require a separate guardian workflow.

### P1 — Biggest operational return without new subscriptions
- A structured **production template** for music videos, events and photo shoots: briefing → estimate → casting → location permits → contract → crew → call sheet → shoot → edits → approvals → delivery.
- **Blocking checklist** on each stage: permits/consents pending, models not selected, overdue decisions, deliverables waiting for client.
- Real **calendar view** for schedules and availability, with collision alerts. Keep calendar items in Supabase; only connect Google Calendar later if useful.
- **Resource booking** using the existing equipment inventory, with assigned operator, checkout/return and maintenance flags; do not promise automatic availability until implemented.
- **Budgets** planned/actual, client quote vs internal payroll/expenses, profit margin accessible only to finance and owner. No payment charges until explicit authorization.
- **Standard forms**: model releases, location releases, service contracts, call sheets, shot lists and asset delivery acknowledgments. Signed revision immutability.
- **Media versioning**: each approved photo/video version immutable ID; Lightroom and Blackmagic Cloud review link should have provider permissions configured separately.
- **A real notification inbox** inside PrimeCuts OS (not email at first), with daily due items and action owners; avoid costly always-running jobs.
- **Search** across customers, projects, shot lists, talent and decisions; avoid indexing sensitive profile data publicly.
- **Retention controls** for rejected applicants, expired invites, unused review links, finished projects and audit logs. Provide export/deletion workflow.

### P2 — Later, only after measured need
- Lightroom/Blackmagic automatic sync (verify approved APIs and cost); guest links already solve review without storing massive video in Vercel.
- Google Drive file-picker OAuth and narrowly scoped folder syncing: folder IDs alone are **not** Drive API authorization.
- True e-sign provider, payment processing, SMS, video proxy/transcode, heavy storage, real-time notifications or sophisticated crew payroll **only if** value exceeds cost.
- Public production-specific casting pages with model release/watermarked audition previews and privacy/personal-info safeguards.

## How to preserve zero additional infrastructure spend
- Keep one Vercel project, one Supabase project and the existing Drive/Blackmagic/Lightroom accounts.
- Store URLs, decisions and metadata in database; large original MOV/RAW files stay in existing storage.
- No polling jobs, no background scraping, no serverless video transcoding, no automated outbound emails, and no duplicated cloud storage.
- No production migrations or deployments on this review. Keep all new code on a `no-deploy` branch.

## Definition of done for a future single controlled deployment
- [ ] Owner verifies SQL migration on the intended Supabase project and creates a rollback/export snapshot.
- [ ] Build/typecheck + checks pass against Next.js dependency versions.
- [ ] Staff secretary cannot view finance or owner settings; editor cannot access unassigned project; disabled employee session revoked.
- [ ] Applicant cannot read another talent's application; casting coordinator cannot access a different project's applicants.
- [ ] Client cannot open another client's project or unreleased references.
- [ ] Client approvals, comments and document changes recorded; contracts immutable and signatures reviewed before legal reliance.
- [ ] Public casting listing, invitation, logout and password flows work from mobile.
- [ ] Review links do not expose unapproved raw files in provider settings.
- [ ] Exactly **one** production deployment, then smoke test without additional retries.
