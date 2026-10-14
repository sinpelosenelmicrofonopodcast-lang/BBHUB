# PRIME CUT STUDIOS — Rentals release readiness (NO DEPLOYMENT)

## Integrated in this branch
- 129 inventory source rows, consolidated into **128 commercial products**; no unit-number suffixes or BB asset IDs in the customer cards.
- Quantity stepper capped at live inventory stock; Shure SM7B 4, RØDE Wireless PRO 2, Canon EOS R100 3.
- Aputure LS 600c Pro II and F10 Fresnel linked to their real equipment database records, without changing internal rental authorization.
- Two reservation systems checked before any inquiry is saved: `pc_equipment_bookings` and `equipment_reservations`, with mapping to the actual units.
- Server revalidates date, quantity, same-origin, duplicate items, and rate; inquiry enters existing PrimeCuts operations via `pc_inquiries`.
- 129 rate card entries, including 16 referenced from Prime Cut Studios October 2026 Financial Model and **113 explicitly proposed** (not owner approved). Four-unit SM7B package $80/day is taken from the existing rate card.
- Required customer information and operational rental policy visible: name, email, phone, billing address, intended use, dates, pickup / delivery, ID in-person, optional COI, damage/loss, security deposit, late returns and tax estimate.
- No external bookings or payments are activated. Assets remain internal by default until explicit owner approval.

## Image supply status — blocking visual completeness
- 128 commercial product entries in the image production queue.
- Only 23 entries have external source image links; 105 still have no direct photo.
- None of the direct images have confirmed background transparency or reuse rights.
- Adobe background-removal requests rejected the manufacturer CDN domains due to domain allowlist restrictions, including Canon, scene7 and GoPro.
- No artificial / generated substitute product photography has been added. Existing image links are rendered on a uniform background with an error fallback.
- Queue: `lib/equipment-image-production-queue.json`. Per product: manufacturer page, original image, rights review, model match, background transparency, normalized 1600×1600 and ready-to-publish flag. Do not mark ready without actual alpha-channel validation and downloaded assets.

## Existing source discrepancies needing owner review
- Canon RF28-70mm F2.8 IS STM vs old rate card's RF28-70mm f/2 L USM: $45/day is a NEW proposal, not an approved price.
- Source inventory and legacy asset system disagree about the Fiilex P3 unit count (1 BB asset vs 2 legacy records). Public count stays conservative; either legacy reservation blocks that commercial model until inventory is reconciled.
- Insignia NS-PG08591 remains without positive equipment-source identification, so selection is disabled.
- High-value items and safety-sensitive accessories remain subject to management approval and COI/insurance screening.
- All 113 suggested prices require owner approval before becoming authoritative public rental rates. A quote inquiry does not authorize an owner to bypass policy.

## Validation
```
cd prime-cut-studios
npm run check:rentals
npm run typecheck
npm run build
npm run check:integration
npm run check:portal
```
Only data-level validation was performed in this chat. `npm run typecheck` / `npm run build` were NOT run against the complete Next.js repository. Complete that check before any future release.

## Never auto-deploy
No Vercel deployment was triggered as part of this work. Existing `vercel.json` continues `git.deploymentEnabled=false`. Merge/release to production must be explicitly authorized by the owner after full tests, image review and rate approvals.

## Back-end interfaces
- GET `/api/rentals/availability?start=YYYY-MM-DD&end=YYYY-MM-DD`
- POST `/api/rentals/request` (JSON, same-origin) — creates an inquiry only, never a reservation.
- Source of truth for live approval: `pc_equipment_overrides` / `equipment.rental_enabled`. We did not modify approval flags or payment settings.
