# PrimeCuts OS — Operations update (staged, not deployed)
**Prepared October 13, 2026.** Extend the existing v0.4 app with a role-scoped operations center, employee accounts, manual projects, casting CRM, talent accounts/application messages, scheduled tasks, creative approvals, internal comments, budgets and audit records.

**Status:** code staged for safe merge into the BBHUB branch; SQL migration file present but **not applied** to Supabase; **no Vercel build or deployment** requested. Published version remains v0.4.

**Offline checks:** TS/TSX syntax parsing, role matrix, cross-project authorization and baseline Supabase-only persistence checks. Does NOT prove full Next.js build, functioning OAuth, independent security audit, legal validity of e-signatures, provider media access, or live load.

**No service subscriptions added.** No real email delivery, payment processing, Google Drive file sync, automatic Lightroom/DaVinci API integration, video storage or live video transcoding. Existing media review links remain external provider resources.

Read [OPERATIONS_REVIEW.md](OPERATIONS_REVIEW.md) for security requirements, roles, cost restrictions and next-stage recommendations. Run `npm run check:operations` after installing existing packages; install/build only in an authorized release window.
