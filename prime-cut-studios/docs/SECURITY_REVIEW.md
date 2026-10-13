# PrimeCuts OS Operations — Threat assessment

## Strong boundaries
- Server-side role gating on each write and authorized reads for individual projects.
- Staff credentials distinct from global owner admin. Disabled staff session is invalidated by session_version.
- User-specific HMAC-SHA256 HttpOnly cookies; passwords stored as salted scrypt hashes.
- Client approval and document signatures require existing client login and project membership.
- Casting submissions require a talent login and per-IP throttling; names/emails/audition links remain private in the back end.
- Strong provider-independent confidentiality: project links shared in client portal cannot override the provider's own link policy.
- Existing REST service_role key remains only server-side. Public databases have RLS and privilege revocation.
- All mutation POST forms require same-origin check. Audits record decision and credential changes.

## Blockers before broad public use
- **Email verification for talent accounts:** email ownership isn't verified; accounts are created with `email_verified=false`. Prevents treating email alone as legal identity.
- **Password reset/2FA:** not included. Build a secure verified flow before onboarding many external users.
- **Document signing:** typed-name/evidence log only. Requires legal review, identity verification and source-document PDF finalization before high-value signatures.
- **Spam/abuse controls:** IP-based limits are minimum; rate-limit signup on email/account and monitor resource usage; consider CAPTCHA after abuse.
- **Data privacy:** publish terms/privacy/casting consent, apply retention/deletion/export and access request procedures.
- **Authorization tests:** must test IDOR, role escalation, cross-project access, and logging of forbidden inputs in live isolated staging before use.
- **External media:** do not treat hidden review URL as private if provider uses public sharing.
- **Availability/recovery:** test database backup restore; confirm indexes and timeout with real project volume.

## Access philosophy
- Default deny. Owner is sole role that can invite or disable staff.
- Secretary cannot manage staff roles or budgets. Accountant cannot access casting. Editor and crew only have authorized modules in assigned projects.
- Public casting listing contains only intentionally public title, description, role and compensation; never contacts or audition submissions.
- No medical details, national ID scans, SSNs, DOB for minors or banking information collected in public casting form.
