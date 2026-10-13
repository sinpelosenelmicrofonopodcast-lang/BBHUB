# PrimeCuts OS — Public Lightroom album, live and lightweight

## Selected public collection
User selected the **entire** Lightroom shared album at https://adobe.ly/4ikEAMg for the public Prime Cut Studios portfolio on 2026-10-13. The album itself remains the sole canonical photo source.

## What is staged
- New `lib/featured-lightroom.ts` holds one live shared album URL; no per-photo IDs, copies, sync mirror, CDN or generated thumbnails.
- `components/LiveLightroomShowcase.tsx` shows a premium animated editorial wrapper on HOME and PORTFOLIO. Subtle CSS animation supports prefers-reduced-motion.
- Uses browser IntersectionObserver (180px margin) to mount the Lightroom iframe ONLY near visibility. The iframe is marked lazy, and it points directly to the Lightroom shared album; no image bytes pass through Vercel server or Supabase.
- Adobe Lightroom updates its shared albums when the source photos are added/edited/removed; viewers see Adobe's latest current gallery upon reloading/revisiting. No polling, webhook, cron, image duplication or deployment per photo update.
- CTA always links to the full album as fallback, even if the Adobe short URL cannot be framed.
- Separate owner-controlled gallery management supports pasting the official embed code, extracting an allowlisted lightroom.adobe.com src. The provided shortlink could NOT be resolved/tested, so embeddability is UNVERIFIED.
- Existing client proofing/delivery galleries remain login protected and distinct from this deliberately public portfolio album.

## What this DOES NOT do
- No claim of 0 bandwidth for real visitors: every displayed photo consumes viewer data through Adobe. Only PrimeCuts infrastructure photo-sync/store/egress is eliminated.
- Does NOT animate each photo individually or extract/manipulate the full photo collection. Same-origin restrictions prevent controlling the interior of Adobe's iframe. The animation here is the surrounding page and entrance of the official embedded gallery. A fully custom Ken Burns slideshow of the actual photo content requires an authorized per-photo feed/export or permitted access to images.
- Does NOT guarantee the adobe.ly URL is embeddable. Adobe might block framing. For reliably integrated gallery the user can copy the official HTML embed code using Lightroom Web > Share & Invite > </> and paste it into the owner admin gallery UI, or we can replace the featured embed URL at release after verification. DO NOT invent a long URL.
- Does NOT auto-update while a browser tab remains open if Adobe doesn't push updates to an already loaded embed. The next page/iframe load reflects Lightroom's current album.
- Does NOT confirm access permission or copyright/publicity releases for every person/photo shown. Confirm this album is safe to share publicly, with Lightroom 'Anyone can view'. Keep downloads OFF if unintended.

## Load and cost policy
No auto-play video, no heavyweight animation JS packages, no image proxy or thumbnail cache, no interval fetching. Only load the remote gallery when visible; no client network traffic to Adobe when section is never reached. Normal Adobe subscription and viewer bandwidth still apply.

## Release gate
Do not deploy without owner authorization. Prior existing operations and galleries planned migrations were not applied. Build + TypeScript + live iframe tests required in a secure test browser before publishing.
Sources: https://helpx.adobe.com/lightroom/web/share-your-work/share-and-invite/share-photos-and-albums-for-review.html and https://helpx.adobe.com/lightroom/desktop/save-share-and-export/save-share-photos.html .
