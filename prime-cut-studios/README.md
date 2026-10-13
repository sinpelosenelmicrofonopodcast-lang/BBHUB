# PrimeCuts OS — Operations expansion (draft)

**This branch extends the existing published v0.4; it is not live yet.** The Prime Cut Studios website stays in the existing Vercel `prime-cut-studios` project, backed by the existing Supabase BBHUB project.

## Staff, clients and talent

- `/admin`: existing owner administration, client invitations and Lightroom / Blackmagic Cloud / Google Drive links (preserved from v0.4).
- `/operations`: owner/employee command center. `/operations/team`: owner-only employee invitations, assigned projects, revocation and suspension. Employees log into `/operations/login` and do not use the owner's admin password.
- `/operations/projects/[id]`: planning, schedules, creative briefs, assigned tasks, crew, documents, budgets, comments and client-visible approvals.
- `/operations/casting`: private casting staff workspace; publish only approved calls.
- `/casting` and `/talent`: talent application, profiles, status and applicant–production messages. Talent accounts are **not email-verified yet** and cannot be treated as independently verified identities.
- `/client/projects/[id]/operations`: authenticated client discussions, approval requests and pilot typed-name consent; do not treat as a certified e-signature provider. Client login and project membership from v0.4 are preserved.

## No-deploy preparation

1. Read `OPERATIONS_REVIEW.md` before rollout; especially security/contract/email verification limitations.
2. New SQL at `supabase/migrations/20261013194500_primecuts_operations.sql` is **deliberately not applied**. Apply only in a controlled release, after verifying v0.4 tables exist and making a safe backup.
3. With Node 24 and npm available, run `npm ci` (if lockfile available; otherwise the pinned `npm install`), `npm run check:integration`, `npm run check:operations`, `npm run typecheck`, `npm run build` before future deployment. Build NOT performed in this environment to avoid resource use.
4. Release to the **existing** Vercel project only in a single approved deployment after passing tests and auditing permissions. Branch config disables automatic Git deployment.
5. Preserve existing Vercel environment variables and secrets; never copy `SUPABASE_SECRET_KEY` or session keys into source code or `NEXT_PUBLIC_*`.

## Operations policy

The server checks **role + project membership** for staff. The owner alone can invite staff or modify roles/scope. Permission changes increment `session_version`, revoking active sessions. Application and talent messages are scoped to authorized calls and the applicant's own session. Private `pc_ops_*` tables have RLS and no `anon`/`authenticated` grants.

## External service boundary

Lightroom and Blackmagic Cloud presentations are linked into the client account; their comments/favorites remain in their original systems and the media provider must separately enforce its sharing rules. Videos/RAW masters are not duplicated into Supabase/Vercel.

## Checks

`node scripts/check-integration.cjs` — original persistence checks.

`node scripts/check-operations.cjs` — offline role/privacy/source regression checks (requires installed TypeScript dev dependency, no network calls).
