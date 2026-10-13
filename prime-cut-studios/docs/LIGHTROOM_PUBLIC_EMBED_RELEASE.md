# Live Lightroom gallery release notes

## Source album
The user selected the **entire** Lightroom album at https://adobe.ly/4ikEAMg for public Prime Cut Studios marketing.

## Implementation, NOT LIVE
The public homepage and portfolio render a lightweight animated Lightroom showcase. The iframe uses the Lightroom share link until an OFFICIAL `lightroom.adobe.com` embed URL is supplied. No photo copying, server transformations, scheduled sync, API polling, duplicate uploads or media CDN.

Admin `/admin/galleries` has a dedicated **Connect main public album** form. It accepts Lightroom's copy-embed HTML, extracts only the HTTPS iframe src and validates host. With owner consent, it registers the official URL in a public portfolio entry, without modifying private client albums that happen to use the same share URL. The homepage/portfolio lookup is cached for one hour; owner changes trigger on-demand invalidation. Thus switching future embed settings does not require a redeployment after the next authorized release, and Adobe album additions/edits appear through Adobe itself.

### External boundary
The Adobe connector currently exposes individual Lightroom assets, not the user-owned shared album's official embed code, and the short URL could not be resolved from this environment. We have NOT verified that the short link permits iframe framing. The owner needs to supply Lightroom Web → Share & Invite → </> embed code once, or use a browser session with the account signed in. Do not invent an embed URL, silently scrape an album, or imply that the actual images currently render in the app.

### Cost
Viewer bandwidth from Adobe is unavoidable, but **PrimeCuts OS transfers zero image originals**, runs no cron/sync and has no photo-storage duplication. The native public page queries a tiny settings record, cached for one hour, rather than fetching photos. Home uses on-demand/ISR caching. Loaded frame mounts only when in viewport; reduced-motion setting respected.

### Privacy
This is a PUBLIC gallery. Do not reuse the same Lightroom share URL for a client's confidential proofing unless Adobe's sharing configuration is also restricted. The studio must confirm model/client public display consent for the album.

### Release status
No database migrations applied. No builds or deployments. Current public site unchanged. Apply staged gallery migration alongside operations release and verify with actual Lightroom iframe in browser before enabling.
