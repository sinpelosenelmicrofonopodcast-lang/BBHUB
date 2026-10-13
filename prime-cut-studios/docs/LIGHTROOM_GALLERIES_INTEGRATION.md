# PrimeCuts OS — Lightroom Shared Galleries

## Tested on 2026-10-13
A customer-provided Lightroom `adobe.ly` shortlink is accepted syntactically by the album URL allowlist. **We could not open or resolve its destination in this environment**, so actual album title, images, download permissions and embed ability remain unverified. DO NOT import or publish it based on guesses.

## Management
Owner-only `/admin/galleries`:
- Paste `https://adobe.ly/...` or full `https://lightroom.adobe.com/...` URL
- Choose project (optional during draft), album purpose (proofs, final_delivery, portfolio), category and description
- Save in PRIVATE DRAFT by default; no customer or public access yet
- Release to an authenticated project only when project is assigned
- Public portfolio requires explicit written consent and an intentional public visibility change
- Optional embed: paste Adobe's copied iframe HTML or embed URL; extract and validate SRC against **lightroom.adobe.com**; never render pasted HTML
- If iframe is rejected or blocked by Adobe, use the album link. Embeds are NOT confirmed with the provided shortlink.

## Important external permissions
PrimeCuts login controls visibility of the link **inside our portal**, not who can access the Lightroom URL after it is copied. For private client work, set Lightroom Link Access to **Invite only**, invite the right email and enable 'Can view'. To collect selections enable comments/favorites. For finished delivery set 'Allow JPG downloads' / 'Allow downloads and exports' in Lightroom only when authorized.
For public portfolio, use albums with consent from every identifiable person/client and explicitly public Lightroom sharing. Keep client's private gallery separate from portfolio source when possible.

## Storage and cost
No photo assets duplicated or uploaded. Supabase stores references/permissions only. No deployment, service upgrade or gallery import. Note that the optional iframe may incur normal Adobe viewing bandwidth based on their own service.

## Release gate
Apply `supabase/planned/20261013_lightroom_photo_galleries_NOT_APPLIED.sql` only with user-approved release, after staging operations schemas. Test new-admin-add-draft, client membership deny, cross-project unauthorized deny, portfolio without consent deny, mobile embed fallback and independent Adobe permissions. No implementation is live until migration, full build/test and explicitly authorized single deployment.
