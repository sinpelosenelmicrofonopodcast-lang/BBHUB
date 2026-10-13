# Equipment Rental Catalogue — Source and release gates

SOURCE: BB ENTERTAINMENT - ASSET CONTROL SYSTEM LIVE (Drive, 2026-10-13)
https://docs.google.com/spreadsheets/d/1TYf5ab5adDkcQrBLa-GteZg0Bv9g5c0TW36eXxmoTks/edit

## Asset integrity
164 unique physical asset IDs in source; 161 flagged operational, NOT preapproved for external rental.
Three disabled/uncertain: DJI Mavic Pro (maintenance), DJI Mavic Mini (unverified), Osee GoStream Deck HDMI Pro (broken).
Additional candidate purchases are unverified until synchronized into physical asset tracker: Aputure LS 600c Pro II, Aputure F10 Fresnel, Manfrotto MVT502AM+MVH500A.
No customer-facing serials, order IDs, purchase costs, internal assignments, or owner private notes.

## Staged implementation (NOT LIVE)
Public /rentals searchable catalog, tech details and verified manufacturer's product links; support/manual links where known; multi-asset rental inquiry. No automatic booking, billing or deposit.
Private /team/equipment owner authorization, condition, rental approval, rate and verified official photo URL.
Private /team/reservations 48h holds, collision-safe reservation RPC and manual confirmation/return, never automatic public reservations.
Client submissions reject manually disabled or internally unfit assets.
Staff/secretary CRM intake, scoped role invitations, casting calls/applications and tasks are also prepared.

## Official documentation research
Manufacturer references include Canon R5 C, R6 II, R50 V, EOS R100, RF24-105, DJI RS3 Pro, RODECaster Pro II, Wireless PRO, Shure SM7B, Zoom H6essential, Godox V1Pro, GoPro HERO12/HERO13, amaran 300c, Aputure MC. Other gear may only have a manufacturer homepage. Do not invent a missing PDF.

## Important incompleteness
ZERO verified, licensed, directly embeddable official photograph URLs were retrieved for the physical equipment, so item.photoUrl stays null; cards display a truthful placeholder and link to manufacturer's product image gallery. To finish images: secure official hotlink or licensed manufacturer asset, or photograph the owned gear and upload optimized images with authorization. Avoid misidentified or fake product photographs.
The SQL files in supabase/planned have NOT been applied. Full Next.js typecheck and production build were NOT performed (environment has Node22, npm registry unavailable, app requires Node>=24). Electronic contracts/signature, provider API synchronization, private native audition uploads, staff e2e auth and automated cost analysis remain future work. No new infrastructure, recurring jobs, media copies, paid services or deployments.

## Release checklist
1. Apply only the current two planned SQL files (not older overlapping draft).
2. Test SQL RLS and secret service role; owner/secretary/editor cross-project forbidden cases and revocation.
3. Verify source and license for each public photo; approve rental dates, fees and availability per asset.
4. Test casting consent, adult validation, applicant file permissions and retention.
5. Test simultaneous holds, expiration, confirmation, check-in/out.
6. Run npm install, npm run typecheck, npm run build, node scripts/check-operations.cjs on Node24.
7. Audit existing rental SOP, release, insurance, deposit, damage and late-fee policy.
8. Only ONE manually authorized deployment after all checks pass. Do not auto deploy.
